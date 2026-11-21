/* Figma capture helper (19 Nov). Served from site/cap.js at capture time: build.py does not copy it, so run `cp tools/figma-capture-helper.js site/cap.js` after every build. */
window.S = ms => new Promise(r => setTimeout(r, ms));
window.chat = () => [...document.querySelectorAll('.chat')].find(c => !c.hidden);
window.clickBtn = async (txt, root) => { for (let i = 0; i < 80; i++) { const b = [...(root || chat()).querySelectorAll('button')].filter(b => !b.disabled && b.offsetParent && b.style.pointerEvents !== 'none' && !b.closest('.chips.done') && b.textContent.trim().startsWith(txt)).pop(); if (b) { b.click(); return true; } await S(250); } throw new Error('no ' + txt); };
window.waitBtn = async (txt, ms = 30000) => { for (let t = 0; t < ms; t += 400) { const b = [...(chat() || document).querySelectorAll('button')].find(b => b.offsetParent && !b.disabled && !b.closest('.chips.done') && b.textContent.trim().startsWith(txt)); if (b) return b; await S(400); } throw new Error('timeout ' + txt); };
window.toBottom = () => { const c = chat(); if (c) c.scrollTop = c.scrollHeight; };
window.toCard = (extra = 70) => { const c = chat(); if (!c) return; const rows = [...c.querySelectorAll(':scope > .row')]; const last = [...rows].reverse().find(r => r.querySelector('.card, .preview, .chips, .status')) || rows[rows.length - 1]; if (last) c.scrollTop = Math.max(0, last.offsetTop - c.offsetTop - extra); };
window.__svgCache = window.__svgCache || {};
window.__icons = async () => {
  const els = [...document.querySelectorAll('#phone i[class*="ph"], .wrap i[class*="ph"], main i[class*="ph"]')].filter(i => !i.dataset.svg && [...i.classList].some(c => /^ph-[a-z0-9-]+$/.test(c) && !/^ph-(bold|fill|thin|light|duotone)$/.test(c)));
  let n = 0; const miss = [];
  for (const i of els) {
    const cls = [...i.classList]; const weight = cls.includes('ph-bold') ? 'bold' : cls.includes('ph-fill') ? 'fill' : cls.includes('ph-light') ? 'light' : 'regular';
    const name = cls.find(c => /^ph-[a-z0-9-]+$/.test(c) && !/^ph-(bold|fill|thin|light|duotone)$/.test(c)).slice(3);
    const url = `https://unpkg.com/@phosphor-icons/core@2.1.1/assets/${weight}/${name}${weight === 'regular' ? '' : '-' + weight}.svg`;
    if (!(url in __svgCache)) { try { const r = await fetch(url); __svgCache[url] = r.ok ? await r.text() : null; } catch (e) { __svgCache[url] = null; } }
    const svg = __svgCache[url]; if (!svg) { miss.push(name); continue; }
    const cs = getComputedStyle(i), size = parseFloat(cs.fontSize) || 16;
    i.innerHTML = svg.replace('<svg ', `<svg width="${size}" height="${size}" style="display:block" `); i.dataset.svg = '1';
    i.style.display = cs.display === 'inline' ? 'inline-flex' : cs.display; i.style.width = size + 'px'; i.style.height = size + 'px'; i.style.lineHeight = '0';
    i.classList.add('svgd'); n++;
  }
  if (!document.getElementById('svgdcss')) { const st = document.createElement('style'); st.id = 'svgdcss'; st.textContent = 'i.svgd::before{content:none!important}'; document.head.appendChild(st); }
  return { n, miss:[...new Set(miss)] };
};
window.__prep = async () => { const ph = document.querySelector('#phone'); if (ph) { ph.style.transform = 'none'; ph.style.margin = '0'; ph.style.boxShadow = 'none'; ph.style.borderRadius = '0'; const isl = ph.querySelector('.island'); if (isl) isl.style.display = 'none'; } return await __icons(); };
window.__cap = async (id, selector = '#phone') => { const r = await __prep(); await S(400);
  window.__capP = window.figma.captureForDesign({ captureId:id, endpoint:`https://mcp.figma.com/mcp/capture/${id}/submit?bindVariables=true&promptId=7c1e3a52-9b4d-4e8a-b2f1-5d6c0a9e3f71`, selector }); return r; };
/* call before navigating away: resolves once the capture has been uploaded (or after 40 s) */
window.__sent = () => Promise.race([window.__capP || Promise.resolve('none'), S(40000).then(() => 'timeout')]).then(v => JSON.stringify(v).slice(0, 120));
/* the browser pane may be hidden, where rAF never fires and the capture stalls ("rAF never fired"): use a timer */
window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16);
window.__ready = new Promise(r => { if (window.figma && window.figma.captureForDesign) return r(); const s = document.createElement('script'); s.src = 'https://mcp.figma.com/mcp/html-to-design/capture.js'; s.onload = r; document.head.appendChild(s); });
