#!/usr/bin/env python3
"""Build the 27-38 s motion sample: one growing path diagram instead of three clay swaps.

Writes a self-contained HyperFrames project to samples/27-38-path-build/.
Beat sheet and reasoning: samples/27-38-path-build/BEATS.md.
"""
import html
import numpy as np
import json
from pathlib import Path
import shutil
import subprocess
import sys

import build_storyboard as board
from caption_profile import SingleWordCaptions
from prepare_render_audio import normalize

ROOT=Path(__file__).resolve().parents[1]
SB=ROOT/'storyboard'
OUT=ROOT/'samples/27-38-path-build'
KIT=ROOT.parent/'_Kit/sprout-talking-head'
T0,T1=26.0,40.0
DUR=T1-T0
e=html.escape

INK,CREAM,SAGE,PALE='#1e3e2b','#f4f1ea','#e2e9e3','#cce8c1'
# Path in world units (1080x1920 canvas before the diagram camera).
PATH='M150 1180 C 300 1180 360 1020 520 1030 S 690 1190 800 1100 S 880 880 930 830'
START,END=(150,1180),(930,830)
CAM_ZOOM=dict(x=45,y=-1006,scale=1.7)    # start point near screen (300, 1000)
CAM_FULL=dict(x=0,y=60,scale=1)
CAM_HALF=dict(x=162,y=589,scale=.7)      # shoe top to path start (world y 630-1180) fills panel y 1030-1415
COUNTER_HALF=dict(x=60,y=915,scale=.45)
CAPTION_TOP=dict(face=1040,full=1390,half=1430)
# name, path fraction, spoken start, label x, label baseline, anchor. Two label lanes above the path
# keep neighbours apart; mindset sits right of the steep last climb (only shown in the half layout).
QUALITIES=[('courage',.2,36.30,335,980,'middle'),('heart',.4,36.94,524,920,'middle'),
           ('dedication',.6,37.48,704,980,'middle'),('mindset',.86,38.30,925,975,'start')]
SFX_B=[(27.20,'paper-whoosh-short.wav',-19,'panel wipes up'),
       (31.90,'paper-slide-long.wav',-19,'path draws while the camera pulls out'),
       (35.50,'card-land-soft.wav',-20,'checkmark lands')]


def point(p):
    """Point at arc-length fraction p of PATH (same measure as SVG getPointAtLength)."""
    a=np.array;segs=[(a(START),a((300,1180)),a((360,1020)),a((520,1030))),
                     (a((520,1030)),a((680,1040)),a((690,1190)),a((800,1100))),
                     (a((800,1100)),a((910,1010)),a((880,880)),a(END))]
    u=np.linspace(0,1,400,endpoint=False)[:,None]
    pts=np.vstack([(1-u)**3*s0+3*(1-u)**2*u*s1+3*(1-u)*u**2*s2+u**3*s3 for s0,s1,s2,s3 in segs]+[a(END)[None]])
    length=np.r_[0,np.cumsum(np.linalg.norm(np.diff(pts,axis=0),axis=1))]
    x,y=pts[np.searchsorted(length,p*length[-1])]
    return round(float(x),1),round(float(y),1)


def t(source_time):return round(source_time-T0,3)


def run(args):subprocess.run(args,check=True,capture_output=True)


