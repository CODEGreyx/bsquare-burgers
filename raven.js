/* ══════════════════════════════════════════════════════════════
   RAVEN R9 · NOTTURNO
   Dual-reel scroll-scrubbed film · GSAP ScrollTrigger + Lenis
   Reel A (arrival, 0 → 0.5 scroll) hard-cuts into Reel B (launch,
   0.5 → 1.0 scroll) — one continuous pinned scrub across two clips.
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

  const SRC_A = "/public/raven-arrival.mp4";
  const SRC_B = "/public/raven-launch.mp4";
  const TRIM_B = 94 / 24; // reel B opens on hands settling onto the bars, not the fist-pump
  const videoA = $("#filmVideoA");
  const videoB = $("#filmVideoB");
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
     PRELOAD BOTH REELS (fetch → blob → objectURL)
     Guarantees both clips are fully buffered so the
     scrub — and the hard cut between them — never
     hits the network. No lag, no black frames.
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

  function attachVideo(video, src, seedTime) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => { if (!settled) { settled = true; resolve(); } };
      video.addEventListener("loadeddata", () => {
        try { video.currentTime = seedTime || 0.001; } catch (e) {}
      }, { once: true });
      video.addEventListener("canplaythrough", done, { once: true });
      video.addEventListener("error", done, { once: true });
      setTimeout(done, 7000); // safety timeout — never block the experience
      video.src = src;
      video.load();
    });
  }

  function fetchBlob(src, onBytes) {
    return fetch(src)
      .then((res) => {
        if (!res.ok || !res.body) throw new Error("no-stream");
        const total = Number(res.headers.get("Content-Length")) || 0;
        const reader = res.body.getReader();
        const chunks = [];
        let received = 0;
        const pump = () =>
          reader.read().then(({ done, value }) => {
            if (done) return new Blob(chunks, { type: "video/mp4" });
            chunks.push(value);
            received += value.length;
            onBytes(received, total);
            return pump();
          });
        return pump();
      })
      .then((blob) => URL.createObjectURL(blob))
      .catch(() => src); // fallback to direct streaming
  }

  async function preload() {
    const bytes = { a: 0, b: 0 };
    const totals = { a: 0, b: 0 };
    const report = () => {
      const gotTotals = totals.a > 0 && totals.b > 0;
      if (gotTotals) {
        setLoaderProgress((bytes.a + bytes.b) / (totals.a + totals.b));
      } else {
        setLoaderProgress(Math.min(0.9, (bytes.a + bytes.b) / 5_500_000));
      }
    };
    const [urlA, urlB] = await Promise.all([
      fetchBlob(SRC_A, (r, t) => { bytes.a = r; totals.a = t; report(); }),
      fetchBlob(SRC_B, (r, t) => { bytes.b = r; totals.b = t; report(); }),
    ]);
    setLoaderProgress(1);
    await Promise.all([attachVideo(videoA, urlA), attachVideo(videoB, urlB, TRIM_B)]);
    if (videoA.readyState >= 2 && videoB.readyState >= 2) {
      poster.style.opacity = "0";
      videoA.classList.add("active"); // reel A opens the film
    }
  }

  /* ─────────────────────────────────────────────
     REDUCED-MOTION / NO-GSAP FALLBACK
     Plays reel A once, hard-cuts to reel B, holds.
  ───────────────────────────────────────────── */
  function fallbackMode() {
    $$("[data-split]").forEach((el) => {
      splitEl(el).forEach((i) => (i.style.transform = "none"));
    });
    $$(".reveal-up, .reveal-lines").forEach((el) => el.classList.add("is-in"));
    $$(".spec-line").forEach((r) => r.classList.add("is-drawn"));
    $$(".spec-hud-fill, .craft-rule, .beat-rule").forEach((el) => (el.style.transform = "none"));
    const teleVals = { "#teleNum1": "220", "#teleNum2": "2.6", "#teleNum3": "310" };
    Object.keys(teleVals).forEach((k) => { const el = $(k); if (el) el.textContent = teleVals[k]; });

    videoA.muted = true;
    videoB.muted = true;
    videoA.classList.add("active");
    const playA = () => videoA.play().catch(() => {});
    videoA.addEventListener("canplay", playA, { once: true });
    videoA.addEventListener("ended", () => {
      videoA.classList.remove("active");
      videoB.classList.add("active");
      videoB.currentTime = TRIM_B;
      videoB.play().catch(() => {});
    });
    videoB.addEventListener("ended", () => {
      videoB.classList.remove("active");
      videoA.classList.add("active");
      videoA.currentTime = 0;
      playA();
    });
    playA();

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
    const cutflash = $("#filmCutflash");
    const progressBar = $("#filmProgress");
    const hudFocal = $("#hudFocal");
    const chapterNum = $("#chapterNum");
    const chapterName = $("#chapterName");
    const CHAPTERS = ["ARRIVAL", "IGNITION", "SILHOUETTE", "TELEMETRY", "DEPARTURE"];
    const scrollCue = $("#scrollCue");
    const CUT = 5.0; // timeline unit where reel A hard-cuts to reel B (of 10 total)

    // beat helper: build in/out on a scrubbed timeline
    const tl = gsap.timeline();
    tl.to({ _t: 0 }, { _t: 1, duration: 10, ease: "none" }, 0);

    function addBeat(sel, tIn, tOut) {
      const el = $(sel);
      if (!el) return;
      const inners = $$(".line-inner, .word-inner, .char-inner", el);
      const extras = $$(".tele-item, .beat-index li", el);
      const rule = $(".beat-rule", el);
      const ruleProp = (el.classList.contains("beat--center") || el.classList.contains("beat--final"))
        ? "scaleY" : "scaleX";
      const btn = $(".beat-btn", el);

      gsap.set(el, { autoAlpha: 0, filter: "blur(6px)" });
      gsap.set(inners, { yPercent: 115 });
      gsap.set(extras, { autoAlpha: 0, y: 26 });
      if (rule) gsap.set(rule, { [ruleProp]: 0 });
      if (btn) gsap.set(btn, { autoAlpha: 0, y: 20 });

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

    // ── Reel A (arrival, timeline 0 → 5) ──
    addBeat('[data-beat="1"]', 0.15, 1.9);
    addBeat('[data-beat="2"]', 2.6,  4.35);
    // ── Reel B (launch, timeline 5 → 10) ──
    addBeat('[data-beat="3"]', 5.15, 6.9);
    addBeat('[data-beat="4"]', 7.3,  9.3);
    addBeat('[data-beat="5"]', 9.5,  null);

    // telemetry fills as she launches away (reel B, back half)
    const gaugeFills = $$('[data-beat="4"] .spec-hud-fill');
    if (gaugeFills.length) {
      tl.to(gaugeFills, {
        scaleX: (i, el) => parseFloat(el.dataset.fill) || 0.8,
        duration: 0.6, ease: "power2.out", stagger: 0.1,
      }, 7.4);
    }

    // telemetry counters count WITH the scrub — reverse scroll counts down
    [["#teleNum1", 220, 0], ["#teleNum2", 2.6, 1], ["#teleNum3", 310, 0]]
      .forEach(([sel, target, dec], i) => {
        const numEl = $(sel);
        if (!numEl) return;
        const o = { v: 0 };
        const write = () => { numEl.textContent = o.v.toFixed(dec); };
        tl.to(o, { v: target, duration: 0.85, ease: "power2.out", onUpdate: write }, 7.35 + i * 0.1);
      });

    // focus reticle locks onto the bike during the launch
    const reticle = $(".tele-reticle");
    if (reticle) {
      gsap.set(reticle, { autoAlpha: 0, scale: 1.1 });
      tl.to(reticle, { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power3.out" }, 7.3);
      tl.to(reticle, { autoAlpha: 0, scale: 1.06, duration: 0.45, ease: "power2.in" }, 9.25);
    }

    // cinema letterbox closes in as the film begins
    gsap.set(".film-bars .bar", { scaleY: 0 });
    tl.to(".film-bars .bar", { scaleY: 1, duration: 0.9, ease: "power3.out" }, 0.05);

    // camera choreography — each reel settles, then pushes per beat
    gsap.set("#filmMedia", { scale: 1.09, transformOrigin: "50% 55%" });
    tl.to("#filmMedia", { scale: 1.0, duration: 1.7, ease: "power2.out" }, 0);      // reel A settle
    tl.to("#filmMedia", { scale: 1.05, duration: 1.3, ease: "power1.inOut" }, 2.6); // ignition push
    tl.to("#filmMedia", { scale: 1.1,  duration: 0.01 }, CUT);                     // snap reset on cut
    tl.to("#filmMedia", { scale: 1.0,  duration: 1.4, ease: "power2.out" }, CUT + 0.05); // reel B settle
    tl.to("#filmMedia", { scale: 1.06, duration: 1.1, ease: "power1.inOut" }, 7.3); // launch push
    tl.to("#filmMedia", { scale: 1.0,  duration: 1.3, ease: "power1.inOut" }, 9.3);

    // hard cut: light sweep + white flash at the reel change
    tl.fromTo("#filmSweep", { xPercent: -55, opacity: 0 },
      { xPercent: 55, opacity: 1, duration: 0.4, ease: "power2.inOut" }, CUT - 0.15);
    tl.to("#filmSweep", { opacity: 0, duration: 0.15 }, CUT + 0.22);
    tl.fromTo(cutflash, { opacity: 0 }, { opacity: 0.85, duration: 0.05, ease: "none" }, CUT - 0.02);
    tl.to(cutflash, { opacity: 0, duration: 0.22, ease: "power2.out" }, CUT + 0.02);

    // additional anamorphic sweeps between beats within each reel
    [1.98, 4.42, 7.0, 9.42].forEach((t) => {
      tl.fromTo("#filmSweep", { xPercent: -55, opacity: 0 },
        { xPercent: 55, opacity: 1, duration: 0.5, ease: "power2.inOut" }, t);
      tl.to("#filmSweep", { opacity: 0, duration: 0.16 }, t + 0.38);
    });

    // directional scrims grade the frame behind each text zone
    const scrim = (side, a, z) => {
      tl.to(".film-scrim--" + side, { opacity: 1, duration: 0.5 }, a);
      tl.to(".film-scrim--" + side, { opacity: 0, duration: 0.45 }, z);
    };
    scrim("r", 2.75, 4.4);   // ignition copy (right)
    scrim("l", 5.3,  6.85);  // silhouette (left)
    scrim("r", 7.45, 9.35);  // telemetry (right, the launch)

    // depth drift — text layers track the scrub at different rates while
    // a beat holds, so the frame never feels frozen
    [["1", 0.15, 1.9], ["2", 2.6, 4.35], ["3", 5.15, 6.9], ["4", 7.3, 9.3], ["5", 9.5, 10]]
      .forEach(([b, a, z]) => {
        const beat = $(`[data-beat="${b}"]`);
        if (!beat) return;
        const t = $(".beat-title", beat) || $(".tele", beat);
        const n = $(".beat-note", beat);
        const d = z - a;
        if (t) tl.fromTo(t, { y: 18 }, { y: -18, duration: d, ease: "none" }, a);
        if (n) tl.fromTo(n, { y: 10 }, { y: -10, duration: d, ease: "none" }, a);
      });

    // ── Dual-reel scrub state ──
    let curTimeA = 0, curTimeB = TRIM_B;
    let targetA = 0, targetB = 0;
    let activeIsA = true;
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
        const p = self.progress;
        const wasA = activeIsA;
        activeIsA = p < 0.5;

        if (activeIsA) {
          const local = Math.min(1, p / 0.5);
          const dur = videoA.duration || 8;
          targetA = local * (dur - 0.03);
        } else {
          const local = Math.min(1, (p - 0.5) / 0.5);
          const dur = videoB.duration || 8;
          targetB = TRIM_B + local * (dur - 0.03 - TRIM_B);
        }

        // hard cut crossing — swap visible reel, snap the incoming
        // reel's time immediately so it never visibly seeks
        if (activeIsA !== wasA) {
          if (activeIsA) {
            curTimeA = targetA;
            try { videoA.currentTime = curTimeA; } catch (e) {}
            videoA.classList.add("active");
            videoB.classList.remove("active");
          } else {
            curTimeB = targetB;
            try { videoB.currentTime = curTimeB; } catch (e) {}
            videoB.classList.add("active");
            videoA.classList.remove("active");
          }
        }

        if (progressBar) progressBar.style.right = (100 - p * 100) + "%";
        if (hudFocal) hudFocal.textContent = String(Math.round(24 + p * 46));
        const sc = Math.min(5, Math.floor(p * 5) + 1);
        if (chapterNum) chapterNum.textContent = "0" + sc;
        if (chapterName) chapterName.textContent = CHAPTERS[sc - 1];

        const v = Math.abs(self.getVelocity());
        const norm = Math.min(1, v / 3500);
        mblur = norm * (isSmall ? 3 : 6);
        if (bloom) bloom.style.opacity = String(0.10 + norm * 0.4);

        if (scrollCue && p > 0.02) scrollCue.classList.add("gone");
        else if (scrollCue) scrollCue.classList.remove("gone");
      },
    });

    // Single rAF loop (via gsap ticker) eases each active video's
    // currentTime → target; the inactive reel is left alone (invisible).
    let blurDecay = 0;
    gsap.ticker.add(() => {
      if (activeIsA && videoA.readyState >= 2) {
        curTimeA += (targetA - curTimeA) * 0.18;
        if (Math.abs(targetA - curTimeA) > 0.002) {
          try { videoA.currentTime = curTimeA; } catch (e) {}
        }
      } else if (!activeIsA && videoB.readyState >= 2) {
        curTimeB += (targetB - curTimeB) * 0.18;
        if (Math.abs(targetB - curTimeB) > 0.002) {
          try { videoB.currentTime = curTimeB; } catch (e) {}
        }
      }
      blurDecay += (mblur - blurDecay) * 0.25;
      mblur *= 0.9;
      media.style.setProperty("--mblur", blurDecay.toFixed(2) + "px");
    });

    /* ═══════════════ POST-FILM REVEALS ═══════════════ */
    $$(".reveal-lines").forEach((el) => {
      const inners = splitEl(el);
      gsap.set(inners, { yPercent: 115 });
      gsap.to(inners, {
        yPercent: 0, duration: 1, ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: "top 82%" },
      });
    });
    $$(".reveal-up").forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onStart: () => el.classList.add("is-in"),
      });
    });

    ["#specification", "#performance"].forEach((sec) => {
      const section = $(sec);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section, start: "top 70%", once: true,
        onEnter: () => runCounters($$("[data-count]", section)),
      });
    });

    const craftImg = $(".craft-media img");
    if (craftImg) {
      gsap.fromTo(craftImg, { yPercent: -8 }, {
        yPercent: 8, ease: "none",
        scrollTrigger: { trigger: ".craft", start: "top bottom", end: "bottom top", scrub: true },
      });
    }
    const confImg = $(".configure-bg img");
    if (confImg) {
      gsap.fromTo(confImg, { yPercent: -6, scale: 1.05 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: ".configure", start: "top bottom", end: "bottom top", scrub: true },
      });
    }

    /* ── micro-interaction layer ── */
    $$(".spec-line").forEach((row) => {
      gsap.from(row, {
        opacity: 0, y: 26, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 90%" },
        onStart: () => row.classList.add("is-drawn"),
      });
    });

    [[".spec-ghost", ".spec"], [".perf-ghost", ".performance"]].forEach(([g, s]) => {
      const el = $(g);
      if (!el) return;
      gsap.fromTo(el, { yPercent: 14 }, {
        yPercent: -14, ease: "none",
        scrollTrigger: { trigger: s, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    const craftMedia = $(".craft-media");
    if (craftMedia) {
      gsap.fromTo(craftMedia,
        { clipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "power4.inOut",
          scrollTrigger: { trigger: ".craft", start: "top 72%" } });
    }

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

    $$(".perf-cell .perf-num").forEach((num, i) => {
      gsap.from(num, {
        opacity: 0, y: 30, filter: "blur(12px)", duration: 0.9, delay: i * 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".perf-grid", start: "top 82%" },
      });
    });

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

  setTimeout(() => { if (body.classList.contains("is-loading")) revealSite(); }, 10000);
})();
