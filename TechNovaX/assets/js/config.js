/* ============================================================
   TechNovaX — SITE CONFIG  (শুধু এই ফাইল এডিট করলেই সাইট কাস্টমাইজ হবে)
   ============================================================ */
window.TNX = {
  siteName: 'TechNovaX',
  tagline: 'Technology Made Simple',
  siteUrl: 'https://technovax.netlify.app',      // ← নিজের ডোমেইন বসান
  contactEmail: 'mirmunawar20@gmail.com',          // ← নিজের ইমেইল
  adsEmail: 'ads@technovax.com',                  // ← অ্যাড/স্পনসর ইমেইল

  /* Google Analytics 4  — ফাঁকা রাখলে বন্ধ থাকবে */
  ga: 'G-XXXXXXXXXX',

  /* Google AdSense — client ID দিলেই সব অ্যাড স্লট চালু হবে */
  adsense: {
    client: '',                                   // যেমন: 'ca-pub-1234567890123456'
    slots: { top: '', mid: '', article: '', sidebar: '' }   // প্রতিটি অ্যাড ইউনিটের slot ID
  },

  /* ফর্ম: Netlify Forms ডিফল্ট। Formspree ইত্যাদি চাইলে endpoint দিন */
  formEndpoint: '',

  /* সোশ্যাল লিংক — ফাঁকা থাকলে আইকন লুকানো থাকবে */
  social: {
    facebook: '', youtube: 'https://www.youtube.com/@techlarn24', twitter: '', github: '', telegram: '', whatsapp: ''
  }
};
