import {
  business,
  demo,
  seo,
  stats,
  services,
  team,
  gallery,
  testimonials,
  navLinks,
  clientConfig,
  waLink
} from './config'
import { icon } from './icons'

const wa = waLink()
const abs = (path: string) => `${business.siteUrl}${path}`

/**
 * Navigasi aktif — link menuju section yang dimatikan lewat config
 * (mis. `team = []`) otomatis dibuang agar tidak ada anchor mati.
 */
const activeNav = navLinks.filter((l) => (l.href === '#team' ? team.length > 0 : true))

const waService = (name: string) =>
  waLink(
    `Halo ${business.name}, saya ingin melakukan booking untuk layanan ${name}. Apakah masih tersedia jadwal hari ini?`
  )

const esc = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** JSON aman untuk ditanam di dalam <script> (mencegah penutupan tag dini). */
const safeJson = (v: unknown) =>
  JSON.stringify(v).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')

/** Penanda kecil "data contoh" — hanya tampil saat mode demo aktif. */
const sampleTag = (text: string = demo.sampleNote) =>
  demo.enabled ? `<span class="sample-tag">${esc(text)}</span>` : ''

/**
 * openingHoursSpecification dibangun langsung dari `business.hoursByDay`
 * sehingga jam pada structured data tidak pernah berbeda dengan jam yang
 * dipakai badge "Buka/Tutup" maupun penyaring slot booking.
 * Hari dengan jam identik digabung menjadi satu entri (lebih ringkas).
 */
const SCHEMA_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const

function openingHoursSpec() {
  const groups = new Map<string, { days: string[]; opens: string; closes: string }>()

  business.hoursByDay.forEach((h, i) => {
    if (h.closed) return
    const key = `${h.open}-${h.close}`
    const group = groups.get(key)
    if (group) group.days.push(SCHEMA_DAYS[i])
    else groups.set(key, { days: [SCHEMA_DAYS[i]], opens: h.open, closes: h.close })
  })

  return Array.from(groups.values()).map((g) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: g.days.length === 1 ? g.days[0] : g.days,
    opens: g.opens,
    closes: g.closes
  }))
}

/** Rentang harga otomatis dari daftar layanan (tidak perlu diedit manual). */
function priceRange(): string {
  const nums = services
    .map((s) => Number(s.price.replace(/[^0-9]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0)
  if (!nums.length) return ''
  const fmt = (n: number) => 'Rp' + n.toLocaleString('id-ID')
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? fmt(min) : `${fmt(min)} - ${fmt(max)}`
}

/* ---------------- Structured data (SEO) ----------------
   Aturan penting: JANGAN pernah mengirim rating / review / jumlah
   pelanggan fiktif ke mesin pencari. Saat mode demo aktif, blok
   aggregateRating & review sengaja DIHILANGKAN.                     */
const jsonLd: Record<string, unknown> = {
  '@context': 'https://schema.org',
  '@type': seo.schemaType,
  name: business.name,
  description: seo.description,
  slogan: business.tagline,
  url: business.siteUrl,
  image: abs('/static/img/hero.webp'),
  priceRange: priceRange(),
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.addressShort,
    addressLocality: business.city,
    addressRegion: business.region,
    addressCountry: business.country
  },
  openingHoursSpecification: openingHoursSpec(),
  sameAs: [business.instagramUrl],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: `Layanan ${business.name}`,
    itemListElement: services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.name, description: s.description },
      price: s.price.replace(/[^0-9]/g, ''),
      priceCurrency: 'IDR'
    }))
  }
}

// Nomor telepon hanya dicantumkan bila BUKAN placeholder.
if (!business.whatsappIsPlaceholder) {
  jsonLd.telephone = '+' + business.whatsappNumber
}

// Rating & review hanya untuk data asli klien (mode demo mati).
if (!demo.enabled) {
  jsonLd.aggregateRating = {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: String(testimonials.length),
    bestRating: '5'
  }
  jsonLd.review = testimonials.map((t) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: t.name },
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: t.quote
  }))
}

/* ---------------- Sections ---------------- */