def media():
    (OUT/'media').mkdir(parents=True,exist_ok=True);(OUT/'audio').mkdir(exist_ok=True)
    run(['ffmpeg','-v','error','-y','-ss',str(T0),'-i',str(SB/'media/source.mp4'),'-t',str(DUR),'-an',
         '-c:v','libx264','-crf','14','-preset','medium','-g','15','-pix_fmt','yuv420p',str(OUT/'media/source.mp4')])
    run(['ffmpeg','-v','error','-y','-ss',str(T0),'-i',str(ROOT/'audio/dialogue.wav'),'-t',str(DUR),
         '-c:a','pcm_s24le',str(OUT/'audio/dialogue.wav')])
    normalize(OUT/'audio/dialogue.wav',OUT/'audio/mix-a.wav',-14,-2)
    cues=dict(duration=DUR,cues=[dict(t=t(at),sound=s,gain_db=g,event=ev) for at,s,g,ev in SFX_B])
    (OUT/'audio/cues-b.json').write_text(json.dumps(cues,indent=2)+'\n')
    run([sys.executable,str(KIT/'tools/mix_sfx.py'),str(OUT/'audio/cues-b.json'),'--output',str(OUT/'audio/sfx-b.wav'),'--replace'])
    run(['ffmpeg','-v','error','-y','-i',str(OUT/'audio/dialogue.wav'),'-i',str(OUT/'audio/sfx-b.wav'),'-filter_complex',
         f'[0:a][1:a]amix=inputs=2:normalize=0:duration=longest,atrim=end={DUR}[m]','-map','[m]','-ar','48000',
         '-c:a','pcm_s24le',str(OUT/'audio/premaster-b.wav')])
    normalize(OUT/'audio/premaster-b.wav',OUT/'audio/mix-b.wav',-14,-2)


def svg_text(identifier,value,font,size,x,baseline,color,weight=500,italic=False):
    return f'<text id="{identifier}" x="{x}" y="{baseline}" font-family="{font}" font-size="{size}" font-weight="{weight}" font-style="{"italic" if italic else "normal"}" fill="{color}">{e(value)}</text>'


def captions(js):
    words=json.loads((ROOT/'words.json').read_text());beats=json.loads((SB/'beats.json').read_text())
    engine=SingleWordCaptions(SB,words,beats,board.mask)
    # Same adjustment as build_render.py: "of" stays with the mindset phrase.
    prior=next(u for u in engine.units if u['id']=='C027');following=next(u for u in engine.units if u['id']=='C028')
    prior['words'].append(following['words'].pop(0));prior['end']=following['words'][0]['start'];following['start']=prior['end']
    out=[];used=[]
    for unit in engine.units:
        if unit['end']<=T0 or unit['start']>=T1:continue
        mode='face' if unit['end']<=27.14 or unit['start']>=38.49 else 'full' if unit['start']<33.16 else 'half'
        arranged=engine.layout(unit,CAPTION_TOP[mode],False)
        text=''
        for w in arranged:
            text+=svg_text('cap-'+w['id'],w['text'],w['font_family'],w['font_size'],w['draw_x'],w['baseline'],w['color'],w['font_weight'],w['highlight'])
            at=max(unit['start'],w['start']-.03,T0)
            js(f"tl.fromTo('#cap-{w['id']}',{{opacity:0,y:8}},{{opacity:1,y:0,duration:.09,ease:'power3.out',immediateRender:false}},{t(at)});")
        out.append(f'<svg class="caption" viewBox="0 0 1080 1920"><g id="{unit["id"]}">{text}</g></svg>')
        js(f"tl.set('#{unit['id']}',{{opacity:1}},{max(0,t(unit['start']))});")
        js(f"tl.set('#{unit['id']}',{{opacity:0}},{min(DUR,t(unit['end']))});")
        used.append(dict(id=unit['id'],mode=mode,text=board.mask(unit['text']),focus=unit['focus_text']))
    return out,used


