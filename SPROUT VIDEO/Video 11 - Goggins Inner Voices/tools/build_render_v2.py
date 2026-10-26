#!/usr/bin/env python3
"""Build render v2: every cutaway is one diagram that grows with the sentence.

v1 (build_render.py) swaps clay pictures on cream. v2 keeps the face beats, the Figma bubble,
the camera reframes and the caption profile, and replaces the three cutaways:
  p04 12.3-17.3  practice bars become the stairs of the process
  p08-p11 27.1-38.5  the walking path from samples/27-38-path-build (unchanged)
  p14 46.8-50.6  the same path, drowned out by everybody else's bubbles
Writes a separate HyperFrames project to v2/ so v1 stays reproducible.
Beat sheet: v2/BEATS.md.
"""
import json
from pathlib import Path
import shutil
import subprocess
import sys

import build_storyboard as board
import build_sample_path as path
from caption_profile import SingleWordCaptions
from prepare_render_audio import normalize

ROOT=Path(__file__).resolve().parents[1]
SB=ROOT/'storyboard'
OUT=ROOT/'v2'
KIT=ROOT.parent/'_Kit/sprout-talking-head'
DUR=json.loads((ROOT/'plan.json').read_text())['source']['duration']
INK,CREAM,SAGE,PALE,BUBBLE=path.INK,path.CREAM,path.SAGE,path.PALE,'#eae6db'
path.T0=0   # the path sample's timeline is written in source time

# Caption placement per scene: on the face, over a full panel, or in the lower half panel.
FULL=[(12.3,17.26),(27.14,33.16),(46.84,50.62)]
HALF=[(33.16,38.5)]
CAPTION_TOP=dict(face=1040,full=1390,half=1430)

# p04: eight practice bars on a floor; on "process" they grow into stairs.
FLOOR_Y,BAR_W,BAR_GAP,BAR_X0,TALLY_H=1180,72,26,161,130
STAIR_H=[110+k*90 for k in range(8)]
# p14: bubbles crowd the journey. Screen coords (x, y, width, appear). Kept above the caption zone.
BUBBLES=[(330,760,230,49.00),
         (620,640,200,49.30),(120,560,180,49.36),(760,900,210,49.42),(430,420,240,49.48),
         (80,960,170,49.54),(690,330,190,49.60),(250,250,210,49.66),
         (560,1040,220,49.72),(860,560,150,49.78),(150,1150,190,49.84),(380,580,160,49.90),(820,1120,200,49.96)]
JOURNEY_P=.3
SFX=[(12.32,'paper-whoosh-short.wav',-19,'steps panel wipes up'),
     (27.20,'paper-whoosh-short.wav',-19,'path panel wipes up'),
     (31.90,'paper-slide-long.wav',-19,'path draws while the camera pulls out'),
     (35.50,'card-land-soft.wav',-20,'checkmark lands'),
     (46.92,'paper-whoosh-short.wav',-19,'journey panel wipes up')]


def run(args):subprocess.run(args,check=True,capture_output=True)


def media():
    (OUT/'media').mkdir(parents=True,exist_ok=True);(OUT/'audio').mkdir(exist_ok=True)
    shutil.copy2(SB/'media/source.mp4',OUT/'media/source.mp4')
    normalize(ROOT/'audio/dialogue.wav',OUT/'audio/master-a.wav',-14,-2)
    cues=dict(duration=DUR,cues=[dict(t=at,sound=s,gain_db=g,event=ev) for at,s,g,ev in SFX])
    (OUT/'audio/cues.json').write_text(json.dumps(cues,indent=2)+'\n')
    run([sys.executable,str(KIT/'tools/mix_sfx.py'),str(OUT/'audio/cues.json'),'--output',str(OUT/'audio/sfx.wav'),'--replace'])
    run(['ffmpeg','-v','error','-y','-i',str(ROOT/'audio/dialogue.wav'),'-i',str(OUT/'audio/sfx.wav'),'-filter_complex',
         f'[0:a][1:a]amix=inputs=2:normalize=0:duration=longest,atrim=end={DUR}[m]','-map','[m]','-ar','48000',
         '-c:a','pcm_s24le',str(OUT/'audio/premaster.wav')])
    normalize(OUT/'audio/premaster.wav',OUT/'audio/master.wav',-14,-2)


