const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../scroll-motion.js'), 'utf8');

function harness({ reduced = false, desktop = true } = {}) {
  const events = {}, classes = new Set(), queue = [];
  let selected = 0;
  const media = [desktop, reduced].map(matches => ({ matches, addEventListener(_, cb) { this.change = cb; } }));
  const element = () => ({
    style: { values:{},setProperty(k,v) {this.values[k]=v;} }, offsetHeight: 600,
    classList: { add() {} }, before() {}, append() {},
    getBoundingClientRect: () => ({ top: 0, height: 720 })
  });
  const panel = element();
  const track = element(); track.offsetHeight = 2800;
  let trackTop = 112;
  track.getBoundingClientRect = () => ({ top: trackTop, height: 2800 });
  const tabs = [0, 1, 2].map(i => ({ getAttribute: () => String(i === selected) }));
  const viewport = { clientWidth: 1000, scrollLeft: 0 };
  const context = {
    document: {
      hidden: false,
      documentElement: { classList: {
        toggle(name, on) { on ? classes.add(name) : classes.delete(name); },
        contains: name => classes.has(name)
      } },
      querySelector: selector => selector === '.day-panel' ? panel : element(), querySelectorAll: () => [], createElement: () => track,
      addEventListener(name, cb) { events[name] = cb; }
    },
    matchMedia: query => media[query.includes('reduced') ? 1 : 0],
    innerHeight: 720, scrollY: 1000,
    requestAnimationFrame(cb) { queue.push(cb); return queue.length; },
    getComputedStyle: () => ({ top: '112px' }),
    dayTabs: tabs, selectDay(tab) { selected = tabs.indexOf(tab); },
    dayViewport: viewport,
    addEventListener(name, cb) { events[name] = cb; },
    scrollTo(options) { context.lastScroll = options; }
  };
  vm.runInNewContext(source, context);
  const flush = () => { while (queue.length) queue.shift()(); };
  flush();
  return { context, events, media, classes, flush, panel,
    get selected() { return selected; }, viewport,
    scroll(progress) { trackTop = 112 - progress * 2200; events.scroll(); flush(); }
  };
}
test('scroll chapters advance, reverse, and clamp at the document edges', () => {
  const h = harness();
  for (const [progress, expected] of [[-.5,0],[.4,1],[.9,2],[1.5,2],[.4,1],[0,0]]) {
    h.scroll(progress); assert.equal(h.selected, expected);
  }
});
test('each scene has a stable dwell point between horizontal transitions', () => {
  const h = harness();
  for (const [progress, expected] of [[.1,0],[.5,.5],[.9,1]]) {
    h.scroll(progress);
    assert.equal(h.panel.style.values['--day-shift'], expected);
  }
});
test('manual tab choice seeks the matching chapter without animated scroll', () => {
  const h = harness(); h.events['sprout:day-selected']({ detail: 2 });
  assert.equal(h.context.lastScroll.top, 3200);
  assert.equal(h.context.lastScroll.behavior, 'smooth');
});
test('mobile and reduced motion leave manual tabs and normal document flow', () => {
  for (const options of [{ desktop:false }, { reduced:true }]) {
    const h = harness(options); h.scroll(.9);
    assert.equal(h.selected, 0); assert.equal(h.classes.size, 0);
    h.events['sprout:day-selected']({ detail: 1 });
    assert.equal(h.context.lastScroll, undefined);
  }
});
test('changing reduced motion removes pinning and restores the selected native slide', () => {
  const h = harness(); h.scroll(.9);
  h.media[1].matches = true; h.media[1].change(); h.flush();
  assert.equal(h.classes.size, 0); assert.equal(h.viewport.scrollLeft, 2000);
  h.media[1].matches = false; h.media[1].change(); h.flush();
  assert.equal(h.classes.has('scroll-story'), true);
});
