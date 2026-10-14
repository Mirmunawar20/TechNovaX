/* ============================================================
   TechNovaX — Google Analytics 4 (GA4)
   সম্পূর্ণ ট্র্যাকিং সিস্টেম
   
   ⚠️ শুরুর আগে: নিচের GA_MEASUREMENT_ID আপনার নিজের ID দিয়ে বদলান
   ============================================================ */

const GA_MEASUREMENT_ID = (window.TNX && window.TNX.ga) || '';

/* ---------- GA4 লোড (শুধু কুকি কনসেন্ট দিলে) ---------- */
function loadGA() {
    if (window.__gaLoaded) return;
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.includes('XXXX')) return;
    window.__gaLoaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: true,
        cookie_flags: 'SameSite=None;Secure',
        anonymize_ip: true
    });
}
(function () {
    let ok = false;
    try { ok = localStorage.getItem('tnx_consent') === 'granted'; } catch (e) {}
    if (ok) loadGA();
    window.addEventListener('tnx:consent', loadGA);
})();

/* ---------- Event Tracker ---------- */
const Track = {
    /* বেসিক ইভেন্ট */
    event(name, params = {}) {
        if (!window.gtag) return;
        window.gtag('event', name, {
            ...params,
            timestamp: new Date().toISOString()
        });
        if (window.location.hostname === 'localhost') {
            console.log(`[Analytics] ${name}`, params);
        }
    },

    /* পেজ ভিউ (SPA-এর জন্য) */
    pageView(path, title) {
        if (!window.gtag) return;
        window.gtag('event', 'page_view', {
            page_path: path,
            page_title: title,
            page_location: window.location.href
        });
    },

    /* স্ক্রল ডেপথ */
    scrollDepth() {
        const marks = [25, 50, 75, 90, 100];
        const fired = new Set();
        const handler = () => {
            const scrolled = window.scrollY + window.innerHeight;
            const height = document.documentElement.scrollHeight;
            const pct = Math.round((scrolled / height) * 100);
            marks.forEach(mark => {
                if (pct >= mark && !fired.has(mark)) {
                    fired.add(mark);
                    Track.event('scroll_depth', {
                        percent: mark,
                        page: window.location.pathname
                    });
                }
            });
        };
        window.addEventListener('scroll', handler, { passive: true });
    },

    /* রিডিং টাইম */
    readingTime() {
        const start = Date.now();
        window.addEventListener('beforeunload', () => {
            const seconds = Math.round((Date.now() - start) / 1000);
            Track.event('reading_time', {
                seconds,
                page: window.location.pathname
            });
        });
    },

    /* বাইরের লিংক */
    outboundLinks() {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href^="http"]');
            if (!a) return;
            const host = new URL(a.href).hostname;
            if (!host.includes(window.location.hostname)) {
                Track.event('outbound_click', {
                    url: a.href,
                    domain: host
                });
            }
        });
    },

    /* ফাইল ডাউনলোড */
    downloads() {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[download], a[href$=".pdf"], a[href$=".zip"]');
            if (a) {
                Track.event('file_download', { file: a.href });
            }
        });
    },

    /* সার্চ ইভেন্ট */
    searchTracking() {
        let lastQuery = '';
        const input = document.getElementById('searchInput');
        if (!input) return;
        let timer;
        input.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const q = e.target.value.trim();
                if (q.length > 2 && q !== lastQuery) {
                    lastQuery = q;
                    Track.event('search', { search_term: q });
                }
            }, 800);
        });
    },

    /* থিম টগল */
    themeToggle() {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            Track.event('theme_change', {
                theme: document.documentElement.getAttribute('data-theme')
            });
        });
    },

    /* ক্যাটাগরি ক্লিক */
    categoryClicks() {
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                Track.event('category_click', {
                    category: card.dataset.category
                });
            });
        });
    },

    /* কনটেন্ট ক্লিক */
    contentClicks() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.tutorial-card, .video-list-item');
            if (!card) return;
            Track.event('content_click', {
                title: card.querySelector('h3, h4')?.textContent || '',
                slug: card.dataset.slug || ''
            });
        });
    },

    /* সোশ্যাল শেয়ার */
    socialShares() {
        document.querySelectorAll('[data-share]').forEach(btn => {
            btn.addEventListener('click', () => {
                Track.event('share', {
                    method: btn.dataset.share,
                    content_type: 'article'
                });
            });
        });
    },

    /* ভিডিও প্লে ট্র্যাক */
    videoPlays() {
        // YouTube iframe থেকে মেসেজ শুনে ট্র্যাক
        window.addEventListener('message', (e) => {
            if (!e.origin.includes('youtube.com')) return;
            try {
                const data = JSON.parse(e.data);
                if (data.event === 'video-progress' || data.info) {
                    // প্লে হয়েছে
                }
            } catch {}
        });

        // HTML5 ভিডিও
        document.querySelectorAll('video').forEach(video => {
            video.addEventListener('play', () => {
                Track.event('video_play', { src: video.src || video.currentSrc });
            });
            video.addEventListener('ended', () => {
                Track.event('video_complete', { src: video.src || video.currentSrc });
            });
        });
    },

    /* ফর্ম সাবমিট */
    formSubmits() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                Track.event('form_submit', {
                    form_id: form.id || 'unknown',
                    form_action: form.action || 'inline'
                });
            });
        });
    },

    /* 404 Error */
    pageErrors() {
        window.addEventListener('error', (e) => {
            Track.event('exception', {
                description: e.message,
                fatal: false,
                file: e.filename,
                line: e.lineno
            });
        });
    },

    /* পারফরম্যান্স */
    performance() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const nav = performance.getEntriesByType('navigation')[0];
                if (!nav) return;
                Track.event('page_performance', {
                    load_time: Math.round(nav.loadEventEnd - nav.startTime),
                    dom_ready: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
                    ttfb: Math.round(nav.responseStart - nav.startTime)
                });
            }, 0);
        });
    }
};

/* ---------- সব ট্র্যাকিং চালু ---------- */
document.addEventListener('DOMContentLoaded', () => {
    Track.scrollDepth();
    Track.readingTime();
    Track.outboundLinks();
    Track.downloads();
    Track.searchTracking();
    Track.themeToggle();
    Track.categoryClicks();
    Track.contentClicks();
    Track.socialShares();
    Track.videoPlays();
    Track.formSubmits();
    Track.pageErrors();
    Track.performance();
});