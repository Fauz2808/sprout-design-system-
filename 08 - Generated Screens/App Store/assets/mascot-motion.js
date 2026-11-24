(function (host) {
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const smooth = (n) => { const v = clamp(n, 0, 1); return v * v * (3 - 2 * v); };
  const pulse = (time, center, duration) => {
    const phase = (time - center) / duration;
    return phase < 0 || phase > 1 ? 0 : Math.sin(phase * Math.PI);
  };
  const profiles = [
    { name: 'Curious', gaze: 'scan', brow: .16, hop: [2.8], energy: .75 },
    { name: 'Surprised', gaze: 'up', brow: .4, hop: [2.1], energy: 1.05 },
    { name: 'Thinking', gaze: 'down', brow: -.22, hop: [], energy: .45 },
    { name: 'Unsure', gaze: 'scan', brow: .08, hop: [3.4], energy: .7 },
    { name: 'Playful', gaze: 'ahead', brow: .08, hop: [1.1, 4.3], energy: 1.2 },
    { name: 'Searching', gaze: 'search', brow: .22, hop: [], energy: .8 },
    { name: 'A little tired', gaze: 'down', brow: -.18, hop: [], energy: .25 },
    { name: 'Relieved', gaze: 'up', brow: .12, hop: [2.3], energy: .85 },
    { name: 'Confident', gaze: 'up', brow: .05, hop: [3.25], energy: .85 },
    { name: 'Delighted', gaze: 'scan', brow: .2, hop: [1.65, 3.8], energy: 1.2 }
  ];
  const config = { eyes: [{ x: .3885, y: .6586, r: .0392 }, { x: .6, y: .6586, r: .0392 }], pivot: [.5007, .2532] };
  function sample(slide, time, progress, tangent = 0, interaction = null) {
    const profile = profiles[slide] || profiles[0];
    const edge = smooth(progress / .09) * smooth((1 - progress) / .09);
    const phase = time * 1.7 + slide * .47;
    let gx = .7 * Math.sin(phase), gy = .25 * Math.sin(phase * .73);
    if (profile.gaze === 'scan') gx = .9 * Math.sin(time * 2.35 - .85);
    if (profile.gaze === 'search') { gx = .95 * Math.sin(time * 2.7); gy = -.45 + .3 * Math.cos(time * 2); }
    if (profile.gaze === 'up') { gx = .35 * Math.sin(phase); gy = -.55; }
    if (profile.gaze === 'down') { gx = .38 * Math.sin(phase); gy = .35; }
    if (profile.gaze === 'ahead') { gx = .75; gy = clamp(tangent / 45, -.55, .55); }
    let lift = 0, landing = 0;
    for (const start of profile.hop) {
      lift = Math.max(lift, pulse(time, start, .65));
      landing = Math.max(landing, pulse(time, start + .6, .24));
    }
    let joy = slide >= 7 ? .18 : 0;
    joy = Math.max(joy, lift * .9);
    if (slide === 9) joy = Math.max(joy, smooth(time / .65) * .9);
    if (interaction) {
      if (Number.isFinite(interaction.gazeX)) gx = clamp(interaction.gazeX, -1, 1);
      if (Number.isFinite(interaction.gazeY)) gy = clamp(interaction.gazeY, -1, 1);
      if (Number.isFinite(interaction.hopTime)) {
        lift = Math.max(lift, pulse(interaction.hopTime, 0, .65));
        landing = Math.max(landing, pulse(interaction.hopTime, .6, .24));
        joy = Math.max(joy, lift);
      }
    }
    const blinkAmount = Math.max(pulse(time, 1.05 + (slide % 3) * .17, .18), pulse(time, 4.45 - (slide % 2) * .22, .19));
    const tired = slide === 6 ? .43 * edge : 0;
    const stretch = .06 * lift - .085 * landing;
    return {
      label: profile.name,
      gazeX: gx * (interaction ? 1 : edge), gazeY: gy * (interaction ? 1 : edge),
      blink: clamp((1 - .96 * blinkAmount) * (1 - tired), .045, 1),
      joy: joy * (slide === 9 ? 1 : edge), brow: profile.brow * edge,
      tilt: clamp(tangent, -12, 12) * edge + gx * 6 * edge + Math.sin(time * 2.2) * 2.5 * profile.energy * edge,
      lean: gx * .018 * edge,
      leafAngle: (Math.sin(time * 3.1 + slide * .45) * 7 + Math.sin(time * 1.2) * 3 + lift * 13) * profile.energy * edge,
      scaleX: 1 - stretch + .013 * Math.sin(time * 4) * edge,
      scaleY: 1 + stretch - .013 * Math.sin(time * 4) * edge,
      hopY: (-.30 * lift + .025 * landing) * edge,
      shadowScale: 1 - .32 * lift * edge,
      shadowOpacity: .14 - .07 * lift * edge
    };
  }
  function markup(label = 'Sprout mascot') {
    return `<span class="sprout-actor" aria-hidden="true"><span class="sprout-shadow"></span><span class="sprout-rig"><img class="sprout-body" src="assets/mascot-live/body.webp" alt="" draggable="false"><img class="sprout-leaves" src="assets/mascot-live/leaves.webp" alt="" draggable="false">${config.eyes.map((eye, i) => `<span class="sprout-eye" data-eye="${i}" style="left:${(eye.x-eye.r)*100}%;top:${(eye.y-eye.r*1.18)*100}%;width:${eye.r*200}%;height:${eye.r*236}%"></span><span class="sprout-brow" data-brow="${i}" style="left:${(eye.x-eye.r)*100}%;top:${(eye.y-eye.r*2.5)*100}%;width:${eye.r*210}%"></span>`).join('')}</span></span>`;
  }
  function apply(actor, pose, size) {
    const rig = actor.querySelector('.sprout-rig');
    rig.style.transform = `translate(${pose.lean * size}px,${pose.hopY * size}px) rotate(${pose.tilt}deg) scale(${pose.scaleX},${pose.scaleY})`;
    actor.querySelector('.sprout-leaves').style.transform = `rotate(${pose.leafAngle}deg)`;
    actor.querySelectorAll('.sprout-eye').forEach(eye => {
      const eyeHeight = config.eyes[0].r * 2.36 * size;
      eye.style.transform = `translate(${pose.gazeX*config.eyes[0].r*1.24*size}px,${pose.gazeY*eyeHeight*.52}px) scaleY(${pose.blink})`;
      eye.style.borderRadius = pose.joy > .55 ? '50% 50% 46% 46% / 30% 30% 70% 70%' : '50%';
    });
    actor.querySelectorAll('.sprout-brow').forEach((brow, i) => {
      brow.style.opacity = String(Math.abs(pose.brow));
      brow.style.transform = `translateY(${-pose.brow*size*.012}px) rotate(${(i ? -1 : 1)*pose.brow*28}deg)`;
    });
    const shadow = actor.querySelector('.sprout-shadow');
    shadow.style.transform = `scaleX(${pose.shadowScale})`;
    shadow.style.opacity = String(pose.shadowOpacity);
  }
  const api = { config, profiles, sample, markup, apply };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else host.SproutMotion = api;
})(typeof window !== 'undefined' ? window : {});
