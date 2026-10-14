/* ============================================================
   TechNovaX — Post page enhancements (TOC, share, copy, related)
   ============================================================ */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const main = $('#main'); if (!main) return;
  const toast = (m, t) => window.TNX && window.TNX.toast && window.TNX.toast(m, t);
  const slug = main.dataset.slug, cat = main.dataset.cat;
  const title = document.title.replace(/ \| TechNovaX$/, '');
  const url = location.href.split('#')[0];

  /* --- TOC --- */
  const prose = $('#prose'), tocList = $('#tocList'), toc = $('#toc');
  if (prose && tocList) {
    const hs = $$('h2, h3', prose);
    if (hs.length < 2) toc.style.display = 'none';
    hs.forEach((h) => {
      const li = document.createElement('li'); if (h.tagName === 'H3') li.className = 'h3';
      li.innerHTML = `<a href="#${h.id}"></a>`; li.firstChild.textContent = h.textContent; tocList.appendChild(li);
      const a = document.createElement('a'); a.className = 'anchor'; a.href = '#' + h.id; a.setAttribute('aria-label', 'Link to section'); a.innerHTML = '<i class="fas fa-link"></i>'; h.prepend(a);
    });
    const links = $$('a', tocList);
    const spy = new IntersectionObserver((en) => en.forEach((e) => {
      if (e.isIntersecting) { links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)); }
    }), { rootMargin: '-90px 0px -70% 0px' });
    hs.forEach((h) => spy.observe(h));
  }

  /* --- Code copy + tables --- */
  $$('pre', prose || document).forEach((pre) => {
    const b = document.createElement('button'); b.className = 'copy-code'; b.type = 'button'; b.textContent = 'Copy';
    b.addEventListener('click', async () => { try { await navigator.clipboard.writeText(pre.innerText.replace(/Copy$/, '').trim()); b.textContent = 'Copied ✓'; setTimeout(() => (b.textContent = 'Copy'), 1800); } catch (e) { toast('Copy failed', 'err'); } });
    pre.appendChild(b);
  });
  $$('table', prose || document).forEach((t) => { const w = document.createElement('div'); w.className = 'table-wrap'; t.replaceWith(w); w.appendChild(t); });

  /* --- Lite YouTube --- */
  $$('.yt-lite').forEach((el) => el.addEventListener('click', () => {
    el.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${el.dataset.id}?autoplay=1&rel=0&modestbranding=1" title="Video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }));

  /* --- Share --- */
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const nets = [
    ['facebook', 'fa-facebook-f', 'Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['x', 'fa-x-twitter', 'X', `https://twitter.com/intent/tweet?url=${u}&text=${t}`],
    ['whatsapp', 'fa-whatsapp', 'WhatsApp', `https://wa.me/?text=${t}%20${u}`],
    ['telegram', 'fa-telegram', 'Telegram', `https://t.me/share/url?url=${u}&text=${t}`],
    ['linkedin', 'fa-linkedin-in', 'LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`]
  ];
  $$('[data-share-row]').forEach((row) => {
    const full = row.dataset.shareRow === 'full';
    row.innerHTML = nets.map(([k, ic, name, href]) => `<a href="${href}" target="_blank" rel="noopener" data-share="${k}" aria-label="Share on ${name}"><i class="fab ${ic}"></i>${full ? name : ''}</a>`).join('') +
      `<button type="button" data-share="copy" aria-label="Copy link"><i class="fas fa-link"></i>${full ? 'Copy link' : ''}</button>`;
    row.querySelector('[data-share=copy]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(url); toast('Link copied — go share it! 🚀'); } catch (e) { toast('Copy failed', 'err'); } });
  });
  $('#shareBtn')?.addEventListener('click', () => {
    if (navigator.share) navigator.share({ title, url }).catch(() => {});
    else $('.share-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#printBtn')?.addEventListener('click', () => print());

  /* --- Bookmark --- */
  const bm = $('#bookmarkBtn');
  if (bm) {
    const key = 'bookmark_' + slug; let on = false;
    try { on = localStorage.getItem(key) === '1'; } catch (e) {}
    const paint = () => { bm.classList.toggle('active', on); bm.firstElementChild.className = on ? 'fas fa-bookmark' : 'far fa-bookmark'; };
    paint();
    bm.addEventListener('click', () => { on = !on; try { localStorage.setItem(key, on ? '1' : '0'); } catch (e) {} paint(); toast(on ? 'Saved to your bookmarks' : 'Bookmark removed'); });
  }

  /* --- Related --- */
  const grid = $('#relatedGrid');
  if (grid && window.TNX) {
    window.TNX.loadIndex().then((all) => {
      const others = all.filter((i) => i.slug !== slug);
      const rel = others.filter((i) => i.category === cat).concat(others.filter((i) => i.category !== cat)).slice(0, 3);
      grid.innerHTML = rel.map((it, i) => window.TNX.cardHTML(it, { i })).join('');
    });
  }
})();
