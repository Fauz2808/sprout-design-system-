"""Builds daily-brief-family-reminders.html: B4-B7 from the 30 Sep call.

    python3 build-family-reminders.py

B4 Family reminders (one list, a photo on every item, both photos when it's shared)
B5 Add a reminder by typing, from the list
B6 What happens when voice doesn't give us a reminder
B7 Shared Daily Brief between spouses: three directions for Tony to pick from

Inherits the <style>, status bar and header from daily-brief-reminder-loop.html, the prototype
Tony already reviewed, so these read as the same screens. Icons are read from the Phosphor
package in the Video 6 folder, never hand-drawn. Re-run after changing any of that.
"""
import re
from pathlib import Path

here = Path(__file__).parent
src = (here / "daily-brief-reminder-loop.html").read_text(encoding="utf-8")
style = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
at5 = src.index("Step 5")
SB = re.search(r'<div class="sb">.*?</span></div>', src[at5:], re.S).group(0)

PHOS = here.parent.parent / "SPROUT VIDEO" / "Video 6 - Parent Story" / "node_modules" / "@phosphor-icons" / "core" / "assets"


def ph(name, weight="regular"):
    fname = name if weight == "regular" else f"{name}-{weight}"
    svg = (PHOS / weight / f"{fname}.svg").read_text(encoding="utf-8")
    svg = re.sub(r'<svg[^>]*>', '<svg viewBox="0 0 256 256">', svg)
    svg = svg.replace('fill="currentColor"', "")
    return f'<span class="ph">{svg}</span>'


BELL, MIC, AGAIN, KEYS, X, CHECK, PLUS, SEND, CARET, ARROW = (
    ph("bell"), ph("microphone"), ph("arrow-counter-clockwise"), ph("keyboard"), ph("x"),
    ph("check"), ph("plus"), ph("paper-plane-tilt"), ph("caret-right"), ph("arrow-left"))
CAL, CLOCK = ph("calendar-blank"), ph("clock")

# The household: Tony (the viewer) and Dana. Photos are the join-page cast, reused as placeholders.
PHOTO = {"me": "assets/people/marcus.webp", "sp": "assets/people/jen.webp"}
NAME = {"me": "Tony", "sp": "Dana"}

