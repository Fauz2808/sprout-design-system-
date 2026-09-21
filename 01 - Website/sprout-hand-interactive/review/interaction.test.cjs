const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../hand-preview.js'), 'utf8');

function harness({ reduce = false, fail = '' } = {}) {
  const timers = new Map();
  let timerId = 0;
  const animations = [];
  const events = {};
  const element = (id = '') => ({
    id, dataset: {}, attributes: {}, handlers: {}, style: {}, classes:new Set(),
    classList:{add(k){this.owner.classes.add(k);},remove(k){this.owner.classes.delete(k);}},
    complete: true, naturalWidth: 1024,
    setAttribute(k,v) {this.attributes[k]=v;},
    getAttribute(k) {return this.attributes[k] ?? null;},
    removeAttribute(k) {delete this.attributes[k];},
    addEventListener(k,fn) {this.handlers[k]=fn;},
    focus() {this.focused=true;},
    getBoundingClientRect() {return {left:100,top:100,width:400,height:800};},
    animate(frames,options) {
      const a={id,frames,options,cancelled:false,cancel(){this.cancelled=true;}};
      animations.push(a);return a;
    }
  });
  const tabs=['brief','events','chat'].map((key,i)=>{
    const n=element('feature-'+key);n.classList.owner=n;n.dataset.feature=key;n.textContent=key;
    n.setAttribute('aria-selected',String(!i));n.tabIndex=i?-1:0;return n;
  });
  const nodes=Object.fromEntries(['.hand-scene','.tapping-hand','#feature-preview','#feature-screen','#feature-caption','#feature-status','.tap-ripple'].map(x=>[x,element(x)]));
  Object.values(nodes).forEach(n=>n.classList.owner=n);
  nodes['#feature-preview'].setAttribute('aria-labelledby','feature-brief');
  nodes['#feature-screen'].src='./assets/daily-brief-updated.png';
  const preference={matches:reduce,addEventListener(k,fn){this.change=fn;}};
  vm.runInNewContext(source,{
    document:{querySelectorAll:()=>tabs,querySelector:s=>nodes[s]},
    matchMedia:()=>preference,
    window:{addEventListener(k,fn){events[k]=fn;}},
    Image:class {decode(){return this.src.includes(fail)&&fail?Promise.reject(Error('offline')):Promise.resolve();}},
    setTimeout(fn,delay){const id=++timerId;timers.set(id,{fn,delay});return id;},
    clearTimeout(id){timers.delete(id);}
  });
  return {
    tabs,nodes,animations,preference,events,timers,
    async flush(){await new Promise(setImmediate);},
    runTimers(){const copy=[...timers.values()];timers.clear();copy.forEach(t=>t.fn());}
  };
}

test('rapid feature requests commit only the final selection',async()=>{
  const h=harness();await h.flush();
  h.tabs[1].handlers.click();h.tabs[2].handlers.click();await h.flush();
  h.runTimers();
  assert.equal(h.nodes['#feature-screen'].src,'./assets/chat-updated.png');
  assert.equal(h.nodes['#feature-preview'].getAttribute('aria-labelledby'),'feature-chat');
  assert.equal(h.nodes['#feature-preview'].getAttribute('aria-busy'),null);
  assert.equal(h.tabs.filter(t=>t.getAttribute('aria-selected')==='true').length,1);
});

test('a new request cancels the pending tap and stale screen commit',async()=>{
  const h=harness();await h.flush();
  h.tabs[1].handlers.click();await h.flush();
  const first=h.animations.find(a=>a.id==='.tapping-hand');
  assert.ok(first);
  h.tabs[0].handlers.click();await h.flush();h.runTimers();
  assert.equal(first.cancelled,true);
  assert.equal(h.nodes['#feature-screen'].src,'./assets/daily-brief-updated.png');
});

