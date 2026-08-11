/* ==========================================================
   NOIR BARBER — interaksi ringan, tanpa dependency eksternal
   ----------------------------------------------------------
   Semua data bisnis (jam buka, slot booking, nomor WhatsApp)
   dibaca dari <script id="site-data"> yang dihasilkan server
   dari src/config.ts — jadi tetap satu sumber data.
   ========================================================== */
(function () {
  'use strict'

  /* ---------- Ambil konfigurasi dari server ---------- */
  function readJson(id, fallback) {
    try {
      var el = document.getElementById(id)
      if (!el) return fallback
      return JSON.parse(el.textContent || '') || fallback
    } catch (err) {
      return fallback
    }
  }

  var CFG = readJson('site-data', {})
  var HOURS = CFG.hoursByDay || []
  var UTC_OFFSET = typeof CFG.utcOffset === 'number' ? CFG.utcOffset : 7
  var TZ = CFG.tz || 'WIB'
  var SLOTS = CFG.slots || []
  var MAX_DAYS = CFG.maxDays || 30

  var navbar = document.getElementById('navbar')
  var toggle = document.getElementById('nav-toggle')
  var menu = document.getElementById('mobile-menu')
  var sticky = document.getElementById('wa-sticky')

  /* ---------- Navbar scrolled state + sticky WA CTA ---------- */
  var ticking = false
  function onScroll() {
    var y = window.scrollY || window.pageYOffset
    if (navbar) navbar.classList.toggle('is-scrolled', y > 24)
    if (sticky) sticky.classList.toggle('is-visible', y > 520)
    ticking = false
  }
  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll)
        ticking = true
      }
    },
    { passive: true }
  )
  onScroll()

  /* ==========================================================
     Focus trap util — dipakai mobile menu, booking sheet, lightbox
     ========================================================== */
  var FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

  function trapFocus(container, e) {
    if (e.key !== 'Tab') return
    var nodes = Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null || el === document.activeElement
    })
    if (!nodes.length) return
    var first = nodes[0]
    var last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    if (!menu || !toggle) return
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    toggle.setAttribute('aria-label', open ? 'Tutup menu navigasi' : 'Buka menu navigasi')
    document.body.classList.toggle('nav-open', open)
    if (open) {
      menu.hidden = false
      // paksa reflow agar transisi berjalan
      void menu.offsetWidth
      menu.classList.add('is-open')
      var firstLink = menu.querySelector(FOCUSABLE)
      if (firstLink) firstLink.focus({ preventScroll: true })
    } else {
      menu.classList.remove('is-open')
      window.setTimeout(function () {
        if (!menu.classList.contains('is-open')) menu.hidden = true
      }, 420)
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true')
    })
  }

  if (menu) {
    menu.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        setMenu(false)
        if (toggle) toggle.focus()
        return
      }
      trapFocus(menu, e)
    })
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false)
      toggle.focus()
    }
  })

  /* Tutup menu setelah klik link navigasi */
  Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (link) {
    link.addEventListener('click', function () {
      setMenu(false)
    })
  })

  /* ---------- Reveal on scroll ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  var reveals = document.querySelectorAll('.reveal')

  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add('is-in')
    })
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          var el = entry.target
          var siblings = el.parentElement ? el.parentElement.children : []
          var i = Array.prototype.indexOf.call(siblings, el)
          el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms'
          el.classList.add('is-in')
          io.unobserve(el)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    Array.prototype.forEach.call(reveals, function (el) {
      io.observe(el)
    })
  }

  /* ---------- Active nav link ---------- */
  var sections = document.querySelectorAll('main section[id]')
  var navLinks = document.querySelectorAll('.nav__link')

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          var id = entry.target.getAttribute('id')
          Array.prototype.forEach.call(navLinks, function (l) {
            var active = l.getAttribute('href') === '#' + id
            l.classList.toggle('is-active', active)
            if (active) l.setAttribute('aria-current', 'true')
            else l.removeAttribute('aria-current')
          })
        })
      },
      { rootMargin: '-45% 0px -50% 0px' }
    )
    Array.prototype.forEach.call(sections, function (s) {
      spy.observe(s)
    })
  }

  /* ==========================================================
     Util waktu bisnis
     ========================================================== */
  function pad(n) {
    return n < 10 ? '0' + n : String(n)
  }

  /** Waktu "sekarang" di zona bisnis — aman untuk pengunjung luar negeri. */
  function localNow() {
    var now = new Date()
    var utc = now.getTime() + now.getTimezoneOffset() * 60000
    return new Date(utc + UTC_OFFSET * 3600000)
  }

  function isoDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
  }

  function toMinutes(hhmm) {
    var p = String(hhmm).replace('.', ':').split(':')
    return Number(p[0]) * 60 + Number(p[1] || 0)
  }

  var DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  var MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ]

  function prettyDate(value) {
    if (!value) return ''
    var parts = value.split('-')
    if (parts.length !== 3) return value
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    if (isNaN(d.getTime())) return value
    return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear()
  }

  /* ==========================================================
     BOOKING SHEET
     Pelanggan memilih layanan / barber / tanggal / jam, lalu
     semuanya dirangkai menjadi satu pesan WhatsApp yang rapi.
     ========================================================== */
  var sheet = document.getElementById('booking-sheet')
  var form = document.getElementById('booking-form')
  var summary = document.getElementById('booking-summary')
  var slotNote = document.getElementById('booking-slot-note')
  var dateInput = document.getElementById('booking-date')
  var timeSelect = document.getElementById('booking-time')
  var lastFocus = null

  /* Nomor WA diambil dari config server; fallback ke href CTA. */
  var waBase = CFG.waNumber
    ? 'https://wa.me/' + CFG.waNumber
    : ((document.getElementById('wa-sticky') || {}).href || '').split('?')[0]

  if (dateInput) {
    var today = localNow()
    dateInput.min = isoDate(today)
    if (!dateInput.value) dateInput.value = isoDate(today)
    var max = localNow()
    max.setDate(max.getDate() + MAX_DAYS)
    dateInput.max = isoDate(max)
  }

  /** Ambil jam operasional untuk tanggal terpilih. */
  function hoursForDate(value) {
    if (!HOURS.length) return null
    var d = value ? new Date(value + 'T00:00:00') : localNow()
    if (isNaN(d.getTime())) return null
    return HOURS[d.getDay()] || null
  }

  /**
   * Nonaktifkan slot yang sudah lewat (untuk hari ini) atau di luar
   * jam operasional pada tanggal terpilih. Pelanggan jadi tidak
   * mengirim permintaan jam yang jelas tidak mungkin.
   */
  function refreshSlots() {
    if (!timeSelect || !SLOTS.length) return
    var value = dateInput ? dateInput.value : ''
    var now = localNow()
    var isToday = value === isoDate(now)
    var nowMins = now.getHours() * 60 + now.getMinutes()
    var dayHours = hoursForDate(value)
    var available = 0
    var firstAvailable = null

    // Hari libur: seluruh slot dinonaktifkan, apa pun jamnya.
    var dayClosed = !!(dayHours && dayHours.closed)

    Array.prototype.forEach.call(timeSelect.options, function (opt) {
      var mins = toMinutes(opt.value)
      var blocked = dayClosed

      if (!blocked && dayHours) {
        if (mins < toMinutes(dayHours.open) || mins >= toMinutes(dayHours.close)) blocked = true
      }
      // beri jeda 30 menit dari waktu sekarang untuk hari ini
      if (isToday && mins <= nowMins + 30) blocked = true

      opt.disabled = blocked
      if (!blocked) {
        available++
        if (firstAvailable === null) firstAvailable = opt.value
      }
    })

    // Bila jam terpilih menjadi tidak tersedia, pindahkan otomatis.
    var current = timeSelect.selectedOptions && timeSelect.selectedOptions[0]
    if ((!current || current.disabled) && firstAvailable !== null) {
      timeSelect.value = firstAvailable
    }

    if (slotNote) {
      if (dayClosed) {
        slotNote.textContent = 'Tanggal ini libur. Silakan pilih tanggal lain.'
        slotNote.classList.add('is-warn')
      } else if (!available) {
        slotNote.textContent =
          'Tidak ada jam tersisa untuk tanggal ini. Silakan pilih tanggal berikutnya.'
        slotNote.classList.add('is-warn')
      } else if (isToday) {
        slotNote.textContent = 'Menampilkan jam yang masih tersedia hari ini (' + TZ + ').'
        slotNote.classList.remove('is-warn')
      } else {
        slotNote.textContent = ''
        slotNote.classList.remove('is-warn')
      }
    }
    return available
  }

  function readForm() {
    if (!form) return null
    var service = form.querySelector('input[name="service"]:checked')
    var barber = form.querySelector('input[name="barber"]:checked')
    var nameField = document.getElementById('booking-name')
    return {
      service: service ? service.value : '',
      price: service ? service.getAttribute('data-price') || '' : '',
      duration: service ? service.getAttribute('data-duration') || '' : '',
      barber: barber ? barber.value : '',
      date: dateInput ? dateInput.value : '',
      time: timeSelect ? timeSelect.value : '',
      name: nameField ? nameField.value.trim() : ''
    }
  }

  function buildMessage(d) {
    var brand = CFG.brand || 'kami'
    var lines = ['Halo ' + brand + ', saya ingin booking:', '']
    lines.push('• Layanan: ' + d.service + (d.price ? ' (' + d.price + ')' : ''))
    if (d.duration) lines.push('• Estimasi: ' + d.duration)
    lines.push('• Barber: ' + (d.barber || 'Siapa saja'))
    if (d.date) lines.push('• Tanggal: ' + prettyDate(d.date))
    if (d.time) lines.push('• Jam: ' + d.time + ' ' + TZ)
    if (d.name) lines.push('• Nama: ' + d.name)
    lines.push('')
    lines.push('Apakah jadwal tersebut tersedia?')
    return lines.join('\n')
  }

  function renderSummary() {
    if (!summary) return
    var d = readForm()
    if (!d || !d.service) {
      summary.innerHTML = ''
      return
    }
    var bits = [
      '<strong>' + d.service + '</strong>',
      d.price,
      d.barber || 'Barber siapa saja',
      prettyDate(d.date),
      d.time ? d.time + ' ' + TZ : ''
    ].filter(Boolean)
    summary.innerHTML = bits.join('<span class="dot">·</span>')
  }

  function openSheet(preselect) {
    if (!sheet) return
    lastFocus = document.activeElement
    if (preselect) {
      var target = form && form.querySelector('input[name="service"][value="' + preselect + '"]')
      if (target) target.checked = true
    }
    refreshSlots()
    renderSummary()
    sheet.hidden = false
    void sheet.offsetWidth
    sheet.classList.add('is-open')
    document.body.classList.add('nav-open')
    var focusTarget =
      sheet.querySelector('input[name="service"]:checked') || sheet.querySelector(FOCUSABLE)
    if (focusTarget) focusTarget.focus({ preventScroll: true })
  }

  function closeSheet() {
    if (!sheet || sheet.hidden) return
    sheet.classList.remove('is-open')
    document.body.classList.remove('nav-open')
    window.setTimeout(function () {
      if (!sheet.classList.contains('is-open')) sheet.hidden = true
    }, 320)
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true })
  }

  /* Semua CTA booking membuka sheet; tanpa JS, href WhatsApp tetap berfungsi. */
  if (sheet && form && waBase) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-booking]'), function (cta) {
      cta.addEventListener('click', function (e) {
        e.preventDefault()
        setMenu(false)
        openSheet(cta.getAttribute('data-service'))
      })
    })

    Array.prototype.forEach.call(sheet.querySelectorAll('[data-sheet-close]'), function (el) {
      el.addEventListener('click', closeSheet)
    })

    form.addEventListener('change', function (e) {
      if (e.target === dateInput) refreshSlots()
      renderSummary()
    })
    form.addEventListener('input', renderSummary)

    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var d = readForm()
      if (!d || !d.service) return

      // Jangan kirim jam yang tidak tersedia.
      var opt = timeSelect && timeSelect.selectedOptions && timeSelect.selectedOptions[0]
      if (opt && opt.disabled) {
        var stillOpen = refreshSlots()
        if (slotNote) {
          slotNote.textContent = stillOpen
            ? 'Pilih jam yang masih tersedia terlebih dahulu.'
            : 'Tidak ada jam tersedia pada tanggal ini. Pilih tanggal lain dulu.'
          slotNote.classList.add('is-warn')
        }
        ;(stillOpen ? timeSelect : dateInput || timeSelect).focus()
        return
      }

      window.open(waBase + '?text=' + encodeURIComponent(buildMessage(d)), '_blank', 'noopener')
      closeSheet()
    })

    sheet.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeSheet()
        return
      }
      trapFocus(sheet, e)
    })
  }

  /* ==========================================================
     LIGHTBOX GALLERY
     ========================================================== */
  var lb = document.getElementById('lightbox')
  var lbImg = document.getElementById('lb-img')
  var lbCap = document.getElementById('lb-cap')
  var lbCount = document.getElementById('lb-count')
  var lbData = readJson('gallery-data', [])
  var lbIndex = 0
  var lbLastFocus = null

  function showShot(i) {
    if (!lbData.length) return
    lbIndex = (i + lbData.length) % lbData.length
    var item = lbData[lbIndex]
    if (lbImg) {
      lbImg.src = item.src
      lbImg.alt = item.alt
    }
    if (lbCap) lbCap.textContent = item.caption
    if (lbCount) lbCount.textContent = lbIndex + 1 + ' / ' + lbData.length
  }

  function openLb(i) {
    if (!lb || !lbData.length) return
    lbLastFocus = document.activeElement
    showShot(i)
    lb.hidden = false
    void lb.offsetWidth
    lb.classList.add('is-open')
    document.body.classList.add('nav-open')
    var closeBtn = lb.querySelector('.lb__close')
    if (closeBtn) closeBtn.focus({ preventScroll: true })
  }

  function closeLb() {
    if (!lb || lb.hidden) return
    lb.classList.remove('is-open')
    document.body.classList.remove('nav-open')
    window.setTimeout(function () {
      if (!lb.classList.contains('is-open')) lb.hidden = true
    }, 300)
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus({ preventScroll: true })
  }

  if (lb && lbData.length) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-lightbox]'), function (btn) {
      btn.addEventListener('click', function () {
        openLb(Number(btn.getAttribute('data-lightbox')) || 0)
      })
    })

    Array.prototype.forEach.call(lb.querySelectorAll('[data-lb-close]'), function (el) {
      el.addEventListener('click', closeLb)
    })

    var prevBtn = lb.querySelector('[data-lb-prev]')
    var nextBtn = lb.querySelector('[data-lb-next]')
    if (prevBtn)
      prevBtn.addEventListener('click', function () {
        showShot(lbIndex - 1)
      })
    if (nextBtn)
      nextBtn.addEventListener('click', function () {
        showShot(lbIndex + 1)
      })

    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeLb()
      } else if (e.key === 'ArrowRight') {
        showShot(lbIndex + 1)
      } else if (e.key === 'ArrowLeft') {
        showShot(lbIndex - 1)
      } else {
        trapFocus(lb, e)
      }
    })

    /* Swipe di perangkat sentuh */
    var touchX = 0
    lb.addEventListener(
      'touchstart',
      function (e) {
        touchX = e.changedTouches[0].clientX
      },
      { passive: true }
    )
    lb.addEventListener(
      'touchend',
      function (e) {
        var dx = e.changedTouches[0].clientX - touchX
        if (Math.abs(dx) > 45) showShot(dx < 0 ? lbIndex + 1 : lbIndex - 1)
      },
      { passive: true }
    )
  }

  /* ==========================================================
     BADGE STATUS BUKA / TUTUP
     ========================================================== */
  function renderStatus() {
    var box = document.getElementById('open-status')
    if (!box || !HOURS.length) return
    var textEl = box.querySelector('.status__text')
    if (!textEl) return

    var now = localNow()
    var mins = now.getHours() * 60 + now.getMinutes()
    var todayHours = HOURS[now.getDay()]
    if (!todayHours) return

    var isOpen =
      !todayHours.closed &&
      mins >= toMinutes(todayHours.open) &&
      mins < toMinutes(todayHours.close)

    box.setAttribute('data-state', isOpen ? 'open' : 'closed')

    if (isOpen) {
      var closeIn = toMinutes(todayHours.close) - mins
      textEl.textContent =
        closeIn <= 60
          ? 'Buka sekarang · tutup dalam ' + closeIn + ' menit'
          : 'Buka sekarang · sampai ' + todayHours.close.replace(':', '.') + ' ' + TZ
    } else {
      var openLater = !todayHours.closed && mins < toMinutes(todayHours.open)
      var nextIdx = now.getDay()
      var label = 'hari ini'

      if (!openLater) {
        // cari hari buka berikutnya (maks 7 hari ke depan)
        for (var step = 1; step <= 7; step++) {
          var idx = (now.getDay() + step) % 7
          if (HOURS[idx] && !HOURS[idx].closed) {
            nextIdx = idx
            label = step === 1 ? 'besok' : DAYS[idx]
            break
          }
        }
      }
      textEl.textContent =
        'Tutup · buka ' + label + ' ' + HOURS[nextIdx].open.replace(':', '.') + ' ' + TZ
    }

    box.classList.toggle('is-open', isOpen)
    box.hidden = false
  }

  /**
   * Tandai baris jam buka yang berlaku HARI INI (zona bisnis) supaya
   * pengunjung langsung tahu jam mana yang relevan untuknya.
   */
  function markTodayHours() {
    var list = document.getElementById('hours-list')
    if (!list) return
    var today = String(localNow().getDay())
    Array.prototype.forEach.call(list.querySelectorAll('.hours-row'), function (row) {
      var days = (row.getAttribute('data-days') || '').split(',')
      var isToday = days.indexOf(today) !== -1
      row.classList.toggle('is-today', isToday)
      if (isToday && !row.querySelector('.hours-row__now')) {
        var tag = document.createElement('span')
        tag.className = 'hours-row__now'
        tag.textContent = 'Hari ini'
        var label = row.firstElementChild
        if (label) label.appendChild(tag)
      }
    })
  }

  renderStatus()
  markTodayHours()
  window.setInterval(function () {
    renderStatus()
    markTodayHours()
  }, 60000)
  refreshSlots()
})()