EXTRA = """
  /* ── 30 Sep: photos instead of initials, both photos when it's for both of you ── */
  .pf{width:28px;height:28px;border-radius:50%;flex-shrink:0;border:2px solid #fff;box-shadow:0 0 0 1px var(--border);
    overflow:hidden;background:#e6e0d2}
  .pf img{display:block;width:100%;height:100%;object-fit:cover}
  .pf2{display:flex;flex-shrink:0;width:44px}
  .pf2 .pf+.pf{margin-left:-12px}
  .titem .ttx .m .fwho{color:var(--ink);font-weight:600}
  .titem.done .pf{filter:grayscale(.2)}
  .due{display:inline-block;font-size:10.5px;font-weight:700;border-radius:99px;padding:2px 7px;vertical-align:1px;
    background:var(--brand-light);color:var(--green)}
  .due.today{background:#fbe4e0;color:#a83f34}
  .cap{min-height:210px}
  .top .cal{position:relative}
  .top .cal .badge{position:absolute;top:7px;right:8px;width:9px;height:9px;border-radius:50%;background:var(--error);border:2px solid var(--bg)}
  .viewer{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
    color:#fff;background:var(--ink);border-radius:99px;padding:3px 10px 3px 3px;margin:0 0 8px}
  .viewer .pf{width:20px;height:20px;border-width:1.5px}

  /* ── B5: add by typing, a sheet over the brief ── */
  .scrim{position:absolute;inset:0;background:rgba(20,30,24,.38);z-index:25}
  .sheet{position:absolute;left:0;right:0;bottom:0;background:var(--bg);border-radius:26px 26px 0 0;z-index:30;
    box-shadow:0 -10px 40px rgba(0,0,0,.18);display:flex;flex-direction:column;padding-bottom:26px}
  .sheet .grab{width:38px;height:5px;border-radius:99px;background:#cfc8ba;margin:9px auto 2px}
  .sheet .shd{display:flex;align-items:center;padding:8px 20px 6px}
  .sheet .shd .tt{flex:1;font-family:var(--serif);font-size:21px;font-weight:600;color:var(--ink)}
  .sheet .shd .x{font-size:13.5px;font-weight:600;color:var(--green)}
  .sheet .sbody{padding:4px 20px 0}
  .tfield{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--brand-border);border-radius:14px;
    padding:12px 12px 12px 16px;box-shadow:var(--shadow-m);margin-bottom:16px}
  .tfield .v{flex:1;font-size:15.5px;color:var(--ink);line-height:1.4}
  .tfield .v.ph0{color:#a89e8c}
  .tfield .caret{display:inline-block;width:1.5px;height:18px;background:var(--green);vertical-align:-4px;margin-left:1px;animation:blink 1s steps(1) infinite}
  .tfield .micb{width:34px;height:34px;border-radius:50%;background:var(--brand-light);color:var(--green);display:grid;place-items:center;flex-shrink:0}
  .tfield .micb .ph{width:17px;height:17px}
  .lbl{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:0 2px 8px}
  .chips{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:16px}
  .chip{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px;border-radius:99px;background:#fff;
    border:1.5px solid var(--border);font-size:13.5px;font-weight:500;color:var(--ink)}
  .chip .ph{width:15px;height:15px;color:var(--muted)}
  .chip.on{border-color:var(--green);background:var(--brand-light);font-weight:600}
  .chip.on .ph{color:var(--green)}
  .chip .pf{width:24px;height:24px;margin-left:-7px;border-width:1.5px}
  .chip .pf2{width:36px;margin-left:-7px}
  .chip .pf2 .pf{margin-left:0}.chip .pf2 .pf+.pf{margin-left:-11px}
  .sendbtn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:16px;padding:15px;
    background:var(--green);color:#fff;font-family:var(--serif);font-size:16px;font-weight:500;box-shadow:var(--shadow-l)}
  .sendbtn .ph{width:18px;height:18px}
  .sendbtn.off{background:#b9c6bb;box-shadow:none}
  .kb{background:#d1d4db;padding:8px 4px 30px;display:flex;flex-direction:column;gap:9px;margin-top:14px}
  .kb .r{display:flex;gap:5px;justify-content:center}
  .kb .k{width:31px;height:40px;border-radius:6px;background:#fff;box-shadow:0 1px 0 #898a8e;display:grid;place-items:center;
    font-size:17px;color:#111}
  .kb .k.w{width:44px;background:#adb2bc}.kb .k.sp{width:190px}.kb .k.rt{width:86px;background:#adb2bc;font-size:14px}
  .toast{position:absolute;left:16px;right:16px;bottom:26px;z-index:40;display:flex;align-items:center;gap:10px;background:var(--ink);
    color:#fff;border-radius:14px;padding:12px 14px;font-size:13px;line-height:1.4;box-shadow:var(--shadow-l)}
  .toast .pf{width:26px;height:26px;border-color:var(--ink)}
  .toast b{font-weight:600}

  /* ── B6: when voice doesn't give us a reminder ── */
  .err{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:26px 26px 0}
  .err .stipple{width:120px;height:120px;background-color:#eee9de;background-image:radial-gradient(rgba(125,113,94,.45) 1px, transparent 1.3px)}
  .err h2{font-family:var(--serif);font-size:23px;font-weight:600;color:var(--ink);margin:22px 0 8px;line-height:1.25;text-wrap:balance}
  .err p{font-size:14px;color:var(--muted);line-height:1.55;margin:0;max-width:290px}
  .err .vex{margin-top:22px}
  .erracts{position:absolute;left:0;right:0;bottom:0;padding:0 20px 34px;display:flex;flex-direction:column;gap:10px}
  .erracts .btn{display:flex;align-items:center;justify-content:center;gap:8px}
  .erracts .btn .ph{width:18px;height:18px}
  .btn.ghost{background:#fff;color:var(--green);border:1.5px solid var(--border);box-shadow:none}
  .dtfield.miss{border:1.5px dashed #d6a646;background:#fffaf0}
  .dtfield.miss .v{color:#8a6414}
  .misshint{display:flex;gap:8px;align-items:flex-start;background:var(--amber-bg);border:1px solid var(--amber-br);border-radius:12px;
    padding:10px 12px;font-size:12.5px;line-height:1.5;color:#7a5a12;margin:-8px 0 20px}
  .who .av{overflow:hidden}
  .who .av img{display:block;width:100%;height:100%;object-fit:cover}
  .who .o:not(.on) .av img{filter:grayscale(1);opacity:.55}
  .who .av.pair{width:auto;height:36px;background:none;display:flex}
  .who .av.pair img{width:36px;height:36px;border-radius:50%;border:2px solid #fff}
  .who .av.pair img+img{margin-left:-14px}

  /* ── B7: shared brief directions ── */
  .dir{display:inline-block;font-size:9.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#fff;
    background:#8a6414;border-radius:99px;padding:4px 10px;margin:0 0 7px 6px}
  .inv+.inv{margin-top:8px}
  .inv.settled{background:#f7faf7;box-shadow:0 0 0 1.5px var(--brand-light) inset}
  .inv .st{font-size:12px;color:var(--green);font-weight:600;margin-top:3px;display:flex;align-items:center;gap:6px}
  .inv .st .pf{width:20px;height:20px;border-width:1.5px}
  .inv .chg{font-size:12.5px;font-weight:600;color:var(--green);flex-shrink:0}
  .inv .fam{display:flex;flex-direction:column;gap:5px;margin-top:7px}
  .inv .fam .p{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--muted)}
  .inv .fam .p .pf{width:20px;height:20px;border-width:1.5px}
  .inv .fam .p b{color:var(--ink);font-weight:600}
  .inv .fam .p .ok{color:var(--green);font-weight:700}
  .inv.tall{align-items:flex-start}
  .inv.tall .acts{align-self:center}
  .sec p .pf{width:20px;height:20px;border-width:1.5px;display:inline-block;vertical-align:-5px;margin-left:4px}
  .src{font-size:11.5px;color:var(--muted)}
"""


