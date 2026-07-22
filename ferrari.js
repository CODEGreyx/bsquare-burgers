/* ══════════════════════════════════════════════════════════════
   FERRARI F8 · NOTTE
   Scroll-scrubbed cinematic film · GSAP ScrollTrigger + Lenis
════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const doc = document;
  const body = doc.body;
  const $ = (s, c) => (c || doc).querySelector(s);
  const $$ = (s, c) => Array.from((c || doc).querySelectorAll(s));

  const hasGSAP = window.gsap && window.ScrollTrigger;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const isSmall = window.matchMedia("(max-width: 760px)").matches;

  const VIDEO_SRC = "/public/ferrari.mp4";
  const video = $("#filmVideo");
  const poster = $("#filmPoster");
  const loader = $("#loader");
  const loaderBar = $("#loaderBar");
  const loaderPct = $("#loaderPct");

  body.classList.add("is-loading");

  /* ─────────────────────────────────────────────
     TEXT SPLITTING (lines via <br>, words, chars)
  ───────────────────────────────────────────── */
  function splitEl(el) {
    const mode = el.dataset.split;
    if (!mode || el.dataset.done) return [];
    el.dataset.done = "1";
    const inners = [];

    if (mode === "lines") {
      const htmlLines = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = "";
      htmlLines.forEach((ln) => {
        const mask = doc.createElement("span");
        mask.className = "line-mask";
        const inner = doc.createElement("span");
        inner.className = "line-inner";
        inner.innerHTML = ln.trim();
        mask.appendChild(inner);
        el.appendChild(mask);
        inners.push(inner);
      });
      return inners;
    }

    // words / chars — operate on plain text
    const text = el.textContent;
    el.textContent = "";
    const units =
      mode === "chars" ? text.split("") : text.split(/(\s+)/);
    units.forEach((u) => {
      if (u === "") return;
      if (/^\s+$/.test(u)) {
        el.appendChild(doc.createTextNode(u));
        return;
      }
      const maskCls = mode === "chars" ? "char-mask" : "word-mask";
      const innerCls = mode === "chars" ? "char-inner" : "word-inner";
      const mask = doc.createElement("span");
      mask.className = maskCls;
      const inner = doc.createElement("span");
      inner.className = innerCls;
      inner.textContent = u;
      mask.appendChild(inner);
      el.appendChild(mask);
      inners.push(inner);
      if (mode === "words") el.appendChild(doc.createTextNode(" "));
    });
    return inners;
  }

  /* ─────────────────────────────────────────────
     PRELOAD VIDEO (fetch → blob → objectURL)
     Guarantees the whole clip is buffered so scrub
     never hits the network → no lag / black frames.
  ───────────────────────────────────────────── */
  function setLoaderProgress(p) {
    p = Math.max(0, Math.min(1, p));
    if (loaderBar) loaderBar.style.right = (100 - p * 100) + "%";
    if (loaderPct) loaderPct.textContent = String(Math.round(p * 100));
  }

  function revealSite() {
    if (loader) loader.classList.add("done");
    body.classList.remove("is-loading");
    if (window.ScrollTrigger) setTimeout(() => window.ScrollTrigger.refresh(), 300);
  }

  function attachVideo(src) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => { if (!settled) { settled = true; resolve(); } };
      video.addEventListener("loadeddata", () => {
        try { video.currentTime = 0.001; } catch (e) {}
      }, { once: true });
      video.addEventListener("canplaythrough", done, { once: true });
      video.addEventListener("error", done, { once: true });
      // safety timeout — never block the experience
      setTimeout(done, 6000);
      video.src = src;
      video.load();
    });
  }

  async function preload() {
    let objectURL = null;
    try {
      const res = await fetch(VIDEO_SRC);
      if (!res.ok || !res.body) throw new Error("no-stream");
      const total = Number(res.headers.get("Content-Length")) || 0;
      const reader = res.body.getReader();
      const chunks = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setLoaderProgress(received / total);
        else setLoaderProgress(Math.min(0.9, received / 3_000_000));
      }
      const blob = new Blob(chunks, { type: "video/mp4" });
      objectURL = URL.createObjectURL(blob);
      setLoaderProgress(1);
    } catch (e) {
      objectURL = VIDEO_SRC; // fallback to direct streaming
      setLoaderProgress(1);
    }
    await attachVideo(objectURL);
    if (video.readyState >= 2) {
      poster.style.opacity = "0";
      video.classList.add("ready");
    }
  }

  /* ─────────────────────────────────────────────
     REDUCED-MOTION / NO-GSAP FALLBACK
  ───────────────────────────────────────────── */
  function fallbackMode() {
    // split for styling consistency, then just show
    $$("[data-split]").forEach((el) => {
      splitEl(el).forEach((i) => (i.style.transform = "none"));
    });
    $$(".reveal-up, .reveal-lines").forEach((el) => el.classList.add("is-in"));
    $$(".spec-line").forEach((r) => r.classList.add("is-drawn"));
    $$(".spec-hud-fill, .craft-rule, .beat-rule").forEach((el) => (el.style.transform = "none"));
    // static telemetry values when the film can't scrub
    const teleVals = { "#teleNum1": "720", "#teleNum2": "2.9", "#teleNum3": "340" };
    Object.keys(teleVals).forEach((k) => { const el = $(k); if (el) el.textContent = teleVals[k]; });
    // let the film play softly on loop
    video.loop = true;
    video.muted = true;
    const tryPlay = () => video.play().catch(() => {});
    video.addEventListener("canplay", tryPlay, { once: true });
    tryPlay();
    // run counters immediately
    runCounters($$("[data-count]"));
  }

  /* ─────────────────────────────────────────────
     NUMBER COUNTERS
  ───────────────────────────────────────────── */
  function runCounters(els) {
    els.forEach((el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || "0", 10);
      const suffix = el.dataset.suffix || "";
      if (!hasGSAP) { el.textContent = target.toFixed(dec) + suffix; return; }
      const o = { v: 0 };
      window.gsap.to(o, {
        v: target, duration: 1.8, ease: "power2.out",
        onUpdate: () => { el.textContent = o.v.toFixed(dec) + suffix; },
      });
    });
  }

  /* ─────────────────────────────────────────────
     MAIN
  ───────────────────────────────────────────── */
  function init() {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    /* Lenis smooth scroll (skip on touch for native feel + perf) */
    let lenis = null;
    if (window.Lenis && !isTouch) {
      lenis = new window.Lenis({
        lerp: 0.09,
        wheelMultiplier: 1,
        smoothWheel: true,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    const scrollTo = (target) => {
      const el = typeof target === "string" ? $(target) : target;
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
      else el.scrollIntoView({ behavior: "smooth" });
    };
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length > 1 && $(id)) { e.preventDefault(); scrollTo(id); }
      });
    });

    /* ── Pre-split all beat text ── */
    $$(".beat [data-split]").forEach(splitEl);

    /* ═══════════════ THE FILM ═══════════════ */
    const filmStage = "#filmStage";
    const bloom = $("#filmBloom");
    const media = $("#filmMedia");
    const progressBar = $("#filmProgress");
    const hudTc = $("#hudTc");
    const hudFocal = $("#hudFocal");
    const chapterNum = $("#chapterNum");
    const chapterName = $("#chapterName");
    const CHAPTERS = ["ARRIVAL", "COCKPIT", "SILHOUETTE", "TELEMETRY", "NOTTE"];
    const scrollCue = $("#scrollCue");
    const filmDuration = 10; // stable fallback; replaced by real metadata

    // beat helper: build in/out on a scrubbed timeline
    const tl = gsap.timeline();
    // reserve full 10-unit length so beat times map 1:1 onto scroll progress
    tl.to({ _t: 0 }, { _t: 1, duration: 10, ease: "none" }, 0);

    function addBeat(sel, tIn, tOut) {
      const el = $(sel);
      if (!el) return;
      const inners = $$(".line-inner, .word-inner, .char-inner", el);
      const extras = $$(".tele-item, .beat-index li", el);  // non-split content
      const rule = $(".beat-rule", el);
      const ruleProp = (el.classList.contains("beat--center") || el.classList.contains("beat--final"))
        ? "scaleY" : "scaleX";
      const btn = $(".beat-btn", el);

      // initial hidden state — container gated with autoAlpha so ONLY the
      // active beat is ever on screen (no overlap of non-masked content).
      gsap.set(el, { autoAlpha: 0, filter: "blur(6px)" });
      gsap.set(inners, { yPercent: 115 });
      gsap.set(extras, { autoAlpha: 0, y: 26 });
      if (rule) gsap.set(rule, { [ruleProp]: 0 });
      if (btn) gsap.set(btn, { autoAlpha: 0, y: 20 });

      // IN — snap visibility on, then let masks carry the motion
      tl.to(el, { autoAlpha: 1, duration: 0.12 }, tIn);
      tl.to(el, { filter: "blur(0px)", duration: 0.7, ease: "power2.out" }, tIn);
      if (rule) tl.to(rule, { [ruleProp]: 1, duration: 0.7, ease: "power3.out" }, tIn + 0.05);
      tl.to(inners, {
        yPercent: 0, duration: 0.9, ease: "power3.out",
        stagger: { each: 0.045, from: "start" },
      }, tIn + 0.02);
      if (extras.length)
        tl.to(extras, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.08 }, tIn + 0.1);
      if (btn) tl.to(btn, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, tIn + 0.4);

      // OUT — masks slide away, then snap visibility off (last beat has no out)
      if (tOut != null) {
        tl.to(inners, {
          yPercent: -115, duration: 0.8, ease: "power3.in",
          stagger: { each: 0.03, from: "start" },
        }, tOut);
        if (extras.length)
          tl.to(extras, { autoAlpha: 0, y: -26, duration: 0.6, ease: "power2.in", stagger: 0.05 }, tOut);
        if (btn) tl.to(btn, { autoAlpha: 0, y: -20, duration: 0.5 }, tOut);
        tl.to(el, { filter: "blur(6px)", duration: 0.6, ease: "power2.in" }, tOut + 0.1);
        tl.to(el, { autoAlpha: 0, duration: 0.12 }, tOut + 0.8);
      }
    }

    // Beat windows over the 10-unit timeline (1 unit ≈ 10% scroll).
    addBeat('[data-beat="1"]', 0.15, 1.7);
    addBeat('[data-beat="2"]', 2.2,  3.7);
    addBeat('[data-beat="3"]', 4.15, 5.65);
    addBeat('[data-beat="4"]', 6.15, 7.7);
    addBeat('[data-beat="5"]', 8.3,  null);

    // telemetry lives in beat 4 — the drive; gauges fill with the scrub
    const gaugeFills = $$('[data-beat="4"] .spec-hud-fill');
    if (gaugeFills.length) {
      tl.to(gaugeFills, {
        scaleX: (i, el) => parseFloat(el.dataset.fill) || 0.8,
        duration: 1.0, ease: "power2.out", stagger: 0.12,
      }, 6.5);
      tl.to(gaugeFills, { scaleX: 0, duration: 0.5, ease: "power2.in" }, 7.7);
    }

    // telemetry counters count WITH the scrub — reverse scroll counts down
    [["#teleNum1", 720, 0], ["#teleNum2", 2.9, 1], ["#teleNum3", 340, 0]]
      .forEach(([sel, target, dec], i) => {
        const numEl = $(sel);
        if (!numEl) return;
        const o = { v: 0 };
        const write = () => { numEl.textContent = o.v.toFixed(dec); };
        tl.to(o, { v: target, duration: 1.15, ease: "power2.out", onUpdate: write }, 6.45 + i * 0.12);
        tl.to(o, { v: 0, duration: 0.45, ease: "power2.in", onUpdate: write }, 7.72);
      });

    // focus reticle locks onto the car during the drive
    const reticle = $(".tele-reticle");
    if (reticle) {
      gsap.set(reticle, { autoAlpha: 0, scale: 1.1 });
      tl.to(reticle, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 6.4);
      tl.to(reticle, { autoAlpha: 0, scale: 1.06, duration: 0.45, ease: "power2.in" }, 7.66);
    }

    // cinema letterbox closes in as the film begins
    gsap.set(".film-bars .bar", { scaleY: 0 });
    tl.to(".film-bars .bar", { scaleY: 1, duration: 0.9, ease: "power3.out" }, 0.05);

    // camera choreography — the footage settles, then pushes in per beat
    gsap.set("#filmMedia", { scale: 1.09, transformOrigin: "50% 55%" });
    tl.to("#filmMedia", { scale: 1.0, duration: 1.7, ease: "power2.out" }, 0);
    tl.to("#filmMedia", { scale: 1.05, duration: 1.3, ease: "power1.inOut" }, 2.3);
    tl.to("#filmMedia", { scale: 1.0, duration: 1.2, ease: "power1.inOut" }, 3.8);
    tl.to("#filmMedia", { scale: 1.06, duration: 1.4, ease: "power1.inOut" }, 6.2);
    tl.to("#filmMedia", { scale: 1.0, duration: 1.4, ease: "power1.inOut" }, 7.85);

    // anamorphic light sweeps between beats
    [1.82, 3.92, 5.85, 7.92].forEach((t) => {
      tl.fromTo("#filmSweep", { xPercent: -55, opacity: 0 },
        { xPercent: 55, opacity: 1, duration: 0.55, ease: "power2.inOut" }, t);
      tl.to("#filmSweep", { opacity: 0, duration: 0.18 }, t + 0.42);
    });

    // directional scrims grade the frame behind each text zone
    const scrim = (side, a, z) => {
      tl.to(".film-scrim--" + side, { opacity: 1, duration: 0.5 }, a);
      tl.to(".film-scrim--" + side, { opacity: 0, duration: 0.45 }, z);
    };
    scrim("r", 2.3, 3.72);   // cockpit copy (right)
    scrim("l", 4.2, 5.68);   // silhouette (left)
    scrim("b", 6.2, 7.72);   // telemetry (bottom, the drive)

    // depth drift — text layers track the scrub at different rates while
    // a beat holds, so the frame never feels frozen
    [["1", 0.15, 1.7], ["2", 2.2, 3.7], ["3", 4.15, 5.65], ["4", 6.15, 7.7], ["5", 8.3, 10]]
      .forEach(([b, a, z]) => {
        const beat = $(`[data-beat="${b}"]`);
        if (!beat) return;
        const t = $(".beat-title", beat) || $(".tele", beat);
        const n = $(".beat-note", beat);
        const d = z - a;
        if (t) tl.fromTo(t, { y: 18 }, { y: -18, duration: d, ease: "none" }, a);
        if (n) tl.fromTo(n, { y: 10 }, { y: -10, duration: d, ease: "none" }, a);
      });

    // Scrub state for video time
    let targetTime = 0;
    let curTime = 0;
    let mblur = 0;

    const filmScrub = isSmall ? 1.1 : 0.7;

    ScrollTrigger.create({
      trigger: "#film",
      start: "top top",
      end: "bottom bottom",
      pin: filmStage,
      pinSpacing: true,
      scrub: filmScrub,
      animation: tl,
      onUpdate: (self) => {
        const dur = video.duration || filmDuration;
        targetTime = self.progress * (dur - 0.05);
        if (progressBar) progressBar.style.right = (100 - self.progress * 100) + "%";
        if (hudTc) hudTc.textContent = fmtTime(self.progress * 10);
        // live camera telemetry: lens creeps 24→70mm, chapter tracks the beat
        if (hudFocal) hudFocal.textContent = String(Math.round(24 + self.progress * 46));
        const sc = Math.min(5, Math.floor(self.progress * 5) + 1);
        if (chapterNum) chapterNum.textContent = "0" + sc;
        if (chapterName) chapterName.textContent = CHAPTERS[sc - 1];
        // velocity → motion blur + red bloom (premium, capped)
        const v = Math.abs(self.getVelocity());
        const norm = Math.min(1, v / 3500);
        mblur = norm * (isSmall ? 3 : 6);
        if (bloom) bloom.style.opacity = String(0.10 + norm * 0.4);
        // scroll cue fade
        if (scrollCue && self.progress > 0.02) scrollCue.classList.add("gone");
        else if (scrollCue) scrollCue.classList.remove("gone");
      },
    });

    // Single rAF loop (via gsap ticker) eases video.currentTime → target
    let blurDecay = 0;
    gsap.ticker.add(() => {
      if (video.readyState >= 2) {
        curTime += (targetTime - curTime) * 0.18;
        if (Math.abs(targetTime - curTime) > 0.002) {
          try { video.currentTime = curTime; } catch (e) {}
        }
      }
      // decay motion blur smoothly
      blurDecay += (mblur - blurDecay) * 0.25;
      mblur *= 0.9;
      media.style.setProperty("--mblur", blurDecay.toFixed(2) + "px");
    });

    function fmtTime(sec) {
      const s = Math.max(0, Math.min(10, sec));
      return "00:" + String(Math.floor(s)).padStart(2, "0");
    }

    /* ═══════════════ POST-FILM REVEALS ═══════════════ */
    // line reveals
    $$(".reveal-lines").forEach((el) => {
      const inners = splitEl(el);
      gsap.set(inners, { yPercent: 115 });
      gsap.to(inners, {
        yPercent: 0, duration: 1, ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 82%" },
      });
    });
    // up reveals
    $$(".reveal-up").forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onStart: () => el.classList.add("is-in"),
      });
    });

    /* counters when their section enters */
    ["#specification", "#performance"].forEach((sec) => {
      const section = $(sec);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section, start: "top 70%", once: true,
        onEnter: () => runCounters($$("[data-count]", section)),
      });
    });

    /* craft image parallax */
    const craftImg = $(".craft-media img");
    if (craftImg) {
      gsap.fromTo(craftImg, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: ".craft", start: "top bottom", end: "bottom top", scrub: true },
      });
    }
    /* configure bg parallax */
    const confImg = $(".configure-bg img");
    if (confImg) {
      gsap.fromTo(confImg, { yPercent: -6, scale: 1.05 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".configure", start: "top bottom", end: "bottom top", scrub: true },
      });
    }

    /* ── micro-interaction layer ── */

    // spec rows rise in; hairline draws underneath each
    $$(".spec-line").forEach((row) => {
      gsap.from(row, {
        opacity: 0, y: 26, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 90%" },
        onStart: () => row.classList.add("is-drawn"),
      });
    });

    // ghost numerals drift against the scroll
    [[".spec-ghost", ".spec"], [".perf-ghost", ".performance"]].forEach(([g, s]) => {
      const el = $(g);
      if (!el) return;
      gsap.fromTo(el, { yPercent: 14 }, {
        yPercent: -14, ease: "none",
        scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // craft image reveals with a cinematic wipe
    const craftMedia = $(".craft-media");
    if (craftMedia) {
      gsap.fromTo(craftMedia,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "power4.inOut",
          scrollTrigger: { trigger: ".craft", start: "top 72%" } });
    }

    // rosso rule draws; craft tags cascade in
    const craftRule = $(".craft-rule");
    if (craftRule) {
      gsap.to(craftRule, {
        scaleX: 1, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".craft-copy", start: "top 75%" },
      });
    }
    const craftTags = $$(".craft-tags span");
    if (craftTags.length) {
      gsap.from(craftTags, {
        opacity: 0, y: 16, duration: 0.6, ease: "power2.out", stagger: 0.07,
        scrollTrigger: { trigger: ".craft-tags", start: "top 90%" },
      });
    }

    // performance figures settle out of a motion blur
    $$(".perf-cell .perf-num").forEach((num, i) => {
      gsap.from(num, {
        opacity: 0, y: 30, filter: "blur(12px)", duration: 0.9, delay: i * 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".perf-grid", start: "top 82%" },
      });
    });

    // magnetic pull on CTAs (pointer devices only)
    if (!isTouch) {
      $$(".btn, .beat-btn, .nav-cta").forEach((el) => {
        el.addEventListener("mousemove", (e) => {
          const r = el.getBoundingClientRect();
          gsap.to(el, {
            x: (e.clientX - r.left - r.width / 2) * 0.16,
            y: (e.clientY - r.top - r.height / 2) * 0.24,
            duration: 0.4, ease: "power2.out",
          });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
        });
      });
    }

    /* nav stays put — it is the site header, always present */

    ScrollTrigger.refresh();
  }

  /* ─────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────── */
  preload().finally(() => {
    if (!hasGSAP || reduceMotion) {
      fallbackMode();
      revealSite();
      return;
    }
    try {
      init();
    } catch (err) {
      console.error("film init failed", err);
      fallbackMode();
    }
    revealSite();
  });

  // never let a slow network trap the user on the loader
  setTimeout(() => { if (body.classList.contains("is-loading")) revealSite(); }, 9000);
})();
