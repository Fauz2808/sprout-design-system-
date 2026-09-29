"""Builds daily-brief-reminder-lifecycle.html (T1-T4 from the 18 Sep call, direction A "one list").

    python3 build-reminder-lifecycle.py

Inherits the <style>, status bar and Daily Brief header from daily-brief-reminder-loop.html,
the prototype Tony already reviewed, so the new panels read as the same screens (sprout-screen
step 1b). Re-run after changing that file or the panel data below.
"""
import re
from pathlib import Path

here = Path(__file__).parent
src = (here / "daily-brief-reminder-loop.html").read_text(encoding="utf-8")
style = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
at5 = src.index("Step 5")
SB = re.search(r'<div class="sb">.*?</span></div>', src[at5:], re.S).group(0)
t = src.index('<div class="top">', at5)
TOP = src[t:src.index('<div class="body">', t)].strip()
CHECK = '<span class="ph"><svg viewBox="0 0 256 256"><path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32"/></svg></span>'
PLUS = '<span class="ph"><svg viewBox="0 0 256 256"><path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8"/></svg></span>'
CARET = '<span class="ph"><svg viewBox="0 0 256 256"><path d="m181.66 133.66-80 80a8 8 0 0 1-11.32-11.32L164.69 128 90.34 53.66a8 8 0 0 1 11.32-11.32l80 80a8 8 0 0 1 0 11.32"/></svg></span>'

EXTRA = """
  /* ── reminder lifecycle (T1-T4): one list, every day until due, ticked stays 24 h, then History ── */
  .due{display:inline-block;font-size:10.5px;font-weight:700;border-radius:99px;padding:2px 7px;vertical-align:1px;
    background:var(--brand-light);color:var(--green)}
  .due.soon{background:var(--amber-bg);color:#8a6414}
  .due.today{background:#fbe4e0;color:#a83f34}
  .titem.focus{box-shadow:0 0 0 1.5px var(--brand-border),var(--shadow-m)}
  .donelink{display:flex;justify-content:flex-end;margin-top:8px}
  .donelink button{display:inline-flex;align-items:center;gap:4px;background:none;border:none;padding:8px 0;cursor:pointer;
    font-family:var(--sans);font-size:13px;font-weight:600;color:var(--green)}
  .donelink .ph{width:13px;height:13px}
  .day{display:inline-block;font-size:9.5px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:#fff;
    background:var(--ink);border-radius:99px;padding:4px 10px;margin:0 0 7px 6px}
  .cap{min-height:190px}
  /* History sheet */
  .scrim{position:absolute;inset:0;background:rgba(20,30,24,.38);z-index:25}
  .sheet{position:absolute;left:0;right:0;bottom:0;top:128px;background:var(--bg);border-radius:26px 26px 0 0;z-index:30;
    box-shadow:0 -10px 40px rgba(0,0,0,.18);display:flex;flex-direction:column}
  .sheet .grab{width:38px;height:5px;border-radius:99px;background:#cfc8ba;margin:9px auto 4px}
  .sheet .shd{display:flex;align-items:center;padding:6px 20px 4px}
  .sheet .shd .tt{flex:1;font-family:var(--serif);font-size:21px;font-weight:600;color:var(--ink)}
  .sheet .shd .x{font-size:13px;font-weight:600;color:var(--green)}
  .sheet .sub{font-size:12.5px;color:var(--muted);padding:0 20px 8px;line-height:1.5}
  .sheet .sbody{flex:1;overflow-y:auto;padding:4px 20px 30px}
  .sheet .grp{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#a49a86;margin:14px 0 8px}
  .hrow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #e6e0d2}
  .hrow .tbox{width:22px;height:22px;border-radius:7px;background:var(--green)}
  .hrow .tbox .ph{display:block;width:13px;height:13px;color:#fff}
  .hrow .face{width:24px;height:24px;font-size:9.5px}
  .hrow .tx{flex:1;min-width:0}
  .hrow .tx .n{font-family:var(--serif);font-size:14px;font-weight:600;color:var(--ink);line-height:1.3}
  .hrow .tx .m{font-size:12px;color:var(--muted);margin-top:1px}
  .hrow.missed .tbox{background:transparent;border:1.5px dashed #b9b1a1}
  .hrow.missed .tbox .ph{display:none}
  .hrow.missed .tx .n{color:var(--muted)}
"""

