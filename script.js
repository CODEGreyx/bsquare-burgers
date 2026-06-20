const burgers = [
  { name: 'Monster Burger',       price: '10.90€', img: 'assets/monster.png',      tag: 'FRIED EGG / BACON / CHEDDAR',              layers: ['Oberes Bun','Spiegelei','Rindbacon','Käse','2×120g Rindfleisch','BBQ Sauce','Senfsauce','Knoblauchsauce','Tomate','Gurken','Rote Zwiebeln','Eisbergsalat','Unteres Bun'] },
  { name: 'Beast Burger',         price: '9.90€',  img: 'assets/beast.png',        tag: 'DOUBLE PATTY / BACON / CARAMELIZED ONION', layers: ['Oberes Bun','Karamellisierte Zwiebeln','Rindbacon','Käse','2×120g Rindfleisch','BBQ Sauce','Senfsauce','Knoblauchsauce','Unteres Bun'] },
  { name: 'Chilling Burger',      price: '6.90€',  img: 'assets/pea.png',          tag: 'JALAPEÑOS / CHILLI SAUCE',                 layers: ['Oberes Bun','Jalapeños','Käse','120g Rindfleisch','Chilli Sauce und Mayo','Tomate','Gurken','Rote Zwiebeln','Eisbergsalat','Unteres Bun'] },
  { name: 'Mush Burger',          price: '7.50€',  img: 'assets/mush.png',         tag: 'MUSHROOMS / GARLIC SAUCE',                 layers: ['Oberes Bun','Pilze','Käse','120g Rindfleisch','Garlic Sauce und Mayo','Tomate','Gurken','Rote Zwiebeln','Eisbergsalat','Unteres Bun'] },
  { name: 'Crispy Bae',           price: '7.50€',  img: 'assets/crispy.png',       tag: 'CHICKEN / CARAMELIZED ONION / GARLIC & GREEN', layers: ['Oberes Bun','Karamellisierte Zwiebeln','Käse','Hähnchenpatty','Garlic Sauce und Green Sauce','Tomate','Gurken','Rote Zwiebeln','Eisbergsalat','Unteres Bun'] },
  { name: 'Pi Burger Veggie',     price: '7.50€',  img: 'assets/veggie.png',       tag: 'VEGGIE PATTY / CARAMELIZED ONION / GARLIC & GREEN', layers: ['Oberes Bun','Karamellisierte Zwiebeln','Käse','Veggie Patty (Kartoffel & Daal Chana)','Garlic Sauce und Green Sauce','Tomate','Gurken','Rote Zwiebeln','Eisbergsalat','Unteres Bun'] },
  { name: 'Cheeseburger',         price: '5.80€',  img: 'assets/cheeseburger.png', tag: 'CLASSIC BEEF / CHEESE',                    layers: ['Oberes Bun','Käse','120g Rindfleisch','Ketchup und Mayo','Tomate','Gurken','Rote Zwiebeln','Eisbergsalat','Unteres Bun'] },
];

const list  = document.getElementById('burgerList');
const cards = document.getElementById('cards');