/** Lightbox gallery — dibuka lewat tombol pada setiap foto. */
const lightbox = () => `
<div class="lb" id="lightbox" hidden>
  <div class="lb__backdrop" data-lb-close></div>

  <div class="lb__inner" role="dialog" aria-modal="true" aria-label="Galeri foto ${esc(business.name)}">
    <button class="lb__close" type="button" data-lb-close aria-label="Tutup galeri">${icon('close')}</button>
    <button class="lb__nav lb__nav--prev" type="button" data-lb-prev aria-label="Foto sebelumnya">${icon('chevronLeft')}</button>
    <button class="lb__nav lb__nav--next" type="button" data-lb-next aria-label="Foto berikutnya">${icon('chevronRight')}</button>

    <figure class="lb__figure">
      <img id="lb-img" src="${gallery[0].src}" alt="${esc(gallery[0].alt)}"
           width="${gallery[0].w}" height="${gallery[0].h}" decoding="async" loading="lazy">
      <figcaption class="lb__cap">
        <span id="lb-cap"></span>
        <span class="lb__count" id="lb-count"></span>
      </figcaption>
    </figure>
  </div>
</div>`

const brandMark = (extraClass = '') =>
  `<span class="brand${extraClass ? ' ' + extraClass : ''}">${esc(business.brandParts[0])}<span>${esc(
    business.brandParts[1]
  )}</span></span>`

const navbar = () => `
<header class="nav" id="navbar">
  <div class="container nav__inner">
    <div class="nav__brand">
      <a class="brand-link" href="#home" aria-label="${esc(business.name)} — kembali ke atas">
        ${brandMark()}
      </a>
      ${
        demo.enabled
          ? `<span class="demo-badge" title="${esc(demo.label)}">${esc(demo.badge)}</span>`
          : ''
      }
    </div>

    <nav aria-label="Navigasi utama">
      <ul class="nav__links">
        ${activeNav
          .map(
            (l) =>
              `<li><a class="nav__link" href="${l.href}" data-nav>${esc(l.label)}</a></li>`
          )
          .join('')}
      </ul>
    </nav>

    <a class="btn btn--primary btn--sm nav__cta" href="${wa}" data-booking target="_blank" rel="noopener noreferrer">Book Now</a>

    <button class="nav__toggle" id="nav-toggle" type="button"
            aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="mobile-menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<div class="mobile-menu" id="mobile-menu" hidden>
  <nav aria-label="Navigasi mobile">
    <ul>
      ${activeNav
        .map(
          (l, i) =>
            `<li><a class="m-link" href="${l.href}" data-nav><span>${esc(l.label)}</span><span class="idx">0${
              i + 1
            }</span></a></li>`
        )
        .join('')}
    </ul>
  </nav>
  <div class="mobile-menu__foot">
    <a class="btn btn--primary btn--block" href="${wa}" data-booking target="_blank" rel="noopener noreferrer">
      ${icon('whatsapp')} Book via WhatsApp
    </a>
    <p class="mobile-menu__meta">${esc(business.address)}${
      demo.enabled ? ` · ${esc(demo.sampleNote)}` : ''
    }</p>
  </div>
</div>`

const hero = () => `
<section class="hero" id="home">
  <div class="hero__bg">
    <img src="/static/img/hero.webp" alt="Interior premium ${esc(business.name)} dengan pencahayaan hangat"
         width="1376" height="768" fetchpriority="high" decoding="async">
  </div>

  <div class="container hero__inner">
    <div class="hero__content">
      <p class="eyebrow">Premium Barbershop · ${esc(business.city)}</p>
      <h1>Your Style.<span class="line-2">Your Signature.</span></h1>
      <p class="hero__sub">
        Potongan presisi, grooming berkualitas, dan pengalaman barber yang dibuat
        untuk membuat penampilanmu lebih percaya diri.
      </p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="${wa}" data-booking target="_blank" rel="noopener noreferrer">
          ${icon('whatsapp')} Book via WhatsApp
        </a>
        <a class="btn btn--ghost" href="#services">
          Explore Services ${icon('arrowRight')}
        </a>
      </div>

      <p class="status" id="open-status" hidden>
        <span class="status__dot" aria-hidden="true"></span>
        <span class="status__text"></span>
      </p>
    </div>
  </div>

  <div class="hero__scroll" aria-hidden="true">
    <span>Scroll</span>
    <i></i>
  </div>
</section>`

