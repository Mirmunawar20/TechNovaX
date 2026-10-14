/* ============================================================
   TechNovaX — Main script (home + shared by every page)
   ============================================================ */
(function () {
  'use strict';

  const CFG = window.TNX || {};
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Toast ---------- */
  function toast(msg, type = 'ok') {
    const stack = $('#toastStack'); if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'err' ? ' err' : '');
    el.innerHTML = `<i class="fas ${type === 'err' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i><span>${esc(msg)}</span>`;
    stack.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 450); }, 3200);
  }
  window.TNX.toast = toast;

  /* ---------- Static bits: year, mail, social ---------- */
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
  $$('[data-mail]').forEach((a) => {
    const addr = a.dataset.mail === 'ads' ? CFG.adsEmail : CFG.contactEmail;
    a.href = `mailto:${addr}` + (a.dataset.subject ? `?subject=${encodeURIComponent(a.dataset.subject)}` : '');
  });
  $$('[data-email]').forEach((el) => { el.textContent = el.dataset.email === 'ads' ? CFG.adsEmail : CFG.contactEmail; });
  const socialIcons = { facebook: 'fa-facebook-f', youtube: 'fa-youtube', twitter: 'fa-x-twitter', github: 'fa-github', telegram: 'fa-telegram', whatsapp: 'fa-whatsapp' };
  $$('[data-social]').forEach((box) => {
    Object.entries(CFG.social || {}).forEach(([k, url]) => {
      if (!url) return;
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', k);
      a.innerHTML = `<i class="fab ${socialIcons[k] || 'fa-link'}"></i>`;
      box.appendChild(a);
    });
    if (!box.children.length) { const card = box.closest('.contact-card'); if (card) card.remove(); }
  });

  /* ---------- Theme ---------- */
  (function theme() {
    const btn = $('#themeToggle'); if (!btn) return;
    const icon = btn.querySelector('i');
    const apply = (t) => {
      document.documentElement.setAttribute('data-theme', t);
      icon.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      const m = $('meta[name="theme-color"]'); if (m) m.content = t === 'dark' ? '#05060d' : '#f6f7fd';
    };
    apply(document.documentElement.getAttribute('data-theme') || 'dark');
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(() => apply(next)); else apply(next);
      store.set('theme', next);
    });
  })();

  /* ---------- Preloader ---------- */
  (function preloader() {
    const p = $('#preloader'); if (!p) return;
    const t0 = performance.now();
    const hide = () => setTimeout(() => { p.classList.add('done'); document.body.classList.add('ready'); setTimeout(() => p.remove(), 900); },
      Math.max(0, (reduceMotion ? 0 : 900) - (performance.now() - t0)));
    if (document.readyState === 'complete') hide(); else window.addEventListener('load', hide);
  })();

  /* ---------- Header / progress / back-to-top ---------- */
  const header = $('#header'), prog = $('#scrollProgress'), toTop = $('#backToTop');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (prog) prog.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    header && header.classList.toggle('scrolled', y > 30);
    toTop && toTop.classList.toggle('active', y > 700);
    updateActiveNav();
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  toTop && toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Nav ---------- */
  const navMenu = $('#navMenu'), burger = $('#hamburger'), indicator = $('.nav-indicator');
  const navLinks = $$('.nav-link');
  function moveIndicator(link) {
    if (!indicator) return;
    if (!link) { indicator.style.opacity = 0; return; }
    indicator.style.opacity = 1;
    indicator.style.width = link.offsetWidth + 'px';
    indicator.style.transform = `translateX(${link.offsetLeft}px)`;
  }
  let activeLink = null;
  function updateActiveNav() {
    if (!$('#home')) return;
    let cur = '';
    ['home', 'categories', 'tutorials', 'tools', 'advertise', 'contact'].forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 140) cur = id;
    });
    const link = navLinks.find((l) => l.getAttribute('href').endsWith('#' + cur)) || null;
    if (link !== activeLink) {
      navLinks.forEach((l) => l.classList.toggle('active', l === link));
      activeLink = link; moveIndicator(link);
    }
  }
  navLinks.forEach((l) => {
    l.addEventListener('mouseenter', () => moveIndicator(l));
    l.addEventListener('click', () => { burger?.classList.remove('active'); navMenu?.classList.remove('active'); document.body.style.overflow = ''; burger?.setAttribute('aria-expanded', 'false'); });
  });
  navMenu && navMenu.addEventListener('mouseleave', () => moveIndicator(activeLink));
  addEventListener('resize', () => moveIndicator(activeLink));
  burger && burger.addEventListener('click', () => {
    const open = burger.classList.toggle('active');
    navMenu.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  const observeReveals = () => $$('.reveal:not(.in)').forEach((el) => io.observe(el));
  observeReveals();

  /* ---------- Pointer effects ---------- */
  const glow = $('#cursorGlow');
  if (finePointer && !reduceMotion) {
    let gx = 0, gy = 0, gt = false;
    addEventListener('pointermove', (e) => {
      gx = e.clientX; gy = e.clientY;
      if (glow) { glow.classList.add('on'); if (!gt) { gt = true; requestAnimationFrame(() => { glow.style.transform = `translate(${gx}px,${gy}px)`; gt = false; }); } }
    }, { passive: true });

    document.addEventListener('pointermove', (e) => {
      const spot = e.target.closest && e.target.closest('.spot');
      if (spot) { const r = spot.getBoundingClientRect(); spot.style.setProperty('--mx', (e.clientX - r.left) + 'px'); spot.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
      const tilt = e.target.closest && e.target.closest('[data-tilt]');
      if (tilt) {
        const r = tilt.getBoundingClientRect(), deg = +tilt.dataset.tilt || 6;
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        tilt.style.transform = `perspective(900px) rotateX(${(-y * deg).toFixed(2)}deg) rotateY(${(x * deg).toFixed(2)}deg) translateZ(0)`;
      }
    }, { passive: true });
    document.addEventListener('pointerout', (e) => {
      const tilt = e.target.closest && e.target.closest('[data-tilt]');
      if (tilt && !tilt.contains(e.relatedTarget)) tilt.style.transform = '';
    });

    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .22).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * .3).toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Counters ---------- */
  function animateCounter(el, to) {
    el.dataset.target = to;
    if (reduceMotion) { el.textContent = to.toLocaleString(); return; }
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { animateCounter(e.target, +e.target.dataset.target || 0); counterIO.unobserve(e.target); } });
  }, { threshold: .6 });
  $$('.counter').forEach((c) => { if (c.id !== 'statArticles') counterIO.observe(c); });

  /* ---------- Hero: rotating typewriter ---------- */
  (function rotator() {
    const el = $('#rotator'); if (!el || reduceMotion) return;
    const words = ['Simple.', 'Practical.', 'Visual.', 'Powerful.', 'Free.'];
    let w = 0, i = words[0].length, deleting = true;
    el.textContent = words[0];
    function tick() {
      if (deleting) {
        i--; el.textContent = words[w].slice(0, i);
        if (i === 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 250); }
        return setTimeout(tick, 40);
      }
      i++; el.textContent = words[w].slice(0, i);
      if (i === words[w].length) { deleting = true; return setTimeout(tick, 2000); }
      setTimeout(tick, 90);
    }
    setTimeout(tick, 2600);
  })();

  /* ---------- Hero: terminal ---------- */
  (function terminal() {
    const body = $('#termBody'); if (!body) return;
    const script = [
      { t: 'cmd', v: 'ping 192.168.0.1' },
      { t: 'out', v: '<span class="dim">64 bytes from 192.168.0.1:</span> time=<span class="hl">1.2 ms</span>' },
      { t: 'out', v: '<span class="ok">✔</span> gateway reachable', d: 500 },
      { t: 'cmd', v: 'technovax setup --router' },
      { t: 'out', v: '<span class="ok">✔</span> PPPoE connected' },
      { t: 'out', v: '<span class="ok">✔</span> Wi-Fi secured <span class="dim">(WPA3)</span>' },
      { t: 'out', v: '<span class="ok">✔</span> Port-forward for CCTV <span class="dim">:8000</span>' },
      { t: 'cmd', v: 'echo "You are online 🚀"' },
      { t: 'out', v: 'You are online 🚀', d: 2600 }
    ];
    const PROMPT = '<span class="p">➜</span> <span class="dim">~</span> ';
    const render = (done, typing, cursor = true) => { body.innerHTML = done + (typing !== null ? PROMPT + esc(typing) : '') + (cursor ? '<span class="cur"></span>' : ''); };
    if (reduceMotion) { render(script.map((s) => (s.t === 'cmd' ? PROMPT + esc(s.v) : s.v) + '\n').join(''), null, false); return; }
    let running = false;
    async function run() {
      running = true;
      while (true) {
        let done = '';
        for (const s of script) {
          if (s.t === 'cmd') {
            for (let i = 0; i <= s.v.length; i++) { render(done, s.v.slice(0, i)); await sleep(32 + Math.random() * 42); }
            await sleep(350); done += PROMPT + esc(s.v) + '\n'; render(done, null);
          } else { await sleep(s.d && s.d < 1000 ? s.d : 260); done += s.v + '\n'; render(done, null); if (s.d >= 1000) await sleep(s.d); }
        }
      }
    }
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    new IntersectionObserver((en, ob) => { if (en[0].isIntersecting && !running) { run(); ob.disconnect(); } }).observe(body);
  })();

  /* ---------- Hero: network canvas ---------- */
  (function network() {
    const cv = $('#netCanvas'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let w, h, dpr, nodes = [], packets = [], raf, visible = true;
    const mouse = { x: -999, y: -999 };
    const dark = () => document.documentElement.getAttribute('data-theme') !== 'light';
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = clamp(Math.floor((w * h) / 17000), 24, 85);
      nodes = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .9 }));
      packets = [];
    }
    const LINK = 150;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      const d = dark(), rgb = d ? '140,160,255' : '70,90,220';
      for (const n of nodes) {
        if (!reduceMotion) { n.x += n.vx; n.y += n.vy; }
        if (n.x < 0 || n.x > w) n.vx *= -1; if (n.y < 0 || n.y > h) n.vy *= -1;
        const dx = n.x - mouse.x, dy = n.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 0) { n.x += (dx / dist) * 1.2; n.y += (dy / dist) * 1.2; }
      }
      const links = [];
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK) { const al = (1 - dist / LINK); ctx.strokeStyle = `rgba(${rgb},${al * .35})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); links.push([a, b]); }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 190) { ctx.strokeStyle = `rgba(255,120,200,${(1 - md / 190) * .55})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
      }
      for (const n of nodes) { ctx.fillStyle = `rgba(${rgb},.9)`; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill(); }
      if (!reduceMotion) {
        if (links.length && packets.length < 14 && Math.random() < .06) packets.push({ l: links[(Math.random() * links.length) | 0], t: 0, s: .012 + Math.random() * .014 });
        packets = packets.filter((p) => p.t < 1);
        for (const p of packets) {
          p.t += p.s; const x = p.l[0].x + (p.l[1].x - p.l[0].x) * p.t, y = p.l[0].y + (p.l[1].y - p.l[0].y) * p.t;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 9); g.addColorStop(0, 'rgba(34,230,196,.95)'); g.addColorStop(1, 'rgba(34,230,196,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, 6.283); ctx.fill();
        }
      }
      if (visible && !reduceMotion) raf = requestAnimationFrame(frame);
    }
    size(); frame();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); if (reduceMotion) frame(); }, 150); });
    cv.parentElement.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    new IntersectionObserver((en) => { const v = en[0].isIntersecting; if (v && !visible) { visible = true; if (!reduceMotion) frame(); } visible = v; }).observe(cv);
  })();

  /* ============================================================
     CONTENT (tutorials grid, filters, search index)
     ============================================================ */
  const ICONS = { Networking: 'fa-network-wired', CCTV: 'fa-video', Development: 'fa-code', Hardware: 'fa-microchip', Mobile: 'fa-mobile-screen', AI: 'fa-robot', Tech: 'fa-bolt' };
  const fmtDate = (d) => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  let indexPromise = null;
  function loadIndex() {
    if (!indexPromise) indexPromise = fetch('/content/index.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : [])).catch(() => []);
    return indexPromise;
  }
  window.TNX.loadIndex = loadIndex;
  window.TNX.cardHTML = cardHTML;

  function cardHTML(it, opts = {}) {
    const cat = it.category || 'Tech';
    const icon = ICONS[cat] || 'fa-bolt';
    const isVideo = it.type === 'video';
    const thumb = it.thumbnail
      ? `<div class="tutorial-thumb has-img" style="background-image:url('${esc(it.thumbnail)}')">${isVideo ? '<span class="play-btn"><i class="fas fa-play"></i></span>' : ''}</div>`
      : `<div class="tutorial-thumb"><i class="fas ${isVideo ? 'fa-circle-play' : icon}"></i></div>`;
    return `<a class="tutorial-card ${opts.featured ? 'featured' : ''} card-in" data-cat="${esc(cat)}" href="${esc(it.url)}" data-slug="${esc(it.slug)}" style="--d:${(opts.i || 0) * 0.06}s">
      ${thumb}
      <div class="tutorial-body">
        ${opts.featured ? '<span class="badge-feat"><i class="fas fa-star"></i> Featured guide</span>' : ''}
        <div class="tutorial-meta"><span class="tutorial-tag">${esc(cat)}</span><span><i class="far fa-clock"></i> ${it.read_time || 1} min ${isVideo ? 'watch' : 'read'}</span></div>
        <h3>${esc(it.title)}</h3>
        <p>${esc(it.description)}</p>
        <div class="tutorial-footer"><span>${esc(fmtDate(it.date))}</span><span class="read-more">${isVideo ? 'Watch' : 'Read'} <i class="fas fa-arrow-right"></i></span></div>
      </div></a>`;
  }

  (async function home() {
    const grid = $('#tutorialsGrid'); if (!grid) return;
    const btn = $('#loadMore'), empty = $('#emptyState');
    let all = [], filter = 'all', shown = 0;
    grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';

    const list = () => (filter === 'all' ? all : all.filter((i) => i.category === filter));
    function render(reset) {
      const items = list();
      if (reset) { grid.innerHTML = ''; shown = 0; }
      const first = shown === 0 && filter === 'all' && items.length >= 4;
      const batch = items.slice(shown, shown + (shown === 0 ? (first ? 7 : 6) : 6));
      grid.insertAdjacentHTML('beforeend', batch.map((it, i) => cardHTML(it, { featured: first && shown + i === 0, i })).join(''));
      shown += batch.length;
      btn.style.display = shown < items.length ? 'inline-flex' : 'none';
      empty.hidden = items.length > 0;
    }

    all = (await loadIndex()).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const feat = all.findIndex((i) => i.featured); if (feat > 0) all.unshift(all.splice(feat, 1)[0]);
    const counts = {}; all.forEach((i) => { counts[i.category] = (counts[i.category] || 0) + 1; });
    $$('[data-cat-count]').forEach((b) => { const n = counts[b.dataset.catCount] || 0; b.textContent = n; const gw = b.parentElement.querySelector('.gw'); if (gw) gw.textContent = n === 1 ? 'guide' : 'guides'; });
    const stat = $('#statArticles'); if (stat) { stat.dataset.target = all.length; counterIO.observe(stat); }
    render(true);

    $('#filters').addEventListener('click', (e) => {
      const b = e.target.closest('.chip-btn'); if (!b) return;
      $$('.chip-btn').forEach((x) => x.classList.toggle('active', x === b));
      filter = b.dataset.filter; render(true);
    });
    btn.addEventListener('click', () => render(false));
    $$('.bento-card[data-category]').forEach((c) => c.addEventListener('click', () => {
      const f = $(`.chip-btn[data-filter="${c.dataset.category}"]`); if (f) f.click();
    }));
  })();

  /* ============================================================
     SEARCH PALETTE
     ============================================================ */
  (function search() {
    const overlay = $('#searchOverlay'), input = $('#searchInput'), box = $('#searchResults'); if (!overlay) return;
    let sel = 0, results = [], index = [];
    const open = async () => {
      overlay.classList.add('active'); document.body.style.overflow = 'hidden';
      setTimeout(() => input.focus(), 120);
      if (!index.length) { index = await loadIndex(); }
      render(input.value);
    };
    const close = () => { overlay.classList.remove('active'); document.body.style.overflow = ''; };
    window.TNX.openSearch = open;
    $('#searchBtn')?.addEventListener('click', open);
    $('#closeSearch')?.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.classList.contains('active') ? close() : open(); }
      else if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
      else if (e.key === 'Escape') close();
    });
    const mark = (t, q) => { const s = esc(t); if (!q) return s; try { return s.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>'); } catch (e) { return s; } };
    function score(it, q) {
      const t = it.title.toLowerCase(), d = (it.description || '').toLowerCase(), c = (it.category || '').toLowerCase(), tg = (it.tags || []).join(' ').toLowerCase();
      return q.split(/\s+/).reduce((s, w) => s + (t.includes(w) ? 6 : 0) + (tg.includes(w) ? 3 : 0) + (c.includes(w) ? 3 : 0) + (d.includes(w) ? 2 : 0), 0);
    }
    function render(q) {
      q = (q || '').trim().toLowerCase();
      if (!q) {
        results = index.slice(0, 6);
        box.innerHTML = (results.length ? '<div class="s-empty" style="padding:10px 14px;text-align:left;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase">Latest guides</div>' : '') + results.map(row).join('') +
          '<div class="s-empty"><div class="s-chips">' + ['router', 'cctv', 'ip address', 'wifi', 'ai'].map((c) => `<button data-q="${c}">${c}</button>`).join('') + '</div></div>';
      } else {
        results = index.map((it) => ({ it, s: score(it, q) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 12).map((x) => x.it);
        box.innerHTML = results.length ? results.map((it) => row(it, q)).join('') : `<div class="s-empty"><i class="fas fa-magnifying-glass-minus" style="font-size:1.8rem;margin-bottom:10px"></i><p>Nothing found for “${esc(q)}”.</p></div>`;
      }
      sel = 0; mark2();
    }
    const row = (it, q) => `<a class="s-item" data-cat="${esc(it.category)}" href="${esc(it.url)}"><span class="s-ic"><i class="fas ${it.type === 'video' ? 'fa-play' : ICONS[it.category] || 'fa-bolt'}"></i></span><span class="s-info"><h4>${mark(it.title, q)}</h4><p>${mark(it.description || '', q)}</p></span><i class="fas fa-arrow-right" style="color:var(--faint)"></i></a>`;
    const mark2 = () => $$('.s-item', box).forEach((el, i) => el.classList.toggle('sel', i === sel));
    input.addEventListener('input', () => render(input.value));
    box.addEventListener('click', (e) => { const c = e.target.closest('[data-q]'); if (c) { input.value = c.dataset.q; render(c.dataset.q); input.focus(); } });
    input.addEventListener('keydown', (e) => {
      const n = $$('.s-item', box).length; if (!n) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % n; mark2(); $$('.s-item', box)[sel].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + n) % n; mark2(); $$('.s-item', box)[sel].scrollIntoView({ block: 'nearest' }); }
      if (e.key === 'Enter') { e.preventDefault(); $$('.s-item', box)[sel]?.click(); }
    });
    const q = new URLSearchParams(location.search).get('q'); if (q) { open().then(() => { input.value = q; render(q); }); }
  })();

  /* ============================================================
     TOOLS
     ============================================================ */
  (function tools() {
    const tabs = $$('.tool-tab'); if (!tabs.length) return;
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.classList.toggle('active', x === t));
      $$('.tool-panel').forEach((p) => p.classList.toggle('active', p.id === 'tool-' + t.dataset.tool));
    }));
    const copy = async (text) => { try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); } catch (e) { toast('Copy failed', 'err'); } };

    /* --- Subnet --- */
    const ip = $('#subIp'), cidr = $('#subCidr'), out = $('#subOut'), bitsBox = $('#subBits'), err = $('#subErr');
    const parse = (s) => { const m = s.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/); if (!m) return null; const o = m.slice(1).map(Number); if (o.some((n) => n > 255)) return null; return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0; };
    const toIp = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    const bitEls = [];
    for (let o = 0; o < 4; o++) { const g = document.createElement('div'); g.className = 'oct'; for (let b = 0; b < 8; b++) { const s = document.createElement('span'); s.className = 'b'; s.textContent = '0'; g.appendChild(s); bitEls.push(s); } bitsBox.appendChild(g); }
    function subnet() {
      const c = +cidr.value; $('#subCidrVal').textContent = '/' + c;
      const addr = parse(ip.value);
      bitEls.forEach((el, i) => { const on = i < c; el.textContent = on ? '1' : '0'; el.classList.toggle('n', on); });
      if (addr === null) { err.hidden = false; err.textContent = 'Enter a valid IPv4 address, e.g. 192.168.1.10'; out.innerHTML = ''; return; }
      err.hidden = true;
      const mask = c === 0 ? 0 : (0xFFFFFFFF << (32 - c)) >>> 0, net = (addr & mask) >>> 0, wc = (~mask) >>> 0, bc = (net | wc) >>> 0;
      const total = Math.pow(2, 32 - c), hosts = c >= 31 ? (c === 31 ? 2 : 1) : total - 2;
      const first = c >= 31 ? net : net + 1, last = c >= 31 ? bc : bc - 1, a = addr >>> 24;
      const cls = a < 128 ? 'A' : a < 192 ? 'B' : a < 224 ? 'C' : a < 240 ? 'D (multicast)' : 'E';
      const priv = a === 10 || (a === 172 && ((addr >>> 16) & 255) >= 16 && ((addr >>> 16) & 255) <= 31) || (a === 192 && ((addr >>> 16) & 255) === 168);
      const rows = [['Network', toIp(net)], ['Broadcast', toIp(bc)], ['Netmask', toIp(mask)], ['Wildcard', toIp(wc)], ['First host', toIp(first)], ['Last host', toIp(last)],
        ['Usable hosts', hosts.toLocaleString()], ['Total addresses', total.toLocaleString()], ['Class · Scope', `${cls} · ${priv ? 'Private' : a === 127 ? 'Loopback' : 'Public'}`]];
      out.innerHTML = rows.map(([k, v]) => `<div class="res" data-copy="${esc(v)}" title="Click to copy"><small>${k}</small><b>${esc(v)}</b></div>`).join('');
    }
    ip.addEventListener('input', subnet); cidr.addEventListener('input', subnet);
    out.addEventListener('click', (e) => { const r = e.target.closest('.res'); if (r) copy(r.dataset.copy); });
    subnet();

    /* --- Password --- */
    const pwOut = $('#pwOut'), pwLen = $('#pwLen'), sets = { up: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', low: 'abcdefghijklmnopqrstuvwxyz', num: '0123456789', sym: '!@#$%^&*()-_=+[]{};:,.?' };
    const rnd = (n) => { const lim = Math.floor(0x100000000 / n) * n, buf = new Uint32Array(1); do { crypto.getRandomValues(buf); } while (buf[0] >= lim); return buf[0] % n; };
    function gen() {
      $('#pwLenVal').textContent = pwLen.value;
      const act = [['pwUp', 'up'], ['pwLow', 'low'], ['pwNum', 'num'], ['pwSym', 'sym']].filter(([id]) => $('#' + id).checked).map(([, k]) => sets[k]);
      if (!act.length) { $('#pwUp').checked = true; return gen(); }
      const pool = act.join(''), len = +pwLen.value;
      const chars = act.map((s) => s[rnd(s.length)]);
      while (chars.length < len) chars.push(pool[rnd(pool.length)]);
      for (let i = chars.length - 1; i > 0; i--) { const j = rnd(i + 1); [chars[i], chars[j]] = [chars[j], chars[i]]; }
      pwOut.textContent = chars.join('');
      const bits = len * Math.log2(pool.length), m = $('#pwMeter');
      m.style.width = clamp(bits / 110 * 100, 6, 100) + '%';
      const lv = bits < 45 ? ['Weak', '#ff5c8a'] : bits < 70 ? ['Fair', '#ffb86b'] : bits < 100 ? ['Strong', '#34d399'] : ['Excellent', '#22e6c4'];
      m.style.background = lv[1]; $('#pwLabel').textContent = `${lv[0]} · ~${Math.round(bits)} bits of entropy · generated locally, never sent anywhere`;
    }
    $('#pwGen').addEventListener('click', gen); pwLen.addEventListener('input', gen);
    ['pwUp', 'pwLow', 'pwNum', 'pwSym'].forEach((id) => $('#' + id).addEventListener('change', gen));
    $('#pwCopy').addEventListener('click', () => copy(pwOut.textContent));
    gen();

    /* --- Download time --- */
    const size = $('#dlSize'), unit = $('#dlUnit'), speed = $('#dlSpeed');
    const fmt = (s) => { if (!isFinite(s)) return '—'; if (s < 1) return '< 1 sec'; const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = Math.round(s % 60); return [d && d + 'd', h && h + 'h', m && m + 'm', (x || (!d && !h && !m)) && x + 's'].filter(Boolean).join(' '); };
    function dl() {
      const mb = (+size.value || 0) * (+unit.value), mbps = +speed.value || 0;
      if (mb <= 0 || mbps <= 0) { $('#dlTime').textContent = '—'; return; }
      const s = (mb * 8) / mbps;
      $('#dlTime').textContent = fmt(s);
      $('#dlNote').textContent = `Realistic estimate (≈85% efficiency): ${fmt(s / .85)}. Plans are quoted in megabits, files in megabytes.`;
      $('#dlBar').style.width = clamp(100 - Math.log10(s + 1) * 22, 6, 100) + '%';
    }
    [size, unit, speed].forEach((e) => e.addEventListener('input', dl)); dl();
  })();

  /* ============================================================
     FORMS
     ============================================================ */
  (function forms() {
    $$('form[data-netlify]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type=submit]'), label = btn.innerHTML;
        btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending…';
        try {
          const fd = new FormData(form);
          const res = CFG.formEndpoint
            ? await fetch(CFG.formEndpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
            : await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString() });
          if (!res.ok) throw new Error(res.status);
          form.reset(); toast(form.name === 'newsletter' ? 'You’re subscribed — welcome aboard! 🎉' : 'Message sent. We’ll reply soon!');
        } catch (err) {
          toast('Form service isn’t connected yet — it activates once the site is deployed on Netlify.', 'err');
        } finally { btn.disabled = false; btn.innerHTML = label; }
      });
    });
  })();

  /* ============================================================
     COOKIES + ADS
     ============================================================ */
  (function consentAndAds() {
    const bar = $('#cookie');
    const decided = () => store.get('tnx_consent');
    function loadAds() {
      const slots = $$('.ad-slot[data-ad]'); if (!slots.length) return;
      const client = CFG.adsense && CFG.adsense.client;
      slots.forEach((slot) => {
        const id = (CFG.adsense && CFG.adsense.slots || {})[slot.dataset.ad];
        if (!client || !id) {
          slot.innerHTML = `<div class="ad-ph"><b>Advertisement</b><span>Your ad could be here · <a href="/#advertise">Advertise with us</a></span></div>`;
          return;
        }
        slot.classList.add('live');
        slot.innerHTML = `<ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="${esc(client)}" data-ad-slot="${esc(id)}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
      });
      if (client && !window.__adsLoaded) {
        window.__adsLoaded = true;
        window.adsbygoogle = window.adsbygoogle || [];
        if (decided() !== 'granted') window.adsbygoogle.requestNonPersonalizedAds = 1;
        const s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous';
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(client);
        document.head.appendChild(s);
        $$('.adsbygoogle').forEach(() => { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} });
      }
    }
    const decide = (v) => { store.set('tnx_consent', v); bar.hidden = true; if (v === 'granted') window.dispatchEvent(new Event('tnx:consent')); loadAds(); };
    if (bar) {
      $('#cookieAccept').addEventListener('click', () => decide('granted'));
      $('#cookieDecline').addEventListener('click', () => decide('denied'));
      if (!decided()) setTimeout(() => { bar.hidden = false; }, 2200);
    }
    // Slots always render a placeholder; real ads load once a choice exists (or no banner on page)
    $$('.ad-slot[data-ad]').forEach((s) => { s.innerHTML = '<div class="ad-ph"><b>Advertisement</b><span>Your ad could be here · <a href="/#advertise">Advertise with us</a></span></div>'; });
    if (decided() || !bar) loadAds();
    else { const w = () => { if (decided()) { loadAds(); removeEventListener('tnx:consent', w); } }; addEventListener('tnx:consent', w); }
  })();

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  }

  /* console signature */
  console.log('%c⚡ TechNovaX', 'font:700 22px system-ui;background:linear-gradient(120deg,#6d8bff,#ff5ca8);-webkit-background-clip:text;color:transparent');
})();
