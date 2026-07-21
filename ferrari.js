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
      const extras = $$(".spec-hud-item", el);   // non-split content (beat 2 numbers)
      const btn = $(".beat-btn", el);

      // initial hidden state — container gated with autoAlpha so ONLY the
      // active beat is ever on screen (no overlap of non-masked content).
      gsap.set(el, { autoAlpha: 0, filter: "blur(6px)" });
      gsap.set(inners, { yPercent: 115 });
      gsap.set(extras, { autoAlpha: 0, y: 26 });
      if (btn) gsap.set(btn, { autoAlpha: 0, y: 20 });

      // IN — snap visibility on, then let masks carry the motion
      tl.to(el, { autoAlpha: 1, duration: 0.12 }, tIn);
      tl.to(el, { filter: "blur(0px)", duration: 0.7, ease: "power2.out" }, tIn);
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

    /* ═══════════════ NAV show / hide ═══════════════ */
    const nav = $("#nav");
    let lastY = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (y > 120 && y > lastY) nav.classList.add("hide");
        else nav.classList.remove("hide");
        lastY = y;
      },
    });

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