def pf(who):
    return f'<span class="pf"><img src="{PHOTO[who]}" alt="{NAME.get(who, "Lydia")}"></span>'


def pair():
    return f'<span class="pf2">{pf("me")}{pf("sp")}</span>'


def row(name, meta, face, done=False, new=False):
    faces = pair() if face == "both" else pf(face)
    cls = "titem" + (" done" if done else "") + (" new" if new else "")
    return (f'<div class="{cls}"><div class="tbox"><div class="inner"></div>{CHECK}</div>{faces}'
            f'<div class="ttx"><div class="n">{name}</div><div class="m">{meta}</div></div></div>')


def sb(time):
    return re.sub(r"<span>[0-9:]+</span>", f"<span>{time}</span>", SB, count=1)


def top(time):
    return (f'<div class="top"><div class="sp"></div><div class="brand"><div class="t">Sprout</div>'
            f'<div class="s">Your daily briefing · {time} AM</div></div>'
            f'<div class="cal" title="Notifications">{BELL}<span class="badge"></span></div></div>')


def reminders(items, title="Family reminders"):
    return (f'<div class="shead"><div class="ttl">&#9989; {title}</div><button class="add">{PLUS}Add</button></div>'
            f'<div class="tlist">{"".join(items)}</div>')


def device(inner, time="7:31"):
    return f"""<div class="device"><div class="island"></div><div class="screen">
    {sb(time)}
    {inner}
  </div></div>"""


def brief(time, body, overlay="", greet="Good morning, Tony."):
    return device(f"""{top(time)}
    <div class="body">
      <div class="greet"><p class="h">{greet}</p><p class="s">Here&rsquo;s your Wednesday:</p></div>
      {body}
    </div>
    {overlay}""", time)


def panel(n, title, body, dev, openq="", tag=""):
    oq = f'<div class="openq">{openq}</div>' if openq else ""
    return f"""<div class="panel">
  <div class="cap"><span class="n">{n}</span>{tag}<b>{title}</b>{body}{oq}</div>
  {dev}
</div>"""


HAPPENING = ('<div class="div"></div><div class="sec"><p class="h">&#128197; Happening today</p><p><b>All day</b>: Staff appreciation fundraiser · Kiker Elementary</p></div>'
             '<div class="div"></div><div class="sec"><p class="h">&#128198; Upcoming events</p>'
             '<p><b>Sat, Oct 3</b>: Fall Festival · Kiker Elementary</p><p><b>Fri, Oct 9</b>: Pizza Day · 1st Grade</p></div>')