def item(name, meta, face="me", ini="TM", done=False, focus=False):
    cls = "titem" + (" done" if done else "") + (" focus" if focus else "")
    return (f'<div class="{cls}"><div class="tbox"><div class="inner"></div>{CHECK}</div>'
            f'<span class="face {face}">{ini}</span><div class="ttx"><div class="n">{name}</div><div class="m">{meta}</div></div></div>')

def brief(time, weekday, items, done_count=None, happening="", sheet=""):
    donelink = (f'<div class="donelink"><button>Done ({done_count}) {CARET}</button></div>' if done_count else "")
    hap = f'<div class="div"></div><div class="sec"><p class="h">&#128197; Happening today</p><p>{happening}</p></div>' if happening else ""
    top = re.sub(r"Your daily briefing · [0-9:]+ [AP]M", f"Your daily briefing · {time}", TOP)
    sb = re.sub(r"<span>[0-9:]+</span>", f"<span>{time.split(' ')[0]}</span>", SB, count=1)
    return f"""<div class="device"><div class="island"></div><div class="screen">
    {sb}
    {top}
    <div class="body">
      <div class="greet"><p class="h">Good morning, Tony.</p><p class="s">Here&rsquo;s your {weekday}:</p></div>
      <div class="shead"><div class="ttl">&#9989; To do</div><button class="add">{PLUS}Add</button></div>
      <div class="tlist">{''.join(items)}</div>
      {donelink}
      {hap}
    </div>
    {sheet}
  </div></div>"""

def panel(n, day, title, body, device, openq=""):
    oq = f'<div class="openq">{openq}</div>' if openq else ""
    return f"""<div class="panel">
  <div class="cap"><span class="n">{n}</span><span class="day">{day}</span><b>{title}</b>{body}{oq}</div>
  {device}
</div>"""

SLIP = "Sign Jake&rsquo;s permission slip"
RP = '<span class="by">from Room parent</span>'

p1 = panel("T2", "Mon 7:31 AM", "Sent with a due date, and it shows up right away.",
    "Lydia added it in the portal with only a due date, no calendar day (Tony: he just fills in the due date). "
    "It lands on the list the day it&rsquo;s sent and stays there every morning until then.",
    brief("7:31 AM", "Monday", [
        item(SLIP, f'<span class="due">Due Fri</span> · {RP}', focus=True),
        item("Pick up Presley from school", 'Today · 2:00 PM · <span class="by">from you</span>', "sp", "DM"),
    ], happening="<b>3:30 PM</b>: Soccer practice · Little Shots"))

p2 = panel("T1", "Thu 7:30 AM", "Still here on Thursday, and it says so.",
    "Same item, fourth morning. The chip is the only thing that changes: "
    '<span class="k">Due Fri</span> → <span class="k">Due tomorrow</span> → <span class="k">Due today</span>. '
    "The list sorts by due date, so it climbs as the day gets closer.",
    brief("7:30 AM", "Thursday", [
        item("Pack a snack for the field trip", '<span class="due today">Due today</span> · <span class="by">from you</span>', "sp", "DM"),
        item(SLIP, f'<span class="due soon">Due tomorrow</span> · {RP}', focus=True),
        item("Return library book", f'<span class="due soon">Due tomorrow</span> · {RP}'),
    ], happening="<b>All day</b>: Field trip · Austin Nature Center"))

