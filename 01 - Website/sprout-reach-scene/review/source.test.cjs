const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
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
test("hero uses the interactive mom hand without floating invitation or task cards", () => {
  const hero =
    html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.ok(hero.includes("hand-mom-iphone-17-pro-max.png"));
  assert.ok(hero.includes("hand-mom-tap.png"));
  assert.ok(!hero.includes("birthday-invitation-card.png"));
  assert.ok(!hero.includes("daily-brief-attention-card.png"));
});
test("family moments accordion starts with only the first card expanded", () => {
  const moments =
    html.match(/<section\s+class="moments section"[\s\S]*?<\/section>/)?.[0] ??
    "";
  const cards = [...moments.matchAll(/class="moment-card([^"]*)" data-moment="(\d)"/g)];
  assert.equal(cards.length, 4);
  assert.deepEqual(
    cards.map((card) => card[1].includes("is-active")),
    [true, false, false, false],
  );
  const expanded = [...moments.matchAll(/aria-expanded="(true|false)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(expanded, ["true", "false", "false", "false"]);
  assert.ok(!moments.includes("previous-moment"));
  assert.ok(!moments.includes("next-moment"));
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
