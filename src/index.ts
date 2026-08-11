import { Hono } from 'hono'
import { renderPage } from './page'
import { business, demo, services, seo } from './config'

const app = new Hono()

/** Landing page utama */
app.get('/', (c) =>
  c.html(renderPage(), 200, {
    'Cache-Control': 'public, max-age=0, must-revalidate'
  })
)

/** Health check ringan */
app.get('/api/health', (c) =>
  c.json({ ok: true, site: business.name, demo: demo.enabled, services: services.length })
)

/**
 * Data layanan sebagai JSON — memudahkan client mengambil harga terbaru
 * tanpa scraping HTML (mis. untuk integrasi lain nanti).
 */
app.get('/api/services', (c) => c.json({ currency: 'IDR', items: services }))

/**
 * robots.txt dibangun dari config.
 * Saat mode demo aktif, seluruh situs di-disallow agar bisnis konsep
 * tidak muncul di hasil pencarian sebagai bisnis nyata.
 */
app.get('/robots.txt', (c) => {
  const body =
    demo.enabled && demo.noindex
      ? `User-agent: *\nDisallow: /\n`
      : `User-agent: *\nAllow: /\n\nSitemap: ${business.siteUrl}/sitemap.xml\n`
  return c.body(body, 200, { 'Content-Type': 'text/plain; charset=UTF-8' })
})

/** Sitemap untuk mesin pencari. */
app.get('/sitemap.xml', (c) => {
  const today = new Date().toISOString().slice(0, 10)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${business.siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
  return c.body(xml, 200, { 'Content-Type': 'application/xml; charset=UTF-8' })
})

/** Web App Manifest — memungkinkan situs di-"Add to Home Screen". */
app.get('/manifest.webmanifest', (c) =>
  c.json(
    {
      name: business.name,
      short_name: business.brandParts[0],
      description: seo.description,
      start_url: '/',
      display: 'standalone',
      background_color: '#08090a',
      theme_color: '#08090a',
      icons: [
        { src: '/static/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
      ]
    },
    200,
    { 'Content-Type': 'application/manifest+json; charset=UTF-8' }
  )
)

/**
 * Halaman 404 on-brand.
 * Dipakai sebagai catch-all route (bukan app.notFound) karena plugin
 * @hono/vite-cloudflare-pages membaca `notFoundHandler` internal Hono
 * yang sudah tidak di-expose pada Hono v4.13+.
 */
const notFoundHtml = `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>404 | ${business.name}</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#08090a">
<link rel="icon" href="/static/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/static/style.css"></head>
<body class="page-404">
<main>
  <p class="eyebrow">Error 404</p>
  <h1>Halaman tidak ditemukan</h1>
  <p class="page-404__sub">Sepertinya halaman ini sudah dipangkas.</p>
  <a class="btn btn--primary" href="/">Kembali ke Beranda</a>
</main></body></html>`

app.all('*', (c) => c.html(notFoundHtml, 404))

export default app
