import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const SP=path.dirname(fileURLToPath(import.meta.url))+'/';
export const OUT=path.resolve(SP,'..')+'/';
const ICONS=JSON.parse(fs.readFileSync(SP+'icons.json','utf8'));
export const SHARED=fs.readFileSync(SP+'shared.css','utf8');

/** Phosphor icon, regular weight, real path data from phosphor-react-native. */
export function I(name,size,cls=''){
  const p=ICONS[name];
  if(!p) throw new Error('missing icon '+name);
  const st=size?` style="width:${size}px;height:${size}px"`:'';
  return `<span class="ic ${cls}"${st}><svg viewBox="0 0 256 256"><path d="${p[0]}"/></svg></span>`;
}

const STATUS=`<div class="bstat"><span>12:17</span><span class="r">
  <svg width="18" height="12" viewBox="0 0 18 12"><path d="M1 8h2v3H1zM5 6h2v5H5zM9 4h2v7H9zM13 2h2v9h-2z"/></svg>
  <svg width="17" height="12" viewBox="0 0 18 12"><path d="M9 3.2c2.5 0 4.8 1 6.5 2.7l-1.4 1.4A7.2 7.2 0 0 0 9 5.3 7.2 7.2 0 0 0 3.9 7.3L2.5 5.9A9.2 9.2 0 0 1 9 3.2Zm0 4.1c1.3 0 2.6.5 3.5 1.5l-1.4 1.4A3 3 0 0 0 9 9.3a3 3 0 0 0-2.1.9L5.5 8.8A5 5 0 0 1 9 7.3Z"/></svg>
  <svg class="bat" viewBox="0 0 25 12"><rect x="1" y="2" width="20" height="8" rx="2.4" fill="none" stroke="#16161a" stroke-opacity=".38"/><rect x="2.6" y="3.6" width="6" height="4.8" rx="1.2"/><rect x="22.2" y="4.6" width="1.6" height="3"/></svg>
</span></div>`;

const BACK=`<div class="bback"><svg viewBox="0 0 9 12"><path d="M8 0.8 2.6 6 8 11.2 6.9 12 0.6 6 6.9 0z"/></svg>Messages</div>`;

const URLBAR=`<div class="urlbar">
  ${I('Sparkle',17,'').replace('class="ic "','class="ic"')}
  <span class="u">app.joinsprout.co</span>
  <span class="ic" style="width:17px;height:17px;color:#57575c"><svg viewBox="0 0 256 256"><path d="M176 104h-24a8 8 0 0 1 0-16h24a16 16 0 0 1 16 16v88a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16v-88a16 16 0 0 1 16-16h24a8 8 0 0 1 0 16H80v88h96Zm-53.66-42.34a8 8 0 0 0 11.32 0L152 43.31V144a8 8 0 0 0 16 0V43.31l18.34 18.35a8 8 0 0 0 11.32-11.32l-32-32a8 8 0 0 0-11.32 0l-32 32a8 8 0 0 0 0 11.32"/></svg></span>
</div>`;

const TOOLBAR=`<div class="btoolbar">
  <span class="ic" style="width:21px;height:21px;color:#0a7cff"><svg viewBox="0 0 256 256"><path d="M224 128a8 8 0 0 1-8 8H59.31l58.35 58.34a8 8 0 0 1-11.32 11.32l-72-72a8 8 0 0 1 0-11.32l72-72a8 8 0 0 1 11.32 11.32L59.31 120H216a8 8 0 0 1 8 8"/></svg></span>
  <span class="ic dim" style="width:21px;height:21px;color:#b6b6ba"><svg viewBox="0 0 256 256"><path d="m221.66 133.66-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32"/></svg></span>
  <span class="ic" style="width:21px;height:21px;color:#0a7cff"><svg viewBox="0 0 256 256"><path d="M224 128a8 8 0 0 1-8 8h-80v80a8 8 0 0 1-16 0v-80H40a8 8 0 0 1 0-16h80V40a8 8 0 0 1 16 0v80h80a8 8 0 0 1 8 8"/></svg></span>
  <span class="tabsq">29</span>
  <span class="ic" style="width:21px;height:21px;color:#0a7cff"><svg viewBox="0 0 256 256"><path d="M156 128a28 28 0 1 1-28-28 28 28 0 0 1 28 28M48 100a28 28 0 1 0 28 28 28 28 0 0 0-28-28m160 0a28 28 0 1 0 28 28 28 28 0 0 0-28-28"/></svg></span>
</div>`;

/** iOS Safari frame. `inner` is the page content that scrolls in the viewport. */
export function chrome(inner){
  return `<div class="browser">
  <div class="island"></div>
  ${STATUS}
  ${BACK}
  ${URLBAR}
  <div class="viewport">${inner}</div>
  ${TOOLBAR}
  <div class="homebar"></div>
</div>`;
}

export function panel(kind,title,ctx,inner,warm=false){
  return `<div class="panel">
  <div class="phead"><span class="k${warm?' warm':''}">${kind}</span><h2>${title}</h2><p>${ctx}</p></div>
  ${chrome(inner)}
</div>`;
}

export function page({title,lede,tagline,css,panels}){
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${title} · Sprout</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${SHARED}
/* ── direction-specific ── */
${css}
</style>
</head>
<body>
<div class="lede">
  <div class="tagline">${tagline}</div>
  <h1>${title}</h1>
  <p>${lede}</p>
</div>
<div class="row">
${panels.join('\n')}
</div>
</body>
</html>`;
}

export function write(file,html){
  fs.mkdirSync(OUT,{recursive:true});
  fs.writeFileSync(OUT+file,html);
  console.log('wrote',OUT+file,(html.length/1024).toFixed(1)+'KB');
}
