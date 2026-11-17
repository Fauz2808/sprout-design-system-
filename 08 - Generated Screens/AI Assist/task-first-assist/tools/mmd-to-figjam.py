"""Turn tools/sprout-map.mmd (written by build-sprout-map.py) into the Mermaid that FigJam's generate_diagram accepts.

FigJam rules (figma-generate-diagram skill): camelCase node IDs (underscores break edge routing), no comments needed,
labels stay quoted. Also drops the "Not app features" group (business card, empty and loose frames).
Usage: python3 tools/mmd-to-figjam.py  ->  writes tools/sprout-map.figjam.mmd
First FigJam copy: https://www.figma.com/board/KkC7lsk6VRMbvo0zOLBRbx (17 Nov 2026, Tony Martin's team).
"""
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
SRC, OUT = HERE / 'sprout-map.mmd', HERE / 'sprout-map.figjam.mmd'


def camel(m):
    head, tail = m.group(1), m.group(2)
    return head[0].lower() + head[1:] + ''.join(w[:1].upper() + w[1:] for w in tail.split('_') if w)


def main():
    lines = []
    for line in SRC.read_text().splitlines():
        if line.lstrip().startswith('%%'):
            continue
        parts = re.split(r'("[^"]*")', line)   # never touch quoted labels
        for i in range(0, len(parts), 2):
            parts[i] = re.sub(r'\b([A-Za-z][A-Za-z0-9]*)_([A-Za-z0-9_]+)\b', camel, parts[i])
        lines.append(''.join(parts))
    s = '\n'.join(lines) + '\n'
    s = re.sub(r'  subgraph fOther\[.*?\n  end\n', '', s, flags=re.S)
    s = s.replace('"Daily Brief: Suggestion banner on top; Done state on the ban"', '"Daily Brief: sign-ups banner, then the done state"')
    s = s.replace('"Daily Brief: Happening today: plan line; Morning Brief push"', '"Daily Brief: Happening today row and Morning Brief push"')
    s = s.replace('"Daily Brief: Suggestion banner on top"', '"Daily Brief: sign-ups banner"')
    OUT.write_text(s)
    print(f'wrote {OUT.name}: {len(s)} chars')


if __name__ == '__main__':
    main()