const statsSection = () => `
<section class="stats" aria-label="Ringkasan keunggulan ${esc(business.name)}">
  <div class="stats__grid">
    ${stats
      .map(
        (s) => `
      <div class="stat">
        <div class="stat__icon">${icon(s.icon)}</div>
        <p class="stat__value">${esc(s.value)}</p>
        <p class="stat__label">${esc(s.label)}</p>
      </div>`
      )
      .join('')}
  </div>
</section>`

const servicesSection = () => `
<section class="section" id="services">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Services</p>
      <h2 class="section-title">Bukan sekadar potong rambut.</h2>
      <p class="section-sub">
        Setiap layanan dimulai dari konsultasi singkat — memastikan hasil akhir sesuai
        bentuk wajah, tekstur rambut, dan gaya harianmu.
      </p>
    </div>

    <div class="services__grid">
      ${services
        .map(
          (s) => `
        <article class="service reveal${s.featured ? ' service--featured' : ''}">
          ${s.featured ? '<span class="service__badge">Popular</span>' : ''}
          <h3 class="service__name">${esc(s.name)}</h3>
          <p class="service__duration">${esc(s.duration)}</p>
          <p class="service__desc">${esc(s.description)}</p>
          ${
            s.benefit
              ? `<p class="service__benefit">${icon('check')}<span>${esc(s.benefit)}</span></p>`
              : ''
          }
          <p class="service__price">${esc(s.price)}</p>
          <a class="btn btn--ghost btn--sm btn--block service__cta"
             href="${waService(s.name)}" data-booking data-service="${esc(s.name)}"
             target="_blank" rel="noopener noreferrer"
             aria-label="Book Now untuk layanan ${esc(s.name)}">Book Now</a>
        </article>`
        )
        .join('')}
    </div>
  </div>
</section>`

const aboutSection = () => `
<section class="section section--line" id="about">
  <div class="container about__grid">
    <div class="about__body reveal">
      <p class="eyebrow">About Us</p>
      <h2 class="section-title">Precision. Style. Experience.</h2>
      <p class="about__lead">
        Potongan rambut yang baik bukan soal cepat selesai, tapi soal detail yang
        diperhatikan. Setiap kunjungan dimulai dengan konsultasi — mendengar dulu,
        baru memotong.
      </p>
      <p>
        Ruang kami tenang dan bersih. Setiap alat disterilkan sebelum digunakan, dan
        produk grooming dipilih agar hasilnya rapi tanpa membebani rambut.
      </p>
      <ul class="about__points">
        <li>${icon('check')}<span>Konsultasi style sebelum setiap potongan</span></li>
        <li>${icon('check')}<span>Alat disterilkan, ruang selalu bersih</span></li>
        <li>${icon('check')}<span>Barber berpengalaman dengan spesialisasi masing-masing</span></li>
        <li>${icon('check')}<span>Produk grooming premium untuk hasil tahan lama</span></li>
      </ul>
    </div>

    <figure class="about__media reveal">
      <img src="/static/img/gallery-workspace.webp" loading="lazy" decoding="async"
           width="1200" height="896"
           alt="Peralatan barber premium tertata rapi di meja kerja ${esc(business.name)}">
    </figure>
  </div>
</section>`

/** Section tim — otomatis disembunyikan bila `team` dikosongkan di config. */
const teamSection = () =>
  team.length
    ? `
<section class="section section--line" id="team">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Our Team</p>
      <h2 class="section-title">Barber di balik hasilnya.</h2>
      <p class="section-sub">
        ${
          team.length > 1
            ? `${team.length} barber dengan keahlian berbeda — pilih yang paling sesuai dengan gaya yang kamu cari.`
            : 'Barber yang akan menangani kunjunganmu.'
        }
        ${sampleTag('Profil contoh')}
      </p>
    </div>

    <div class="team__grid">
      ${team
        .map(
          (m) => `
        <article class="member reveal">
          <div class="member__photo">
            <img src="${m.photo}" loading="lazy" decoding="async" width="896" height="1200"
                 alt="${esc(m.name)}, ${esc(m.role)} di ${esc(business.name)}">
          </div>
          <div class="member__info">
            <h3 class="member__name">${esc(m.name)}</h3>
            <p class="member__role">${esc(m.role)}</p>
            <p class="member__bio">${esc(m.bio)}</p>
          </div>
        </article>`
        )
        .join('')}
    </div>
  </div>
</section>`
    : ''