p3 = panel("T1", "Fri 7:30 AM", "Due today, at the top.",
    "Nothing new to learn: the same row, now first, with the red chip. No banner, no second place it lives.",
    brief("7:30 AM", "Friday", [
        item(SLIP, f'<span class="due today">Due today</span> · {RP}', focus=True),
        item("Return library book", f'<span class="due today">Due today</span> · {RP}'),
        item("Bring towels for Water Day", '<span class="due today">Due today</span> · <span class="by">from you</span>', "sp", "DM"),
    ], happening="<b>All day</b>: School picture day · Kiker Elementary"))

p4 = panel("T3", "Fri 8:12 AM", "Dana ticks it. It stays.",
    "Struck through, Dana&rsquo;s face on it, and it drops below what&rsquo;s still open. "
    "Tony: <i>&ldquo;if I&rsquo;m someone&rsquo;s spouse and I wanna see that my wife already finished it, I want it to still be there.&rdquo;</i>",
    brief("8:12 AM", "Friday", [
        item("Return library book", f'<span class="due today">Due today</span> · {RP}'),
        item("Bring towels for Water Day", '<span class="due today">Due today</span> · <span class="by">from you</span>', "sp", "DM"),
        item(SLIP, '<span class="by">Dana did this</span> · 8:12 AM', "sp", "DM", done=True, focus=True),
    ], happening="<b>All day</b>: School picture day · Kiker Elementary"))

p5 = panel("T4", "Sat 8:15 AM", "A day later it leaves the list, not your life.",
    "About 24 hours after the tick (Tony) the row moves to History. "
    "The library book nobody ticked is gone too: a portal reminder shows until its due date and leaves the next day (Tony). "
    '<span class="k">Done (3)</span> is the way back to both.',
    brief("8:15 AM", "Saturday", [
        item("RSVP to Presley&rsquo;s birthday party", '<span class="due">Due Wed</span> · <span class="by">from you</span>', "sp", "DM"),
    ], done_count=3, happening="<b>10:00 AM</b>: Fall Festival · Kiker Elementary field"))

def hrow(name, meta, face="sp", ini="DM", missed=False):
    return (f'<div class="hrow{" missed" if missed else ""}"><div class="tbox">{CHECK}</div>'
            + (f'<span class="face {face}">{ini}</span>' if not missed else "")
            + f'<div class="tx"><div class="n">{name}</div><div class="m">{meta}</div></div></div>')

SHEET = f"""<div class="scrim"></div>
    <div class="sheet"><div class="grab"></div>
      <div class="shd"><div class="tt">History</div><span class="x">Close</span></div>
      <div class="sub">Everything your household ticked off, and what slipped past its date. One History for both of you, because it&rsquo;s one list.</div>
      <div class="sbody">
        <div class="grp">This week</div>
        {hrow(SLIP, "Dana · Fri 8:12 AM · from Room parent")}
        {hrow("Bring towels for Water Day", "Dana · Fri 7:52 AM")}
        {hrow("Pack a snack for the field trip", "You · Thu 7:40 AM", "me", "TM")}
        <div class="grp">Not ticked</div>
        {hrow("Return library book", "Was due Fri · from Room parent", missed=True)}
      </div>
    </div>"""

p6 = panel("T4", "Sat 8:16 AM", "History: one sheet, both parents.",
    "Tap Done. Mohit&rsquo;s point, and why it isn&rsquo;t just deleted: "
    "<i>&ldquo;if I come after one week and my details are gone, it&rsquo;s a little bit confusing.&rdquo;</i> "
    "Grouped by week, who did it and when. What slipped past its date sits at the end instead of vanishing.",
    brief("8:16 AM", "Saturday", [
        item("RSVP to Presley&rsquo;s birthday party", '<span class="due">Due Wed</span> · <span class="by">from you</span>', "sp", "DM"),
    ], done_count=3, happening="<b>10:00 AM</b>: Fall Festival · Kiker Elementary field", sheet=SHEET),
    openq='<span class="k">Needs Tony:</span> how long History keeps things (drawn as the current and last weeks; 30 days is the proposal).')