def diagram():
    marks=''
    for i,(name,p,_,lx,base,anchor) in enumerate(QUALITIES):
        x,y=point(p)
        leader=f'<line x1="{x}" y1="{y-20}" x2="{x}" y2="{base+16}" stroke="{PALE}" stroke-opacity=".6" stroke-width="3"/>' if anchor=='middle' else ''
        marks+=(f'<g class="milestone" id="ms-{i}">{leader}<circle cx="{x}" cy="{y}" r="16" fill="{PALE}"/>'
                f'<polyline transform="translate({x} {y})" points="-7,0 -2,6 8,-6" fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'
                f'<text x="{lx}" y="{base}" font-family="Inter" font-weight="600" font-size="54" fill="{CREAM}" text-anchor="{anchor}">{name}</text></g>')
    return f'''<svg class="diagram" id="path-diagram" viewBox="0 0 1080 1920"><defs>
<mask id="reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><path id="reveal-path" d="{PATH}" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/></mask></defs>
<g id="cam">
<path id="future" d="{PATH}" fill="none" stroke="{SAGE}" stroke-opacity=".38" stroke-width="9" stroke-linecap="round" stroke-dasharray="0 24" mask="url(#reveal)"/>
<g id="lane"><line id="lane-line" x1="230" y1="1180" x2="560" y2="1180" stroke="{CREAM}" stroke-width="8" stroke-linecap="round"/><line id="lane-tick" x1="560" y1="1150" x2="560" y2="1210" stroke="{CREAM}" stroke-width="8" stroke-linecap="round"/></g>
<path id="walked" d="{PATH}" fill="none" stroke="{CREAM}" stroke-width="14" stroke-linecap="round"/>
<circle id="start-ring" cx="{START[0]}" cy="{START[1]}" r="20" fill="none" stroke="{CREAM}" stroke-width="6"/>
<g transform="translate({END[0]} {END[1]})"><g id="end-node"><circle id="end-fill" r="26" fill="{PALE}" opacity="0"/><circle r="26" fill="none" stroke="{CREAM}" stroke-width="6"/></g></g>
{marks}
<g id="shoe"><g id="shoe-pose"><image href="clay/daily-shoe.png" x="-120" y="-215" width="240" height="240" transform="scale(-1 1)"/></g></g>
<image id="check" href="clay/quality-checkmark.png" x="{END[0]+40}" y="{END[1]-150}" width="170" height="170"/>
</g>
<g id="counter"><text id="counter-label" x="112" y="300" font-family="Inter" font-weight="600" font-size="44" letter-spacing="9" fill="{PALE}">DAY</text>
<text id="counter-num" x="96" y="600" font-family="Playfair" font-style="italic" font-size="330" fill="{CREAM}">1</text><g id="dots"></g></g>
</svg>'''


