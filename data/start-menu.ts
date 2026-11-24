/** What the Start menu on the laptop's Windows desktop shows. Static, like the rest of the screen. */

/** The windows the menu can open. Anything without one just closes the menu. */
export type StartLaunch =
  | "edge"
  | "chrome"
  | "brave"
  | "code"
  | "explorer"
  | "terminal"
  | "vlc"
  | "granola"
  | "claude"
  | "chatgpt"
  | "whatsapp"
  | "bin";

/** How an app's picture is made: a cell of the taskbar or desktop sprite, or a drawn icon. */
export type StartPicture =
  | { sheet: "bar" | "desk"; cell: number }
  | { drawn: "settings" | "photos" | "solitaire" | "paint" | "linkedin" | "calculator" | "clock" | "notepad" | "snipping" | "idm" | "teams" }
  | { logo: "claude" | "chatgpt" | "vlc" };

export type StartApp = {
  name: string;
  picture: StartPicture;
  opens?: StartLaunch;
};

const bar = (cell: number): StartPicture => ({ sheet: "bar", cell });
const desk = (cell: number): StartPicture => ({ sheet: "desk", cell });

export const APPS = {
  edge: { name: "Microsoft Edge", picture: bar(2), opens: "edge" },
  outlook: { name: "Outlook", picture: bar(4) },
  store: { name: "Microsoft Store", picture: bar(5) },
  settings: { name: "Settings", picture: { drawn: "settings" } },
  photos: { name: "Photos", picture: { drawn: "photos" } },
  solitaire: { name: "Solitaire & Casual Games", picture: { drawn: "solitaire" } },
  paint: { name: "Paint", picture: { drawn: "paint" } },
  linkedin: { name: "LinkedIn", picture: { drawn: "linkedin" } },
  calculator: { name: "Calculator", picture: { drawn: "calculator" } },
  clock: { name: "Clock", picture: { drawn: "clock" } },
  notepad: { name: "Notepad", picture: { drawn: "notepad" } },
  snipping: { name: "Snipping Tool", picture: { drawn: "snipping" } },
  // Not pinned, but they have windows, so searching for them works.
  explorer: { name: "File Explorer", picture: bar(3), opens: "explorer" },
  code: { name: "Visual Studio Code", picture: bar(7), opens: "code" },
  terminal: { name: "Terminal", picture: bar(9), opens: "terminal" },
  brave: { name: "Brave", picture: bar(8), opens: "brave" },
  chrome: { name: "Google Chrome", picture: desk(8), opens: "chrome" },
  vlc: { name: "VLC media player", picture: { logo: "vlc" }, opens: "vlc" },
  granola: { name: "Granola", picture: desk(19), opens: "granola" },
  claude: { name: "Claude", picture: { logo: "claude" }, opens: "claude" },
  chatgpt: { name: "ChatGPT", picture: { logo: "chatgpt" }, opens: "chatgpt" },
  whatsapp: { name: "WhatsApp", picture: bar(12), opens: "whatsapp" },
  bin: { name: "Recycle Bin", picture: desk(0), opens: "bin" },
  teams: { name: "Microsoft Teams", picture: bar(6) },
  idm: { name: "Internet Download Manager", picture: { drawn: "idm" } },
  drive: { name: "Google Drive", picture: desk(13) },
  github: { name: "GitHub Desktop", picture: desk(10) },
  loom: { name: "Loom", picture: desk(18) },
} as const satisfies Record<string, StartApp>;

export const PINNED: readonly StartApp[] = [
  APPS.edge,
  APPS.outlook,
  APPS.store,
  APPS.settings,
  APPS.photos,
  APPS.solitaire,
  APPS.paint,
  APPS.linkedin,
  APPS.calculator,
  APPS.clock,
  APPS.notepad,
  APPS.snipping,
];

export type StartRecent = {
  name: string;
  note: string;
  picture: StartPicture | { file: "image" | "download" };
};

export const RECENT: readonly StartRecent[] = [
  { name: "Google Drive", note: "Recently added", picture: APPS.drive.picture },
  { name: "Internet Download Manager", note: "Recently added", picture: APPS.idm.picture },
  { name: "Screenshot 2026-11-21 231611", note: "12m ago", picture: { file: "image" } },
  { name: "temmstech-context", note: "25m ago", picture: { file: "download" } },
];

/** The "All" section: folders of four, opened into a list. */
export const CATEGORIES: readonly { title: string; apps: readonly StartApp[] }[] = [
  { title: "Browsers", apps: [APPS.edge, APPS.chrome, APPS.brave, APPS.idm] },
  { title: "Files & media", apps: [APPS.explorer, APPS.vlc, APPS.photos, APPS.snipping] },
  { title: "Developer", apps: [APPS.code, APPS.terminal, APPS.github, APPS.claude] },
  { title: "Work & AI", apps: [APPS.drive, APPS.chatgpt, APPS.granola, APPS.loom] },
  { title: "Utilities", apps: [APPS.calculator, APPS.clock, APPS.notepad, APPS.paint] },
  { title: "Social & mail", apps: [APPS.whatsapp, APPS.linkedin, APPS.outlook, APPS.teams] },
];

/** Everything the search box looks through. */
export const SEARCHABLE: readonly StartApp[] = Object.values(APPS);

export const PROFILE_NAME = "TEMMS";

/** The iPhone panel on the right (Phone Link). */
export const PHONE = {
  name: "iPhone",
  battery: "64%",
  actions: ["Messages", "Calls", "Send files"],
  notifications: [
    { app: "X", note: "100 new notifications", icon: "x" },
    { app: "8 Ball Pool", note: "91 new notifications", icon: "pool" },
    { app: "Flashscore", note: "74 new notifications", icon: "flashscore" },
  ],
} as const;