SPEC = """
<div class="band"><h2>The rules, one item at a time</h2>
<p>One reminder moves through four states. They are one package on purpose (18 Sep notes): designing them apart is how an item ends up in two places.</p></div>
<div class="specwrap"><table class="spec">
<tr><th>State</th><th>Where it shows</th><th>What changes</th></tr>
<tr><td><b>Open, due later</b></td><td>To do, every day from the day it&rsquo;s created or sent</td><td>Green chip with the day, <b>Due Fri</b>. A reminder from the portal needs only a due date, no calendar day (T2)</td></tr>
<tr><td><b>Due tomorrow / today</b></td><td>Same row, sorted by due date so it climbs</td><td>Amber <b>Due tomorrow</b>, then red <b>Due today</b>. Nothing else moves</td></tr>
<tr><td><b>Ticked</b></td><td>Same list, below the open ones, for about 24 hours</td><td>Struck through, the face of whoever ticked it, <b>Dana did this · 8:12 AM</b> (T3)</td></tr>
<tr><td><b>Done, after ~24 h</b></td><td>History, from <b>Done (n)</b> under the list</td><td>Leaves the brief. n counts what was ticked this week (T4)</td></tr>
<tr><td><b>Past due, never ticked</b></td><td>History, under <b>Not ticked</b></td><td>A portal reminder leaves the list the day after its due date (Tony). Proposal: personal ones do the same, so one rule covers both</td></tr>
</table>
<div class="openq" style="max-width:880px"><span class="k">Open for Tony:</span>
(1) 24 hours after the tick, or at the end of the next day? Drawn as 24 hours, as he said.
(2) A personal reminder that passes its date unticked: leave the next day like portal ones (drawn), or stay as overdue?
(3) History retention: 30 days proposed.
(4) The portal side (T4, &ldquo;app vs portal&rdquo;): the room parent&rsquo;s own to-do gets the same Done view; not drawn here.</div>
</div>"""

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Daily Brief · Reminder lifecycle · Sprout</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<!-- Generated by build-reminder-lifecycle.py from daily-brief-reminder-loop.html. Edit the script, not this file. -->
<style>{style}{EXTRA}</style>
</head>
<body>

<div class="lede">
  <h1>Daily Brief, a reminder&rsquo;s whole life</h1>
  <p class="p">T1&ndash;T4 from the 18 Sep call, direction A (Ahmad, 29 Sep): one list, no new screen in the brief.
  Follow <span style="font-weight:700;color:var(--ink)">Sign Jake&rsquo;s permission slip</span> (outlined) from Monday to Saturday.
  Same household as the reminder loop: Tony and Dana, one list, a face on every item.</p>
  <div class="quote"><b>Mohit, 18 Sep:</b> <i>&ldquo;This is not done.&rdquo;</i> A note on the 1st with a due date on the 7th only showed on the 1st.
  He fixes the backend; this is what it looks like across those days.</div>
</div>

<div class="band"><h2>Monday to Friday: it stays until it&rsquo;s due</h2>
<p>The row doesn&rsquo;t move between screens or change shape. Only the chip counts down.</p></div>
<div class="row">
{p1}
{p2}
{p3}
</div>

<div class="band"><h2>Friday to Saturday: ticked, then History</h2>
<p>Visible long enough for the other parent to see it&rsquo;s handled, then out of the way, but never gone.</p></div>
<div class="row">
{p4}
{p5}
{p6}
</div>
{SPEC}

<script>
/* tap an open row to tick it, like the reminder loop */
document.querySelectorAll('.tlist .titem').forEach(r => r.addEventListener('click', () => r.classList.toggle('done')));
</script>
</body>
</html>
"""
out = here / "daily-brief-reminder-lifecycle.html"
out.write_text(html, encoding="utf-8")
print(out, len(html))