test('menu and screen commit together at fingertip contact',async()=>{
  const h=harness();await h.flush();
  h.tabs[1].handlers.click();await h.flush();
  assert.equal(h.tabs[0].getAttribute('aria-selected'),'true');
  assert.equal(h.tabs[1].classes.has('is-targeted'),true);
  assert.equal(h.nodes['#feature-screen'].src,'./assets/daily-brief-updated.png');
  const contact=[...h.timers.values()][0];
  assert.equal(contact.delay,230);
  contact.fn();h.timers.clear();
  assert.equal(h.tabs[1].getAttribute('aria-selected'),'true');
  assert.equal(h.tabs[1].classes.has('is-targeted'),false);
  assert.equal(h.nodes['#feature-screen'].src,'./assets/events-updated.png');
});

test('tap travel is short and uses corrected navigation coordinates',async()=>{
  const h=harness();await h.flush();h.tabs[1].handlers.click();await h.flush();
  const hand=h.animations.find(a=>a.id==='.tapping-hand');
  assert.equal(hand.options.duration,640);
  h.runTimers();
  assert.equal(h.nodes['.tap-ripple'].style.left,'34.9%');
  assert.ok(Math.abs(parseFloat(h.nodes['.tap-ripple'].style.bottom)-8.6)<.001);
});

test('reduced motion switches immediately with no hand or screen animation',async()=>{
  const h=harness({reduce:true});await h.flush();
  h.tabs[1].handlers.click();await h.flush();
  assert.equal(h.nodes['#feature-screen'].src,'./assets/events-updated.png');
  assert.equal(h.animations.length,0);assert.equal(h.timers.size,0);
});

test('failed image keeps the last good screen and restores selected tab',async()=>{
  const h=harness({fail:'chat-updated.png'});await h.flush();
  h.tabs[2].handlers.click();await h.flush();
  assert.equal(h.nodes['#feature-screen'].src,'./assets/daily-brief-updated.png');
  assert.equal(h.tabs[0].getAttribute('aria-selected'),'true');
  assert.equal(h.tabs[0].tabIndex,0);
  assert.match(h.nodes['#feature-status'].textContent,/could not load/);
  assert.equal(h.nodes['#feature-preview'].getAttribute('aria-busy'),null);
});

test('End and ArrowRight maintain roving focus and wrap to the first feature',async()=>{
  const h=harness({reduce:true});await h.flush();
  h.tabs[0].handlers.keydown({key:'End',preventDefault(){}});await h.flush();
  assert.equal(h.tabs[2].focused,true);assert.equal(h.tabs[2].tabIndex,0);
  h.tabs[2].handlers.keydown({key:'ArrowRight',preventDefault(){}});await h.flush();
  assert.equal(h.tabs[0].focused,true);assert.equal(h.tabs[0].tabIndex,0);
  assert.equal(h.nodes['#feature-preview'].getAttribute('aria-labelledby'),'feature-brief');
});

test('enabling reduced motion during a tap commits without leaving a pending timer',async()=>{
  const h=harness();await h.flush();h.tabs[1].handlers.click();await h.flush();
  h.preference.matches=true;h.preference.change();await h.flush();
  assert.equal(h.nodes['#feature-screen'].src,'./assets/events-updated.png');
  assert.equal(h.timers.size,0);
  assert.ok(h.animations.filter(a=>a.id==='.tapping-hand').every(a=>a.cancelled));
});

test('Chat returns directly to Daily Brief using the shared bottom navigation',async()=>{
  const h=harness();await h.flush();h.tabs[2].handlers.click();await h.flush();h.runTimers();
  assert.equal(h.nodes['#feature-screen'].src,'./assets/chat-updated.png');
  const priorTaps=h.animations.filter(a=>a.id==='.tapping-hand').length;
  h.tabs[0].handlers.click();await h.flush();h.runTimers();
  assert.equal(h.nodes['#feature-screen'].src,'./assets/daily-brief-updated.png');
  assert.equal(h.nodes['#feature-preview'].getAttribute('aria-busy'),null);
  assert.equal(h.animations.filter(a=>a.id==='.tapping-hand').length,priorTaps+1);
  assert.equal(h.timers.size,0);
  assert.equal(h.nodes['.tap-ripple'].style.left,'13.7%');
});
