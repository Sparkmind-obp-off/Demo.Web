# NOIR BARBER — Premium Barbershop Landing Page

## Project Overview

- **Nama**: NOIR BARBER
- **Tagline**: *Your Style. Your Signature.*
- **Tujuan**: Demo portfolio landing page premium untuk bisnis barbershop — siap dikirim ke calon client agar mereka langsung bisa membayangkan website ini dipakai untuk bisnis mereka sendiri.
- **Positioning**: modern, premium, maskulin, clean · Bahasa Indonesia
- **Stack**: Hono + TypeScript + Vanilla CSS/JS (zero framework frontend) di Cloudflare Pages

## URLs

- **Production**: https://noir-barber.pages.dev
- **Deployment terbaru**: https://6dc5802b.noir-barber.pages.dev
- **GitHub**: https://github.com/Sparkmind-obp-off/Demo.Web
- **API health**: https://noir-barber.pages.dev/api/health
- **API services**: https://noir-barber.pages.dev/api/services
- **Sitemap**: https://noir-barber.pages.dev/sitemap.xml

## Fitur yang Sudah Selesai

### Struktur Halaman
1. **Navbar sticky** — logo, 6 menu, CTA "Book Now", hamburger + full-screen menu di mobile
2. **Hero cinematic** — headline dua baris, subheadline, dua CTA, **badge status Buka/Tutup live**
3. **Trust bar** — 500+ Happy Clients · 5+ Years · Professional Barbers · Premium Products
4. **Services** — 4 kartu layanan (Rp50rb–Rp150rb) dengan harga, estimasi durasi, badge "Popular", CTA per layanan
5. **About** — storytelling + 4 poin diferensiasi
6. **Barber Team** — Arga, Dimas, Raka (foto + spesialisasi)
7. **Gallery** — 6 foto masonry, **klik untuk lightbox**
8. **Reviews** — 3 testimonial realistis dengan rating bintang
9. **Booking CTA** — section konversi utama
10. **Location** — alamat, jam buka, WhatsApp, Instagram, Google Maps embed
11. **Footer** — brand, tagline, 3 social link
12. **Sticky WhatsApp CTA** — muncul saat scroll di mobile

### Fitur Interaktif (Upgrade)
- **Booking Sheet** — pelanggan memilih **layanan + barber + tanggal + jam + nama**, lalu semuanya dirangkai otomatis menjadi satu pesan WhatsApp terstruktur. Live summary preview sebelum kirim. Tanpa backend, tanpa database, tanpa login.
  - Klik "Book Now" pada kartu layanan → layanan tersebut otomatis terpilih
  - Tanggal dibatasi hari ini s/d 30 hari ke depan (zona **Asia/Jakarta**)
  - Tombol kirim sticky di mobile
- **Lightbox Gallery** — navigasi via klik, tombol prev/next, **keyboard arrow kiri/kanan**, **swipe** di layar sentuh, `Esc` untuk tutup, counter `1 / 6`
- **Badge Status Buka/Tutup** — dihitung live di browser berdasarkan jam operasional WIB, refresh tiap 60 detik. Menampilkan "tutup dalam N menit" bila mendekati jam tutup.

### Teknis
- **Accessibility**: skip-link, semantic HTML (`<header>`/`<nav>`/`<main>`/`<section>`/`<article>`/`<footer>`), heading hierarchy benar, `aria-modal` + **focus trap** pada sheet & lightbox, `aria-expanded`, `aria-current` pada nav aktif, `aria-live` pada summary, focus-visible ring, `prefers-reduced-motion` dihormati
- **Performance**: zero dependency JS runtime (vanilla, ~11KB), gambar WebP + `loading="lazy"`, hero `preload` + `fetchpriority="high"`, inline SVG icon (nol request icon font), worker bundle ~51KB
- **SEO**: title/description/keywords, canonical + Open Graph + Twitter Card dengan **URL absolut**, JSON-LD `HairSalon` lengkap (alamat, jam operasional, katalog layanan + harga, `aggregateRating`, `review`), `sitemap.xml`, `robots.txt`, `manifest.webmanifest`
- **Responsive**: mobile-first, breakpoint 1024 / 760 / 560 / 420px, `env(safe-area-inset-*)` untuk iPhone notch
- **404 on-brand** — halaman error tetap dark aesthetic

## Data Architecture

- **Storage**: **Tidak ada** — situs sepenuhnya statis/SSR di edge. Tidak ada D1/KV/R2 karena tidak ada data yang perlu dipersist (booking dikirim langsung ke WhatsApp).
- **Single source of truth**: seluruh data bisnis ada di **`src/config.ts`**
  - `business` — nama, tagline, siteUrl, nomor WhatsApp, pesan default, alamat, Maps URL, Instagram, jam buka, `hoursByDay` (untuk badge status), `bookingSlots`
  - `seo` — title, description, keywords, locale
  - `stats`, `services`, `team`, `gallery`, `testimonials`, `navLinks`
  - `waLink()` — helper pembentuk URL WhatsApp
