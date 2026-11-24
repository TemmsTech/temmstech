import { WA_THREADS } from "@/data/whatsapp-history";

/**
 * What the hero laptop's simulated WhatsApp window shows. Every name and message
 * here is made up; nothing comes from a real account. `tone` picks one of the
 * avatar colour pairs in components/screen-whatsapp.css.
 */
/** Structured content for an assistant reply: text, a bold heading, or a code block. */
export type WaBlock =
  | { type: "p" | "h"; text: string }
  | { type: "code"; lang: string; code: string };

export type WaImageKind =
  | "wireframe" | "storefront" | "logo" | "palette" | "dress" | "bag" | "fabric"
  | "invoice" | "price-list" | "phone-ui" | "chart" | "sunset" | "whiteboard" | "barber";

export type WaMessage = {
  from: "me" | "them";
  text: string;
  /** A picture sent in the message, drawn in lib/screen-whatsapp-images.ts; `text` is its caption. */
  image?: WaImageKind;
  /** Who wrote it, in group chats. */
  sender?: string;
  /** Replaces `text` with headings and code blocks (used by the Meta AI chat). */
  rich?: WaBlock[];
  time: string;
  /** A day label shown above this message. */
  day?: string;
};

export type WaChat = {
  id: string;
  name: string;
  tone: number;
  time: string;
  preview: string;
  unread?: number;
  muted?: boolean;
  /** The Meta AI assistant: shows its logo, no call buttons, and the web banner. */
  ai?: boolean;
  /** The last message was sent by the owner (shows ticks). */
  sent?: boolean;
  /** The last event was a call, not a message. */
  call?: "video" | "missed";
  messages: WaMessage[];
};

export const WA_META_AI: WaChat = {
  id: "meta-ai",
  name: "Meta AI",
  tone: 0,
  time: "Friday",
  preview: "Here are the main loops in JavaScript — from basics to advanced",
  ai: true,
  messages: [
    { from: "me", day: "Friday", text: "Show me the different loops in JavaScript", time: "00:30" },
    {
      from: "them",
      text: "",
      time: "00:31",
      rich: [
        { type: "p", text: "Here are the main loops in JavaScript — from basics to advanced:" },
        { type: "h", text: "1. `for` — best when you know how many times" },
        { type: "code", lang: "JavaScript", code: "for (let i = 0; i < 5; i++) {\n  console.log(i);\n}\n// Output: 0, 1, 2, 3, 4" },
        { type: "h", text: "2. `for...of` — best for looping through arrays" },
        { type: "code", lang: "JavaScript", code: "const fruits = [\"mango\", \"orange\", \"pineapple\"];\n\nfor (const fruit of fruits) {\n  console.log(fruit);\n}" },
        { type: "h", text: "3. `while` — best when you don't know how many times" },
        { type: "code", lang: "JavaScript", code: "let score = 10;\n\nwhile (score > 0) {\n  console.log(score);\n  score--;\n}" },
        { type: "h", text: "4. `forEach` — the cleanest for arrays" },
        { type: "code", lang: "JavaScript", code: "const numbers = [2, 4, 6, 8];\n\nnumbers.forEach(num => {\n  console.log(num * 2);\n});\n// Output: 4, 8, 12, 16" },
        { type: "p", text: "Want me to show you a loop for something specific like looping through objects, infinite loop, or breaking early?" },
      ],
    },
  ],
};

/**
 * Profile photos, by display name. The files live in public/avatars and are fetched once with
 * `node scripts/fetch-avatars.mjs`; a missing file falls back to the coloured initial. Groups
 * and communities have no photo.
 */
export const WA_AVATARS: Record<string, string> = {
  "Adaeze Okoro": "/avatars/adaeze.jpg",
  "Tunde Bakare": "/avatars/tunde.jpg",
  "Ngozi Eze": "/avatars/ngozi.jpg",
  "Ibrahim Sule": "/avatars/ibrahim.jpg",
  "Chiamaka Nwosu": "/avatars/chiamaka.jpg",
  "Henry Adeyemi": "/avatars/henry.jpg",
  "Folake Ajayi": "/avatars/folake.jpg",
  Me: "/avatars/me.jpg",
};

