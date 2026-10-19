"""Shared helpers for the Sprout talking-head kit: load a word-level transcript, split it into script lines
for the planning page, and split lines into caption phrases. Standard library only."""
import json
import re
from pathlib import Path

KIT = Path(__file__).resolve().parent.parent
SCENE_TYPES = ["captions", "captions-ui", "half", "full"]

SENTENCE_END = re.compile(r"[.?!]['\")\]]*$")
SOFT_BREAK = re.compile(r"[,;:]['\")\]]*$")


def load_words(path):
    """Accepts a plain list [{text,start,end,(id)}], ElevenLabs Scribe JSON ({words:[{text,start,end,type}]}),
    or Whisper-style {segments:[{words:[{word,start,end}]}]}. Returns [{id,text,start,end}] in time order."""
    data = json.loads(Path(path).read_text())
    if isinstance(data, dict) and "words" in data:
        raw = [w for w in data["words"] if w.get("type", "word") == "word"]
    elif isinstance(data, dict) and "segments" in data:
        raw = [w for s in data["segments"] for w in s.get("words", [])]
    elif isinstance(data, list):
        raw = data
    else:
        raise SystemExit(f"{path}: unrecognised transcript format")
    words = []
    for i, w in enumerate(raw):
        text = (w.get("text") or w.get("word") or "").strip()
        if not text:
            continue
        words.append({"id": w.get("id") or f"w{i}", "text": text,
                      "start": round(float(w["start"]), 3), "end": round(float(w["end"]), 3)})
    words.sort(key=lambda w: w["start"])
    ids = [w["id"] for w in words]
    if len(ids) != len(set(ids)):
        for i, w in enumerate(words):
            w["id"] = f"w{i}"
    return words


WEAK_END = {"a", "an", "the", "to", "of", "and", "or", "but", "in", "on", "at", "for", "with", "from", "my", "your",
            "our", "their", "his", "her", "is", "are", "was", "were", "be", "i", "you", "we", "they", "that",
            "which", "because", "it's", "its", "not", "so", "if", "as", "than", "this", "these", "those", "have"}
JOINERS = {"and", "but", "because", "which", "or", "so", "then", "when", "while", "if", "who", "where"}


def _bare(t):
    return re.sub(r"[^a-z']", "", t.lower())


def _break_score(words, j):
    """How good a break is after words[j-1] (higher is better)."""
    w, nxt = words[j - 1], words[j]
    score = min((nxt["start"] - w["end"]) * 15, 5)
    if SENTENCE_END.search(w["text"]):
        score += 10
    elif SOFT_BREAK.search(w["text"]):
        score += 6
    if _bare(nxt["text"]) in JOINERS:
        score += 3
    if _bare(w["text"]) in WEAK_END:
        score -= 8
    return score


def _partition(words, max_words, max_chars, target_chars, single_ok, length_weight=1 / 60, chunk_cost=3):
    """Minimum-cost split of a word run into chunks (dynamic programming, deterministic)."""
    n = len(words)
    best = [0.0] + [float("inf")] * n
    back = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(max(0, j - max_words), j):
            chunk = words[i:j]
            chars = len(" ".join(w["text"] for w in chunk))
            if chars > max_chars and j - i > 1:
                continue
            cost = chunk_cost + (chars - target_chars) ** 2 * length_weight
            if j < n:
                cost -= _break_score(words, j)
            if j - i == 1 and not single_ok(chunk[0], j == n):
                cost += 7
            if best[i] + cost < best[j]:
                best[j], back[j] = best[i] + cost, i
    cuts, j = [], n
    while j > 0:
        cuts.append((back[j], j))
        j = back[j]
    return [words[i:j] for i, j in reversed(cuts)]


def segment_lines(words, max_words=14, pause=0.55):
    """Script lines for planning (one line = one planning row = one scene): sentences, split at long pauses, and
    long sentences split at their best internal break."""
    sentences, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        if nxt is None or (SENTENCE_END.search(w["text"]) and len(cur) >= 3) or nxt["start"] - w["end"] >= pause:
            sentences.append(cur)
            cur = []
    lines = []
    for s in sentences:
        if len(s) <= max_words:
            lines.append(s)
        else:
            lines += _partition(s, max_words, 999, 60, lambda w, last: False, 1 / 400, 9)
    return [make_line([w["id"] for w in ln], {w["id"]: w for w in ln}) for ln in lines]


def line_id(first_word_id):
    """Stable line id from its first word, so merging or splitting lines never renames another line's scene."""
    m = re.search(r"(\d+)$", first_word_id)
    return f"L{int(m.group(1)):03d}" if m else f"L-{first_word_id}"


def make_line(word_ids, index):
    ws = [index[i] for i in word_ids]
    return {"id": line_id(word_ids[0]), "start": ws[0]["start"], "end": ws[-1]["end"],
            "text": " ".join(w["text"] for w in ws), "word_ids": list(word_ids)}


def chunk_phrases(words, max_chars=30, max_words=6):
    """Caption phrases inside one line: one plate each, broken where a reader would pause."""
    return _partition(words, max_words, max_chars, 20, lambda w, last: len(w["text"]) >= 9 or last)


def word_index(words):
    return {w["id"]: w for w in words}
