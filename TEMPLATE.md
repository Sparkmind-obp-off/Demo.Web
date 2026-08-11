# MASTER TEMPLATE v1.0 — Panduan Clone untuk Klien Baru

Dokumen ini menjelaskan **cara mengubah template ini menjadi website klien**
tanpa menulis kode baru.

Prinsipnya satu: **semua data bisnis ada di `src/config.ts`.**
Selama kamu hanya mengedit file itu + mengganti gambar, website akan tetap konsisten.

---

## Alur kerja standar (±1–2 jam per klien)

```
clone repo
   ↓
edit src/config.ts        ← seluruh data bisnis
   ↓
ganti public/static/img/  ← foto klien
   ↓
matikan mode demo         ← demo.enabled = false
   ↓
npm run build && QA
   ↓
deploy Cloudflare Pages
```

---

## 1. Clone project

```bash
git clone <repo-url> client-namaklien
cd client-namaklien
rm -rf .git && git init
npm install
```

Ganti nama project di 3 tempat:

| File | Field |
|---|---|
| `package.json` | `name`, `description` |
| `wrangler.jsonc` | `name` (jadi subdomain `*.pages.dev`) |
| `ecosystem.config.cjs` | `apps[0].name` |

---

## 2. Edit `src/config.ts` — satu-satunya file data

File ini dibagi menjadi 10 bagian bernomor. Kerjakan berurutan.

### Bagian 1 — MODE DEMO

```ts
export const demo = { enabled: true, ... }
```

| Nilai | Efek |
|---|---|
| `true` | Badge "Demo" di navbar & footer, testimoni ditandai contoh, rating/review **tidak** dikirim ke Google, halaman `noindex` |
| `false` | Website tampil sebagai bisnis nyata, boleh diindeks Google |

> ⚠️ **Untuk klien nyata WAJIB `false`** — tetapi hanya setelah **seluruh** data
> di bawah sudah diganti data asli. Kalau masih ada placeholder, biarkan `true`.

### Bagian 2 — JAM OPERASIONAL

```ts
export const hoursByDay: DayHours[] = [ ... ]   // index 0 = Minggu … 6 = Sabtu
```

Ini **sumber tunggal** yang dipakai untuk 3 hal sekaligus:
- badge "Buka sekarang / Tutup" (dihitung live di browser)
- penyaringan slot jam di form booking
- `openingHoursSpecification` pada structured data (SEO)

Hari libur:
```ts
{ open: '00:00', close: '00:00', closed: true }
```

Setelah mengubah ini, **sesuaikan juga `business.hours`** (Bagian 3) yang
merupakan versi tampilan untuk mata manusia, termasuk field `days`.

### Bagian 3 — IDENTITAS BISNIS & KONTAK

Checklist wajib ganti:

- [ ] `name`, `brandParts` (2 kata: tebal + aksen), `tagline`
- [ ] `city`, `region`
- [ ] `siteUrl` → domain produksi, **tanpa trailing slash**
- [ ] `whatsappNumber` → format `628xxxxxxxxx` (tanpa `+`, tanpa spasi)
- [ ] `whatsappDisplay` → versi yang dibaca manusia
- [ ] `whatsappIsPlaceholder` → **`false`** setelah nomor asli dipasang
- [ ] `address`, `addressShort`, `addressIsPlaceholder: false`
- [ ] `mapsEmbedUrl`, `mapsLinkUrl` (cara ambil di bawah)
- [ ] `instagramUrl`, `instagramHandle`
- [ ] `hours` (tampilan) + `days` per baris
- [ ] `bookingSlots` → jam yang boleh dipilih pelanggan
- [ ] `utcOffset` → WIB `7`, WITA `8`, WIT `9`

**Cara ambil Google Maps embed:**
Google Maps → cari lokasi → **Share** → tab **Embed a map** → copy isi `src="..."`
→ tempel ke `mapsEmbedUrl`.

### Bagian 4 — SEO

- `title` → pola aman: `NAMA BISNIS | Kategori Kota` (maks ±60 karakter)
- `description` → 1–2 kalimat, ±150 karakter
- `schemaType` → sesuaikan jenis bisnis:

| Jenis bisnis | `schemaType` |
|---|---|
| Barbershop / salon | `HairSalon` |
| Kafe / restoran | `CafeOrCoffeeShop` / `Restaurant` |
| Fotografer | `LocalBusiness` |
| Wedding organizer | `LocalBusiness` |
| Klinik / dokter | `MedicalBusiness` |
| Bengkel | `AutoRepair` |

### Bagian 5 — HIGHLIGHT / TRUST BAR

⚠️ **Jangan mengarang angka.** Isi hanya klaim yang bisa dibuktikan klien.
Kalau klien punya data asli (mis. `8 Tahun`, `4.9★ Google`), baru pakai angka.

Icon yang tersedia: lihat `src/icons.ts`
(`users`, `clock`, `scissors`, `sparkle`, `check`, `mapPin`, `phone`,
`instagram`, `map`, `star`, `calendar`, …).

### Bagian 6 — LAYANAN & HARGA

```ts
{ name, price, duration, description, benefit?, featured? }
```

- `price` ditulis apa adanya (`'Rp50.000'`) — `priceRange` di structured data
  dihitung otomatis dari angka ini, jadi tidak perlu diedit terpisah.
- `featured: true` → kartu diberi badge **Popular**. Cukup **satu** layanan.
- Jumlah ideal **3–6** layanan. Grid otomatis menyesuaikan.

### Bagian 7 — TIM

Ganti nama, `role`, `bio`, dan `photo`.
Foto: rasio **3:4 (portrait)**, disarankan 896×1200.

