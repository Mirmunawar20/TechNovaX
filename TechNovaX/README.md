# ⚡ TechNovaX — Premium Animated Tech Blog (v2)

Static, super-fast, SEO-ready tech blog with CMS, free tools, ad slots and PWA.
No framework, no database — host anywhere (Netlify, Vercel, Cloudflare Pages, GitHub Pages w/ custom domain at root).

## 1) Live করার সবচেয়ে সহজ উপায় (Netlify)
1. GitHub-এ নতুন repo বানিয়ে এই ফোল্ডারের সব ফাইল আপলোড করুন (`node_modules` ছাড়া)।
2. Netlify → **Add new site → Import from Git** → repo সিলেক্ট করুন। Build settings অটো (`netlify.toml`) নেবে।
3. **Site settings → Identity → Enable**, তারপর **Services → Git Gateway → Enable** → নিজেকে Invite করুন।
4. `https://আপনার-সাইট/admin/` এ লগইন করে আর্টিকেল/ভিডিও লিখুন — Save করলেই সাইট অটো আপডেট।

> ড্র্যাগ-ড্রপ করতেও পারেন: ফোল্ডারটা সরাসরি Netlify Drop-এ ফেলুন (বিল্ড করা ফাইল ভেতরেই আছে)। তবে CMS (`/admin`) কাজ করতে Git সংযোগ লাগবে।

## 2) নিজের তথ্য বসান — শুধু `assets/js/config.js`
| সেটিং | কী করে |
|---|---|
| `siteUrl` | আপনার ডোমেইন (sitemap, share preview, canonical এর জন্য) |
| `contactEmail`, `adsEmail` | Contact ও Advertise বাটনের ইমেইল |
| `ga` | Google Analytics 4 ID (`G-…`) — ভিজিটর কুকি accept করলে চালু হয় |
| `adsense.client` + `slots` | AdSense ID দিলেই `top / mid / article` অ্যাড স্লটে অ্যাড বসবে |
| `social` | Facebook/YouTube/… লিংক দিলে আইকন দেখাবে |
| `formEndpoint` | ফাঁকা = Netlify Forms (ডিফল্ট)। Formspree চাইলে URL বসান |

`siteUrl` বদলালে `npm install && npm run build` চালান।

## 3) নতুন কনটেন্ট যোগ করা
**CMS দিয়ে:** `/admin` → Articles → New। **অথবা** `content/articles/নাম.md` ফাইল বানান:

```md
---
title: "আপনার টাইটেল"
date: "2026-10-20T10:00:00.000Z"
category: "Networking"      # Networking | CCTV | Development | Hardware | Mobile | AI
description: "Google ও Facebook শেয়ারে যে লেখাটা দেখাবে"
thumbnail: "/uploads/cover.jpg"   # ঐচ্ছিক
featured: false
tags: ["router"]
---
লেখা এখানে…
```
ভিডিওর জন্য `content/videos/…md` এ `video_url: "https://youtu.be/…"` দিন।
প্রতিটি পোস্ট নিজস্ব পেজ (`/articles/slug/`) হিসেবে বিল্ড হয় → Google ইনডেক্স + Facebook/WhatsApp প্রিভিউ ঠিকমতো দেখায়।

## 4) লোকালি চালানো
```bash
npm install
npm run build      # কনটেন্ট → পেজ, sitemap, rss
npm run serve      # http://localhost:3000
```

## 5) যা আছে
- Preloader, canvas network animation, typing terminal, 3D tilt, spotlight cards, magnetic buttons, scroll reveal, counters
- Dark/Light theme, Ctrl+K সার্চ, ফিল্টার, Load more, reading progress, TOC, কোড কপি, শেয়ার বাটন
- ফ্রি টুল: Subnet Calculator, Password Generator, Download Time (ব্যাকলিংক ও রিটার্নিং ভিজিটরের জন্য দারুণ)
- Ad slots + কুকি কনসেন্ট (GDPR-friendly), Privacy/Terms/Disclaimer পেজ, `ads.txt` টেমপ্লেট
- Advertise/Sponsor সেকশন (সরাসরি ক্লায়েন্ট ধরার জন্য), Newsletter ও Contact ফর্ম
- SEO: JSON-LD, Open Graph, sitemap.xml, rss.xml, robots.txt · PWA: installable + offline

## 6) আর্ন করার বাস্তব ধাপ
1. **AdSense অনুমোদন:** অন্তত ২০–৩০টি নিজের লেখা মানসম্পন্ন আর্টিকেল + কাস্টম ডোমেইন + Privacy Policy (দেওয়া আছে)। তারপর apply করুন, অনুমোদন পেলে `config.js` ও `ads.txt` এ ID বসান।
2. **ভাইরাল/ট্রাফিক:** টুল ও "কীভাবে ঠিক করবেন" টাইপ গাইড লিখুন (Google সার্চ), প্রতিটি আর্টিকেল Facebook গ্রুপ/WhatsApp/YouTube Shorts এ শেয়ার করুন, YouTube ভিডিও এম্বেড করুন।
3. **সরাসরি আয়:** Advertise সেকশনের মাধ্যমে স্পনসর্ড পোস্ট বিক্রি করুন; Amazon/অন্যান্য affiliate লিংক দিন।
4. **সাইট বিক্রি করতে চাইলে:** এটি টেমপ্লেট হিসেবে (Gumroad, Fiverr, ফেসবুক গ্রুপ) বা কাস্টমাইজড সাইট হিসেবে ক্লায়েন্টকে দেওয়া যায়। ক্রেতাকে `config.js` + `/admin` গাইড দিন — মাত্র ১০ মিনিটে সে নিজের ব্র্যান্ড বসাতে পারবে।

> কোনো সাইটেরই ভাইরাল বা আয়ের নিশ্চয়তা কেউ দিতে পারে না — ধারাবাহিক ভালো কনটেন্টই আসল চাবিকাঠি। এই ফাইলগুলোর Privacy/Terms টেমপ্লেট সাধারণ; ব্যবসায়িক ব্যবহারের আগে নিজের তথ্য দিয়ে মিলিয়ে নিন।
