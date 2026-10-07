/* Sprout Assist landing, v2. Four small jobs:
   1. The hero's last line rotates through what Sprout does, each with its own Sprout 3D object.
   2. Each row's UI pieces rise in when the row scrolls into view.
   3. Two rows keep a quiet loop while on screen: the camp form types its last field, and the payment is
      approved and the "Approved by Lydia" note lands.
   4. The waitlist forms. Prototype only: they check the email and send nothing anywhere. */
(function () {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1 · rotating line */
  const A = "./assets/assist/";
  const LINES = [
    ["signs up for camp", A + "need-when.webp"],
    ["fills in the field-trip slip", A + "need-what.webp"],
    ["plans the birthday party", A + "bday-lg.webp"],
    ["sorts out the carpool", A + "bus-lg.webp"],
    ["reminds Matt about pickup", A + "bell.webp"],
  ];
  LINES.forEach(([, src]) => (new Image().src = src));
  const rot = document.querySelector(".h-rot");
  const word = document.getElementById("rotWord");
  const obj = document.getElementById("rotObj");
  let i = 0;
  if (rot && !reduced) {
    setInterval(() => {
      if (document.hidden) return;
      rot.classList.add("swap");
      setTimeout(() => {
        i = (i + 1) % LINES.length;
        word.textContent = LINES[i][0];
        obj.src = LINES[i][1];
        rot.classList.remove("swap");
      }, 380);
    }, 2600);
  }

  /* 2 + 3 · rows */
  const arts = [...document.querySelectorAll(".row .art")];
  arts.forEach((a) => a.classList.add("reveal"));
  const typeField = document.getElementById("typeField");
  const loops = new Map();

  function typeLoop() {
    let n = 0;
    const text = "Youth M";
    return setInterval(() => {
      n = (n + 1) % (text.length + 8); // type, then hold the full value for a beat
      typeField.textContent = text.slice(0, Math.min(n, text.length));
    }, 160);
  }
  function payLoop(art) {
    const ok = art.querySelector(".gp-approve, .pay-ok");
    const cycle = () => {
      art.classList.add("approve-off");
      setTimeout(() => ok.classList.add("pressed"), 1600);
      setTimeout(() => { ok.classList.remove("pressed"); art.classList.remove("approve-off"); }, 1850);
    };
    cycle();
    return setInterval(cycle, 5200);
  }

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const a = e.target;
        if (e.isIntersecting) {
          a.classList.add("is-in");
          if (reduced || loops.has(a)) return;
          if (a.contains(typeField)) loops.set(a, typeLoop());
          if (a.querySelector(".gp-pay, .pay")) loops.set(a, payLoop(a));
        } else if (loops.has(a)) {
          clearInterval(loops.get(a));
          loops.delete(a);
        }
      }),
    { threshold: 0.25 }
  );
  arts.forEach((a) => io.observe(a));

  /* Sprout's Thinking Orb on every canvas[data-orb]: data-play animates (paused off screen by the
     orb itself), the rest draw one still frame so small orbs don't all move at once. */
  addEventListener("load", () => {
    if (!window.SproutThinkingOrb) return;
    document.querySelectorAll("canvas[data-orb]").forEach((c) => {
      const orb = window.SproutThinkingOrb.create(c, { state: c.dataset.orb, theme: "light" });
      if (!orb) return;
      "play" in c.dataset ? orb.play() : orb.draw();
    });
  });


  /* 5 · blink: every mascot with data-blink closes its eyes for a beat, at its own random rhythm */
  document.querySelectorAll("img[data-blink]").forEach((img) => (new Image().src = img.dataset.blink));
  function blinkLoop(img) {
    if (reduced) return;
    const open = img.getAttribute("src");
    setTimeout(function tick() {
      if (!document.hidden && img.dataset.blink) {
        const keep = img.getAttribute("src");
        img.src = img.dataset.blink;
        setTimeout(() => (img.src = keep), 140);
      }
      setTimeout(tick, 2800 + Math.random() * 3200);
    }, 1200 + Math.random() * 2400);
  }
  document.querySelectorAll("img[data-blink]").forEach(blinkLoop);

  /* 6 · the film slot: a live teaser of Video 7, direction 2 ("two phones, one Sprout"), ~20 s, looping.
     Built from the same mascot frames and UI as the page; replaced by a <video> once the film exists. */
  const film = document.getElementById("film");
  if (film) {
    const M = "./assets/mascot/";
    const stage = document.getElementById("stage");
    const chatL = document.getElementById("chatL"), chatR = document.getElementById("chatR");
    const tc = document.getElementById("tc"), tcText = document.getElementById("tcText");
    const actor = document.getElementById("actor"), aImg = document.getElementById("actorImg");
    const pill = document.getElementById("pill"), pillText = document.getElementById("pillText");
    const pBrowser = document.getElementById("propBrowser"), pSpend = document.getElementById("propSpend");
    const bmField = document.getElementById("bmField"), smBtn = document.getElementById("smBtn");
    const confetti = document.getElementById("confetti"), ctl = document.getElementById("filmCtl");
    let narrow = false;

    function fit() {
      narrow = film.clientWidth < 620;
      stage.classList.toggle("narrow", narrow);
      const w = narrow ? 480 : 1000;
      stage.style.transform = `scale(${film.clientWidth / w})`;
    }
    addEventListener("resize", fit);
    fit();

    // where the actor stands: centre, by Lydia's phone, by Matt's phone (desktop and narrow)
    const POS = {
      mid: () => (narrow ? [240, 300, 150] : [500, 150, 170]),
      L: () => (narrow ? [126, 300, 120] : [392, 150, 120]),
      R: () => (narrow ? [354, 300, 120] : [608, 150, 120]),
      work: () => (narrow ? [240, 300, 110] : [500, 96, 124]),
      low: () => (narrow ? [240, 330, 170] : [500, 120, 190]),
    };
    function place(where, hop) {
      const [x, y, size] = POS[where]();
      actor.style.setProperty("--ax", x + "px");
      actor.style.setProperty("--ay", y + "px");
      actor.style.setProperty("--as", size + "px");
      if (hop) { actor.classList.remove("idle", "hop"); void actor.offsetWidth; actor.classList.add("hop"); setTimeout(() => { actor.classList.remove("hop"); actor.classList.add("idle"); }, 900); }
    }
    function face(name) { aImg.src = M + name; aImg.dataset.blink = name === "sprout.webp" ? M + "sprout-blink.webp" : ""; }
    function say(chat, cls, html) {
      const b = document.createElement("div");
      b.className = "fb " + cls;
      b.innerHTML = html;
      chat.appendChild(b);
      while (chat.children.length > 4) chat.removeChild(chat.firstElementChild);
    }
    function status(text) { pillText.textContent = text; pill.classList.toggle("on", !!text); }
    function burst() {
      const colors = ["#f6d57c", "#73b588", "#f2a58e", "#186338", "#9bc7e8"];
      confetti.innerHTML = Array.from({ length: 46 }, (_, i) => `<i style="left:${Math.random() * 100}%;background:${colors[i % 5]};animation-delay:${Math.random() * 0.5}s;transform:rotate(${Math.random() * 180}deg)"></i>`).join("");
    }

    let timers = [], playing = false;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    function reset() {
      timers.forEach(clearTimeout); timers = [];
      chatL.innerHTML = chatR.innerHTML = confetti.innerHTML = bmField.textContent = "";
      [pBrowser, pSpend, actor, pill, tc].forEach((e) => e.classList.remove("on"));
      tc.classList.remove("low"); smBtn.classList.remove("pressed"); stage.classList.remove("finale");
      face("sprout.webp"); place("mid");
    }
    function run() {
      reset();
      tcText.innerHTML = "A camp sign-up, <em>start to finish</em>";
      at(200, () => tc.classList.add("on"));
      at(1700, () => { tc.classList.remove("on"); actor.classList.add("on", "idle"); });
      at(2500, () => say(chatL, "me", "Can you sign Presley up for Camp Pinecrest week 2?"));
      at(3300, () => { face("sprout-listening.webp"); status("Listening…"); place("L", true); });
      at(4700, () => { face("sprout.webp"); status("Asking Matt…"); place("R", true); });
      at(5700, () => say(chatR, "ai", "<b>@Matt</b> 3 PM pickup again, like last summer?"));
      at(7000, () => say(chatR, "me", "Yep, put me down 👍"));
      at(7900, () => { status("Filling the camp form…"); place("work", true); });
      at(8700, () => pBrowser.classList.add("on"));
      "Youth M".split("").forEach((c, i) => at(9300 + i * 130, () => (bmField.textContent += c)));
      at(11000, () => { pBrowser.classList.remove("on"); status("Waiting for Lydia…"); place("L", true); face("sprout-listening.webp"); });
      at(11700, () => pSpend.classList.add("on"));
      at(13300, () => smBtn.classList.add("pressed"));
      at(13650, () => {
        pSpend.classList.remove("on");
        const chip = '<i class="ph-fill ph-check-circle"></i>Approved by Lydia';
        say(chatL, "chip", chip); say(chatR, "chip", chip);
        face("sprout-happy-lg.webp"); status("Presley's in!"); place("mid", true); burst();
      });
      at(16200, () => { status(""); place("low"); stage.classList.add("finale"); confetti.innerHTML = ""; tcText.innerHTML = "One Sprout for <em>both of you</em>"; tc.classList.add("low", "on"); });
      at(20500, () => { [actor, tc].forEach((e) => e.classList.remove("on")); });
      at(21400, run);
    }
    function still() {
      reset();
      say(chatL, "me", "Can you sign Presley up for Camp Pinecrest week 2?");
      say(chatR, "ai", "<b>@Matt</b> 3 PM pickup again, like last summer?");
      say(chatR, "me", "Yep, put me down 👍");
      const chip = '<i class="ph-fill ph-check-circle"></i>Approved by Lydia';
      say(chatL, "chip", chip); say(chatR, "chip", chip);
      face("sprout-happy-lg.webp"); place("low"); actor.classList.add("on"); stage.classList.add("finale");
      tcText.innerHTML = "One Sprout for <em>both of you</em>"; tc.classList.add("low", "on");
    }
    function setPlaying(on) {
      playing = on;
      ctl.innerHTML = on ? '<i class="ph-fill ph-pause"></i>' : '<i class="ph-fill ph-play"></i>';
      ctl.setAttribute("aria-label", on ? "Pause the story" : "Play the story");
      if (on) run(); else { timers.forEach(clearTimeout); timers = []; }
    }
    ctl.addEventListener("click", () => setPlaying(!playing));
    if (reduced) { still(); ctl.hidden = true; }
    else {
      reset();
      let userPaused = false;
      ctl.addEventListener("click", () => (userPaused = !playing));
      new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting && !playing && !userPaused) setPlaying(true);
        if (!e.isIntersecting && playing) setPlaying(false);
      }), { threshold: 0.35 }).observe(film);
    }
    // the actor blinks too, whenever it wears the plain face
    blinkLoop(aImg);
  }


  /* 7-9 · the sky hero, the live mascot and the portal: hero-portal.js */

  /* 4 · waitlist (prototype) */
  document.querySelectorAll("[data-join]").forEach((form) => {
    const input = form.querySelector("input");
    const msg = form.querySelector(".join-msg");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      input.setAttribute("aria-invalid", ok ? "false" : "true");
      msg.classList.toggle("err", !ok);
      msg.textContent = ok ? "You're on the list. We'll email you when your family can try it." : "That email doesn't look right.";
      if (ok) input.value = "";
    });
  });
})();
