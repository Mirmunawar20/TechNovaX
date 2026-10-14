#!/usr/bin/env node
/* ============================================================
   TechNovaX — Static Site Builder
   Markdown (content/*.md) → pre-rendered HTML pages with full SEO
   + search index, sitemap.xml, rss.xml, robots.txt, 404.html
   Run:  npm run build
   ============================================================ */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };

const log = {
  ok: (m) => console.log(`\x1b[32m[✓]\x1b[0m ${m}`),
  warn: (m) => console.log(`\x1b[33m[!]\x1b[0m ${m}`),
  info: (m) => console.log(`\x1b[36m[i]\x1b[0m ${m}`)
};

/* ---------- Config ---------- */
const cfgSrc = read('assets/js/config.js');
const pick = (k, d = '') => (cfgSrc.match(new RegExp(k + "\\s*:\\s*'([^']*)'")) || [, d])[1];
const SITE = (process.env.SITE_URL || pick('siteUrl', 'https://technovax.netlify.app')).replace(/\/$/, '');

const COLLECTIONS = [
  { dir: 'articles', type: 'article', base: 'articles' },
  { dir: 'videos', type: 'video', base: 'videos' },
  { dir: 'images', type: 'image', base: 'gallery' }
];
const ICONS = { Networking: 'fa-network-wired', CCTV: 'fa-video', Development: 'fa-code', Hardware: 'fa-microchip', Mobile: 'fa-mobile-screen', AI: 'fa-robot', Tech: 'fa-bolt' };

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-') || 'section';
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ''));
const hasBangla = (s) => /[ঀ-৿]/.test(s);

/* ---------- Marked: heading ids ---------- */
function addHeadingIds(html) {
  const used = new Set();
  return html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, l, inner) => {
    let id = slugify(inner), n = 2; const base = id;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return `<h${l} id="${id}">${inner}</h${l}>`;
  });
}

