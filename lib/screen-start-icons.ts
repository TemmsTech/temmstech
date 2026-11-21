/** Icons drawn for the Start menu. Plain SVG, no image files; each fills its box. */

const svg = (viewBox: string, body: string, extra = "") =>
  `<svg viewBox="${viewBox}" width="100%" height="100%" aria-hidden="true" ${extra}>${body}</svg>`;
const icon = (body: string) => svg("0 0 48 48", body);
const line = (body: string, width = 1.8) =>
  svg(
    "0 0 24 24",
    body,
    `fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`,
  );

export const START_ICONS = {
  settings: icon(
    '<defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9d4e3"/><stop offset="1" stop-color="#6f7f95"/></linearGradient></defs><path fill="url(#sg)" d="M21 5h6l1 4.2 3.2 1.4 3.7-2.2 4.2 4.2-2.2 3.7 1.4 3.2L43 20v6l-4.2 1 -1.4 3.2 2.2 3.7-4.2 4.2-3.7-2.2-3.2 1.4L27 42h-6l-1-4.2-3.2-1.4-3.7 2.2-4.2-4.2 2.2-3.7-1.4-3.2L5 26v-6l4.2-1 1.4-3.2-2.2-3.7 4.2-4.2 3.7 2.2 3.2-1.4z"/><circle cx="24" cy="23" r="7.5" fill="#1d63c9"/><circle cx="24" cy="23" r="4.2" fill="#0b2a5c"/>',
  ),
  photos: icon(
    '<defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#30c6ff"/><stop offset="1" stop-color="#1f5fe6"/></linearGradient></defs><rect x="5" y="5" width="38" height="38" rx="10" fill="url(#pg)"/><path d="M5 34c8-12 18-14 38-6v7a8 8 0 0 1-8 8H13a8 8 0 0 1-8-8z" fill="#0d3fae" opacity=".55"/><circle cx="32" cy="16" r="4.5" fill="#fff" opacity=".9"/>',
  ),
  solitaire: icon(
    '<rect x="7" y="9" width="24" height="31" rx="3.5" fill="#1b2a44" stroke="#6b7a92" stroke-width="1.4" transform="rotate(-9 19 24)"/><rect x="15" y="6" width="25" height="33" rx="3.5" fill="#fff"/><path d="M27.5 14c3.6 3.8 6.2 5.8 6.2 8.6a3.1 3.1 0 0 1-5.1 2.4l.6 3.4h-3.4l.6-3.4a3.1 3.1 0 0 1-5.1-2.4c0-2.8 2.6-4.8 6.2-8.6z" fill="#111"/><rect x="31" y="31" width="14" height="14" rx="4" fill="#1d8bf0"/><path d="M38 34v8M34 38h8" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
  ),
  paint: icon(
    '<path d="M24 5C12 5 5 13.5 5 23c0 8 5.5 14 12 14 3.2 0 4-1.7 4-3.4 0-2.4-1.6-3-1.6-5.2 0-2.2 1.8-3.4 4-3.4h5.5c5.4 0 9.6-3.3 9.6-8.2C38.5 10.4 32 5 24 5z" fill="#e9eef7"/><circle cx="14" cy="19" r="3.2" fill="#ef4a4a"/><circle cx="21" cy="12.5" r="3.2" fill="#ffb41f"/><circle cx="30" cy="13" r="3.2" fill="#31b857"/><circle cx="35" cy="20" r="3.2" fill="#1d8bf0"/><path d="m27 41 15-17a3.2 3.2 0 0 1 4.6 4.5L33 43z" fill="#2f6bd8"/>',
  ),
  linkedin: icon(
    '<rect x="5" y="5" width="38" height="38" rx="7" fill="#0a66c2"/><rect x="11.5" y="19.5" width="5.5" height="17" fill="#fff"/><circle cx="14.2" cy="13.6" r="3.2" fill="#fff"/><path d="M21.5 19.5h5.3v2.4c1-1.7 3-2.8 5.4-2.8 4.4 0 5.8 2.7 5.8 7v10.4h-5.5v-9.2c0-2.2-.6-3.4-2.5-3.4-2.2 0-3 1.5-3 3.6v9h-5.5z" fill="#fff"/>',
  ),
  calculator: icon(
    '<rect x="9" y="4" width="30" height="40" rx="5" fill="#cfd8e6"/><rect x="13" y="8" width="22" height="9" rx="2" fill="#31405c"/><g fill="#6f7f95"><rect x="13" y="21" width="6" height="5.5" rx="1.4"/><rect x="21" y="21" width="6" height="5.5" rx="1.4"/><rect x="29" y="21" width="6" height="5.5" rx="1.4"/><rect x="13" y="28.5" width="6" height="5.5" rx="1.4"/><rect x="21" y="28.5" width="6" height="5.5" rx="1.4"/><rect x="29" y="28.5" width="6" height="5.5" rx="1.4"/><rect x="13" y="36" width="6" height="5" rx="1.4"/><rect x="21" y="36" width="6" height="5" rx="1.4"/></g><rect x="29" y="36" width="6" height="5" rx="1.4" fill="#1d8bf0"/>',
  ),
  clock: icon(
    '<circle cx="24" cy="24" r="19" fill="#e9eef7"/><circle cx="24" cy="24" r="19" fill="none" stroke="#8a97ab" stroke-width="3"/><path d="M24 12v12l8 5" fill="none" stroke="#1b2a44" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="24" cy="24" r="2" fill="#e5484d"/>',
  ),
  notepad: icon(
    '<rect x="9" y="6" width="30" height="37" rx="5" fill="#1b9be8"/><rect x="9" y="6" width="30" height="8" rx="4" fill="#0b6fc2"/><g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M15 21h18M15 27h18M15 33h12"/></g><g fill="#cfe6fa"><circle cx="16" cy="6" r="2"/><circle cx="24" cy="6" r="2"/><circle cx="32" cy="6" r="2"/></g>',
  ),
  snipping: icon(
    '<rect x="6" y="8" width="30" height="24" rx="4" fill="#e9eef7"/><rect x="6" y="8" width="30" height="7" rx="3.5" fill="#d9534f"/><g fill="none" stroke="#6f7f95" stroke-width="2" stroke-dasharray="3 3"><rect x="12" y="19" width="18" height="9" rx="1.5"/></g><circle cx="34" cy="37" r="4.2" fill="none" stroke="#2a8cf0" stroke-width="2.6"/><circle cx="43" cy="35" r="3.4" fill="none" stroke="#2a8cf0" stroke-width="2.6"/><path d="m36.6 34 3-8M40.4 33l-2.6-6" stroke="#2a8cf0" stroke-width="2.4" stroke-linecap="round"/>',
  ),
  idm: icon(
    '<circle cx="24" cy="24" r="17" fill="#2c7be5"/><ellipse cx="24" cy="24" rx="7" ry="17" fill="none" stroke="#9fd0ff" stroke-width="1.8"/><path d="M7 24h34M10 15h28M10 33h28" stroke="#9fd0ff" stroke-width="1.8" fill="none"/><path d="M30 8c8-2 14 4 12 12-6-2-9-5-12-12z" fill="#7bc043"/><path d="M12 30c4 8 12 12 22 8l-6-4z" fill="#f2c230"/>',
  ),
  file: icon(
    '<path d="M12 5h17l9 9v29H12z" fill="#e9eef7"/><path d="M29 5v9h9z" fill="#b6c2d6"/><path d="M17 24h14M17 30h14M17 36h9" stroke="#8a97ab" stroke-width="2.2" stroke-linecap="round"/>',
  ),
  image: icon(
    '<rect x="8" y="6" width="32" height="36" rx="4" fill="#fff"/><rect x="12" y="11" width="24" height="18" rx="2" fill="#2a8cf0"/><path d="m12 29 7-8 5 5 5-6 7 9z" fill="#0d4fb3"/><circle cx="31" cy="17" r="2.5" fill="#fff"/><path d="M13 34h14M13 38h9" stroke="#b6c2d6" stroke-width="2" stroke-linecap="round"/>',
  ),
  download: icon(
    '<path d="M12 5h17l9 9v29H12z" fill="#eef2f8"/><path d="M29 5v9h9z" fill="#b6c2d6"/><rect x="17" y="21" width="14" height="14" rx="2" fill="#1d6fd6"/><path d="M24 24v7m-3.2-3 3.2 3.2 3.2-3.2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  ),
  teams: icon(
    '<rect x="4" y="9" width="28" height="30" rx="5" fill="#5059c9"/><circle cx="36" cy="14" r="5" fill="#7b83eb"/><path d="M29 21h14v13a7 7 0 0 1-14 0z" fill="#7b83eb"/><path d="M10 18h16M18 18v14" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>',
  ),
  // The phone panel
  iphone: svg(
    "0 0 48 80",
    '<rect x="3" y="3" width="42" height="74" rx="9" fill="#101418" stroke="#5f6b7a" stroke-width="2"/><rect x="7" y="7" width="34" height="66" rx="6" fill="#0a84ff"/><rect x="17" y="9.500" width="14" height="4.500" rx="2.200" fill="#050709"/>',
  ),
  check: svg(
    "0 0 24 24",
    '<circle cx="12" cy="12" r="10" fill="#3fb950"/><path d="m7.500 12.300 3 3 6-6.500" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  ),
  bluetooth: line('<path d="m7 7 10 10-5 4V3l5 4L7 17"/>'),
  battery: line(
    '<rect x="2.500" y="7.500" width="16" height="9" rx="2"/><path d="M21 10.500v3"/><rect x="4.500" y="9.500" width="6" height="5" rx="1" fill="currentColor"/>',
  ),
  messages: line(
    '<path d="M4 6.500a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-5.500L7 20.500v-4H7a3 3 0 0 1-3-3z"/>',
  ),
  calls: line(
    '<path d="M6.500 3.500h3l1.500 4-2 1.300a11 11 0 0 0 5.200 5.200l1.300-2 4 1.500v3a2 2 0 0 1-2 2A14.500 14.500 0 0 1 4.500 5.500a2 2 0 0 1 2-2z"/>',
  ),
  send: line(
    '<path d="M8 3.500h6l5 5v12H8zM14 3.500v5h5M4 12h7m-2.500-2.500L11 12l-2.500 2.500"/>',
  ),
  x: icon(
    '<rect x="2" y="2" width="44" height="44" rx="6" fill="#000"/><path d="M12 11h8.500l6.300 8.600L34.500 11H38l-9.500 11 10 15h-8.500l-6.800-9.300L15 37h-3.500l10.200-11.800zm5 2.600 14.300 20.800h2.700L19.800 13.600z" fill="#fff" fill-rule="evenodd"/>',
  ),
  pool: icon(
    '<rect x="2" y="2" width="44" height="44" rx="9" fill="#1a6fd8"/><circle cx="24" cy="25" r="14" fill="#f4f6fa"/><circle cx="24" cy="25" r="14" fill="none" stroke="#0b2a5c" stroke-width="2"/><circle cx="24" cy="21" r="6.500" fill="#0b2a5c"/><text x="24" y="25" font-family="Arial" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">8</text><circle cx="11" cy="9" r="4" fill="#ef4a4a"/><circle cx="37" cy="9" r="4" fill="#ffc83d"/>',
  ),
  flashscore: icon(
    '<rect x="2" y="2" width="44" height="44" rx="9" fill="#111823"/><path d="M12 28a12 12 0 1 1 24 0" fill="none" stroke="#fff" stroke-width="3.400" stroke-linecap="round"/><path d="M24 28 31 15" stroke="#ff2d55" stroke-width="3.400" stroke-linecap="round"/><circle cx="24" cy="29" r="3" fill="#fff"/>',
  ),
  // Chrome of the menu
  search: line('<circle cx="10.500" cy="10.500" r="6"/><path d="m15 15 5 5"/>', 2),
  phone: line('<rect x="7.500" y="3" width="9" height="18" rx="2"/><path d="M11 18h2"/>', 1.700),
  chevron: line('<path d="m9 6 6 6-6 6"/>', 2),
  down: line('<path d="m6 9 6 6 6-6"/>', 2),
  back: line('<path d="m15 6-6 6 6 6"/>', 2),
  lock: line('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  sleep: line('<path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"/>'),
  restart: line('<path d="M19 12a7 7 0 1 1-2.200-5.100M19 4.500v4h-4"/>', 1.900),
  power: line('<path d="M12 3v8M7 6.500a8 8 0 1 0 10 0"/>', 1.900),
  more: svg(
    "0 0 24 24",
    '<g fill="currentColor"><circle cx="5" cy="12" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="19" cy="12" r="1.800"/></g>',
  ),
} as const;