def in_any(t,spans):return any(a<=t<b for a,b in spans)


def captions(js):
    words=json.loads((ROOT/'words.json').read_text());beats=json.loads((SB/'beats.json').read_text())
    engine=SingleWordCaptions(SB,words,beats,board.mask)
    # Same adjustment as build_render.py: "of" stays with the mindset phrase.
    prior=next(u for u in engine.units if u['id']=='C027');following=next(u for u in engine.units if u['id']=='C028')
    prior['words'].append(following['words'].pop(0));prior['end']=following['words'][0]['start'];following['start']=prior['end']
    for u in [prior,following]:u['text']=' '.join(w['text'] for w in u['words'])
    out=[];used=[]
    for unit in engine.units:
        mode='full' if in_any(unit['start'],FULL) else 'half' if in_any(unit['start'],HALF) else 'face'
        arranged=engine.layout(unit,CAPTION_TOP[mode],False)
        text=''
        for w in arranged:
            text+=path.svg_text('render-'+w['id'],w['text'],w['font_family'],w['font_size'],w['draw_x'],w['baseline'],w['color'],w['font_weight'],w['highlight'])
            at=max(unit['start'],w['start']-.03)
            js(f"tl.fromTo('#render-{w['id']}',{{opacity:0,y:8}},{{opacity:1,y:0,duration:.09,ease:'power3.out',immediateRender:false}},{at:.6f});")
        out.append(f'<svg class="caption" viewBox="0 0 1080 1920"><g id="{unit["id"]}">{text}</g></svg>')
        js(f"tl.set('#{unit['id']}',{{opacity:1}},{unit['start']:.6f});")
        js(f"tl.set('#{unit['id']}',{{opacity:0}},{unit['end']:.6f});")
        used.append(dict(id=unit['id'],mode=mode,start=unit['start'],end=unit['end'],text=board.mask(unit['text']),focus=unit['focus_text'],layout=arranged))
    ids=[w['id'] for u in engine.units for w in u['words']]
    assert ids==[w['id'] for w in words] and len(ids)==len(set(ids))
    assert all(sum(w['highlight'] for w in u['layout'])==1 for u in used)
    return out,used


def inner_voice(js):
    """Beat 01 Figma bubble, exactly as build_render.py draws it."""
    geometry=json.loads((SB/'assets/ui/chat-bubble-layout.json').read_text())
    width,height=geometry['width'],geometry['height'];x=(1080-width)/2;y=1390;scale=1080/393
    quote=geometry['text'];f=board.font(geometry['video_font_size'],medium=True);box=f.getbbox(quote,anchor='ls')
    ink_height=box[3]-box[1];line_height=round(16.94318199157715*scale)
    baseline=y+geometry['padding_y']+round((line_height-ink_height)/2)-box[1]
    bubble=f'<image href="ui/chat-tail.png" x="{x-round(8*scale)}" y="{y+height-round(15*scale)}" width="{round(18*scale)}" height="{round(15*scale)}"/><rect x="{x}" y="{y}" width="{width}" height="{height}" rx="{round(12*scale)}" fill="{BUBBLE}"/>'
    bubble+=path.svg_text('inner-voice-text',quote,'Inter',f.size,x+geometry['padding_x']-box[0],baseline,INK)
    words=json.loads((ROOT/'words.json').read_text())
    js(f"tl.fromTo('#inner-voice',{{opacity:0,y:16}},{{opacity:1,y:0,duration:.25,ease:'power3.out',immediateRender:false}},{words[11]['end']:.6f});")
    js("tl.to('#inner-voice',{opacity:0,duration:.12,ease:'power2.in'},3.68);")
    return f'<svg class="svg-layer" viewBox="0 0 1080 1920"><g id="inner-voice">{bubble}</g></svg>'


def enter(js,sel,at,span=.3,y=24,scale=.96,origin=None):
    o=f",transformOrigin:'{origin}'" if origin else ''
    js(f"tl.fromTo('{sel}',{{opacity:0,y:{y},scale:{scale}{o}}},{{opacity:1,y:0,scale:1,duration:{span},ease:'power3.out',immediateRender:false}},{at:.6f});")


