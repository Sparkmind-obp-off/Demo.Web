/**
 * ============================================================
 *  NOIR BARBER — PUSAT DATA BISNIS  (MASTER TEMPLATE v1.0)
 * ============================================================
 *  SATU-SATUNYA file yang perlu diedit saat membuat website
 *  untuk klien baru: nama bisnis, kontak, layanan, harga, tim,
 *  galeri, testimoni, lokasi, jam buka, dan SEO.
 *
 *  Alur pemakaian:
 *    clone  →  edit file ini  →  ganti gambar di public/static/img
 *           →  npm run build  →  deploy
 *
 *  Baca TEMPLATE.md untuk panduan lengkap.
 * ============================================================
 */

/* ============================================================
   1. MODE DEMO
   ------------------------------------------------------------
   NOIR BARBER adalah bisnis KONSEP untuk keperluan demo/portofolio.
   Selama `enabled: true`:
     • muncul penanda "Concept Demo" yang halus di navbar & footer
     • testimoni, statistik, dan alamat ditandai sebagai contoh
     • structured data TIDAK mengirim rating/review palsu ke Google
     • halaman TIDAK diindeks mesin pencari (noindex)

   UNTUK KLIEN NYATA: set `enabled: false`, lalu ganti seluruh
   data di bawah dengan data asli milik klien.
   ============================================================ */
export const demo = {
  enabled: true,
  /** Label pendek pada penanda di navbar. */
  badge: 'Demo',
  /** Teks lengkap penanda (tooltip & footer). */
  label: 'Concept Website — Demo',
  /** Penjelasan di footer. */
  notice:
    'Website ini adalah demo konsep. NOIR BARBER bukan bisnis yang beroperasi — nama, alamat, nomor WhatsApp, foto tim, dan testimoni adalah data contoh.',
  /** Catatan singkat untuk bagian yang memakai data contoh. */
  sampleNote: 'Data contoh',
  /** Jangan biarkan demo terindeks mesin pencari. */
  noindex: true
} as const

/* ============================================================
   2. JAM OPERASIONAL (SUMBER TUNGGAL)
   ------------------------------------------------------------
   Dipakai untuk 3 hal sekaligus:
     • badge "Buka / Tutup" yang dihitung live di browser
     • penyaringan slot jam di form booking
     • openingHoursSpecification pada structured data (SEO)

   Index 0 = Minggu … 6 = Sabtu.
   Hari libur: `{ open: '00:00', close: '00:00', closed: true }`
   ============================================================ */
export type DayHours = {
  /** Format 24 jam "HH:MM". */
  open: string
  close: string
  /** Set true bila hari itu tutup total. */
  closed?: boolean
}

export const hoursByDay: DayHours[] = [
  { open: '12:00', close: '20:00' }, // Minggu
  { open: '10:00', close: '21:00' }, // Senin
  { open: '10:00', close: '21:00' }, // Selasa
  { open: '10:00', close: '21:00' }, // Rabu
  { open: '10:00', close: '21:00' }, // Kamis
  { open: '10:00', close: '21:00' }, // Jumat
  { open: '10:00', close: '21:00' } // Sabtu
]

/* ============================================================
   3. IDENTITAS BISNIS & KONTAK
   ============================================================ */