const RECENT_CHATS: WaChat[] = [
  {
    id: "adaeze",
    name: "Adaeze Okoro",
    tone: 0,
    time: "01:17",
    preview: "Yes, that works. Mornings are best for me 🙏",
    unread: 2,
    messages: [],
  },
  {
    id: "tunde",
    name: "Tunde Bakare",
    tone: 1,
    time: "Yesterday",
    preview: "I sent the logo files to your email 📧",
    messages: [],
  },
  {
    id: "studio",
    name: "Studio Clients",
    tone: 4,
    time: "Yesterday",
    preview: "Kemi: Can we move the review to Friday? 🙏",
    unread: 12,
    muted: true,
    messages: [],
  },
  {
    id: "ngozi",
    name: "Ngozi Eze",
    tone: 3,
    time: "Yesterday",
    preview: "Great. Let me know if anything needs changing 😊",
    sent: true,
    messages: [],
  },
  {
    id: "ibrahim",
    name: "Ibrahim Sule",
    tone: 2,
    time: "Yesterday",
    preview: "Is the quote still valid? 🤔",
    unread: 1,
    messages: [],
  },
  {
    id: "chiamaka",
    name: "Chiamaka Nwosu",
    tone: 5,
    time: "Tuesday",
    preview: "Missed voice call",
    call: "missed",
    messages: [
      { from: "them", day: "Tuesday", text: "Hi, I tried calling about the booking page 📞", time: "17:30" },
    ],
  },
  {
    id: "henry",
    name: "Henry Adeyemi",
    tone: 1,
    time: "Tuesday",
    preview: "Video call",
    call: "video",
    messages: [],
  },
  {
    id: "folake",
    name: "Folake Ajayi",
    tone: 3,
    time: "Monday",
    preview: "Can you also do product photos? 📸",
    unread: 1,
    messages: [],
  },
  {
    id: "updates",
    name: "Team Updates",
    tone: 0,
    time: "Monday",
    preview: "Seun: Deploy went through 🚀",
    muted: true,
    messages: [],
  },
];

/** Long histories (data/whatsapp-history.ts) replace the empty `messages` of the busiest chats. */
export const WA_CHATS: WaChat[] = RECENT_CHATS.map((chat) => ({
  ...chat,
  messages: WA_THREADS[chat.id] ?? chat.messages,
}));

export type WaCall = {
  name: string;
  tone: number;
  when: string;
  direction: "Outgoing" | "Incoming" | "Missed";
  video?: boolean;
  /** Clock time the call started, shown in Call info. */
  at: string;
  /** How long it lasted; missed calls have none. */
  length?: string;
};

export const WA_FAVOURITES: { name: string; tone: number }[] = [{ name: "Tunde Bakare", tone: 1 }];

export const WA_CALLS: WaCall[] = [
  { name: "Henry Adeyemi", tone: 1, when: "Yesterday", direction: "Outgoing", video: true, at: "15:31", length: "17 minutes" },
  { name: "Adaeze Okoro", tone: 0, when: "Yesterday", direction: "Outgoing", at: "20:36", length: "8 seconds" },
  { name: "Ngozi Eze", tone: 3, when: "Yesterday", direction: "Outgoing", at: "11:05", length: "4 minutes" },
  { name: "Folake Ajayi", tone: 3, when: "Yesterday", direction: "Incoming", video: true, at: "09:48", length: "12 minutes" },
  { name: "Ibrahim Sule", tone: 2, when: "Tuesday", direction: "Outgoing", at: "18:12", length: "2 minutes" },
  { name: "Ibrahim Sule", tone: 2, when: "Tuesday", direction: "Outgoing", at: "10:20", length: "31 seconds" },
  { name: "Chiamaka Nwosu", tone: 5, when: "Tuesday", direction: "Missed", at: "17:28" },
];

/** One status update: a picture from the shared set, or text on a coloured background (`tone`, 0 to 5). */
export type WaStatusItem =
  | { kind: "image"; image: WaImageKind; caption?: string; at: string }
  | { kind: "text"; text: string; tone: number; at: string };

