const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
test("every local asset is available", () => {
  const paths = [
    ...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[^\"]*)"/g),
  ].map((m) => m[1]);
  assert.ok(paths.length > 10);
  for (const asset of paths)
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
});
test("navigation and ARIA relationships resolve to unique targets", () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const m of html.matchAll(/href="#([^"]+)"/g))
    assert.ok(ids.includes(m[1]), m[1]);
  for (const m of html.matchAll(/aria-(?:controls|labelledby)="([^"]+)"/g))
    for (const id of m[1].split(" ")) assert.ok(ids.includes(id), id);
});
test("new option retains the supplied store destinations", () => {
  assert.ok(html.includes("id6739574052"));
  assert.ok(html.includes("id=com.meetingpoint"));
  assert.ok(!html.includes('href="#"'));
});
test("hero phone is a coded screen: no hand photo, no island, a soft gray stroke", () => {
  const hero =
    html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.ok(hero.includes('class="phone-scene"'));
  assert.ok(!hero.includes("hand-mom"));
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.ok(!/\.device-screen::after/.test(css));
  assert.match(css, /--phone-stroke: rgba\(24, 99, 56, 0\.5\)/);
  assert.ok(!hero.includes("birthday-invitation-card.png"));
  assert.ok(!hero.includes("daily-brief-attention-card.png"));
});
test("hero opens on the live Sprout Assist demo; the phone's own tab bar switches screens", () => {
  const hero =
    html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] ?? "";
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  assert.ok(!hero.includes("hero-tabs"));
  assert.ok(!hero.includes("data-preview"));
  assert.ok(script.includes("window.sproutHero = { select: selectPreview }"));
  assert.ok(demo.includes("window.sproutHero.select(key)"));
  // all five tabs live, in the app's order, from one persistent tab bar
  const tabs = [...demo.matchAll(/^\s*\["(\w+)", "[\w-]*", "[^"]+"\],?$/gm)].map((m) => m[1]);
  assert.deepEqual(tabs, ["brief", "events", "assist", "chat", "clubs"]);
  assert.ok(!demo.includes('aria-disabled="true"'));
  assert.ok(demo.includes('app.insertAdjacentHTML("beforeend", navBar("assist"))'));
  assert.ok(script.includes('./assets/daily-brief-updated.png'));
  assert.ok(script.includes('./assets/chat-updated.png'));
  assert.ok(script.includes('./assets/clubs-updated.png'));
});

test("navbar Download app CTA has a constant, pausable botanical current", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  const js = fs.readFileSync(path.join(root, "script.js"), "utf8");
  assert.match(html, /class="nav-clover-field"[\s\S]*?nav-clover-a[\s\S]*?nav-clover-b[\s\S]*?nav-clover-c/);
  assert.ok(css.includes("@keyframes nav-download-wave"));
  assert.ok(css.includes("@keyframes nav-clover-rise"));
  assert.match(css, /animation: nav-download-wave 3\.8s linear infinite/);
  assert.match(css, /animation: nav-clover-rise 5\.4s linear infinite/);
  assert.ok(css.includes("animation-play-state: paused"));
  assert.match(css, /\.nav-download:hover \.nav-download-arrow,[\s\S]*?translateX\(3px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation: none !important/);
  assert.ok(js.includes('document.addEventListener("visibilitychange", updateNavDownloadMotion)'));
  assert.ok(js.includes("navDownloadVisible = entry.isIntersecting"));
});
test("family moments accordion starts with only the first card expanded", () => {
  const moments =
    html.match(/<section\s+class="moments section"[\s\S]*?<\/section>/)?.[0] ??
    "";
  const cards = [...moments.matchAll(/class="moment-card([^"]*)" data-moment="(\d)"/g)];
  assert.equal(cards.length, 3);
  assert.deepEqual(
    cards.map((card) => card[1].includes("is-active")),
    [true, false, false],
  );
  const expanded = [...moments.matchAll(/aria-expanded="(true|false)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(expanded, ["true", "false", "false"]);
  assert.ok(!moments.includes("previous-moment"));
  assert.ok(!moments.includes("next-moment"));
});
test("family moments do not repeat the hero's Daily Brief or Chat screens", () => {
  const moments =
    html.match(/<section\s+class="moments section"[\s\S]*?<\/section>/)?.[0] ??
    "";
  assert.ok(!moments.includes("daily-brief-updated.png"));
  assert.ok(!moments.includes("chat-updated.png"));
  assert.ok(moments.includes("daily-brief-attention-card-v2.png"));
});
test("classes section keeps chat, calendar, emails, and links in one place", () => {
  const classes =
    html.match(/<section\s+class="classes section"[\s\S]*?<\/section>/)?.[0] ??
    "";
  const views = [...classes.matchAll(/data-class-view="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(views, ["chat", "calendar", "updates", "links"]);
  for (const view of views)
    assert.ok(script.includes(`./assets/class-${view}.png`), view);
  assert.ok(html.indexOf('id="classes"') < html.indexOf('id="features"'));
  assert.ok(!/gmail\.com/i.test(html + script));
});
test("headings use Sprout's display face", () => {
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.ok(html.includes("family=Playfair+Display"));
  assert.ok(css.includes('--display: "Playfair Display"'));
});
test("Sprout Assist story keeps the requested feature order and source screens", () => {
  const product =
    html.match(/<section\s+class="product section"[\s\S]*?<\/section>/)?.[0] ??
    "";
  const keys = [...product.matchAll(/data-story="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(keys, ["assist", "reminder", "carpool", "event", "club"]);
  assert.ok(product.includes("sprout-assist-home.png"));
  assert.ok(product.includes("01 / 05"));
  assert.ok(!product.includes("01 / Daily Brief"));
  const assistAssets = [
    ...script.matchAll(/src: "(\.\/assets\/sprout-assist-[^"]+\.png)"/g),
  ].map((match) => match[1]);
  assert.equal(new Set(assistAssets).size, 5);
  for (const asset of assistAssets)
    assert.ok(fs.existsSync(path.join(root, asset)), asset);
  assert.ok(script.includes("mobileChapterObserver"));
  assert.ok(script.includes('rootMargin: "-68% 0px -22% 0px"'));
});
test("closing banner uses its own generated landscape", () => {
  const closing =
    html.match(/<section\s+class="download section"[\s\S]*?<\/section>/)?.[0] ??
    "";
  assert.ok(closing.includes("family-hills-closing-v1.webp"));
  assert.ok(!closing.includes("community-meadow.webp"));
  assert.ok(!closing.includes("download-picture"));
});
test("brand text pairs meet 4.5:1 contrast", () => {
  const luminance = (hex) => {
    const c = hex
      .match(/\w\w/g)
      .map((x) => parseInt(x, 16) / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  };
  for (const [a, b] of [
    ["59665e", "fbfcf9"],
    ["194e3d", "ffffff"],
    ["d3e1d4", "194e3d"],
    ["59665e", "f0f3ed"],
  ]) {
    const x = luminance(a),
      y = luminance(b);
    assert.ok((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) >= 4.5);
  }
});

test("assist demo uses only its own assets and never touches the microphone", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  for (const m of demo.matchAll(/\$\{A\}([a-z0-9-]+\.png)/g))
    assert.ok(fs.existsSync(path.join(root, "assets/assist", m[1])), m[1]);
  assert.ok(!/getUserMedia|webkitSpeech|SpeechRecognition/.test(demo));
  assert.ok(html.includes("assist-demo.js"));
});

test("Sprout Assist uses Thinking Orbs for listening and composing", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const orb = fs.readFileSync(path.join(root, "thinking-orb.js"), "utf8");
  assert.ok(html.includes('src="./thinking-orb.js'));
  assert.ok(!html.includes('src="./ai-blob.js'));
  assert.ok(demo.includes("window.SproutThinkingOrb"));
  assert.ok(demo.includes('state: "listening"'));
  assert.ok(orb.includes('processing: "composing"'));
  assert.ok(orb.includes("function drawListening"));
  assert.ok(orb.includes("function drawComposing"));
  assert.ok(orb.includes('getContext("2d")'));
  for (const token of ["30, 62, 43", "24, 99, 56", "87, 154, 116", "226, 233, 227"])
    assert.ok(orb.includes(token), `missing Sprout orb token ${token}`);
  assert.ok(!/webgl/i.test(orb));
  assert.ok(fs.existsSync(path.join(root, "vendor", "THINKING-ORBS-LICENSE")));
});

test("Daily Brief tab is coded and scrollable, not a screenshot", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "assist-demo.css"), "utf8");
  assert.ok(demo.includes('data-s="brief"'));
  assert.ok(demo.includes('class="db-scroll"'));
  assert.ok(/\.db-scroll\s*\{[^}]*overflow-y:\s*auto/.test(css));
  assert.ok(script.includes("window.sproutAssistDemo.show(key)"));
});

test("every hero tab is a coded screen; screenshots are only the no-JS fallback", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  for (const k of ["brief", "chat", "clubs", "home"]) assert.ok(demo.includes(`data-s="${k}"`), k);
  assert.ok(script.includes("window.sproutAssistDemo.show(key)"));
});

test("Events tab is coded from Figma 12900:24890 with a working week strip and Discover / My Events", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "assist-demo.css"), "utf8");
  assert.ok(demo.includes('data-s="events"'));
  assert.ok(demo.includes("function pickDay(") && demo.includes("function pickEvTab("));
  for (const d of [24, 25, 26, 27, 28, 29, 30]) assert.ok(new RegExp(`\\b${d}: \\[\\[`).test(demo), `events for ${d}`);
  assert.ok(/\.ev-scroll\s*\{[^}]*overflow-y:\s*auto/.test(css));
  for (const f of ["ev-storytime", "ev-nature", "ev-splash", "ev-share"])
    assert.ok(fs.existsSync(path.join(root, "assets", "assist", f + ".webp")), f);
});