def timeline(js):
    def cam(state,at,span=.35,ease='power3.inOut',target='#cam'):
        js(f"tl.to('{target}',{{x:{state['x']},y:{state['y']},scale:{state['scale']},duration:{span},ease:'{ease}'}},{t(at)});")
    def enter(sel,at,span=.3,y=24,scale=.96):
        js(f"tl.fromTo('{sel}',{{opacity:0,y:{y},scale:{scale}}},{{opacity:1,y:0,scale:1,duration:{span},ease:'power3.out',immediateRender:false}},{t(at)});")
    js(f"tl.set('#cam',{{svgOrigin:'0 0',x:{CAM_ZOOM['x']},y:{CAM_ZOOM['y']},scale:{CAM_ZOOM['scale']}}},0);")
    js("tl.set('#counter',{svgOrigin:'0 0',x:0,y:0,scale:1},0);")
    js("tl.set(['#lane-line','#lane-tick','#start-ring','#end-node','#check','#shoe-pose','#counter','.milestone','#dots circle'],{opacity:0},0);")
    # Panel wipes up over the face; diagram rides with it.
    js("tl.fromTo('#path-panel',{clipPath:'inset(1920px 0px 0px 0px)'},{clipPath:'inset(0px 0px 0px 0px)',duration:.35,ease:'power3.out',immediateRender:false},%s);"%t(27.04))
    js("tl.fromTo('#path-diagram',{opacity:0},{opacity:1,duration:.2,ease:'power2.out',immediateRender:false},%s);"%t(27.14))
    enter('#start-ring',27.30,y=0,scale=.6)
    enter('#shoe-pose',27.70)
    enter('#counter',28.24,y=8,scale=1)
    js(f"tl.to('#dots circle:nth-child(1)',{{opacity:1,duration:.12}},{t(28.24)});")
    # every day: 1 -> 7, one dot per tick, shoe inches forward.
    for k in range(1,7):
        at=29.00+k*.14
        js(f"tl.to('#dots circle:nth-child({k+1})',{{opacity:1,duration:.1}},{t(at)});")
    js(f"tl.fromTo(cnt,{{n:1}},{{n:7,duration:.85,ease:'none',immediateRender:false,onUpdate:showCount}},{t(29.0)});")
    js(f"tl.fromTo(walk,{{p:0}},{{p:.06,duration:.85,ease:'sine.inOut',immediateRender:false,onUpdate:place}},{t(29.0)});")
    for at in (29.36,33.38):  # "lace": ready pose
        js(f"tl.to('#shoe-pose',{{rotation:-4,scaleY:.95,transformOrigin:'50% 100%',duration:.16,ease:'power2.out'}},{t(at)});")
        js(f"tl.to('#shoe-pose',{{rotation:0,scaleY:1,duration:.22,ease:'power2.inOut'}},{t(at+.16)});")
    # I don't mean run: straight lane shoots out, then retracts.
    js("tl.set(['#lane-line','#lane-tick'],{opacity:1},%s);"%t(30.08))
    js("tl.fromTo('#lane-line',{attr:{x2:230}},{attr:{x2:560},duration:.38,ease:'power3.out',immediateRender:false},%s);"%t(30.10))
    enter('#lane-tick',30.36,span=.15,y=0,scale=.5)
    js("tl.to('#lane-tick',{opacity:0,duration:.12},%s);"%t(30.52))
    js("tl.to('#lane-line',{attr:{x2:230},duration:.4,ease:'power3.in'},%s);"%t(30.55))
    js("tl.set('#lane-line',{opacity:0},%s);"%t(30.95))
    # metaphor for life: camera pulls out while the real path draws.
    cam(CAM_FULL,31.66,span=.85)
    js(f"tl.fromTo('#reveal-path',{{strokeDashoffset:L}},{{strokeDashoffset:0,duration:1.0,ease:'power2.inOut',immediateRender:false}},{t(31.66)});")
    enter('#end-node',32.52,y=0,scale=.6)
    # When you lace them up: panel drops to the lower half, the same diagram keeps going.
    js("tl.to('#path-panel',{clipPath:'inset(1000px 0px 0px 0px)',duration:.35,ease:'power3.inOut'},%s);"%t(33.11))
    cam(CAM_HALF,33.11)
    cam(COUNTER_HALF,33.11,target='#counter')
    # every day, pretty soon you win: the walk and the count.
    js(f"tl.fromTo(walk,{{p:.06}},{{p:.955,duration:1.14,ease:'sine.inOut',immediateRender:false,onUpdate:place}},{t(34.46)});")
    js(f"tl.fromTo(cnt,{{n:7}},{{n:365,duration:1.14,ease:'sine.inOut',immediateRender:false,onUpdate:showCount}},{t(34.46)});")
    js("tl.to('#end-fill',{opacity:1,duration:.2},%s);"%t(35.45))
    enter('#check',35.45,span=.3,y=16,scale=.85)
    for i,q in enumerate(QUALITIES):
        enter(f'#ms-{i}',q[2]-.1,span=.28,y=8,scale=1)
    # everybody: clear back to the face.
    js("tl.to(['#path-panel','#path-diagram'],{opacity:0,duration:.15,ease:'power2.in'},%s);"%t(38.48))


def page_css():
    return f'''@font-face{{font-family:Inter;src:url(fonts/Inter-normal-500.ttf);font-weight:500;font-display:block}}@font-face{{font-family:Inter;src:url(fonts/Inter-normal-600.ttf);font-weight:600;font-display:block}}@font-face{{font-family:Playfair;src:url(fonts/PlayfairDisplay-italic-400.ttf);font-style:italic;font-weight:400;font-display:block}}
*{{box-sizing:border-box;margin:0;padding:0}}html,body{{width:1080px;height:1920px;overflow:hidden;background:#101311}}#main{{position:relative;width:1080px;height:1920px;overflow:hidden;isolation:isolate}}#source{{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover;z-index:0}}.shade{{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,0) 50%,rgba(0,0,0,.42) 76%);pointer-events:none}}.panel{{position:absolute;inset:0;z-index:2;background:radial-gradient(120% 80% at 50% 45%,#23472f 0%,{INK} 55%,#173223 100%);clip-path:inset(1920px 0px 0px 0px)}}.diagram{{position:absolute;inset:0;width:1080px;height:1920px;z-index:3;overflow:visible;pointer-events:none;opacity:0}}.caption{{position:absolute;inset:0;width:1080px;height:1920px;z-index:8;overflow:visible;pointer-events:none}}.caption g,.caption text{{opacity:0}}.caption text{{white-space:pre}}'''