/* ---------- Video embeds ---------- */
function videoCover(url, thumb) {
  if (!url) return '';
  url = url.trim();
  const yt = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (yt) return { html: `<div class="post-cover video"><div class="yt-lite" data-id="${yt[1]}" style="background-image:url('https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg')" role="button" aria-label="Play video"><button type="button" aria-hidden="true"><i class="fas fa-play"></i></button></div></div>`, thumb: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`, ytId: yt[1] };
  const vm = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  if (vm) return { html: `<div class="post-cover video"><iframe src="https://player.vimeo.com/video/${vm[1]}" title="Video" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>` };
  if (url.includes('facebook.com')) return { html: `<div class="post-cover video"><iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false" title="Video" loading="lazy" allowfullscreen></iframe></div>` };
  if (/\.(mp4|webm|ogg)$/i.test(url)) return { html: `<div class="post-cover video"><video controls playsinline preload="metadata"${thumb ? ` poster="${esc(thumb)}"` : ''}><source src="${esc(url)}"></video></div>` };
  return { html: `<div class="post-cover video"><iframe src="${esc(url)}" title="Video" loading="lazy" allowfullscreen></iframe></div>` };
}

/* ---------- Parse one markdown file ---------- */
function parse(file, col) {
  const raw = fs.readFileSync(file, 'utf8');
  const { data, content } = matter(raw);
  const slug = data.slug || path.basename(file).replace(/\.md$/, '');
  const words = content.split(/\s+/).filter(Boolean).length;
  const excerpt = content.replace(/```[\s\S]*?```/g, '').replace(/[#*`>_\[\]()!-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 155);
  const date = data.date ? new Date(data.date).toISOString() : new Date(fs.statSync(file).mtime).toISOString();
  return {
    slug, type: col.type, base: col.base,
    url: `/${col.base}/${slug}/`,
    title: String(data.title || 'Untitled'),
    date,
    category: data.category || 'Tech',
    description: data.description || excerpt + '…',
    thumbnail: data.thumbnail || data.image || null,
    author: data.author || 'TechNovaX',
    video_url: data.video_url || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    featured: !!data.featured,
    read_time: Math.max(1, Math.round(words / 200)),
    body_md: content
  };
}

/* ---------- Render a post ---------- */
function renderPost(it, tpl) {
  let body = addHeadingIds(marked.parse(it.body_md));
  let cover = '', ogimage = it.thumbnail ? (it.thumbnail.startsWith('http') ? it.thumbnail : SITE + it.thumbnail) : SITE + '/assets/img/og.png';
  const icon = ICONS[it.category] || 'fa-bolt';
  if (it.type === 'video') {
    const v = videoCover(it.video_url, it.thumbnail);
    cover = v ? v.html : '';
    if (v && v.thumb && !it.thumbnail) ogimage = v.thumb;
  } else if (it.type === 'image' && it.thumbnail) {
    cover = `<figure class="post-cover" data-cat="${esc(it.category)}"><img src="${esc(it.thumbnail)}" alt="${esc(it.title)}" loading="eager"></figure>`;
  } else if (it.thumbnail) {
    cover = `<figure class="post-cover" data-cat="${esc(it.category)}"><i class="fas ${icon}"></i><img src="${esc(it.thumbnail)}" alt="${esc(it.title)}" onerror="this.remove()"></figure>`;
  } else {
    cover = `<figure class="post-cover" data-cat="${esc(it.category)}" aria-hidden="true"><i class="fas ${icon}"></i></figure>`;
  }
  const canonical = SITE + it.url;
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      it.type === 'video'
        ? { '@type': 'VideoObject', name: it.title, description: it.description, thumbnailUrl: ogimage, uploadDate: it.date, embedUrl: it.video_url || undefined }
        : { '@type': 'Article', headline: it.title, description: it.description, image: ogimage, datePublished: it.date, dateModified: it.date, author: { '@type': 'Person', name: it.author }, publisher: { '@type': 'Organization', name: 'TechNovaX', logo: { '@type': 'ImageObject', url: SITE + '/assets/img/favicon.svg' } }, mainEntityOfPage: canonical },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: it.category, item: SITE + '/#tutorials' }, { '@type': 'ListItem', position: 3, name: it.title }] }
    ]
  }).replace(/</g, '\\u003c');
  const tags = [it.category, ...it.tags, 'TechNovaX'].map((t) => `<span>#${esc(String(t).replace(/\s+/g, ''))}</span>`).join('');
  const initials = it.author.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return fill(tpl, {
    lang: hasBangla(it.title + it.body_md.slice(0, 200)) ? 'bn' : 'en',
    title: esc(it.title), description: esc(it.description), author: esc(it.author), canonical, ogimage,
    date: it.date, datefmt: new Date(it.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    category: esc(it.category), slug: esc(it.slug), type: it.type,
    typeicon: it.type === 'video' ? 'fa-circle-play' : it.type === 'image' ? 'fa-image' : 'fa-book-open',
    typelabel: it.type === 'video' ? 'Video tutorial' : it.type === 'image' ? 'Gallery' : 'Guide',
    readverb: it.type === 'video' ? 'watch' : 'read', readtime: it.read_time, initials,
    cover, body, tags, jsonld
  });
}

/* ---------- Static pages (legal etc.) ---------- */
function renderPages(tpl) {
  const dir = path.join(ROOT, 'templates/pages'); if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, f), 'utf8'));
    const name = f.replace(/\.md$/, '');
    const html = `<div class="page-card"><h1>${esc(data.title)}</h1><p class="updated">Last updated: ${esc(data.updated || new Date().toISOString().slice(0, 10))}</p><div class="prose">${addHeadingIds(marked.parse(content))}</div></div>`;
    write(`${name}.html`, fill(tpl, { title: esc(data.title), description: esc(data.description || data.title), canonical: `${SITE}/${name}.html`, robots: 'index,follow', content: html }));
    out.push(`/${name}.html`);
  }
  return out;
}

/* ---------- Header / footer injection ---------- */
function inject(file, header, footer) {
  if (!fs.existsSync(path.join(ROOT, file))) return;
  let s = read(file);
  s = s.replace(/<!--HEADER:START-->[\s\S]*?<!--HEADER:END-->/, `<!--HEADER:START-->\n${header}\n<!--HEADER:END-->`);
  s = s.replace(/<!--FOOTER:START-->[\s\S]*?<!--FOOTER:END-->/, `<!--FOOTER:START-->\n${footer}\n<!--FOOTER:END-->`);
  write(file, s);
}