def panel_in(js,panel,diagram,at):
    js(f"tl.fromTo('{panel}',{{clipPath:'inset(1920px 0px 0px 0px)'}},{{clipPath:'inset(0px 0px 0px 0px)',duration:.35,ease:'power3.out',immediateRender:false}},{at:.6f});")
    js(f"tl.fromTo('{diagram}',{{opacity:0}},{{opacity:1,duration:.2,ease:'power2.out',immediateRender:false}},{at+.1:.6f});")


def panel_out(js,panel,diagram,at):
    js(f"tl.to(['{panel}','{diagram}'],{{opacity:0,duration:.12,ease:'power2.in'}},{at:.6f});")


def steps(js):
    xs=[BAR_X0+k*(BAR_W+BAR_GAP) for k in range(8)]
    bars=''.join(f'<rect class="bar" id="bar-{k}" x="{x}" y="{FLOOR_Y}" width="{BAR_W}" height="0" rx="14" fill="{CREAM}"/>' for k,x in enumerate(xs))
    # Trace over the stair tops, 24px above them, ending in a ring on the top step.
    points=[]
    for x,h in zip(xs,STAIR_H):points+= [(x,FLOOR_Y-h-24),(x+BAR_W,FLOOR_Y-h-24)]
    trace=' '.join(f'{x},{y}' for x,y in points)
    ex,ey=points[-1]
    svg=(f'<svg class="diagram" id="steps-diagram" viewBox="0 0 1080 1920">'
         f'<line id="floor" x1="130" y1="{FLOOR_Y}" x2="950" y2="{FLOOR_Y}" stroke="{SAGE}" stroke-opacity=".45" stroke-width="6" stroke-linecap="round"/>'
         f'{bars}<polyline id="trace" points="{trace}" fill="none" stroke="{PALE}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>'
         f'<circle id="steps-end" cx="{ex+30}" cy="{ey}" r="22" fill="none" stroke="{CREAM}" stroke-width="6"/>'
         # Same day counter as the path beat: each bar is one day of practice, and the top of the frame is not left empty.
         f'<g id="steps-counter"><text x="112" y="300" font-family="Inter" font-weight="600" font-size="44" letter-spacing="9" fill="{PALE}">DAY</text>'
         f'<text id="steps-num" x="96" y="600" font-family="Playfair" font-style="italic" font-size="330" fill="{CREAM}">1</text></g></svg>')
    js("const TR=document.getElementById('trace'),TL=TR.getTotalLength();TR.style.strokeDasharray=TL;TR.style.strokeDashoffset=TL;")
    js("const SC={n:1},SN=document.getElementById('steps-num');function stepCount(){SN.textContent=String(Math.round(SC.n));}")
    js("tl.set(['#steps-end','#steps-counter'],{opacity:0},0);")
    enter(js,'#steps-counter',13.10,y=8,scale=1)
    for k in range(1,8):
        js(f"tl.fromTo(SC,{{n:{k}}},{{n:{k+1},duration:.05,ease:'none',immediateRender:false,onUpdate:stepCount}},{13.80+(k-1)*.07:.6f});")
    panel_in(js,'#steps-panel','#steps-diagram',12.20)
    js(f"tl.fromTo('#floor',{{attr:{{x2:130}}}},{{attr:{{x2:950}},duration:.45,ease:'power3.out',immediateRender:false}},12.30);")
    # put -> first bar; practice -> the rest, one per beat, done on "in".
    for k in range(8):
        at=13.10 if k==0 else 13.80+(k-1)*.07
        js(f"tl.fromTo('#bar-{k}',{{attr:{{y:{FLOOR_Y},height:0}}}},{{attr:{{y:{FLOOR_Y-TALLY_H},height:{TALLY_H}}},duration:.25,ease:'power3.out',immediateRender:false}},{at:.6f});")
    # that you know this: a highlight sweeps across the bars.
    for k in range(8):
        at=14.90+k*.06
        js(f"tl.to('#bar-{k}',{{attr:{{fill:'{PALE}'}},duration:.12,ease:'power1.out'}},{at:.6f});")
        js(f"tl.to('#bar-{k}',{{attr:{{fill:'{CREAM}'}},duration:.3,ease:'power1.inOut'}},{at+.12:.6f});")
    # the process: bars grow into stairs, then one line connects them to the top.
    for k,h in enumerate(STAIR_H):
        js(f"tl.to('#bar-{k}',{{attr:{{y:{FLOOR_Y-h},height:{h}}},duration:.32,ease:'power3.inOut'}},{16.06+k*.05:.6f});")
    js("tl.to(TR,{strokeDashoffset:0,duration:.45,ease:'power2.inOut'},16.58);")
    enter(js,'#steps-end',16.98,span=.2,y=0,scale=.6,origin='50% 50%')
    panel_out(js,'#steps-panel','#steps-diagram',17.14)
    return svg