# Path diagram runtime: arc-length helpers for the walking shoe, walked stroke and day counter.
PATH_SETUP='''const P=document.getElementById('walked'),L=P.getTotalLength();
const R=document.getElementById('reveal-path');R.style.strokeDasharray=L;R.style.strokeDashoffset=L;
P.style.strokeDasharray=L;P.style.strokeDashoffset=L;
const walk={p:0},cnt={n:1},num=document.getElementById('counter-num'),shoe=document.getElementById('shoe');
function at(p){const q=P.getPointAtLength(p*L);return [q.x,q.y];}
function place(){const [x,y]=at(walk.p);shoe.setAttribute('transform',`translate(${x} ${y})`);P.style.strokeDashoffset=L*(1-walk.p);}
function showCount(){num.textContent=String(Math.max(1,Math.round(cnt.n)));}
const dots=document.getElementById('dots');
for(let k=0;k<7;k++){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',122+k*40);c.setAttribute('cy',672);c.setAttribute('r',10);c.setAttribute('fill','%s');dots.appendChild(c);}
place();showCount();
''' % PALE


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    for sub in ['clay','fonts','assets']:(OUT/sub).mkdir(exist_ok=True)
    for name in ['daily-shoe.png','quality-checkmark.png']:shutil.copy2(SB/'assets/clay'/name,OUT/'clay'/name)
    for name in ['Inter-normal-500.ttf','Inter-normal-600.ttf','PlayfairDisplay-italic-400.ttf']:shutil.copy2(SB/'fonts'/name,OUT/'fonts'/name)
    shutil.copy2(ROOT/'assets/gsap.min.js',OUT/'assets/gsap.min.js')
    if '--skip-media' not in sys.argv:media()
    animations=[];js=animations.append
    caps,used=captions(js)
    timeline(js)
    css=page_css()
    setup='const tl=gsap.timeline({paused:true});\n'+PATH_SETUP
    page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920"><script src="assets/gsap.min.js"></script><style>'+css+'</style></head><body>'
    page+=f'<div id="main" data-composition-id="main" data-width="1080" data-height="1920" data-duration="{DUR}" data-fps="30">'
    page+=f'<video id="source" src="media/source.mp4" data-start="0" data-duration="{DUR}" data-track-index="0" muted playsinline></video><div class="shade" data-layout-ignore></div><div id="path-panel" class="panel" data-layout-ignore></div>'
    page+=diagram()+''.join(caps)
    page+=f'<audio id="programme" src="audio/mix-a.wav" data-start="0" data-duration="{DUR}" data-track-index="1" data-volume="1"></audio></div>'
    page+='<script>'+setup+'\n'.join(animations)+'\nwindow.__timelines=window.__timelines||{};window.__timelines.main=tl;</script></body></html>'
    (OUT/'index.html').write_text(page)
    (OUT/'hyperframes.json').write_text(json.dumps({'$schema':'https://hyperframes.heygen.com/schema/hyperframes.json','paths':{'assets':'assets','blocks':'compositions','components':'compositions/components'},'media':{'autoProxy':True}},indent=2)+'\n')
    (OUT/'package.json').write_text(json.dumps({'name':'sprout-goggins-sample-path','private':True,'type':'module','scripts':{'check':'npx --yes hyperframes@0.8.163 check','render':'npx --yes hyperframes@0.8.163 render'}},indent=2)+'\n')
    (OUT/'sample-plan.json').write_text(json.dumps(dict(window=[T0,T1],captions=used,sfx_b=SFX_B,animation_commands=len(animations)),indent=2,ensure_ascii=False)+'\n')
    print(json.dumps(dict(out=str(OUT),captions=len(used),animation_commands=len(animations))))


if __name__=='__main__':main()