test("Carpool runs in the phone and lands as a Live Activity on Lydia's Lock Screen", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "assist-demo.css"), "utf8");
  // the idle slot: the card at 50% under the "Try" button
  assert.ok(demo.includes('<button class="la-try" data-la-try="carpool">Try a carpool request</button>'));
  const previewRule = css.match(
    /\.la-slot\.is-idle \.la-card,[\s\S]*?\{\s*opacity:\s*0\.5/,
  )?.[0] ?? "";
  assert.ok(previewRule.includes(".la-slot.is-running .la-card"));
  // Figma 12798:18485: 144 listening, 149 review, 150 posted, all coded
  assert.ok(demo.includes("Can you help me grab my kids on Friday morning and take them to Kiker Elementary?"));
  for (const k of ["cp-review", "cp-posted"]) assert.ok(demo.includes(`data-s="${k}"`), k);
  assert.ok(demo.includes("Post to Class Chat") && demo.includes("Open Class Chat"));
  // Figma 11106:244182: acceptance opens an interactive, locally simulated room
  assert.ok(demo.includes('data-s="carpool-chat"'));
  assert.ok(demo.includes('go("carpool-chat")'));
  assert.ok(demo.includes('class="cc-compose"') && demo.includes('class="cc-input"'));
  assert.ok(demo.includes("function appendCarpoolMessage(") && demo.includes("function sarahReplyFor("));
  assert.ok(demo.includes('message.textContent = text'));
  // the story's own people; no placeholder names or real people
  assert.ok(demo.includes("Lydia Martin") && demo.includes("Sarah Baker") && demo.includes("Sarah is arriving soon"));
  assert.ok(!demo.includes("Sarah Becker"));
  assert.ok(!demo.includes("Emily Centineo, Flore") && !/Tony is arriving/.test(demo));
  for (const f of ["la-busav", "la-home", "la-school", "la-bus", "bus-lg", "need-where"])
    assert.ok(fs.existsSync(path.join(root, "assets", "assist", f + ".webp")), f);
});