export const business = {
  name: 'NOIR BARBER',
  /** Dipakai di logo: kata pertama tebal, kata kedua warna aksen. */
  brandParts: ['NOIR', 'BARBER'] as const,
  tagline: 'Your Style. Your Signature.',
  city: 'Purbalingga',
  region: 'Jawa Tengah',
  country: 'ID',

  /** Domain produksi — untuk canonical, Open Graph, dan sitemap (tanpa trailing slash). */
  siteUrl: 'https://noir-barber.pages.dev',

  // ── NOMOR WHATSAPP ────────────────────────────────────────
  // Format internasional tanpa "+" dan tanpa spasi.
  // Contoh: 0812-3456-7890  ->  6281234567890
  //
  // ⚠️ Nomor di bawah adalah PLACEHOLDER (bukan nomor asli).
  //    Set `whatsappIsPlaceholder: false` setelah diganti nomor klien.
  whatsappNumber: '6281234567890',
  whatsappDisplay: '+62 812-3456-7890',
  whatsappIsPlaceholder: true,

  /** Pesan otomatis saat tombol WhatsApp diklik tanpa memilih detail. */
  whatsappMessage:
    'Halo NOIR BARBER, saya ingin melakukan booking haircut. Apakah masih tersedia jadwal hari ini?',

  // ── ALAMAT ────────────────────────────────────────────────
  // ⚠️ Alamat contoh. Ganti dengan alamat asli klien.
  address: 'Jl. Sudirman No. 88, Purbalingga',
  addressShort: 'Jl. Sudirman No. 88',
  addressIsPlaceholder: true,

  /** Google Maps → Share → Embed a map → salin bagian src="..." */
  mapsEmbedUrl:
    'https://maps.google.com/maps?q=Jl.%20Jenderal%20Sudirman%20Purbalingga&t=&z=15&ie=UTF8&iwloc=&output=embed',
  mapsLinkUrl:
    'https://www.google.com/maps/search/?api=1&query=Jl.+Jenderal+Sudirman+Purbalingga',

  instagramUrl: 'https://instagram.com/noirbarber',
  instagramHandle: '@noirbarber',

  /**
   * Jam buka yang DITAMPILKAN pada bagian Location (teks bebas).
   * `days` = index hari yang dicakup baris ini (0 = Minggu … 6 = Sabtu)
   * dan dipakai untuk menandai baris "Hari ini" secara otomatis.
   */
  hours: [
    { day: 'Senin – Sabtu', time: '10.00 – 21.00', days: [1, 2, 3, 4, 5, 6] },
    { day: 'Minggu', time: '12.00 – 20.00', days: [0] }
  ],

  /** Jam operasional terstruktur — lihat bagian 2 di atas. */
  hoursByDay,

  /** Zona waktu bisnis (offset jam dari UTC). WIB = 7. */
  utcOffset: 7,
  timezoneLabel: 'WIB',

  /** Slot jam yang bisa dipilih di form booking. */
  bookingSlots: [
    '10.00',
    '11.00',
    '12.00',
    '13.00',
    '14.00',
    '15.00',
    '16.00',
    '17.00',
    '18.00',
    '19.00',
    '20.00'
  ],

  /** Berapa hari ke depan pelanggan boleh memilih tanggal. */
  bookingMaxDays: 30
} as const

/* ============================================================
   4. SEO
   ============================================================ */
export const seo = {
  title: 'NOIR BARBER | Premium Barbershop Purbalingga',
  description:
    'NOIR BARBER adalah premium barbershop di Purbalingga dengan layanan haircut, beard grooming, styling, dan full grooming.',
  keywords:
    'barbershop purbalingga, potong rambut purbalingga, premium barbershop, beard grooming, haircut pria, noir barber',
  locale: 'id_ID',
  /** Tipe schema.org. Salon → 'HairSalon', kafe → 'CafeOrCoffeeShop', dst. */
  schemaType: 'HairSalon'
} as const

/* ============================================================
   5. HIGHLIGHT / TRUST BAR
   ------------------------------------------------------------
   Bukan angka karangan. Isi dengan keunggulan yang benar-benar
   bisa dibuktikan. Untuk klien nyata, boleh diganti angka asli
   (mis. "8 Tahun", "4.9★ Google") selama datanya valid.
   ============================================================ */
export const stats = [
  { value: 'Konsultasi', label: 'Sebelum setiap potongan', icon: 'users' },
  { value: 'Steril', label: 'Alat & ruang selalu bersih', icon: 'sparkle' },
  { value: 'Spesialis', label: 'Barber dengan keahlian berbeda', icon: 'scissors' },
  { value: '30–90 mnt', label: 'Durasi layanan', icon: 'clock' }
] as const

/* ============================================================
   6. LAYANAN & HARGA
   ============================================================ */
export type Service = {
  name: string
  price: string
  duration: string
  description: string
  /** Manfaat singkat — tampil sebagai poin di kartu layanan. */
  benefit?: string
  featured?: boolean
}

export const services: Service[] = [
  {
    name: 'Classic Haircut',
    price: 'Rp50.000',
    duration: '30 menit',
    description: 'Potongan klasik dengan finishing rapi.',
    benefit: 'Rapi untuk kerja & harian'
  },
  {
    name: 'Premium Haircut',
    price: 'Rp75.000',
    duration: '45 menit',
    description: 'Konsultasi style + haircut + styling.',
    benefit: 'Style disesuaikan bentuk wajah',
    featured: true
  },
  {
    name: 'Haircut & Beard',
    price: 'Rp100.000',
    duration: '60 menit',
    description: 'Haircut lengkap dengan beard grooming.',
    benefit: 'Rambut & janggut sekali duduk'
  },
  {
    name: 'Full Grooming',
    price: 'Rp150.000',
    duration: '90 menit',
    description: 'Haircut, beard treatment, wash, styling.',
    benefit: 'Paling lengkap, siap acara'
  }
]

