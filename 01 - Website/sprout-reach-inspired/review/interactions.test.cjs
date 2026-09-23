const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function fixture(reduced = false) {
  const animations = [];
  const listeners = {};
  class Element {
    constructor() { this.attributes = {}; this.textContent = ''; this.dataset = {}; this.handlers = {}; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name]; }
    addEventListener(name, fn) { this.handlers[name] = fn; }
    querySelectorAll() { return this.items || []; }
    querySelector() { return new Element(); }
    focus() { this.focused = true; }
    animate() {
      const handlers = {};
      const animation = { cancelled: false, addEventListener: (name, fn) => { handlers[name] = fn; }, cancel() { this.cancelled = true; handlers.cancel?.(); } };
      animations.push(animation);
      return animation;
    }
  }
  const nodes = new Map();
  const get = selector => {
    if (!nodes.has(selector)) nodes.set(selector, new Element());
    return nodes.get(selector);
  };
  get('#feature-list').items = Array.from({ length: 3 }, () => new Element());
  const tabs = ['brief', 'events', 'chat'].map(key => {
    const node = new Element(); node.dataset.feature = key; node.id = `tab-${key}`; return node;
  });
  const motion = { matches: reduced, addEventListener(name, fn) { listeners.motion = fn; } };
  const context = {
    document: {
      documentElement: { classList: { add() {} } },
      querySelector: get,
      querySelectorAll(selector) { return selector.includes('[role="tab"]') ? tabs : []; },
      addEventListener() {},
    },
    window: { matchMedia(query) { return query.includes('reduced-motion') ? motion : { matches: false, addEventListener() {} }; } },
    Image: class {},
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8'), context);
  return { tabs, get, animations, listeners, motion };
}

test('rapid tab clicks immediately commit the last selected screen and cancel superseded transitions', () => {
  const f = fixture();
  for (const tab of [f.tabs[1], f.tabs[2], f.tabs[0], f.tabs[2]]) tab.handlers.click();
  assert.equal(f.get('#feature-panel').getAttribute('aria-labelledby'), 'tab-chat');
  assert.equal(f.get('#feature-image').src, './assets/chat-updated.png');
  assert.equal(f.get('#feature-heading').textContent, 'Keep people close.');
  assert.equal(f.tabs.filter(tab => tab.getAttribute('aria-selected') === 'true').length, 1);
  assert.ok(f.animations.slice(0, -2).every(animation => animation.cancelled));
});

test('reduced motion preserves instant navigation with no animations', () => {
  const f = fixture(true);
  f.tabs[1].handlers.click();
  assert.equal(f.get('#feature-image').src, './assets/events-updated.png');
  assert.equal(f.animations.length, 0);
});

test('enabling reduced motion mid-transition preserves the selected content', () => {
  const f = fixture();
  f.tabs[2].handlers.click();
  f.listeners.motion({ matches: true });
  assert.ok(f.animations.every(animation => animation.cancelled));
  assert.equal(f.get('#feature-image').src, './assets/chat-updated.png');
});

test('arrow navigation wraps from Daily Brief to Chat and transfers focus', () => {
  const f = fixture();
  let prevented = false;
  f.tabs[0].handlers.keydown({ key: 'ArrowLeft', preventDefault() { prevented = true; } });
  assert.equal(f.get('#feature-panel').getAttribute('aria-labelledby'), 'tab-chat');
  assert.ok(prevented && f.tabs[2].focused);
});
