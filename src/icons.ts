/** Inline SVG icons (no external icon font → faster load, zero requests). */

const s = (path: string, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${path}</svg>`

export const icons: Record<string, string> = {
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.28.17-1.41-.07-.13-.27-.2-.57-.35Z"/><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.24-8.23a8.24 8.24 0 0 1 .01 16.45Z"/></svg>`,

  users: s('<path d="M17 20v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 20v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  clock: s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  scissors: s('<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="m14.47 14.48 5.53 5.52"/><path d="M8.12 8.12 12 12"/>'),
  sparkle: s('<path d="M12 3v4M12 17v4M3 12h4M17 12h4"/><path d="M12 8.5 13.6 12 12 15.5 10.4 12 12 8.5Z"/>'),
  check: s('<path d="m20 6-11 11-5-5"/>'),
  arrowRight: s('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>'),
  arrowDown: s('<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>'),
  mapPin: s('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'),
  clockAlt: s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  phone: s('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>'),
  instagram: s('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>'),
  map: s('<path d="m1 6 7-3 8 3 7-3v15l-7 3-8-3-7 3V6Z"/><path d="M8 3v15M16 6v15"/>'),
  star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="m12 2 2.9 6.26 6.85.72-5.1 4.6 1.43 6.72L12 16.9l-6.08 3.4 1.43-6.72-5.1-4.6 6.85-.72L12 2Z"/></svg>`,
  close: s('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
  chevronLeft: s('<path d="m15 18-6-6 6-6"/>'),
  chevronRight: s('<path d="m9 18 6-6-6-6"/>'),
  expand: s('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>'),
  calendar: s('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/>')
}

export const icon = (name: string) => icons[name] ?? ''