/* ============================================================
   7. TIM
   ------------------------------------------------------------
   Untuk demo: profil contoh (bukan orang asli).
   Ganti nama, foto, dan bio dengan tim asli klien.
   ============================================================ */
export const team = [
  {
    name: 'Arga',
    role: 'Senior Barber',
    photo: '/static/img/barber-arga.webp',
    bio: 'Spesialis fade dan potongan klasik. Detail rapi di setiap garis.'
  },
  {
    name: 'Dimas',
    role: 'Barber',
    photo: '/static/img/barber-dimas.webp',
    bio: 'Kuat di potongan modern dan styling harian yang mudah dirawat.'
  },
  {
    name: 'Raka',
    role: 'Grooming Specialist',
    photo: '/static/img/barber-raka.webp',
    bio: 'Fokus pada beard grooming, hot towel, dan perawatan wajah.'
  }
]

/* ============================================================
   8. GALERI
   ------------------------------------------------------------
   Taruh file di public/static/img lalu daftarkan di sini.
   Rasio disarankan seragam (4:5 atau 1:1) agar grid rapi.
   ============================================================ */
export type GalleryItem = {
  src: string
  alt: string
  caption: string
  /** Dimensi asli file — dipakai browser untuk mencegah layout shift (CLS). */
  w: number
  h: number
}

export const gallery: GalleryItem[] = [
  { src: '/static/img/gallery-haircut.webp', alt: 'Proses haircut presisi di NOIR BARBER', caption: 'Haircut', w: 1200, h: 896 },
  { src: '/static/img/gallery-beard.webp', alt: 'Beard grooming dengan straight razor', caption: 'Beard Grooming', w: 1200, h: 896 },
  { src: '/static/img/gallery-workspace.webp', alt: 'Peralatan barber premium di meja kerja', caption: 'Workspace', w: 1200, h: 896 },
  { src: '/static/img/gallery-styling.webp', alt: 'Styling rambut dengan pomade', caption: 'Styling', w: 1200, h: 896 },
  { src: '/static/img/gallery-result.webp', alt: 'Hasil potongan rambut pelanggan NOIR BARBER', caption: 'Customer Result', w: 1200, h: 896 },
  { src: '/static/img/hero.webp', alt: 'Interior premium NOIR BARBER', caption: 'Our Space', w: 1376, h: 768 }
]

/* ============================================================
   9. TESTIMONI
   ------------------------------------------------------------
   ⚠️ Selama mode demo aktif, testimoni ini ditampilkan dengan
   label "Data contoh" dan TIDAK dikirim sebagai review/rating
   ke structured data. Untuk klien nyata: pakai review asli
   (Google Review / WhatsApp / Instagram) dengan izin pelanggan,
   lalu set `demo.enabled = false`.
   ============================================================ */
export const testimonials = [
  {
    quote: 'Tempatnya nyaman, barbernya ngerti style yang saya mau. Hasilnya juga rapi.',
    name: 'Fajar',
    detail: 'Premium Haircut'
  },
  {
    quote: 'Pelayanannya cepat dan detail. Sekarang jadi langganan.',
    name: 'Rizky',
    detail: 'Haircut & Beard'
  },
  {
    quote: 'Recommended kalau mau haircut yang lebih premium.',
    name: 'Aldi',
    detail: 'Full Grooming'
  }
]

/* ============================================================
   10. NAVIGASI
   ============================================================ */
export const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#about', label: 'About' },
  { href: '#team', label: 'Team' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#location', label: 'Location' }
]

/* ============================================================
   HELPER
   ============================================================ */

/** Membentuk URL WhatsApp lengkap dengan pesan otomatis. */
export function waLink(message: string = business.whatsappMessage): string {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`
}

/** Data ringkas yang dibutuhkan browser (dikirim sebagai JSON di halaman). */
export const clientConfig = {
  hoursByDay: business.hoursByDay,
  utcOffset: business.utcOffset,
  tz: business.timezoneLabel,
  slots: business.bookingSlots,
  maxDays: business.bookingMaxDays,
  waNumber: business.whatsappNumber,
  brand: business.name
}