RP = 'from Lydia, room parent'

# ─────────────────────────────── B4 ───────────────────────────────
FAMILY = [
    row("Pick up Presley from school", f'<span class="due today">Today</span> · 2:00 PM · for <span class="fwho">Dana</span>', "sp"),
    row("Sign Jake&rsquo;s permission slip", f'<span class="due">Due Fri</span> · {RP}', "both"),
    row("Book the dentist for Presley", '<span class="due">Due Mon</span> · for <span class="fwho">you</span>', "me"),
    row("Bring towels for Water Day", '<span class="by">Dana did this</span> · 8:12 AM', "sp", done=True),
]
b4a = panel("B4 · Tony&rsquo;s phone", "One list for the family, a photo on every item.",
    "Tony, 30 Sep: <i>&ldquo;It might make sense to just merge them&hellip; like family reminders.&rdquo;</i> "
    "Yours and Dana&rsquo;s sit in one list, sorted by when they&rsquo;re due. The photo says who it&rsquo;s for: "
    "Dana&rsquo;s, yours, or <span class=\"k\">both of you</span> side by side, the way Notion stacks assignees. "
    "A reminder from the room parent goes to the household, so it carries both.",
    brief("7:31", reminders(FAMILY) + HAPPENING))

FAMILY_DANA = [
    row("Pick up Presley from school", f'<span class="due today">Today</span> · 2:00 PM · <span class="by">from Tony</span>', "sp"),
    row("Sign Jake&rsquo;s permission slip", f'<span class="due">Due Fri</span> · {RP}', "both"),
    row("Book the dentist for Presley", '<span class="due">Due Mon</span> · for <span class="fwho">Tony</span>', "me"),
    row("Bring towels for Water Day", '<span class="by">You did this</span> · 8:12 AM', "sp", done=True),
]
b4b = panel("B4 · Dana&rsquo;s phone", "Same list on Dana&rsquo;s phone.",
    "Same items, same photos, same order: it&rsquo;s one list, not two lists that sync. Only the words turn around: "
    "<span class=\"k\">from Tony</span>, <span class=\"k\">You did this</span>. When either of you ticks something, it ticks on both phones, "
    "and the other one sees whose photo is on it (the 24-hour rule from the lifecycle prototype still applies).",
    brief("7:34", reminders(FAMILY_DANA) + HAPPENING, greet="Good morning, Dana."))

SPEC_B4 = """
<div class="specwrap"><table class="spec">
<tr><th>Reminder</th><th>Photo</th><th>Line under the title</th></tr>
<tr><td><b>You set it for yourself</b></td><td>yours</td><td>for <b>you</b></td></tr>
<tr><td><b>You set it for Dana</b></td><td>Dana&rsquo;s</td><td>for <b>Dana</b> on yours · <b>from Tony</b> on hers</td></tr>
<tr><td><b>You set it for both</b></td><td>both, yours first</td><td>for <b>both of you</b></td></tr>
<tr><td><b>From the room parent</b></td><td>both (it&rsquo;s the household&rsquo;s)</td><td>from Lydia, room parent</td></tr>
<tr><td><b>Ticked</b></td><td>whoever ticked it</td><td><b>Dana did this</b> · time, struck through, stays about a day</td></tr>
</table>
<div class="openq" style="max-width:880px"><span class="k">For Tony:</span>
(1) Section name: drawn as <b>Family reminders</b>, his words. It still holds room-parent to-dos, which are reminders too.
(2) A parent with no linked spouse sees the same list with only their own photo, so nothing changes for them.
(3) Photos are the join-page cast, standing in until real profile photos.</div>
</div>"""

# ─────────────────────────────── B5 ───────────────────────────────
KB = """<div class="kb">
  <div class="r">""" + "".join(f'<span class="k">{c}</span>' for c in "qwertyuiop") + """</div>
  <div class="r">""" + "".join(f'<span class="k">{c}</span>' for c in "asdfghjkl") + """</div>
  <div class="r"><span class="k w">&#8679;</span>""" + "".join(f'<span class="k">{c}</span>' for c in "zxcvbnm") + """<span class="k w">&#9003;</span></div>
  <div class="r"><span class="k w">123</span><span class="k sp">space</span><span class="k rt">return</span></div>
</div>"""