Kalau klien tidak ingin menampilkan tim: kosongkan array (`export const team = []`)
— section tetap aman, tetapi pilihan barber di form booking juga akan hilang.

### Bagian 8 — GALERI

Rasio bebas, tapi **konsisten** agar grid rapi. `alt` wajib deskriptif (SEO + aksesibilitas).
Jumlah ideal 6 foto (grid asimetris sudah diatur untuk 6).

### Bagian 9 — TESTIMONI

⚠️ **Aturan trust yang tidak boleh dilanggar:**
Untuk klien nyata, pakai **hanya ulasan asli** (Google Review / WhatsApp /
Instagram) **dengan izin pelanggan**. Jangan pernah mengarang review.

Selama `demo.enabled = true`, testimoni otomatis diberi label "Data contoh"
dan **tidak** dikirim sebagai `review`/`aggregateRating` ke Google.

### Bagian 10 — NAVIGASI

Sesuaikan bila ada section yang dihapus. `href` harus cocok dengan `id` section
di `src/page.ts`.

---

## 3. Ganti gambar

Semua di `public/static/img/`. **Pertahankan nama file** supaya `config.ts`
tidak perlu diubah, atau ubah path di config.

| File | Rasio | Ukuran disarankan |
|---|---|---|
| `hero.webp` | 16:9 | 1376×768 |
| `barber-*.webp` | 3:4 | 896×1200 |
| `gallery-*.webp` | bebas, konsisten | ±1200px sisi panjang |
| `favicon.svg` | 1:1 | SVG |

**Wajib format `.webp`** dan usahakan < 200 KB per file:

```bash
# konversi + resize
npx @squoosh/cli --webp '{"quality":80}' -d public/static/img foto-asli.jpg
```

Setelah mengganti hero, sesuaikan `width`/`height` pada `<img>` hero di
`src/page.ts` agar tidak terjadi layout shift (CLS).

---

## 4. Matikan mode demo

```ts
export const demo = { enabled: false, ... }
```

Lalu pastikan:

- [ ] `whatsappIsPlaceholder: false`
- [ ] `addressIsPlaceholder: false`
- [ ] `siteUrl` = domain final
- [ ] testimoni sudah ulasan asli
- [ ] `stats` tidak mengandung angka karangan

Efek otomatis: badge demo hilang, `robots.txt` jadi `Allow: /`,
`noindex` dilepas, `telephone` masuk structured data, `aggregateRating` &
`review` mulai dikirim (**hanya aman kalau reviewnya asli**).

---

## 5. Build & QA lokal

```bash
npm run build
pm2 start ecosystem.config.cjs
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000   # harus 200
```

Checklist QA sebelum deploy:

- [ ] Semua CTA membuka booking sheet
- [ ] Pesan WhatsApp terbentuk rapi dan nomornya benar
- [ ] Badge Buka/Tutup sesuai jam klien
- [ ] Hari libur → seluruh slot nonaktif + pesan "Tanggal ini libur"
- [ ] Galeri + lightbox (klik, panah, Escape, swipe)
- [ ] Peta menampilkan lokasi yang benar
- [ ] Tidak ada horizontal scroll di 360px
- [ ] Tidak ada error di console browser
- [ ] `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` benar
- [ ] Halaman 404 tampil on-brand

---

## 6. Deploy

```bash
npx wrangler pages project create <nama-project> \
  --production-branch main --compatibility-date 2024-01-01
npm run build
npx wrangler pages deploy dist --project-name <nama-project>
```

Custom domain: **Cloudflare Dashboard → Pages → project → Custom domains**.
Setelah domain aktif, update `business.siteUrl` lalu deploy ulang
(canonical, Open Graph, dan sitemap ikut domain ini).

---

## Yang TIDAK perlu disentuh

| File | Alasan |
|---|---|
| `src/page.ts` | Struktur HTML; sudah membaca semua data dari config |
| `src/index.ts` | Routing, robots, sitemap, manifest, 404 — otomatis dari config |
| `src/icons.ts` | Kumpulan ikon SVG |
| `public/static/app.js` | Interaksi; membaca config lewat `<script id="site-data">` |
| `public/static/style.css` | Ubah hanya `:root` bila ganti warna brand |
| `public/_headers` | Security & cache headers |

**Ganti warna brand** cukup di `:root` (`public/static/style.css`):

```css
--accent: #c8a45d;   /* warna aksen utama */
--black:  #08090a;   /* latar */
```

Kalau `--black` diubah, sinkronkan juga `theme-color` di `src/page.ts`
dan `background_color`/`theme_color` di manifest (`src/index.ts`).

---

## Adaptasi ke jenis bisnis lain

Struktur section sudah generik — biasanya cukup mengganti label:

| Section | Barbershop | Kafe | Fotografer |
|---|---|---|---|
| Services | Layanan & harga | Menu | Paket foto |
| Team | Barber | Barista | Fotografer |
| Gallery | Hasil potongan | Suasana & menu | Portfolio |
| Booking | Booking kursi | Reservasi meja | Jadwal sesi |

Yang perlu diubah: `navLinks` (label), `seo.schemaType`, dan judul section di
`src/page.ts`. Arsitektur config tidak berubah.

---

## Aturan FREEZE

Master ini **dibekukan** pada v1.0. Pekerjaan klien dilakukan dengan:

```
CLONE → CONFIGURE → CUSTOMIZE → QA → DEPLOY
```

**bukan** dengan menambah fitur ke master. Fitur baru hanya masuk ke master
bila terbukti dibutuhkan oleh **lebih dari satu** klien nyata.