test("Event runs in the phone and lands on Emily's phone, with no real people in the invite list", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "assist-demo.css"), "utf8");
  assert.ok(demo.includes('<button class="la-try" data-la-try="event">Try creating an event</button>'));
  for (const k of ["ev-review", "ev-invite", "ev-sent"]) assert.ok(demo.includes(`data-s="${k}"`), k);
  assert.ok(/const order = \[[^\]]*"ev-review", "ev-invite"[^\]]*"ev-sent"\]/.test(demo));
  assert.ok(demo.includes("const evScreens"));
  // Emily's phone lives outside the app, so it needs the app's tokens
  assert.ok(/\.assist-app,\s*\.spouse-phone,\s*\.la-stack,\s*\.sx-app\s*\{\s*--sa-bg/.test(css));
  for (const name of ["Noah Lyles", "Noah Kahan", "Noah Cyrus", "Frost Bank Center", "San Antonio"]) assert.ok(!demo.includes(name), name);
});

test("Birthday cover sits above Matt's phone and runs the listening → cover flow", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.ok(demo.includes('<button class="la-try" data-la-try="birthday">Try a birthday cover</button>'));
  assert.ok(demo.includes('data-s="bd-ready"') && demo.includes("const bdScreens"));
  assert.ok(demo.includes("<em>Oct 3</em>2PM (CST)"));
  // the card is on top of the right column; Matt's phone starts under it
  assert.match(css, /\.hero-center \.bd-slot\.la-slot \{[^}]*top: 0/);
  assert.match(css, /\.hero-center \.spouse-phone \{[^}]*top: calc\(295px \* 0\.7 \+ 14px\)/);
});