const gallerySection = () => `
<section class="section section--line" id="gallery">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Gallery</p>
      <h2 class="section-title">Hasil kerja kami.</h2>
      <p class="section-sub">
        Sekilas suasana, proses, dan hasil potongan di ${esc(business.name)}.
      </p>
    </div>

    <div class="gallery__grid">
      ${gallery
        .map(
          (g, i) => `
        <figure class="shot reveal">
          <button class="shot__btn" type="button" data-lightbox="${i}"
                  aria-label="Perbesar foto: ${esc(g.caption)}">
            <img src="${g.src}" loading="lazy" decoding="async"
                 width="${g.w}" height="${g.h}" alt="${esc(g.alt)}">
            <span class="shot__zoom" aria-hidden="true">${icon('expand')}</span>
          </button>
          <figcaption class="shot__cap">${esc(g.caption)}</figcaption>
        </figure>`
        )
        .join('')}
    </div>
  </div>
</section>`

const reviewsSection = () => `
<section class="section reviews" id="reviews">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Reviews</p>
      <h2 class="section-title">Kata mereka yang sudah datang.</h2>
      ${
        demo.enabled
          ? `<p class="section-sub">Testimoni di bawah adalah contoh isi untuk demo — pada website klien, bagian ini diisi ulasan asli pelanggan. ${sampleTag()}</p>`
          : ''
      }
    </div>

    <div class="reviews__grid">
      ${testimonials
        .map(
          (t) => `
        <figure class="review reveal">
          <div class="review__stars" role="img" aria-label="Rating 5 dari 5">
            ${icon('star').repeat(5)}
          </div>
          <blockquote class="review__quote">“${esc(t.quote)}”</blockquote>
          <figcaption class="review__by">
            <span class="review__avatar" aria-hidden="true">${esc(t.name.charAt(0))}</span>
            <span>
              <span class="review__name">${esc(t.name)}</span>
              <span class="review__detail">${esc(t.detail)}</span>
            </span>
          </figcaption>
        </figure>`
        )
        .join('')}
    </div>
  </div>
</section>`

const bookingSection = () => `
<section class="section booking" id="booking">
  <div class="container booking__inner reveal">
    <p class="eyebrow">Booking</p>
    <h2>Ready for your next look?</h2>
    <p>Pilih layanan dan jam kunjunganmu — detailnya langsung terkirim ke WhatsApp.</p>
    <a class="btn btn--primary" href="${wa}" data-booking target="_blank" rel="noopener noreferrer">
      ${icon('whatsapp')} Book via WhatsApp
    </a>
    <p class="booking__note">Tanpa pembayaran online · Walk-in tetap dilayani</p>
  </div>
</section>`

/**
 * Booking sheet: pelanggan memilih layanan, barber, tanggal, dan jam.
 * Semua pilihan dirangkai menjadi satu pesan WhatsApp yang rapi —
 * tanpa backend, tanpa database, tanpa login.
 */
