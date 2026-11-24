/** One command in a "Ran commands" row, with what it printed. */
export type Command = { cmd: string; out?: string };
export type Block =
  | { p: string }
  | { ran: Command[] }
  /** The thin line with a notice in the middle, e.g. the usage limit. */
  | { divider: string };
export type Message =
  | { who: "user"; text: string; long?: boolean }
  | { who: "notice"; text: string }
  | { who: "gpt"; blocks: Block[] };
export type Source = { id: string; kind: "image" | "file" | "app"; name: string };
export type Thread = {
  id: string;
  title: string;
  messages: Message[];
  /** Pages and previews the chat has open (the "Outputs" card). */
  outputs: string[];
  sources: Source[];
  /** The "You're out of usage" card above the reply box. */
  limit?: boolean;
};

/**
 * The chats in the ChatGPT (Codex) window. Everything here is made up, apart
 * from the chat names, which follow the real app's sidebar.
 */
export const THREADS: readonly Thread[] = [
  {
    id: "foundation",
    title: "Set up TemmsTech foundation",
    limit: true,
    outputs: ["127.0.0.1:3000/work"],
    sources: [
      { id: "clip", kind: "image", name: "codex-clipboard-bc51f53c-d909-426d-8a31-6e0c7f5e2b19.png" },
      { id: "design", kind: "file", name: "--- name: apple-design description: Apple-style design rules for the site" },
      { id: "tools", kind: "app", name: "ChatGPT App Tools" },
      { id: "brief", kind: "file", name: "temmstech-brief.md" },
      { id: "tokens", kind: "file", name: "design-tokens.json" },
    ],
    messages: [
      {
        who: "user",
        long: true,
        text: "Set up the TemmsTech foundation. Start a Next.js app with TypeScript and Tailwind, add a shared header and footer, a hero module and the design tokens from the brief. Keep the pages static, keep the code small, and run the checks before you tell me it is done.",
      },
      {
        who: "gpt",
        blocks: [
          { p: "Starting with the project scaffold and the shared layout, then the design tokens from your brief." },
          {
            ran: [
              { cmd: "npx create-next-app@latest temmstech --ts --tailwind --app", out: "Creating a new Next.js app in temmstech.\nSuccess! Created temmstech" },
              { cmd: "cd temmstech && npm install", out: "added 312 packages in 14s" },
              { cmd: "npm run typecheck", out: "tsc --noEmit\nNo errors." },
            ],
          },
          { p: "The foundation is in: the app shell, a shared header and footer, the hero module and the colour and spacing tokens. Typecheck passes. The next step is the Work page." },
        ],
      },
      { who: "user", text: "add the work page and run it so i can see it" },
      {
        who: "gpt",
        blocks: [
          { p: "The Work page is in, with the project grid and the filters. I started the dev server so you can look at it." },
          {
            ran: [
              { cmd: "npm run dev", out: "▲ Next.js ready\nLocal: http://127.0.0.1:3000" },
              { cmd: "curl -s -o /dev/null -w \"%{http_code}\" http://127.0.0.1:3000/work", out: "200" },
            ],
          },
          { p: "It answers on <code>127.0.0.1:3000/work</code>. The grid shows six projects, and the filter row sits above it." },
        ],
      },
      {
        who: "user",
        long: true,
        text: "Good. Now get it live. Check how Git and Vercel are linked on this machine, run install, typecheck, lint and the production build, then run the full Playwright check. If everything passes, initialise Git, push to GitHub and deploy through the linked Vercel project. Do not create anything new on GitHub until you have checked the repository name.",
      },
      { who: "notice", text: "This model isn’t available" },
      { who: "user", text: "now" },
      {
        who: "gpt",
        blocks: [
          { p: "I’m checking the existing Git/Vercel linkage and running the project checks first, then I’ll push and deploy through the linked configuration." },
          {
            ran: [
              { cmd: "git remote -v", out: "(no remotes)" },
              { cmd: "vercel project ls", out: "temmstech   linked   Production: ready" },
              { cmd: "npm install && npm run typecheck && npm run lint && npm run build", out: "typecheck: ok\nlint: ok\nbuild: 14 pages generated" },
            ],
          },
          { p: "The project is clean through install, typecheck, lint, and production build. The full Playwright check is running now; after it passes I’ll initialize Git and use the existing Vercel project linkage. GitHub still needs a repository name, so I’m checking whether the configured SSH alias already identifies one before creating anything." },
          { ran: [{ cmd: "ssh -G github.com", out: "hostname github.com\nuser git" }, { cmd: "npx playwright test", out: "Running 48 tests using 4 workers…" }] },
          { divider: "You’ve hit your usage limit. Upgrade your plan to continue, or try again later." },
        ],
      },
    ],
  },
  {
    id: "mog",
    title: "Start the Mog project",
    outputs: ["127.0.0.1:3001"],
    sources: [{ id: "readme", kind: "file", name: "README.md" }],
    messages: [
      { who: "user", text: "start the mog project" },
      {
        who: "gpt",
        blocks: [
          { p: "Found it in your projects folder. Installing the packages first, then starting the dev server." },
          {
            ran: [
              { cmd: "npm install", out: "added 204 packages in 9s" },
              { cmd: "npm run dev", out: "ready on http://127.0.0.1:3001" },
            ],
          },
          { p: "It is running on <code>127.0.0.1:3001</code>. The home page loads and there are no errors in the terminal." },
        ],
      },
    ],
  },
  {
    id: "run-mog",
    title: "Run mog project",
    outputs: [],
    sources: [],
    messages: [
      { who: "user", text: "run mog project" },
      {
        who: "gpt",
        blocks: [
          { p: "The server was already up, so I only checked it." },
          { ran: [{ cmd: "curl -s -o /dev/null -w \"%{http_code}\" http://127.0.0.1:3001", out: "200" }] },
          { p: "It answers with 200. Nothing to restart." },
        ],
      },
    ],
  },
  {
    id: "don",
    title: "Start Don Elclasico app",
    outputs: ["127.0.0.1:3002"],
    sources: [],
    messages: [
      { who: "user", text: "start don elclasico app" },
      {
        who: "gpt",
        blocks: [
          { p: "Starting it now. I will use the next free port so it does not clash with the other project." },
          { ran: [{ cmd: "npm run dev -- -p 3002", out: "ready on http://127.0.0.1:3002" }] },
          { p: "Don Elclasico is running on <code>127.0.0.1:3002</code>." },
        ],
      },
    ],
  },
];