test("Matt's phone never hides when the phone changes screens", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const go = demo.slice(demo.indexOf("function go(next)"), demo.indexOf("function switchTab("));
  assert.ok(go.includes("spouse.hidden = false"));
  assert.ok(!/spouse\.hidden = !/.test(go));
});

test("the orb works for a beat before it listens", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const orb = fs.readFileSync(path.join(root, "thinking-orb.js"), "utf8");
  // upstream thinking-orbs `working` (orbits mode, 64 px preset) is ported
  assert.ok(orb.includes("function drawWorking(") && orb.includes('working: "Working…"'));
  const start = demo.slice(demo.indexOf("function startListening()"), demo.indexOf("function finishListening()"));
  assert.ok(start.indexOf('setState("working")') < start.indexOf('setState("listeningActive")'));
  assert.ok(start.includes('"Working…"') && start.includes("2400"));
});

test("hovering a menu row grows the card that row acts on", () => {
  const demo = fs.readFileSync(path.join(root, "assist-demo.js"), "utf8");
  const css = fs.readFileSync(path.join(root, "assist-demo.css"), "utf8");
  for (const k of ["reminder", "carpool", "event", "birthday"]) assert.ok(new RegExp(`\\b${k}: \\(\\) =>`).test(demo), k);
  assert.ok(demo.includes('row.addEventListener("pointerenter"') && demo.includes('row.addEventListener("focus"'));
  assert.match(css, /\.la-card\.is-hinted,[\s\S]*?\{\s*scale: 1\.06/);
});

test("Classes, the Sprout Assist story and the moments card are coded, not screenshots", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const sx = fs.readFileSync(path.join(root, "sections-demo.js"), "utf8");
  assert.ok(html.includes("sections-demo.js") && html.includes("sections-demo.css"));
  for (const v of ["chat", "calendar", "updates", "links"]) assert.ok(sx.includes(`data-v="${v}"`), v);
  for (const k of ["reminder", "carpool", "event", "club"]) assert.ok(new RegExp(`\\b${k}: \\["`).test(sx), k);
  assert.ok(script.includes("window.sproutClasses.show(") && script.includes("window.sproutStory.show("));
  assert.ok(sx.includes("cut.replaceWith(box)"));
  // no real people or retired names in the coded copies
  for (const bad of ["Anthonyjhonmartin", "Meeting Point", "Mohit Rai"]) assert.ok(!sx.includes(bad), bad);
});