const bookingModal = () => `
<div class="sheet" id="booking-sheet" hidden>
  <div class="sheet__backdrop" data-sheet-close></div>

  <div class="sheet__panel" role="dialog" aria-modal="true"
       aria-labelledby="sheet-title" aria-describedby="sheet-desc">
    <div class="sheet__head">
      <div>
        <p class="eyebrow" style="margin:0">Booking</p>
        <h2 class="sheet__title" id="sheet-title">Atur kunjunganmu</h2>
      </div>
      <button class="sheet__close" type="button" data-sheet-close aria-label="Tutup form booking">
        ${icon('close')}
      </button>
    </div>

    <p class="sheet__desc" id="sheet-desc">
      Pilih detailnya, lalu kami kirim otomatis ke WhatsApp untuk dikonfirmasi.
    </p>

    <form class="sheet__form" id="booking-form" novalidate>
      <fieldset class="field">
        <legend class="field__label">Layanan</legend>
        <div class="chips" role="radiogroup" aria-label="Pilih layanan">
          ${services
            .map(
              (s, i) => `
          <label class="chip">
            <input type="radio" name="service" value="${esc(s.name)}"
                   data-price="${esc(s.price)}" data-duration="${esc(s.duration)}"${
                     i === 1 ? ' checked' : ''
                   }>
            <span class="chip__body">
              <span class="chip__name">${esc(s.name)}</span>
              <span class="chip__meta">${esc(s.price)} · ${esc(s.duration)}</span>
            </span>
          </label>`
            )
            .join('')}
        </div>
      </fieldset>

      ${
        // Pilihan barber hanya muncul bila `team` diisi — klien yang tidak
        // ingin menampilkan tim cukup mengosongkan array di config.
        team.length
          ? `<fieldset class="field">
        <legend class="field__label">Barber <span class="field__hint">opsional</span></legend>
        <div class="chips chips--inline" role="radiogroup" aria-label="Pilih barber">
          <label class="chip chip--sm">
            <input type="radio" name="barber" value="" checked>
            <span class="chip__body"><span class="chip__name">Siapa saja</span></span>
          </label>
          ${team
            .map(
              (m) => `
          <label class="chip chip--sm">
            <input type="radio" name="barber" value="${esc(m.name)}">
            <span class="chip__body"><span class="chip__name">${esc(m.name)}</span></span>
          </label>`
            )
            .join('')}
        </div>
      </fieldset>`
          : ''
      }

      <div class="field__row">
        <div class="field">
          <label class="field__label" for="booking-date">Tanggal</label>
          <input class="input" type="date" id="booking-date" name="date" required>
        </div>

        <div class="field">
          <label class="field__label" for="booking-time">Jam</label>
          <select class="input" id="booking-time" name="time" required>
            ${business.bookingSlots.map((t) => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <p class="field__status" id="booking-slot-note" role="status" aria-live="polite"></p>

      <div class="field">
        <label class="field__label" for="booking-name">Nama <span class="field__hint">opsional</span></label>
        <input class="input" type="text" id="booking-name" name="name"
               placeholder="Nama kamu" autocomplete="name" maxlength="40">
      </div>

      <div class="sheet__summary" id="booking-summary" aria-live="polite"></div>

      <div class="sheet__submit">
        <button class="btn btn--primary btn--block" type="submit">
          ${icon('whatsapp')} Kirim ke WhatsApp
        </button>
      </div>

      <p class="sheet__note">
        Tidak ada pembayaran online. Jadwal dikonfirmasi langsung oleh barber via WhatsApp.${
          demo.enabled
            ? '<br>Ini demo — pesan akan terbuka di WhatsApp dengan nomor contoh.'
            : ''
        }
      </p>
    </form>
  </div>
</div>`

const locationSection = () => `
<section class="section section--line" id="location">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Location</p>
      <h2 class="section-title">Datang dan rasakan sendiri.</h2>
      ${
        demo.enabled
          ? `<p class="section-sub">Alamat dan kontak berikut adalah data contoh untuk keperluan demo. ${sampleTag()}</p>`
          : ''
      }
    </div>

    <div class="location__grid">
      <div class="info-list reveal">
        <div class="info-item">
          <span class="info-item__icon">${icon('mapPin')}</span>
          <div>
            <p class="info-item__label">Alamat</p>
            <p class="info-item__value">
              <a href="${business.mapsLinkUrl}" target="_blank" rel="noopener noreferrer">${esc(
                business.address
              )}</a>
            </p>
          </div>
        </div>

        <div class="info-item">
          <span class="info-item__icon">${icon('clockAlt')}</span>
          <div style="flex:1">
            <p class="info-item__label">Jam Buka</p>
            <div class="info-item__value" id="hours-list">
              ${business.hours
                .map(
                  (h) =>
                    `<div class="hours-row" data-days="${esc(h.days.join(','))}"><span>${esc(
                      h.day
                    )}</span><span>${esc(h.time)}</span></div>`
                )
                .join('')}
            </div>
          </div>
        </div>

        <div class="info-item">
          <span class="info-item__icon">${icon('phone')}</span>
          <div>
            <p class="info-item__label">WhatsApp</p>
            <p class="info-item__value">
              <a href="${wa}" data-booking target="_blank" rel="noopener noreferrer">${esc(
                business.whatsappDisplay
              )}</a>
            </p>
          </div>
        </div>

        <div class="info-item">
          <span class="info-item__icon">${icon('instagram')}</span>
          <div>
            <p class="info-item__label">Instagram</p>
            <p class="info-item__value">
              <a href="${business.instagramUrl}" target="_blank" rel="noopener noreferrer">${esc(
                business.instagramHandle
              )}</a>
            </p>
          </div>
        </div>
      </div>

      <div class="map reveal">
        <iframe src="${business.mapsEmbedUrl}" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="Peta lokasi ${esc(business.name)} di ${esc(business.address)}"></iframe>
      </div>
    </div>
  </div>
</section>`