def who_chips(sel):
    opts = [("me", f'{pf("me")}Me'), ("sp", f'{pf("sp")}Dana'), ("both", f'<span class="pf2">{pf("me")}{pf("sp")}</span>Both')]
    return '<div class="chips">' + "".join(f'<span class="chip{" on" if k == sel else ""}">{v}</span>' for k, v in opts) + "</div>"


def when_chips(day, time):
    days = ["Today", "Tomorrow", f"{CAL}Pick a date"]
    d = "".join(f'<span class="chip{" on" if x == day else ""}">{x}</span>' for x in days)
    return (f'<div class="chips">{d}</div><div class="lbl">Time</div>'
            f'<div class="chips"><span class="chip{" on" if time else ""}">{CLOCK}{time or "Any time"}</span></div>')


def add_sheet(text, who, day, time, btn, keyboard):
    field = (f'<span class="v">{text}<span class="caret"></span></span>' if text
             else '<span class="v ph0"><span class="caret"></span>What needs doing?</span>')
    return f"""<div class="scrim"></div>
    <div class="sheet"><div class="grab"></div>
      <div class="shd"><div class="tt">New reminder</div><span class="x">Cancel</span></div>
      <div class="sbody">
        <div class="tfield">{field}<span class="micb" title="Say it instead">{MIC}</span></div>
        <div class="lbl">For</div>{who_chips(who)}
        {"" if keyboard else '<div class="lbl">When</div>' + when_chips(day, time)}
        {"" if keyboard else f'<button class="sendbtn">{SEND}{btn}</button>'}
      </div>
      {KB if keyboard else ""}
    </div>"""


B5_BASE = [FAMILY[1], FAMILY[2], FAMILY[3]]
b5a = panel("B5 · 1", "+ Add opens a sheet with the keyboard up.",
    "Tony, 30 Sep: <i>&ldquo;When I&rsquo;m looking at reminders, I might think of another one&hellip; I can just type out, like, "
    "pick up Presley. And then I just set the date, time, and send it.&rdquo;</i> "
    "The field is focused, so you type first. It starts on <span class=\"k\">Me</span>, today, any time: typing and hitting return is already a reminder. "
    "The mic in the field switches to voice for anyone who&rsquo;d rather talk.",
    brief("7:32", reminders(B5_BASE) + HAPPENING, overlay=add_sheet("", "me", "Today", "", "", True)))

b5b = panel("B5 · 2", "Type, tap Dana, tap the time, send.",
    "Keyboard down, the rest shows: <span class=\"k\">For</span> with photos, <span class=\"k\">When</span> as one-tap chips, and a time. "
    "The button says what will happen: <span class=\"k\">Send to Dana</span>, <span class=\"k\">Add for me</span>, or <span class=\"k\">Send to both of you</span>. "
    "Three taps after typing, no review screen, because nothing had to be interpreted.",
    brief("7:32", reminders(B5_BASE) + HAPPENING,
          overlay=add_sheet("Pick up Presley from school", "sp", "Tomorrow", "2:00 PM", "Send to Dana", False)))

NEW_ROW = row("Pick up Presley from school", '<span class="due">Tomorrow</span> · 2:00 PM · for <span class="fwho">Dana</span>', "sp", new=True)
b5c = panel("B5 · 3", "It lands in the list, and Dana has it too.",
    "The sheet closes on the brief. The new row is outlined for a moment, sorted in by date, with Dana&rsquo;s photo. "
    "The toast confirms it reached her, not just that it saved.",
    brief("7:33", reminders([NEW_ROW] + B5_BASE) + HAPPENING,
          overlay=f'<div class="toast">{pf("sp")}<span><b>Sent to Dana.</b> It&rsquo;s on her list now.</span></div>'),
    openq='<span class="k">For Tony:</span> he said this <i>&ldquo;would take precedence over nudge&rdquo;</i>. '
          'So + Add is the one action in the header, and Nudge (the 17 Sep spouse to-do idea) is not drawn. Parked, not dropped.')

