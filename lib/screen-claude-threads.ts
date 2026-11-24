import { EXCERPTS } from "@/lib/screen-claude-excerpts";

export type Lang = "html" | "js" | "ts" | "css" | "text";
export type FileEntry = { id: string; name: string; type: string; lang: Lang; code: string };
export type Block =
  | { p: string }
  | { list: string[] }
  | { code: string; lang: Lang; label: string }
  | { files: string[]; all?: boolean };
export type Message = { who: "user"; text: string } | { who: "claude"; blocks: Block[] };
export type Thread = {
  id: string;
  title: string;
  messages: Message[];
  files: FileEntry[];
  /** The file open in the side panel when the chat is first shown (none: the panel starts closed). */
  firstFile?: string;
};

const file = (id: string, name: string, type: string, lang: Lang, code: string): FileEntry => ({
  id,
  name,
  type,
  lang,
  code,
});

/**
 * The chats in the Claude window. The first is this project's own build
 * conversation (the files are real excerpts from the project, see
 * lib/screen-claude-excerpts.ts); the others are short made-up chats.
 */
export const THREADS: readonly Thread[] = [
  {
    id: "build",
    title: "Building a multi-app desktop prototype",
    firstFile: "browser-claude",
    files: [
      file("device-showcase", "Device showcase", "TSX", "ts", EXCERPTS["device-showcase"]),
      file("browser-vlc", "Screen browser", "TS", "ts", EXCERPTS["browser-vlc"]),
      file("backdrop", "Globals", "CSS", "css", EXCERPTS["backdrop"]),
      file("desktop-trim", "Screen desktop", "TS", "ts", EXCERPTS["desktop-trim"]),
      file("app-icons", "Screen app icons", "TS", "ts", EXCERPTS["app-icons"]),
      file("open-zoom", "Open zoom", "TSX", "ts", EXCERPTS["open-zoom"]),
      file("scene-sway", "Device scene", "TS", "ts", EXCERPTS["scene-sway"]),
      file("events", "Showcase events", "TS", "ts", EXCERPTS["events"]),
      file("claude-types", "Screen claude", "TS", "ts", EXCERPTS["claude-types"]),
      file("browser-claude", "Screen browser", "TS", "ts", EXCERPTS["browser-claude"]),
      file("zip", "T T fixed", "ZIP", "text", EXCERPTS["zip"]),
    ],
    messages: [
      {
        who: "user",
        text: "the simulated laptop in the hero section. when i click recycle bin, it seems broken, can you fix it. also, the scratch file has vlc working, can we implement?",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Both are in. The Recycle Bin’s stylesheet, <code>screen-recycle-bin.css</code>, was never imported anywhere, so the window’s code ran with no styles. I added the import to <code>device-showcase.tsx</code>.",
          },
          {
            p: "VLC was gated to /scratch: <code>vlcEnabled()</code> only returned true there. It now returns true for everyone, so the desktop icon and taskbar button open the same player as on the scratch page.",
          },
          { files: ["device-showcase", "browser-vlc"] },
        ],
      },
      {
        who: "user",
        text: "in this zoom to interact mode: can the close button sit above the lets talk buttton area exactly, and also can we make the background more darker to give the laptop focus?",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Done. When zoom mode opens, the page measures the real Let’s talk button and puts Close in exactly the same spot and size, with a solid fill so nothing shows through. On phones, where Let’s talk is hidden, Close stays top right.",
          },
          {
            p: "The backdrop is now close to black, a little lighter behind the laptop so it stays the focus:",
          },
          { files: ["backdrop"] },
        ],
      },
      {
        who: "user",
        text: "list out the desktop icons that arent wired yet, so i can choose which ones to keep and remove",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Sixteen icons only highlight when double-clicked: UltraISO, PowerISO, Foxit PDF Reader, Adobe Acrobat, Google Chrome, Claude, GitHub Desktop, HandBrake, Makinde - Chrome, Google Drive, Google Docs, Google Sheets, Google Slides, 3D Prototypes, Loom and Adobe Express.",
          },
          {
            p: "Microsoft Edge, Temms Tech, Visual Studio Code, Brave, Granola, Recycle Bin and VLC are already wired.",
          },
        ],
      },
      {
        who: "user",
        text: "make sure we have the scratch file updated, thats how i test before implementing in main project. lets remove: 1,2,3,8,9,11,12,13,14,16.",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Removed on /scratch only, so you can check them there first. The remaining icons keep their pictures and the grid closes up on its own.",
          },
          { files: ["desktop-trim"] },
        ],
      },
      {
        who: "user",
        text: "instead use, proper claude logo, also put chatgpt icon on the desktop. lets wire the chrome browser, just like the others we already did",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Claude now uses a drawn starburst (my approximation, so paste the official SVG into <code>screen-app-icons.ts</code> if you have it), and ChatGPT sits right after it. Double-clicking Google Chrome opens a Chrome window with two tabs and the same maximise, minimise and close as Brave.",
          },
          { files: ["app-icons"] },
        ],
      },
      {
        who: "user",
        text: "do not remove icons but update the replaced desktop logos and add the new one in main project, and add the wiring we just did.",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Live everywhere now: the Claude logo, the ChatGPT icon and the Chrome window. All the original icons stay on the main site; the cleanup of ten icons still applies only on /scratch.",
          },
        ],
      },
      {
        who: "user",
        text: "taskbar is getting too filled up, can closed apps be closed, only pin edge, explorer, vs code and visual studio. anything else closes out when we close them",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Done. Edge, File Explorer and VS Code stay pinned. Brave, Terminal, Granola, WhatsApp, VLC, Recycle Bin and Chrome now show a taskbar button only while they are open or minimised.",
          },
          {
            p: "One catch: Terminal and WhatsApp have no desktop icons, so closing them leaves no way to reopen them. Say if you want icons for them.",
          },
        ],
      },
      { who: "user", text: "when i load or refresh the scratch file, what happens to the laptop?" },
      {
        who: "claude",
        blocks: [
          {
            p: "It opens in Zoom in &amp; interact mode by itself, once the 3D laptop is ready. Nothing is saved between loads, so every window starts closed.",
          },
        ],
      },
      { who: "user", text: "very good. can we have that effect in main project" },
      {
        who: "claude",
        blocks: [
          {
            p: "Yes, the home page does it too now. The helper lives in <code>components/open-zoom.tsx</code> and skips itself under browser automation, so your scroll tests still see the normal page.",
          },
          { files: ["open-zoom"] },
        ],
      },
      { who: "user", text: "main project, does the laptop sway stops?" },
      {
        who: "claude",
        blocks: [
          {
            p: "Yes. Zoom mode fades the sway out and keeps it off until you close the zoom.",
          },
        ],
      },
      {
        who: "user",
        text: "when outside zoom mode, ie normal hero section mode, sway should be infinite, unless the user interacts with it, and after it detects no interaction, it sways again. sway must be seen",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Two things were hiding it: it rested front-on for about a third of every cycle, and it stopped for as long as the mouse stayed over the laptop.",
          },
          {
            list: [
              "It now sways continuously, front-on as each tab opens",
              "Moving, pressing, scrolling or typing pauses it",
              "After 2.5 seconds of quiet it starts again from front-on",
            ],
          },
          { files: ["scene-sway", "events"] },
        ],
      },
      {
        who: "user",
        text: "lets develop claude interface. and we make sure it scrolls, selects files etc. scratch file first, when its good, we do for main project",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Built on /scratch: a window laid out like your screenshot, with a chat that scrolls, file cards that open in a code panel with line numbers, and working window controls.",
          },
          { files: ["claude-types"] },
        ],
      },
      {
        who: "user",
        text: "very good, lets do it in the main project. but lets use this thread we are chatting and building with, and lets be able to have multiple chat threads too",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Done. The Claude window is on the main site now and shows this conversation. The sidebar lists several chats, <b>New chat</b> starts a blank one, and each chat remembers its own scroll position and open file.",
          },
          { files: ["browser-claude", "zip"], all: true },
        ],
      },
    ],
  },
  {
    id: "search",
    title: "Search panel bug and shortcuts",
    firstFile: "shortcuts",
    files: [
      file(
        "shortcuts",
        "Shortcuts",
        "JS",
        "js",
        String.raw`// Keyboard shortcuts for the search panel.
const panel = document.getElementById("searchPanel");
const box = document.getElementById("searchBox");

const typing = (el) => /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);

document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !typing(e.target)) {
    e.preventDefault();
    panel.hidden = false;
    box.focus();
  }
  if (e.key === "Escape" && !panel.hidden) {
    panel.hidden = true;
    box.blur();
  }
});`,
      ),
    ],
    messages: [
      {
        who: "user",
        text: "The search panel stays open after I press Esc, and the / shortcut doesn't focus the search box.",
      },
      {
        who: "claude",
        blocks: [
          {
            p: "Both come from the same cause: the key handler is attached to the search input, so it only hears keys while the input already has focus.",
          },
          {
            p: "Attach it to the document instead, ignore keys typed into fields, and close the panel on Escape:",
          },
          { files: ["shortcuts"] },
        ],
      },
      { who: "user", text: "That fixed it, thanks." },
      {
        who: "claude",
        blocks: [
          {
            p: "Good. If you add more shortcuts later, keep them in that one handler so they can’t collide.",
          },
        ],
      },
    ],
  },
  {
    id: "contact",
    title: "Contact page review notes",
    firstFile: "checklist",
    files: [
      file(
        "checklist",
        "Review checklist",
        "TXT",
        "text",
        `Contact page review

[ ] Labels on every field
[ ] Inline errors, announced to screen readers
[ ] Submit disabled while sending
[ ] Success state replaces the form
[ ] Works at 360px wide
[ ] Spam trap field hidden from people`,
      ),
    ],
    messages: [
      { who: "user", text: "What should I check before merging the contact page?" },
      {
        who: "claude",
        blocks: [
          { p: "A short pass covers most of it:" },
          {
            list: [
              "Every field has a visible label, not just a placeholder",
              "Errors appear next to the field and are read out by screen readers",
              "The form can’t be submitted twice while it is sending",
              "A clear success message replaces the form",
              "It still works at 360px wide",
            ],
          },
          { files: ["checklist"] },
        ],
      },
    ],
  },
  {
    id: "print",
    title: "Printing exam slips on A4",
    firstFile: "print",
    files: [
      file(
        "print",
        "Print styles",
        "CSS",
        "css",
        String.raw`@page {
  size: A4;
  margin: 12mm;
}

.slip {
  width: 186mm;
  break-inside: avoid;
}

@media print {
  .toolbar,
  .no-print {
    display: none;
  }
}`,
      ),
    ],
    messages: [
      { who: "user", text: "The slips print cut off on the right edge." },
      {
        who: "claude",
        blocks: [
          {
            p: "Browsers add their own page margins, so a fixed pixel width spills over. Set the page size and margins yourself, and size the slip in millimetres:",
          },
          { files: ["print"] },
        ],
      },
    ],
  },
];
