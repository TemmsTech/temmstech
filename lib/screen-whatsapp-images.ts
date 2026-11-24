import type { WaImageKind } from "@/data/whatsapp";

/**
 * Generated pictures for the simulated WhatsApp threads. The project ships no photos, so every
 * "image" sent in a chat is a small drawing made here (wireframes, logos, receipts, product
 * shots). Shapes only, no text, 3:2.
 */
const frame = (body: string) =>
  `<svg viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
const lines = (x: number, y: number, widths: number[], fill: string, gap = 8, h = 4) =>
  widths
    .map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="${h}" rx="2" fill="${fill}"/>`)
    .join("");
const browserBar = (fill: string, dot: string) =>
  `<rect x="0" y="0" width="240" height="16" fill="${fill}"/><circle cx="9" cy="8" r="2.4" fill="${dot}"/><circle cx="17" cy="8" r="2.4" fill="${dot}"/><circle cx="25" cy="8" r="2.4" fill="${dot}"/>`;

const ART: Record<WaImageKind, string> = {
  wireframe: frame(
    `<rect width="240" height="160" fill="#f3efe6"/>${browserBar("#e4ddcc", "#c9bfa6")}<rect x="12" y="24" width="216" height="52" rx="4" fill="#dcd4c0"/><path d="M12 76 70 44l40 22 28-14 90 24v0H12z" fill="#cfc6ad"/>${lines(24, 34, [70, 46], "#b9ae92", 9, 5)}<rect x="12" y="86" width="66" height="50" rx="4" fill="#e4ddcc"/><rect x="87" y="86" width="66" height="50" rx="4" fill="#e4ddcc"/><rect x="162" y="86" width="66" height="50" rx="4" fill="#e4ddcc"/>${lines(18, 120, [40, 24], "#bdb398", 7, 3)}${lines(93, 120, [40, 24], "#bdb398", 7, 3)}${lines(168, 120, [40, 24], "#bdb398", 7, 3)}<rect x="12" y="144" width="216" height="8" rx="3" fill="#d6cdb6"/>`,
  ),
  storefront: frame(
    `<rect width="240" height="160" fill="#101a15"/>${browserBar("#18251e", "#2f4a3b")}<rect x="0" y="16" width="240" height="14" fill="#14201a"/><rect x="10" y="20" width="26" height="6" rx="2" fill="#d6b25e"/><rect x="150" y="21" width="18" height="4" rx="2" fill="#4a6a58"/><rect x="174" y="21" width="18" height="4" rx="2" fill="#4a6a58"/><rect x="198" y="21" width="18" height="4" rx="2" fill="#4a6a58"/><rect x="12" y="38" width="216" height="50" rx="5" fill="#1f5a3d"/><circle cx="190" cy="62" r="22" fill="#d6b25e" opacity=".9"/><circle cx="205" cy="52" r="14" fill="#0f3a27" opacity=".7"/>${lines(24, 50, [78, 52], "#e8e2cf", 9, 6)}<rect x="24" y="72" width="34" height="9" rx="4" fill="#d6b25e"/><rect x="12" y="96" width="50" height="52" rx="4" fill="#d6b25e" opacity=".85"/><rect x="68" y="96" width="50" height="52" rx="4" fill="#2c7a54"/><rect x="124" y="96" width="50" height="52" rx="4" fill="#8a5a2b"/><rect x="180" y="96" width="48" height="52" rx="4" fill="#e8e2cf"/>`,
  ),
  logo: frame(
    `<rect width="240" height="160" fill="#14181a"/><circle cx="108" cy="80" r="38" fill="none" stroke="#d6b25e" stroke-width="7"/><circle cx="132" cy="80" r="38" fill="none" stroke="#2c7a54" stroke-width="7"/><path d="M120 50v60" stroke="#e8e2cf" stroke-width="4" stroke-linecap="round"/><rect x="82" y="128" width="76" height="5" rx="2.5" fill="#e8e2cf" opacity=".7"/>`,
  ),
  palette: frame(
    `<rect width="240" height="160" fill="#f6f2e8"/><rect x="14" y="16" width="38" height="104" rx="6" fill="#d6b25e"/><rect x="58" y="16" width="38" height="104" rx="6" fill="#1f5a3d"/><rect x="102" y="16" width="38" height="104" rx="6" fill="#e8d9b0"/><rect x="146" y="16" width="38" height="104" rx="6" fill="#101a15"/><rect x="190" y="16" width="38" height="104" rx="6" fill="#b4573a"/>${[14, 58, 102, 146, 190].map((x) => `<rect x="${x}" y="130" width="38" height="5" rx="2" fill="#b9ae92"/>`).join("")}`,
  ),
  dress: frame(
    `<defs><linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0e1c8"/><stop offset="1" stop-color="#d9b98d"/></linearGradient></defs><rect width="240" height="160" fill="url(#d)"/><path d="M104 22c0 10 8 16 16 16s16-6 16-16l8 6-6 28 16 80H86l16-80-6-28z" fill="#9b2c3c"/><path d="M96 80c16 10 32 10 48 0" stroke="#7a1f2d" stroke-width="2" fill="none"/><rect x="0" y="140" width="240" height="20" fill="#c9a77a" opacity=".6"/>`,
  ),
  bag: frame(
    `<rect width="240" height="160" fill="#e6dfd2"/><path d="M92 62c0-26 56-26 56 0" stroke="#5b3a21" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="66" y="58" width="108" height="78" rx="12" fill="#8a5a2b"/><rect x="66" y="58" width="108" height="26" rx="12" fill="#a06a35"/><circle cx="120" cy="92" r="6" fill="#d6b25e"/><ellipse cx="120" cy="146" rx="62" ry="6" fill="#000" opacity=".12"/>`,
  ),
  fabric: frame(
    `<rect width="240" height="160" fill="#1f5a3d"/>${Array.from({ length: 6 }, (_, row) =>
      Array.from({ length: 8 }, (_, col) => {
        const x = 15 + col * 30 + (row % 2) * 15;
        const y = 14 + row * 26;
        const colours = ["#d6b25e", "#b4573a", "#e8e2cf", "#101a15"];
        return `<circle cx="${x}" cy="${y}" r="9" fill="${colours[(row + col) % 4]}"/><circle cx="${x}" cy="${y}" r="3.5" fill="${colours[(row + col + 2) % 4]}"/>`;
      }).join(""),
    ).join("")}`,
  ),
  invoice: frame(
    `<rect width="240" height="160" fill="#d9dedb"/><rect x="62" y="10" width="116" height="142" rx="5" fill="#fbfbf8"/><rect x="74" y="22" width="30" height="8" rx="2" fill="#1f5a3d"/>${lines(74, 40, [92, 80, 86, 70], "#c9cdc9", 9, 4)}<rect x="74" y="82" width="92" height="1.5" fill="#c9cdc9"/>${lines(74, 92, [92, 76], "#c9cdc9", 9, 4)}<rect x="74" y="122" width="92" height="20" rx="4" fill="#1f5a3d"/><rect x="82" y="129" width="34" height="6" rx="2" fill="#d6e8dc"/><rect x="132" y="129" width="26" height="6" rx="2" fill="#d6b25e"/>`,
  ),
  "price-list": frame(
    `<rect width="240" height="160" fill="#16181a"/><rect x="14" y="12" width="212" height="136" rx="8" fill="#202325" stroke="#d6b25e" stroke-width="1.5"/><rect x="88" y="22" width="64" height="8" rx="3" fill="#d6b25e"/>${[0, 1, 2, 3, 4]
      .map(
        (i) =>
          `<rect x="28" y="${44 + i * 20}" width="${70 + (i % 3) * 14}" height="5" rx="2" fill="#e8e2cf"/><circle cx="${126 + (i % 3) * 8}" cy="${46.5 + i * 20}" r="1" fill="#6b6f72"/><circle cx="${134 + (i % 3) * 8}" cy="${46.5 + i * 20}" r="1" fill="#6b6f72"/><rect x="190" y="${44 + i * 20}" width="24" height="5" rx="2" fill="#d6b25e"/>`,
      )
      .join("")}`,
  ),
  "phone-ui": frame(
    `<rect width="240" height="160" fill="#dfe6e1"/><rect x="40" y="10" width="68" height="140" rx="11" fill="#101a15"/><rect x="45" y="17" width="58" height="126" rx="7" fill="#f5f2ea"/><rect x="50" y="24" width="48" height="26" rx="4" fill="#1f5a3d"/>${lines(50, 58, [36, 48, 42], "#c9bfa6", 8, 4)}<rect x="50" y="86" width="22" height="28" rx="3" fill="#d6b25e"/><rect x="76" y="86" width="22" height="28" rx="3" fill="#2c7a54"/><rect x="50" y="122" width="48" height="12" rx="6" fill="#1f5a3d"/><rect x="132" y="10" width="68" height="140" rx="11" fill="#101a15"/><rect x="137" y="17" width="58" height="126" rx="7" fill="#f5f2ea"/><rect x="142" y="24" width="48" height="8" rx="3" fill="#c9bfa6"/>${[0, 1, 2, 3].map((i) => `<rect x="142" y="${40 + i * 22}" width="48" height="17" rx="4" fill="${i === 1 ? "#d6b25e" : "#e4ddcc"}"/>`).join("")}<rect x="142" y="128" width="48" height="10" rx="5" fill="#1f5a3d"/>`,
  ),
  chart: frame(
    `<rect width="240" height="160" fill="#101a15"/>${[0, 1, 2, 3].map((i) => `<rect x="14" y="${30 + i * 28}" width="212" height="1" fill="#2a3a31"/>`).join("")}${[28, 44, 38, 62, 70, 58, 92, 104, 96, 118]
      .map((h, i) => `<rect x="${20 + i * 21}" y="${140 - h}" width="13" height="${h}" rx="2" fill="${i > 6 ? "#d6b25e" : "#2c7a54"}"/>`)
      .join("")}<path d="M26 118 47 102 68 108 89 80 110 72 131 82 152 52 173 38 194 44 215 24" stroke="#e8e2cf" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  ),
  sunset: frame(
    `<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2a5c"/><stop offset=".55" stop-color="#d9654a"/><stop offset="1" stop-color="#f4b860"/></linearGradient></defs><rect width="240" height="160" fill="url(#s)"/><circle cx="150" cy="96" r="26" fill="#ffe3a3"/><path d="M0 112c40-24 80-6 120-14s80-16 120 6v56H0z" fill="#1c2438"/><path d="M0 134c50-18 110-8 150-14s60-4 90 4v36H0z" fill="#10172a"/>`,
  ),
  whiteboard: frame(
    `<rect width="240" height="160" fill="#f7f7f4"/><rect x="0" y="144" width="240" height="16" fill="#d8d8d2"/><rect x="16" y="18" width="62" height="34" rx="5" fill="none" stroke="#2c7a54" stroke-width="2.5"/><rect x="104" y="18" width="62" height="34" rx="5" fill="none" stroke="#2c7a54" stroke-width="2.5"/><rect x="170" y="78" width="54" height="34" rx="5" fill="none" stroke="#b4573a" stroke-width="2.5"/><rect x="40" y="84" width="62" height="34" rx="5" fill="none" stroke="#2c7a54" stroke-width="2.5"/><path d="M78 35h26M135 52v24l-40 8M166 35l40 0 0 43M71 52v32" stroke="#444" stroke-width="2" fill="none" stroke-linecap="round"/>${lines(24, 28, [44, 30], "#888", 8, 3)}${lines(112, 28, [44, 30], "#888", 8, 3)}${lines(48, 94, [44, 30], "#888", 8, 3)}${lines(178, 88, [38, 26], "#888", 8, 3)}<circle cx="206" cy="30" r="9" fill="#d6b25e" opacity=".8"/>`,
  ),
  barber: frame(
    `<rect width="240" height="160" fill="#2a2320"/><rect x="0" y="116" width="240" height="44" fill="#1a1514"/><rect x="26" y="20" width="62" height="86" rx="31" fill="#4b5a62" stroke="#d6b25e" stroke-width="4"/><rect x="34" y="28" width="46" height="70" rx="23" fill="#6f8089"/><path d="M130 104h54v-26c0-8-6-12-12-12h-30c-6 0-12 4-12 12z" fill="#7a1f2d"/><rect x="148" y="104" width="18" height="30" fill="#8a8f93"/><rect x="132" y="132" width="50" height="8" rx="4" fill="#8a8f93"/><rect x="132" y="48" width="14" height="18" rx="3" fill="#e8e2cf"/><rect x="154" y="48" width="14" height="18" rx="3" fill="#d6b25e"/><rect x="176" y="48" width="14" height="18" rx="3" fill="#e8e2cf"/>`,
  ),
};

export const waImage = (kind: WaImageKind) => ART[kind];