// ── Particle burst ─────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('labParticles');
  if (!container) return;
  const count = 18;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'lab-particle';
    const angle  = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    const dist   = 80 + Math.random() * 180;
    const tx     = Math.cos(angle) * dist;
    const ty     = Math.sin(angle) * dist;
    const sz     = 4 + Math.random() * 8;
    p.style.cssText = `
      --tx: ${tx}px; --ty: ${ty}px;
      --sz: ${sz}px;
      --d: ${Math.random() * 0.12}s;
      width: ${sz}px; height: ${sz}px;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

// ── Flash ring ─────────────────────────────────────────────
function triggerFlash() {
  const flash = document.getElementById('labFlash');
  if (!flash) return;
  flash.classList.remove('flash');
  void flash.offsetWidth;
  flash.classList.add('flash');
  setTimeout(() => flash.classList.remove('flash'), 600);
}

// ── Price slide animation ───────────────────────────────────
function animatePrice(el, newVal) {
  el.style.transition = 'transform 0.18s ease-in, opacity 0.18s ease-in';
  el.style.transform  = 'translateY(-14px)';
  el.style.opacity    = '0';
  setTimeout(() => {
    el.textContent      = newVal;
    el.style.transition = 'none';
    el.style.transform  = 'translateY(14px)';
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.38s cubic-bezier(0.22,1,0.36,1), opacity 0.3s';
      el.style.transform  = '';
      el.style.opacity    = '1';
    });
  }, 190);
}

// ── Status text cycle on selection ─────────────────────────
const statusCycles = ['ANALYSE...', 'WIRD GELADEN', 'ERKANNT', 'BEREIT'];
function cycleStatus() {
  const el = document.getElementById('labStatusText');
  if (!el) return;
  let i = 0;
  el.textContent = statusCycles[0];
  const iv = setInterval(() => {
    i++;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent  = statusCycles[Math.min(i, statusCycles.length - 1)];
      el.style.opacity = '1';
    }, 100);
    if (i >= statusCycles.length - 1) clearInterval(iv);
  }, 260);
}

// ── Mouse-tilt 3D on the burger ────────────────────────────
function initTilt() {
  const wrap = document.getElementById('labBurgerWrap');
  const img  = document.getElementById('activeImg');
  if (!wrap || !img) return;

  let tiltActive = false;
  wrap.addEventListener('mouseenter', () => { tiltActive = true; });
  wrap.addEventListener('mouseleave', () => {
    tiltActive = false;
    img.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1), filter 0.4s';
    img.style.transform  = '';
  });
  wrap.addEventListener('mousemove', e => {
    if (!tiltActive) return;
    const r   = wrap.getBoundingClientRect();
    const cx  = r.left + r.width  / 2;
    const cy  = r.top  + r.height / 2;
    const rx  = ((e.clientY - cy) / (r.height / 2)) * -14;
    const ry  = ((e.clientX - cx) / (r.width  / 2)) *  14;
    img.style.transition = 'transform 0.1s linear, filter 0.4s';
    img.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06)`;
  });
}

// ── Render burger list buttons ─────────────────────────────
const isMobile = () => window.innerWidth <= 940;

function renderButtons(active = 0) {
  list.innerHTML = '';
  burgers.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.className = (!isMobile() && i === active) ? 'active' : '';
    btn.innerHTML = `<span><strong>${b.name}</strong><small>${b.tag}</small></span>`;
    btn.onclick = () => {
      if (isMobile()) {
        openSheet(i);
      } else {
        setActive(i);
      }
    };
    list.appendChild(btn);
  });
}

// ── Set active burger (desktop) ────────────────────────────
let activeIndex = 0;
function setActive(i, initial = false) {
  if (i === activeIndex && !initial) return;
  activeIndex = i;
  const b   = burgers[i];
  const img = document.getElementById('activeImg');

  document.querySelectorAll('.burger-list button').forEach((x, n) =>
    x.classList.toggle('active', n === i)
  );

  if (!initial) {
    img.classList.remove('drop-enter');
    img.classList.add('drop-exit');
    spawnParticles();
    triggerFlash();
    cycleStatus();

    setTimeout(() => {
      img.src = b.img;
      img.alt = b.name;
      img.classList.remove('drop-exit');
      void img.offsetWidth;
      img.classList.add('drop-enter');
      setTimeout(() => img.classList.remove('drop-enter'), 800);
    }, 220);
  } else {
    img.src = b.img;
    img.alt = b.name;
  }

  const delay = initial ? 0 : 280;
  setTimeout(() => {
    const nameEl = document.getElementById('activeName');
    nameEl.textContent = b.name;
    nameEl.style.animation = 'none';
    void nameEl.offsetWidth;
    nameEl.style.animation = '';
  }, delay);

  const priceEl = document.getElementById('activePrice');
  if (initial) {
    priceEl.textContent = b.price;
  } else {
    setTimeout(() => animatePrice(priceEl, b.price), delay);
  }

  setTimeout(() => {
    const tagEl = document.getElementById('activeTag');
    if (tagEl) tagEl.textContent = b.tag;
  }, delay);

  setTimeout(() => {
    const lcEl = document.getElementById('layerCount');
    if (lcEl) lcEl.textContent = `${b.layers.length} LAGEN`;
  }, delay);

  setTimeout(() => {
    const layersEl = document.getElementById('layers');
    if (!layersEl) return;
    layersEl.innerHTML = '';
    b.layers.forEach((l, n) => {
      const div = document.createElement('div');
      div.className = 'layer';
      div.style.animationDelay = `${n * 0.07}s`;
      div.innerHTML = `<b>${String(n + 1).padStart(2, '0')}</b>${l}`;
      layersEl.appendChild(div);
    });
  }, initial ? 0 : delay + 60);
}