/** Each person has between one and three updates, oldest first. */
export type WaStatus = { name: string; tone: number; when: string; seen?: boolean; items: WaStatusItem[] };

export const WA_STATUSES: WaStatus[] = [
  {
    name: "Ngozi Eze",
    tone: 3,
    when: "Yesterday at 23:15",
    items: [
      { kind: "image", image: "whiteboard", caption: "Planning day 🧠", at: "Yesterday at 21:40" },
      { kind: "text", text: "Deliveries up 20% this month 🚚🔥", tone: 2, at: "Yesterday at 23:15" },
    ],
  },
  {
    name: "Tunde Bakare",
    tone: 1,
    when: "Yesterday at 23:00",
    items: [
      { kind: "image", image: "barber", caption: "New chairs 💈", at: "Yesterday at 18:20" },
      { kind: "image", image: "price-list", caption: "Opening Saturday! Book online soon", at: "Yesterday at 20:05" },
      { kind: "image", image: "sunset", caption: "Last evening before the opening 🙏", at: "Yesterday at 23:00" },
    ],
  },
  {
    name: "Folake Ajayi",
    tone: 3,
    when: "Yesterday at 22:56",
    items: [
      { kind: "image", image: "sunset", caption: "New scent coming soon 🕯️", at: "Yesterday at 22:56" },
    ],
  },
  {
    name: "Henry Adeyemi",
    tone: 1,
    when: "Yesterday at 22:45",
    items: [
      { kind: "image", image: "chart", caption: "Usage this week 📈", at: "Yesterday at 17:52" },
      { kind: "text", text: "Meter pilot goes live on Monday ⚡", tone: 4, at: "Yesterday at 22:45" },
    ],
  },
  {
    name: "Ibrahim Sule",
    tone: 2,
    when: "Yesterday at 22:34",
    seen: true,
    items: [
      { kind: "text", text: "Stock count day. Pray for me 😅", tone: 0, at: "Yesterday at 22:34" },
    ],
  },
  {
    name: "Chiamaka Nwosu",
    tone: 5,
    when: "Yesterday at 22:17",
    items: [
      { kind: "image", image: "bag", caption: "Sample for the booking page shoot 👜", at: "Yesterday at 19:30" },
      { kind: "text", text: "Weekend plans: sleep 😴", tone: 1, at: "Yesterday at 22:17" },
    ],
  },
  {
    name: "Adaeze Okoro",
    tone: 0,
    when: "Yesterday at 22:05",
    seen: true,
    items: [
      { kind: "image", image: "dress", caption: "Launch collection 👗✨", at: "Yesterday at 20:30" },
      { kind: "image", image: "bag", caption: "Bags are ready", at: "Yesterday at 21:10" },
      { kind: "image", image: "fabric", caption: "Ankara drop this week 🧵", at: "Yesterday at 22:05" },
    ],
  },
];

export type WaCommunity = {
  name: string;
  tone: number;
  groups: { name: string; when: string; preview: string }[];
};

export const WA_COMMUNITIES: WaCommunity[] = [
  {
    name: "Studio Clients",
    tone: 4,
    groups: [
      { name: "Announcements", when: "27/10/2026", preview: "Kemi added you to the review thread" },
      { name: "Design reviews", when: "27/10/2026", preview: "Chidi: Draft two is ready" },
    ],
  },
  {
    name: "Business Network",
    tone: 2,
    groups: [{ name: "Announcements", when: "06/09/2026", preview: "Seun: New meetup date is set" }],
  },
];

export type WaChannel = { name: string; followers: string; tone: number; verified?: boolean };

/** Channels shown on the Channels screen. They are display only; none opens. */
export const WA_CHANNELS: WaChannel[] = [
  { name: "NELFUND", followers: "448k followers", tone: 4 },
  { name: "WhatsApp", followers: "233.9m followers", tone: 4, verified: true },
  { name: "NELFUND", followers: "434k followers", tone: 1 },
  { name: "Man City", followers: "24.1m followers", tone: 0, verified: true },
  { name: "JAMB 2027 QUESTIONS & ANSW…", followers: "428k followers", tone: 4 },
];