# ─────────────────────────────── B6 ───────────────────────────────
def voice_top(title):
    return f'<div class="vtop"><div class="ibtn">{X}</div><div class="tt">{title}</div><div class="sp"></div></div>'


b6a = panel("B6 · 1", "Heard something, but not a reminder.",
    "Mohit asked for this one: the parent talked, but there&rsquo;s nothing to remind anyone about (&ldquo;what&rsquo;s the weather like&rdquo;, "
    "or the TV). We don&rsquo;t show what we heard, same reason there&rsquo;s no live transcript. We show the sentence that works, "
    "and two ways forward: <span class=\"k\">Try again</span> goes straight back to listening, <span class=\"k\">Type it instead</span> opens the B5 sheet.",
    device(f"""{voice_top("New reminder")}
    <div class="err"><div class="stipple"></div>
      <h2>We couldn&rsquo;t find a reminder in that</h2>
      <p>Say what needs doing, and when. Who it&rsquo;s for is optional.</p>
      <div class="vex"><span class="l">Say it like this</span>
        <p>&ldquo;Remind <b>Dana</b> to <b>pick up Presley from school</b> at <b>2PM</b>.&rdquo;</p></div>
    </div>
    <div class="erracts"><button class="btn">{MIC}Try again</button><button class="btn ghost">{KEYS}Type it instead</button></div>""", "9:42"))

b6b = panel("B6 · 2", "Heard the task, missed the when: no error.",
    "A missing piece is not a failure. If we got <i>what</i> but not <i>when</i>, go to Review as usual with the gap marked: "
    "<span class=\"k\">Today, any time</span> is filled in so Set reminder still works, and the amber box asks you to check it. "
    "No one gets sent back to talk again for something one tap fixes.",
    device(f"""<div class="top2"><div class="ibtn">{ARROW}</div><div class="tt">Review reminder</div><div class="sp"></div></div>
    <div class="body2">
      <div class="flabel">Reminder</div>
      <div class="rfield">Pick up Presley from school</div>
      <div class="flabel">Who it&rsquo;s for</div>
      <div class="who">
        <div class="o"><span class="av"><img src="{PHOTO['me']}" alt=""></span><span class="l">Myself</span></div>
        <div class="o on"><span class="av"><img src="{PHOTO['sp']}" alt=""></span><span class="l">Dana</span></div>
        <div class="o"><span class="av pair"><img src="{PHOTO['me']}" alt=""><img src="{PHOTO['sp']}" alt=""></span><span class="l">Both</span></div>
      </div>
      <div class="flabel">When</div>
      <div class="dtrow">
        <div class="dtfield miss">{CAL}<span class="v">Today</span></div>
        <div class="dtfield miss">{CLOCK}<span class="v">Any time</span></div>
      </div>
      <div class="misshint">We didn&rsquo;t catch when. Is today, any time, right?</div>
    </div>
    <div class="cta"><button class="btn">Set reminder</button></div>""", "9:42"))

SPEC_B6 = """
<div class="specwrap"><table class="spec">
<tr><th>What came back</th><th>What the parent sees</th></tr>
<tr><td><b>Nothing usable at all</b> (silence, noise, off-topic)</td><td>B6 · 1. Try again / Type it instead</td></tr>
<tr><td><b>A task, no when</b></td><td>B6 · 2. Review, Today + Any time filled in and marked amber</td></tr>
<tr><td><b>A task and a day, no time</b></td><td>Review, time marked amber as Any time</td></tr>
<tr><td><b>A task, no who</b></td><td>Review with Myself selected. Not an error, just the default</td></tr>
<tr><td><b>Our side failed</b> (network, n8n)</td><td>Same screen as B6 · 1, heading &ldquo;That didn&rsquo;t go through&rdquo;, body &ldquo;Nothing was saved. Try again in a moment.&rdquo;</td></tr>
</table>
<div class="openq" style="max-width:880px"><span class="k">Not designed on purpose:</span> the processing screen between the check and Review.
Tony, 30 Sep: Mohit builds it with Whisper first, the three of us try it, and we design for however long it actually takes.
Until then, step 3 of the reminder loop (&ldquo;Putting it together&rdquo;) stands in. <i>&ldquo;We can make it awkward in the beginning.&rdquo;</i></div>
</div>"""