// ── Render menu cards ──────────────────────────────────────
function renderCards() {
  cards.innerHTML = '';
  const sorted = [...burgers].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  sorted.forEach(item => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.img}" alt="${item.name}" loading="lazy" />
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.tag.toLowerCase()}</p>
        <span class="card-price">${item.price}</span>
      </div>`;
    cards.appendChild(card);
  });
}

// ── Mobile bottom sheet ────────────────────────────────────
const sheet         = document.getElementById('labSheet');
const sheetBackdrop = document.getElementById('labSheetBackdrop');
const sheetClose    = document.getElementById('labSheetClose');

function spawnSheetParticles() {
  const container = document.getElementById('sheetParticles');
  if (!container) return;
  for (let i = 0; i < 12; i++) {
    const p     = document.createElement('div');
    p.className = 'lab-particle';
    const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    const dist  = 40 + Math.random() * 90;
    const sz    = 3 + Math.random() * 6;
    p.style.cssText = `--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;--sz:${sz}px;--d:${Math.random()*0.1}s;width:${sz}px;height:${sz}px;`;
    container.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}

const sheetStatusCycles = ['ANALYSE...', 'WIRD GELADEN', 'ERKANNT', 'BEREIT'];
function cycleSheetStatus() {
  const el = document.getElementById('sheetStatusText');
  if (!el) return;
  let i = 0;
  el.textContent = sheetStatusCycles[0];
  const iv = setInterval(() => {
    i++;
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = sheetStatusCycles[Math.min(i, sheetStatusCycles.length - 1)]; el.style.opacity = '1'; }, 90);
    if (i >= sheetStatusCycles.length - 1) clearInterval(iv);
  }, 240);
}

let sheetCurrentIndex = -1;

function openSheet(i) {
  const b   = burgers[i];
  const img = document.getElementById('sheetImg');

  document.querySelectorAll('.burger-list button').forEach((x, n) =>
    x.classList.toggle('active', n === i)
  );

  const isSwap = sheet.classList.contains('open') && sheetCurrentIndex !== i;

  if (isSwap) {
    img.classList.remove('entering');
    img.classList.add('exiting');
    spawnSheetParticles();
    cycleSheetStatus();
    setTimeout(() => {
      img.src = b.img; img.alt = b.name;
      img.classList.remove('exiting');
      void img.offsetWidth;
      img.classList.add('entering');
      setTimeout(() => img.classList.remove('entering'), 700);
    }, 210);
  } else {
    img.src = b.img; img.alt = b.name;
    img.classList.remove('exiting', 'entering');
    void img.offsetWidth;
    img.classList.add('entering');
    setTimeout(() => img.classList.remove('entering'), 700);
    cycleSheetStatus();
    if (sheetCurrentIndex !== -1) spawnSheetParticles();
  }

  sheetCurrentIndex = i;

  const delay = isSwap ? 220 : 0;
  setTimeout(() => {
    document.getElementById('sheetName').textContent = b.name;
    const priceEl = document.getElementById('sheetPrice');
    if (isSwap) { animatePrice(priceEl, b.price); } else { priceEl.textContent = b.price; }
    const lc = document.getElementById('sheetLayerCount');
    if (lc) lc.textContent = `${b.layers.length} LAGEN`;
  }, delay);

  setTimeout(() => {
    const layersEl = document.getElementById('sheetLayers');
    layersEl.innerHTML = '';
    b.layers.forEach((l, n) => {
      const div = document.createElement('div');
      div.className = 'layer';
      div.style.animationDelay = `${n * 0.065}s`;
      div.innerHTML = `<b>${String(n + 1).padStart(2, '0')}</b>${l}`;
      layersEl.appendChild(div);
    });
  }, delay + 50);

  sheet.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  sheet.classList.remove('open');
  document.body.style.overflow = '';
  sheetCurrentIndex = -1;
  document.querySelectorAll('.burger-list button').forEach(b => b.classList.remove('active'));
}

sheetBackdrop.addEventListener('click', closeSheet);
sheetClose.addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

// ── Nav scroll class ───────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Scroll reveal ──────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── NEW: Enhanced loader with counter ─────────────────────
function initLoader() {
  const countEl = document.getElementById('loaderCount');
  const loaderEl = document.getElementById('loader');
  if (!countEl || !loaderEl) return;

  const duration = 900;
  const start = performance.now();

  function updateCount(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const val = Math.round(progress * 100);
    countEl.textContent = val;
    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      countEl.textContent = '100';
      setTimeout(() => loaderEl.classList.add('hide'), 80);
    }
  }

  requestAnimationFrame(updateCount);
}

// ── NEW: Hero canvas particles ─────────────────────────────
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, mouseX = 0, mouseY = 0;
  const NUM = 120;
  const particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rand(min, max) { return min + Math.random() * (max - min); }

  function createParticle() {
    const depth = Math.random(); // 0 = far, 1 = near
    const isYellow = Math.random() < 0.3;
    return {
      x:    rand(0, W || window.innerWidth),
      y:    rand(0, H || window.innerHeight),
      vx:   rand(-0.15, 0.15),
      vy:   rand(-0.08, -0.22),
      size: 0.5 + depth * 2,
      opacity: 0.1 + depth * 0.6,
      depth,
      isYellow,
    };
  }

  for (let i = 0; i < NUM; i++) particles.push(createParticle());

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('resize', resize);
  resize();

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const mx = (mouseX / W - 0.5);
    const my = (mouseY / H - 0.5);

    for (let i = 0; i < NUM; i++) {
      const p = particles[i];

      // Drift
      p.x += p.vx + mx * p.depth * 0.4;
      p.y += p.vy + my * p.depth * 0.25;

      // Wrap
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      if (p.isYellow) {
        ctx.fillStyle = `rgba(255,240,0,${p.opacity})`;
      } else {
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
      }
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < NUM; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.08;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}


// ── NEW: Cinematic chapters scroll ─────────────────────────
function initChapters() {
  const section = document.getElementById('chapters');
  const track   = document.getElementById('chaptersTrack');
  const dotsEl  = document.getElementById('chaptersDots');
  if (!section || !track || !dotsEl) return;

  // Hide on mobile — CSS handles display:none but guard here too
  if (window.innerWidth <= 940) return;

  const chapters  = track.querySelectorAll('.chapter');
  const dots      = dotsEl.querySelectorAll('.cp-dot');
  const n         = chapters.length;
  let targetProg  = 0;
  let currentProg = 0;
  let lastDot     = 0;

  // Set first chapter active immediately
  chapters[0].classList.add('is-active');

  // Click dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      // Scroll section into position
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const totalScrollRange = section.offsetHeight - window.innerHeight;
      const targetScroll = sectionTop + (i / (n - 1)) * totalScrollRange;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  });

  function update() {
    const rect   = section.getBoundingClientRect();
    const total  = section.offsetHeight - window.innerHeight;
    targetProg   = Math.max(0, Math.min(1, -rect.top / total));

    currentProg += (targetProg - currentProg) * 0.08;

    const translateX = -currentProg * (n - 1) * 100;
    track.style.transform = `translateX(${translateX}vw)`;

    // Active chapter index
    const activeIdx = Math.round(currentProg * (n - 1));

    // Update is-active class
    chapters.forEach((ch, i) => ch.classList.toggle('is-active', i === activeIdx));

    // Update dots
    if (activeIdx !== lastDot) {
      lastDot = activeIdx;
      dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    }

    requestAnimationFrame(update);
  }

  update();
}

// ── NEW: AI Mood Matcher ───────────────────────────────────
const moodMap = {
  bold:    { name: 'Monster Burger',      desc: 'Spiegelei, Rindfleischbacon und doppelter Cheddar auf einem Rindfleischpatty. Der, für den man wiederkommt.', price: '10.90€', img: 'assets/monster.png' },
  heat:    { name: 'Chilling Burger', desc: 'Jalapeños, Chilli Sauce und ein ordentliches Rindfleischpatty. Nichts für schwache Nerven.', price: '6.90€', img: 'assets/pea.png' },
  classic: { name: 'Cheeseburger',         desc: 'Beef, Käse, Gurke, Tomate, Salat — der Klassiker, so wie er sein soll. Einfach, ehrlich, gut.', price: '5.80€', img: 'assets/cheeseburger.png' },
  plant:   { name: 'Pi Burger Veggie',    desc: 'Kartoffelpatty, Green Sauce und frisches Gemüse. Schmeckt, als wäre er schon immer hier gewesen.', price: '7.50€', img: 'assets/veggie.png' },
};

function initMoodMatcher() {
  const cards     = document.querySelectorAll('.mood-card');
  const result    = document.getElementById('moodResult');
  const analyzing = document.getElementById('moodAnalyzing');
  const matchEl   = document.getElementById('moodMatch');
  const fill      = document.getElementById('moodAiFill');
  const aiText    = document.getElementById('moodAiText');
  const moodImg   = document.getElementById('moodImg');
  const moodName  = document.getElementById('moodName');
  const moodDesc  = document.getElementById('moodDesc');
  const moodPrice = document.getElementById('moodPrice');

  if (!cards.length || !result) return;

  const steps = [
    'WIR SUCHEN DEINEN BURGER...',
    'WIR SCHAUEN INS MENÜ...',
    'GEFUNDEN.',
    'HIER IST ER.'
  ];

  let running = false;

  function runMatcher(mood) {
    if (running) {
      // Reset match visibility for swap
      matchEl.classList.remove('visible');
      matchEl.style.display = 'none';
    }
    running = true;

    // Show result container
    result.classList.add('active');

    // Show analyzing, hide match
    analyzing.style.display = 'flex';
    matchEl.style.display = 'none';
    matchEl.classList.remove('visible');

    // Reset bar
    fill.style.width = '0%';
    aiText.textContent = steps[0];

    let stepIdx = 0;
    const totalSteps = steps.length;
    const stepDuration = 450;

    function nextStep() {
      stepIdx++;
      if (stepIdx < totalSteps) {
        fill.style.width = `${(stepIdx / (totalSteps - 1)) * 100}%`;
        aiText.textContent = steps[stepIdx];
        setTimeout(nextStep, stepDuration);
      } else {
        // Done — show match
        fill.style.width = '100%';
        setTimeout(() => {
          analyzing.style.display = 'none';
          const data = moodMap[mood];
          moodImg.src   = data.img;
          moodImg.alt   = data.name;
          moodName.textContent  = data.name;
          moodDesc.textContent  = data.desc;
          moodPrice.textContent = data.price;

          matchEl.style.display = 'flex';
          // Force reflow then animate in
          void matchEl.offsetWidth;
          matchEl.classList.add('visible');
          running = false;
        }, 200);
      }
    }

    setTimeout(nextStep, stepDuration);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      runMatcher(card.dataset.mood);
    });
  });
}

// ── NEW: 3D tilt on pillars ───────────────────────────────
function init3DTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.pillar, .card').forEach(el => {
    const isCard = el.classList.contains('card');
    const maxRot = isCard ? 6 : 5;
    const tz     = isCard ? 4 : 6;

    // Cache rect — only read layout on enter/resize, never on mousemove
    let rect = null;
    let pending = null;

    el.addEventListener('mouseenter', () => {
      rect = el.getBoundingClientRect();
      el.style.transition = 'box-shadow 0.35s, border-color 0.35s';
    });

    el.addEventListener('mousemove', e => {
      if (!rect) return;
      const ex = e.clientX, ey = e.clientY;
      if (pending) return; // already have a frame queued
      pending = requestAnimationFrame(() => {
        pending = null;
        const x = (ex - rect.left - rect.width  / 2) / (rect.width  / 2);
        const y = (ey - rect.top  - rect.height / 2) / (rect.height / 2);
        el.style.transform = `perspective(800px) rotateY(${x * maxRot}deg) rotateX(${-y * maxRot}deg) translateZ(${tz}px)`;
      });
    });

    el.addEventListener('mouseleave', () => {
      rect = null;
      if (pending) { cancelAnimationFrame(pending); pending = null; }
      el.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s, border-color 0.35s';
      el.style.transform  = '';
    });
  });

  window.addEventListener('resize', () => {
    // Invalidate all cached rects on resize
  }, { passive: true });
}

// ── NEW: Split text animation on hero h1 ──────────────────
function initSplitText() {
  const els = document.querySelectorAll('.split-text');
  els.forEach(el => {
    const lines = el.innerHTML.split(/<br\s*\/?>/gi);
    let charIndex = 0;
    const out = lines.map(line => {
      const words = line.trim().split(' ');
      return words.filter(Boolean).map(word => {
        const chars = word.split('').map(ch => {
          const delay = charIndex++ * 28;
          return `<span class="char" style="animation-delay:${delay}ms">${ch}</span>`;
        }).join('');
        return `<span style="display:inline-block;white-space:nowrap">${chars}</span>`;
      }).join(' ');
    }).join('<br/>');
    el.innerHTML = out;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add('splitting');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
  });
}

// ── Init ───────────────────────────────────────────────────



// ── Scroll progress bar ────────────────────────────────────
function initScrollProgress() {
  const bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  function updateProgress() {
    const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.transform = `scaleX(${Math.min(progress, 1)})`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('touchmove', updateProgress, { passive: true });
}

// ── True magnetic buttons ──────────────────────────────────
function initMagnetic() {
  document.querySelectorAll('.magnetic').forEach(el => {
    let rect = null;
    let tx = 0, ty = 0;
    let pending = null;

    el.addEventListener('mouseenter', () => {
      rect = el.getBoundingClientRect();
      el.style.transition = 'transform 0.1s linear';
    });
    el.addEventListener('mouseleave', () => {
      rect = null;
      if (pending) { cancelAnimationFrame(pending); pending = null; }
      el.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      el.style.transform = '';
    });
    el.addEventListener('mousemove', e => {
      if (!rect) return;
      tx = (e.clientX - rect.left - rect.width  / 2) * 0.28;
      ty = (e.clientY - rect.top  - rect.height / 2) * 0.28;
      if (pending) return;
      pending = requestAnimationFrame(() => {
        pending = null;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
      });
    });
  });
}

// ── Hero parallax on scroll ────────────────────────────────
function initParallax() {
  const orb    = document.querySelector('.hero-orb');
  const burger = document.getElementById('heroBurger');
  const copy   = document.querySelector('.hero-copy');
  const canvas = document.getElementById('heroCanvas');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > window.innerHeight) return;
    if (orb)    orb.style.transform    = `translateY(${y * 0.5}px)`;
    if (burger) burger.style.transform = `translateY(${y * 0.22}px)`;
    if (copy)   copy.style.transform   = `translateY(${y * 0.12}px)`;
    if (canvas) canvas.style.transform = `translateY(${y * 0.08}px)`;
  }, { passive: true });
}


// ── LocalStorage personalization ───────────────────────────
function initPersonalization() {
  document.querySelectorAll('.mood-card').forEach(card => {
    card.addEventListener('click', () => localStorage.setItem('bsquare_mood', card.dataset.mood));
  });
}

// ── Nav active section ─────────────────────────────────────
function initNavActive() {
  const links = document.querySelectorAll('.nav-links a');
  const ids = ['lab', 'menu', 'story', 'location'];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => {
        const match = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('nav-active', match);
      });
    });
  }, { threshold: 0.35 });
  ids.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el); });
}

// ── Story micro-interactions ───────────────────────────────
function initStoryAnimations() {
  function onceVisible(el, cb, opts) {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { cb(); io.disconnect(); }
    }, opts);
    io.observe(el);
  }

  // Header fades up, then yellow line draws
  onceVisible(
    document.querySelector('.story-header'),
    () => document.querySelector('.story-header').classList.add('s-in'),
    { threshold: 0.4 }
  );

  // Paragraphs cascade in 80ms apart
  onceVisible(
    document.querySelector('.story-body'),
    () => {
      document.querySelectorAll('.story-body p').forEach((p, i) => {
        setTimeout(() => p.classList.add('s-in'), i * 80);
      });
    },
    { threshold: 0.08 }
  );

  // Pillars stagger left-to-right 110ms apart
  onceVisible(
    document.querySelector('.story-pillars'),
    () => {
      document.querySelectorAll('.pillar').forEach((p, i) => {
        setTimeout(() => p.classList.add('s-in'), i * 110);
      });
    },
    { threshold: 0.1 }
  );
}

window.addEventListener('load', () => {
  renderButtons(0);
  renderCards();
  if (!isMobile()) setActive(0, true);
  initTilt();
  initReveal();
  initLoader();
  initHeroCanvas();
  initChapters();
  initMoodMatcher();
  init3DTilt();
  initSplitText();
  initScrollProgress();
  initMagnetic();
  initParallax();
  initPersonalization();
  initStoryAnimations();
  initNavActive();
});