def bubble(i,x,y,w):
    h=round(w*.46);r=round(h*.32);d=round(w*.05)
    tail=f'M{x+w*.16:.0f} {y+h-2} L{x+w*.08:.0f} {y+h+h*.28:.0f} L{x+w*.34:.0f} {y+h-2} Z' if i%2==0 else \
         f'M{x+w*.66:.0f} {y+h-2} L{x+w*.92:.0f} {y+h+h*.28:.0f} L{x+w*.84:.0f} {y+h-2} Z'
    dots=''.join(f'<circle cx="{x+w/2+(j-1)*w*.17:.0f}" cy="{y+h/2:.0f}" r="{d}" fill="{INK}" fill-opacity=".55"/>' for j in range(3))
    return f'<g class="bubble" id="bubble-{i}"><path d="{tail}" fill="{BUBBLE}"/><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{BUBBLE}"/>{dots}</g>'


def journey(js):
    cam=path.CAM_FULL
    sx,sy=path.point(JOURNEY_P)
    svg=(f'<svg class="diagram" id="journey-diagram" viewBox="0 0 1080 1920"><defs>'
         f'<mask id="j-reveal-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><path id="j-reveal" d="{path.PATH}" fill="none" stroke="#fff" stroke-width="40" stroke-linecap="round"/></mask></defs>'
         f'<g id="j-world" transform="translate({cam["x"]} {cam["y"]})">'
         f'<path d="{path.PATH}" fill="none" stroke="{SAGE}" stroke-opacity=".38" stroke-width="9" stroke-linecap="round" stroke-dasharray="0 24" mask="url(#j-reveal-mask)"/>'
         f'<path id="j-walked" d="{path.PATH}" fill="none" stroke="{CREAM}" stroke-width="14" stroke-linecap="round"/>'
         f'<circle cx="{path.START[0]}" cy="{path.START[1]}" r="20" fill="none" stroke="{CREAM}" stroke-width="6"/>'
         f'<g transform="translate({path.END[0]} {path.END[1]})"><g id="j-end"><circle r="26" fill="none" stroke="{CREAM}" stroke-width="6"/></g></g>'
         f'<g transform="translate({sx} {sy})"><g id="j-shoe"><image href="clay/daily-shoe.png" x="-120" y="-215" width="240" height="240" transform="scale(-1 1)"/></g></g>'
         f'</g>'+''.join(bubble(i,x,y,w) for i,(x,y,w,_) in enumerate(BUBBLES))+'</svg>')
    js(f"const JW=document.getElementById('j-walked'),JR=document.getElementById('j-reveal'),JL=JW.getTotalLength();"
       f"JW.style.strokeDasharray=JL;JW.style.strokeDashoffset=JL*{1-JOURNEY_P};JR.style.strokeDasharray=JL;JR.style.strokeDashoffset=JL;")
    js("tl.set(['#j-end','#j-shoe','.bubble'],{opacity:0},0);")
    panel_in(js,'#journey-panel','#journey-diagram',46.74)
    enter(js,'#j-shoe',46.90)
    # their journey: the road ahead draws out to its end.
    js("tl.to(JR,{strokeDashoffset:0,duration:.8,ease:'power2.inOut'},48.40);")
    enter(js,'#j-end',49.0-.2,span=.2,y=0,scale=.6,origin='50% 50%')
    # everybody else's: bubbles multiply around the walker.
    for i,(_,_,_,at) in enumerate(BUBBLES):
        enter(js,f'#bubble-{i}',at,span=.22,y=10,scale=.8,origin='50% 50%')
    # shit: the journey is drowned out.
    js("tl.to('#j-world',{opacity:.3,duration:.3,ease:'power2.inOut'},50.24);")
    panel_out(js,'#journey-panel','#journey-diagram',50.48)
    return svg


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    for sub in ['clay','fonts','assets','ui','renders']:(OUT/sub).mkdir(exist_ok=True)
    for name in ['daily-shoe.png','quality-checkmark.png']:shutil.copy2(SB/'assets/clay'/name,OUT/'clay'/name)
    for name in ['Inter-normal-500.ttf','Inter-normal-600.ttf','PlayfairDisplay-italic-400.ttf']:shutil.copy2(SB/'fonts'/name,OUT/'fonts'/name)
    shutil.copy2(SB/'assets/ui/chat-tail.png',OUT/'ui/chat-tail.png')
    shutil.copy2(ROOT/'assets/gsap.min.js',OUT/'assets/gsap.min.js')
    if '--skip-media' not in sys.argv:media()
    animations=[];js=animations.append
    # Camera reframes from v1, below the approved 3% change.
    for line in ["tl.to('#camera',{scale:1.03,duration:5.06,ease:'sine.inOut'},3.8);","tl.to('#camera',{scale:1,duration:.25,ease:'power3.out'},8.86);",
                 "tl.to('#camera',{scale:1.03,duration:5.14,ease:'sine.inOut'},50.62);","tl.to('#camera',{scale:1,duration:.25,ease:'power3.out'},55.76);"]:js(line)
    bubble_svg=inner_voice(js)
    steps_svg=steps(js)
    path.timeline(js)
    journey_svg=journey(js)
    caps,used=captions(js)
    css=path.page_css()+'#camera{position:absolute;inset:0;transform-origin:50% 35%;z-index:0}.svg-layer{position:absolute;inset:0;width:1080px;height:1920px;z-index:4;overflow:visible;pointer-events:none}#inner-voice{opacity:0}'
    setup='const tl=gsap.timeline({paused:true});\n'+path.PATH_SETUP
    page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=1080,height=1920"><script src="assets/gsap.min.js"></script><style>'+css+'</style></head><body>'
    page+=f'<div id="main" data-composition-id="main" data-width="1080" data-height="1920" data-duration="{DUR}" data-fps="30">'
    page+=f'<div id="camera"><video id="source" src="media/source.mp4" data-start="0" data-duration="{DUR}" data-track-index="0" muted playsinline></video></div><div class="shade" data-layout-ignore></div>'
    page+=''.join(f'<div id="{p}" class="panel" data-layout-ignore></div>' for p in ['steps-panel','path-panel','journey-panel'])
    page+=bubble_svg+steps_svg+path.diagram()+journey_svg+''.join(caps)
    page+=f'<audio id="programme" src="audio/master.wav" data-start="0" data-duration="{DUR}" data-track-index="1" data-volume="1"></audio></div>'
    page+='<script>'+setup+'\n'.join(animations)+'\nwindow.__timelines=window.__timelines||{};window.__timelines.main=tl;</script></body></html>'
    (OUT/'index.html').write_text(page)
    (OUT/'hyperframes.json').write_text(json.dumps({'$schema':'https://hyperframes.heygen.com/schema/hyperframes.json','paths':{'assets':'assets','blocks':'compositions','components':'compositions/components'},'media':{'autoProxy':True}},indent=2)+'\n')
    (OUT/'package.json').write_text(json.dumps({'name':'sprout-goggins-inner-voices-v2','private':True,'type':'module','scripts':{'check':'npx --yes hyperframes@0.8.163 check','render':'npx --yes hyperframes@0.8.163 render'}},indent=2)+'\n')
    (OUT/'renders/render-plan.json').write_text(json.dumps(dict(version=2,duration=DUR,fps=30,full=FULL,half=HALF,sfx=SFX,bubbles=BUBBLES,units=used,animation_commands=len(animations)),indent=2,ensure_ascii=False)+'\n')
    print(json.dumps(dict(out=str(OUT),captions=len(used),animation_commands=len(animations))))


if __name__=='__main__':main()