- **Data flow**: `config.ts` → `page.ts` (render HTML string di edge) → browser. Fitur interaktif dibaca client-side dari `href` CTA dan `<script type="application/json">`.

## Cara Mengganti Data untuk Client Baru

Semua yang perlu diedit ada di **`src/config.ts`**:

| Yang diganti | Field |
|---|---|
| Nomor WhatsApp | `business.whatsappNumber` (format `62…`, tanpa `+`) & `whatsappDisplay` |
| Nama & tagline | `business.name`, `business.tagline` |
| Domain produksi | `business.siteUrl` (dipakai canonical/OG/sitemap) |
| Alamat & Maps | `business.address`, `mapsEmbedUrl`, `mapsLinkUrl` |
| Jam buka | `business.hours` (tampilan) + `business.hoursByDay` (logika badge, index 0 = Minggu) |
| Harga & layanan | array `services` |
| Barber | array `team` |
| Testimonial | array `testimonials` |
| Foto | ganti file di `public/static/img/` |

Setelah edit: `npm run build` lalu deploy.

> Catatan: `hoursByDay` juga direplikasi di `public/static/app.js` (konstanta `HOURS`) karena badge dihitung di browser. Ubah keduanya bila jam operasional berubah.

## User Guide

1. Buka https://noir-barber.pages.dev
2. Badge di hero menunjukkan barbershop sedang **Buka** atau **Tutup** saat ini (WIB)
3. Klik **BOOK VIA WHATSAPP** / **BOOK NOW** (mana saja) → booking sheet terbuka
4. Pilih layanan, barber (opsional), tanggal, jam, dan nama
5. Klik **KIRIM KE WHATSAPP** → WhatsApp terbuka dengan pesan booking yang sudah lengkap dan rapi
6. Klik foto di **Gallery** untuk memperbesar; navigasi dengan panah, swipe, atau tombol; `Esc` untuk tutup

## Development

```bash
npm install
npm run build                        # build ke dist/
pm2 start ecosystem.config.cjs       # jalankan di sandbox (port 3000)
curl http://localhost:3000/api/health
```

## API Endpoints

| Method | Path | Keterangan |
|---|---|---|
| GET | `/` | Landing page |
| GET | `/api/health` | Health check |
| GET | `/api/services` | Daftar layanan + harga (JSON) |
| GET | `/sitemap.xml` | Sitemap |
| GET | `/manifest.webmanifest` | Web App Manifest |
| GET | `/robots.txt` | Robots |
| GET | `/static/*` | Aset statis (CSS, JS, gambar, favicon) |

## Belum Diimplementasikan (di luar scope demo)

- Sistem booking dengan database & slot real-time (butuh D1 + admin panel)
- Login / dashboard admin
- Sistem pembayaran / deposit online
- Halaman blog atau multi-page routing
- Multi-bahasa (saat ini Indonesia saja)
- Google Analytics / pixel tracking
- Notifikasi otomatis (email/WA API resmi)

## Rekomendasi Langkah Berikutnya

1. **Ganti placeholder** — nomor WhatsApp (`6281234567890`), URL Google Maps embed, dan handle Instagram dengan data client sebenarnya
2. **Foto asli** — ganti 9 gambar di `public/static/img/` dengan foto barbershop client (WebP, kompres < 100KB)
3. **Custom domain** — bind domain client: `npx wrangler pages domain add <domain> --project-name noir-barber`, lalu update `business.siteUrl`
4. **Google Business Profile** — hubungkan agar JSON-LD `HairSalon` terindeks maksimal di local search
5. **Analytics** — tambahkan Cloudflare Web Analytics (gratis, tanpa cookie banner)
6. **Upgrade opsional** — bila client mau booking dengan slot real-time, tambah Cloudflare D1 + halaman admin sederhana

## Deployment

- **Platform**: Cloudflare Pages (BYOK — akun Cloudflare milik user)
- **Project name**: `noir-barber`
- **Production branch**: `main`
- **Status**: ✅ Active (verified — semua route balik `200`)
- **Tech Stack**: Hono 4 + TypeScript + Vite + Vanilla CSS/JS
- **Storage**: tidak ada (situs stateless)
- **Bundle**: `dist/_worker.js` ≈ 54 kB
- **Last Updated**: 2026-08-11

### Cara Redeploy

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name noir-barber --branch main
```
