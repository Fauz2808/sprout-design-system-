const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const code=fs.readFileSync(path.join(__dirname,'../script.js'),'utf8').split('Object.values(screens)')[0];
function setup(reduced=false){const listeners={};const preference={matches:reduced,addEventListener:(key,fn)=>listeners[key]=fn};const context=vm.createContext({matchMedia:()=>preference});vm.runInContext(code,context);const created=[];const element={animate:()=>{const animation={cancelled:false,cancel(){this.cancelled=true}};created.push(animation);return animation;}};return {context,element,created,preference,listeners};}
test('a new screen transition cancels the previous one',()=>{const t=setup();t.context.enter(t.element);t.context.enter(t.element);assert.equal(t.created.length,2);assert.equal(t.created[0].cancelled,true);assert.equal(t.created[1].cancelled,false);});
test('reduced motion starts no animation',()=>{const t=setup(true);t.context.enter(t.element);assert.equal(t.created.length,0);});
test('enabling reduced motion cancels a running transition',()=>{const t=setup();t.context.enter(t.element);t.preference.matches=true;t.listeners.change();assert.equal(t.created[0].cancelled,true);});