/* ---------- Build ---------- */
function build() {
  const t0 = Date.now();
  marked.setOptions({ gfm: true, breaks: false });
  const header = read('templates/header.html'), footer = read('templates/footer.html');
  const postTpl = read('templates/post.html').replace('<!--HEADER:START-->\n<!--HEADER:END-->', `<!--HEADER:START-->\n${header}\n<!--HEADER:END-->`).replace('<!--FOOTER:START-->\n<!--FOOTER:END-->', `<!--FOOTER:START-->\n${footer}\n<!--FOOTER:END-->`);
  const pageTpl = read('templates/page.html').replace('<!--HEADER:START-->\n<!--HEADER:END-->', `<!--HEADER:START-->\n${header}\n<!--HEADER:END-->`).replace('<!--FOOTER:START-->\n<!--FOOTER:END-->', `<!--FOOTER:START-->\n${footer}\n<!--FOOTER:END-->`);

  // remove old generated post folders so deleted content disappears
  for (const c of COLLECTIONS) fs.rmSync(path.join(ROOT, c.base), { recursive: true, force: true });

  const items = [];
  for (const c of COLLECTIONS) {
    const dir = path.join(ROOT, 'content', c.dir);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.md'))) {
      const it = parse(path.join(dir, f), c);
      items.push(it);
      write(`${c.base}/${it.slug}/index.html`, renderPost(it, postTpl));
    }
  }
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  // search / listing index (no bodies)
  const index = items.map(({ body_md, base, ...rest }) => rest);
  write('content/index.json', JSON.stringify(index, null, 1));
  log.ok(`${items.length} content items → /articles, /videos, /gallery + content/index.json`);

  // legal pages + 404
  const pages = renderPages(pageTpl);
  const nf = `<div class="notfound"><div class="code gradient-text">404</div><h1 class="post-title" style="margin:0">Page not found</h1><p>The page you’re looking for moved, or never existed.</p><a href="/" class="btn btn-primary btn-lg"><i class="fas fa-house"></i> Back to home</a></div>`;
  write('404.html', fill(pageTpl, { title: 'Page not found', description: 'Page not found', canonical: SITE + '/404.html', robots: 'noindex', content: nf }));
  log.ok(`${pages.length} static pages + 404.html`);

  // home page: header/footer + canonical host
  inject('index.html', header, footer);
  let home = read('index.html');
  const oldHost = (home.match(/<link rel="canonical" href="([^"]+?)\/?">/) || [])[1];
  if (oldHost && oldHost !== SITE) { home = home.split(oldHost).join(SITE); write('index.html', home); }

  // sitemap
  const urls = [['/', 1.0, new Date().toISOString()], ...pages.map((p) => [p, .3, null]), ...items.map((i) => [i.url, .8, i.date])];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, p, d]) => `  <url><loc>${SITE}${u}</loc>${d ? `<lastmod>${d.slice(0, 10)}</lastmod>` : ''}<priority>${p}</priority></url>`).join('\n')}\n</urlset>\n`);
  // rss
  write('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>TechNovaX</title><link>${SITE}</link><description>Technology Made Simple</description>\n${items.slice(0, 30).map((i) => `<item><title>${esc(i.title)}</title><link>${SITE}${i.url}</link><guid>${SITE}${i.url}</guid><pubDate>${new Date(i.date).toUTCString()}</pubDate><category>${esc(i.category)}</category><description>${esc(i.description)}</description></item>`).join('\n')}\n</channel></rss>\n`);
  // robots
  write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
  log.ok(`sitemap.xml, rss.xml, robots.txt  (site: ${SITE})`);
  console.log(`\n\x1b[35m⚡ Build complete in ${((Date.now() - t0) / 1000).toFixed(2)}s\x1b[0m\n`);
}

build();
if (process.argv.includes('--watch')) {
  const chokidar = require('chokidar');
  log.info('Watching content/, templates/ … (Ctrl+C to stop)');
  chokidar.watch([path.join(ROOT, 'content'), path.join(ROOT, 'templates')], { ignoreInitial: true, ignored: /index\.json$/ }).on('all', (_, f) => { if (/\.(md|html)$/.test(f)) { log.info('changed: ' + path.relative(ROOT, f)); try { build(); } catch (e) { console.error(e); } } });
}