# ─────────────────────────────── B7 ───────────────────────────────
PICKLE = f"""<div class="inv"><div class="thumb">&#127934;</div><div class="tx"><div class="n">Pickleball at Circle C</div>
  <div class="m">Sun, Oct 4 · from Jake R. · just you</div></div><div class="acts"><span>No</span><span class="y">Yes</span></div></div>"""
INV_HEAD = '<div class="div"></div><div class="shead"><div class="ttl">&#9993;&#65039; Your invitations</div></div>'


def upcoming(extra=""):
    return ('<div class="div"></div><div class="sec"><p class="h">&#128198; Upcoming events</p>'
            f'{extra}<p><b>Fri, Oct 9</b>: Pizza Day · 1st Grade</p></div>')


FEST_GOING = f'<p><b>Sat, Oct 3</b>: Fall Festival <span class="going">Going</span>{pf("sp")}</p>'
VIEWER = reminders([FAMILY[0], FAMILY[1]])

dA = panel("Direction A", "Answered for the family. It just leaves.",
    "Dana taps Yes on Lydia&rsquo;s Fall Festival invitation, for the family. On Tony&rsquo;s phone it&rsquo;s no longer an invitation: "
    "it&rsquo;s in Upcoming with <span class=\"k\">Going</span> and Dana&rsquo;s photo. Tony: <i>&ldquo;I don&rsquo;t also need to answer that invitation. "
    "It should kind of go away.&rdquo;</i> Jake&rsquo;s pickleball invite was only for Tony, so it waits for him.",
    brief("7:31", VIEWER + INV_HEAD + PICKLE + upcoming(FEST_GOING)),
    tag='<span class="dir">Quietest</span>',
    openq="<span class=\"k\">Risk:</span> Tony never sees that it happened unless he reads Upcoming. Fine if he trusts Dana&rsquo;s answer; "
          "a surprise if he had other plans that Saturday.")

SETTLED = f"""<div class="inv settled"><div class="thumb">&#127810;</div><div class="tx"><div class="n">Fall Festival</div>
  <div class="m">Sat, Oct 3 · from Lydia, room parent</div>
  <div class="st">{pf("sp")}Dana said yes for the family</div></div><span class="chg">Change</span></div>"""
dB = panel("Direction B", "Settled where you&rsquo;d look for it, for a day.",
    "The invitation stays in Your invitations until tomorrow morning, but answered: Dana&rsquo;s photo, "
    "<span class=\"k\">Dana said yes for the family</span>, and <span class=\"k\">Change</span> if Tony knows something she doesn&rsquo;t. "
    "Then it moves to Upcoming like Direction A. Same idea as a ticked reminder staying on the list for a day.",
    brief("7:31", VIEWER + INV_HEAD + SETTLED + PICKLE + upcoming()),
    tag='<span class="dir">Recommended</span>',
    openq="<span class=\"k\">Why recommended:</span> the household answers once (what Tony asked for), and the other parent still finds out "
          "in the place they&rsquo;d look. It reuses the rule we already have for ticked reminders, so there&rsquo;s nothing new to learn.")

EACH = f"""<div class="inv tall"><div class="thumb">&#127810;</div><div class="tx"><div class="n">Fall Festival</div>
  <div class="m">Sat, Oct 3 · from Lydia, room parent</div>
  <div class="fam"><div class="p">{pf("sp")}<b>Dana</b><span class="ok">Going</span></div>
  <div class="p">{pf("me")}<b>You</b>not answered yet</div></div></div>
  <div class="acts"><span>No</span><span class="y">Yes</span></div></div>"""
dC = panel("Direction C", "Each of you answers, both of you see.",
    "The opposite of A: nobody answers for anyone. The invitation stays for Tony until he answers, with the household under it: "
    "Dana going, Tony not yet. Headcount adds up per person.",
    brief("7:31", VIEWER + INV_HEAD + EACH + PICKLE + upcoming()),
    tag='<span class="dir">Most control</span>',
    openq="<span class=\"k\">Against it:</span> it&rsquo;s exactly the double answering Tony wants gone. Drawn so the choice is visible, "
          "and because it&rsquo;s the only one that works for parents who are separated.")