const footer = () => `
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        ${brandMark()}
        <p class="footer__tagline">${esc(business.tagline)}</p>
      </div>

      <div class="footer__socials">
        <a class="social" href="${business.instagramUrl}" target="_blank" rel="noopener noreferrer">
          ${icon('instagram')} Instagram
        </a>
        <a class="social" href="${wa}" target="_blank" rel="noopener noreferrer">
          ${icon('whatsapp')} WhatsApp
        </a>
        <a class="social" href="${business.mapsLinkUrl}" target="_blank" rel="noopener noreferrer">
          ${icon('map')} Google Maps
        </a>
      </div>
    </div>

    ${
      demo.enabled
        ? `<p class="footer__disclaimer">
             <span class="demo-badge demo-badge--inline">${esc(demo.label)}</span>
             ${esc(demo.notice)}
           </p>`
        : ''
    }

    <div class="footer__bottom">
      <p>© ${new Date().getFullYear()} ${esc(business.name)}. All rights reserved.</p>
      <p>${esc(business.address)}</p>
    </div>
  </div>
</footer>

<a class="wa-sticky" id="wa-sticky" href="${wa}" data-booking target="_blank" rel="noopener noreferrer"
   aria-label="Book via WhatsApp">
  ${icon('whatsapp')} Book via WhatsApp
</a>`

/* ---------------- Document ---------------- */

export function renderPage(): string {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(seo.title)}</title>
<meta name="description" content="${esc(seo.description)}">
<meta name="keywords" content="${esc(seo.keywords)}">
<meta name="theme-color" content="#08090a">
<meta name="color-scheme" content="dark">
<meta name="robots" content="${demo.enabled && demo.noindex ? 'noindex, nofollow' : 'index, follow'}">
<link rel="canonical" href="${business.siteUrl}/">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(business.name)}">
<meta property="og:title" content="${esc(seo.title)}">
<meta property="og:description" content="${esc(seo.description)}">
<meta property="og:url" content="${business.siteUrl}/">
<meta property="og:image" content="${abs('/static/img/hero.webp')}">
<meta property="og:image:width" content="1376">
<meta property="og:image:height" content="768">
<meta property="og:image:alt" content="Interior premium ${esc(business.name)}">
<meta property="og:locale" content="${seo.locale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(seo.title)}">
<meta name="twitter:description" content="${esc(seo.description)}">
<meta name="twitter:image" content="${abs('/static/img/hero.webp')}">
<meta name="twitter:image:alt" content="Interior premium ${esc(business.name)}">

<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/static/favicon.svg">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="preload" as="image" href="/static/img/hero.webp" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/style.css">

<script type="application/ld+json">${safeJson(jsonLd)}</script>
</head>
<body>
<a class="skip-link" href="#main">Lewati ke konten utama</a>
${navbar()}
<main id="main">
${hero()}
${statsSection()}
${servicesSection()}
${aboutSection()}
${teamSection()}
${gallerySection()}
${reviewsSection()}
${bookingSection()}
${locationSection()}
</main>
${footer()}
${bookingModal()}
${lightbox()}

<script id="site-data" type="application/json">${safeJson(clientConfig)}</script>
<script id="gallery-data" type="application/json">${safeJson(
    gallery.map((g) => ({ src: g.src, alt: g.alt, caption: g.caption }))
  )}</script>
<script src="/static/app.js" defer></script>
</body>
</html>`
}