SPEC_B7 = """
<div class="specwrap"><table class="spec">
<tr><th>Invitation</th><th>Shared by the household?</th></tr>
<tr><td><b>From the room parent</b> (class events, portal)</td><td>Yes. One answer counts for the family, with a headcount (parents / kids) like today</td></tr>
<tr><td><b>From another parent to the class</b> (a birthday party)</td><td>Yes, same as room parent: it&rsquo;s addressed to the family</td></tr>
<tr><td><b>To one person</b> (Jake&rsquo;s pickleball)</td><td>No. Only that person sees it and answers it</td></tr>
</table>
<div class="openq" style="max-width:880px"><span class="k">Questions for tomorrow&rsquo;s session with Tony:</span>
(1) Which direction: A, B (recommended) or C.
(2) Dana says yes, Tony says no later: does the last answer win, or does Change ask Dana first?
(3) Who counts in &ldquo;the family&rdquo; for the headcount: set by whoever answers, or both parents by default?
(4) Separated parents, each linked to the kids but not to each other: two households, no sharing. Right?
(5) The rest of the brief (weather, Happening today, lunch) is already the same for both; only invitations and reminders need rules.</div>
</div>"""

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Family reminders · Sprout</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<!-- Generated by build-family-reminders.py from daily-brief-reminder-loop.html. Edit the script, not this file. -->
<style>{style}{EXTRA}</style>
</head>
<body>

<div class="lede">
  <h1>Family reminders, and one brief for two parents</h1>
  <p class="p">From the 30 Sep call. Tony: <i>&ldquo;The big one that we need to nail is just reminders.&rdquo;</i>
  Same household as the reminder loop and the lifecycle: Tony and Dana. Four parts, left to right in each row:
  one family list, adding a reminder by typing, what happens when voice doesn&rsquo;t work, and three directions for a shared brief.</p>
  <div class="quote"><b>Tony, 30 Sep:</b> <i>&ldquo;The Sprout daily brief is almost gonna be like a share&hellip; the spouses are all in the same classes&hellip;
  those two daily briefs should be one and the same.&rdquo;</i></div>
  <div class="gone">
    <span><s>Initials</s> <b>photos</b></span>
    <span><s>Mine / spouse&rsquo;s split</s> <b>one Family reminders list</b></span>
    <span><b>+ Add by typing</b></span>
    <span><s>Calendar icon</s> <b>notifications bell</b> (Tony, 30 Sep)</span>
  </div>
</div>

<div class="band"><h2>B4 · One family list</h2>
<p>Everything the household needs to do, in one place, with a photo that answers &ldquo;whose is this?&rdquo; before you read the title.</p></div>
<div class="row">
{b4a}
{b4b}
</div>
{SPEC_B4}

<div class="band"><h2>B5 · Add a reminder by typing</h2>
<p>For when you&rsquo;re already looking at the list and think of one more. No voice, no review, three taps after typing.</p></div>
<div class="row">
{b5a}
{b5b}
{b5c}
</div>

<div class="band"><h2>B6 · When voice doesn&rsquo;t give us a reminder</h2>
<p>One real error screen, for when there&rsquo;s nothing to work with. Everything else is a gap we fill and mark, not an error.</p></div>
<div class="row">
{b6a}
{b6b}
</div>
{SPEC_B6}

<div class="band"><h2>B7 · One brief for two parents: three directions</h2>
<p>For tomorrow&rsquo;s working session with Tony. The same moment in each: Dana has said yes to Lydia&rsquo;s Fall Festival invitation, and this is Tony&rsquo;s phone.
Tony: <i>&ldquo;We don&rsquo;t have that fully fleshed out.&rdquo;</i> So these are options to pick from, not a decision.</p></div>
<div class="row">
{dA}
{dB}
{dC}
</div>
{SPEC_B7}

<script>
/* tap an open row to tick it, like the reminder loop */
document.querySelectorAll('.tlist .titem').forEach(r => r.addEventListener('click', () => r.classList.toggle('done')));
</script>
</body>
</html>
"""
out = here / "daily-brief-family-reminders.html"
out.write_text(html, encoding="utf-8")
print(out, len(html))
