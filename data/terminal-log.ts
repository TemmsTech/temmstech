/**
 * What the hero laptop's Terminal window shows: the owner's own dev-server and
 * git session. Repeated blocks are built from the same pieces. The Windows user
 * name is generic and the LAN "Network:" lines are left out.
 */
export const TERMINAL_BANNER = [
  "Windows PowerShell 5.1",
  "Copyright (C) Microsoft Corporation. All rights reserved.",
  "",
];

const PROMPT = "PS C:\\Users\\dev\\Temms Tech> ";

const WARNING_LINES = [
  "(209,39-65): warning X4122: sum of 1 and -1.49272e-017 cannot be represented accurately in double precision",
  "(210,87-113): warning X4122: sum of 1 and -1.49272e-017 cannot be represented accurately in double precision",
  "(209,39-65): warning X4122: sum of 1 and -1.66644e-018 cannot be represented accurately in double precision",
  "(210,87-113): warning X4122: sum of 1 and -1.66644e-018 cannot be represented accurately in double precision (lib/device-scene.ts:104:29)",
];
const WARN = [
  "[browser] THREE.WebGLProgram: Program Info Log: (210,86-138): warning X4122: sum of 0.996094 and -2.98545e-017 cannot be represented accurately in double precision",
  ...WARNING_LINES,
];

const DOM_CODES = [
  "INDEX_SIZE_ERR", "DOMSTRING_SIZE_ERR", "HIERARCHY_REQUEST_ERR", "WRONG_DOCUMENT_ERR",
  "INVALID_CHARACTER_ERR", "NO_DATA_ALLOWED_ERR", "NO_MODIFICATION_ALLOWED_ERR",
  "NOT_FOUND_ERR", "NOT_SUPPORTED_ERR", "INUSE_ATTRIBUTE_ERR", "INVALID_STATE_ERR",
  "SYNTAX_ERR", "INVALID_MODIFICATION_ERR", "NAMESPACE_ERR", "INVALID_ACCESS_ERR",
  "VALIDATION_ERR", "TYPE_MISMATCH_ERR", "SECURITY_ERR", "NETWORK_ERR", "ABORT_ERR",
  "URL_MISMATCH_ERR", "QUOTA_EXCEEDED_ERR", "TIMEOUT_ERR", "INVALID_NODE_TYPE_ERR",
  "DATA_CLONE_ERR",
];
const TIMEOUT = [
  "Error [TimeoutError]: The operation was aborted due to timeout",
  "    at ignore-listed frames {",
  "  code: 23,",
  ...DOM_CODES.map((name, index) => `  ${name}: ${index + 1}${index === DOM_CODES.length - 1 ? "" : ","}`),
  "}",
];
const FETCH_FAILED = [
  "[TypeError: fetch failed] {",
  "  [cause]: Error: getaddrinfo ENOTFOUND images.unsplash.com",
  "      at ignore-listed frames {",
  "    errno: -3008,",
  "    code: 'ENOTFOUND',",
  "    syscall: 'getaddrinfo',",
  "    hostname: 'images.unsplash.com'",
  "  }",
  "}",
];

const PHOTOS = {
  a: "1547658719-da2b51169166",
  b: "1555664424-778a1e5e1b48",
  c: "1542744094-24638eff58bb",
  d: "1512941937669-90a1b58e7e9c",
  e: "1519389950473-47ba0277781c",
  f: "1674027444485-cec3da58eef4",
  g: "1499951360447-b19be8fe80f5",
} as const;
const photoUrl = (key: keyof typeof PHOTOS) =>
  `https://images.unsplash.com/photo-${PHOTOS[key]}?w=1200&q=80&auto=format&fit=crop`;
const timedOut = (key: keyof typeof PHOTOS) =>
  `⨯ upstream image response timed out for ${photoUrl(key)}`;
const image = (key: keyof typeof PHOTOS, width: number, took: string, server: string, app: string) =>
  ` GET /_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-${PHOTOS[key]}%3Fw%3D1200%26q%3D80%26auto%3Dformat%26fit%3Dcrop&w=${width}&q=75 500 in ${took} (next.js: ${server}, application-code: ${app})`;
const get = (path: string, took: string, server: string, app: string) =>
  ` GET ${path} 200 in ${took} (next.js: ${server}, application-code: ${app})`;

const SMOOTH =
  "[browser] Detected `scroll-behavior: smooth` on the `<html>` element. To disable smooth scrolling during route transitions, add `data-scroll-behavior=\"smooth\"` to your <html> element. Learn more: https://nextjs.org/docs/messages/missing-data-scroll-behavior";
const RSC =
  "[browser] Failed to fetch RSC payload for http://localhost:3000/contact. Falling back to browser navigation. TypeError: Failed to fetch";
const TRACE = [
  "Import trace:",
  "  Server Component:",
  "    ./components/device-showcase.tsx",
  "    ./modules/hero/Hero.tsx",
  "    ./modules/home/Home.tsx",
  "    ./app/page.tsx",
  "",
  "https://nextjs.org/docs/messages/module-not-found",
  "",
];
const NOT_FOUND_HERO = [
  "⨯ ./modules/hero/Hero.tsx:1:1",
  "Error: Module not found: Can't resolve '@/components/device-showcase'",
  '> 1 | import { DeviceShowcase } from "@/components/device-showcase";',
  "    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
  '  2 | import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";',
  '  3 | import { Arrow } from "@/components/arrow";',
  '  4 | import { Button } from "@/components/ui/button";',
  "",
  "Import map: aliased to relative './components/device-showcase' inside of [project]/",
  "",
  "",
  "Import trace:",
  "  Server Component:",
  "    ./modules/hero/Hero.tsx",
  "    ./modules/home/Home.tsx",
  "    ./app/page.tsx",
  "",
  "https://nextjs.org/docs/messages/module-not-found",
  "",
];
const notFoundExplorer = (first: string) => [
  first,
  "Error: Module not found: Can't resolve './screen-explorer.css'",
  '  19 | import type { ShowcaseProject, ShowcaseVideo } from "@/types/showcase";',
  '  20 | import "./screen-desktop.css";',
  '> 21 | import "./screen-explorer.css";',
  "     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
  '  22 | import "./screen-vscode.css";',
  "  23 |",
  "  24 | type DeviceShowcaseProps = {",
  "",
  "",
  ...TRACE,
];
const notFoundVsCode = (first: string) => [
  first,
  "Error: Module not found: Can't resolve './screen-vscode.css'",
  '  20 | import "./screen-desktop.css";',
  '  21 | import "./screen-explorer.css";',
  '> 22 | import "./screen-vscode.css";',
  "     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",
  "  23 |",
  "  24 | type DeviceShowcaseProps = {",
  "  25 |   projects: readonly ShowcaseProject[];",
  "",
  "",
  ...TRACE,
];
const showcaseBlocks = (pairs: number) =>
  Array.from({ length: pairs }, () => [
    ...notFoundExplorer("⨯ ./components/device-showcase.tsx:21:1"),
    ...notFoundVsCode("⨯ ./components/device-showcase.tsx:22:1"),
  ]).flat();

const repeat = (lines: string[], times: number) => Array.from({ length: times }, () => lines).flat();

const WORKING_COPY = [
  "app/globals.css", "components/device-showcase.tsx", "data/device-showcase.ts",
  "lib/device-scene.ts", "lib/screen-browser.ts", "lib/showcase-timing.ts",
  "modules/hero/AnimatedHeroCopy.tsx", "skills/temmstech-engineering/SKILL.md",
  "skills/temmstech-testing/SKILL.md", "tests/e2e/showcase.spec.ts", "types/showcase.ts",
  "components/screen-desktop.css", "components/screen-explorer.css",
  "components/screen-vscode.css", "lib/screen-desktop.ts", "lib/screen-explorer.spec.ts",
  "lib/screen-explorer.ts", "lib/screen-files.ts", "lib/screen-video-player.ts",
  "lib/screen-vscode.ts", "lib/showcase-events.ts", "lib/window-controls.ts",
  "tests/e2e/screen-explorer.spec.ts",
].map(
  (file) =>
    `warning: in the working copy of '${file}', LF will be replaced by CRLF the next time Git touches it`,
);
const CREATED = [
  "components/screen-desktop.css", "components/screen-explorer.css",
  "components/screen-vscode.css", "lib/screen-desktop.ts", "lib/screen-explorer.spec.ts",
  "lib/screen-explorer.ts", "lib/screen-files.ts", "lib/screen-video-player.ts",
  "lib/screen-vscode.ts", "lib/showcase-events.ts", "lib/window-controls.ts",
  "public/images/desktop/desktop-icons.png", "public/images/desktop/taskbar-icons.png",
  "public/images/desktop/wallpaper.jpg", "tests/e2e/screen-explorer.spec.ts",
].map((file) => ` create mode 100644 ${file}`);

const compiled = (took: string) => `✓ Compiled in ${took}`;

/** Every line of the session. A line that starts with the prompt is typed out; the rest print. */
export const TERMINAL_LOG: string[] = [
  `${PROMPT}npm run dev`,
  "npm notice run temmstech@0.1.0 dev",
  "npm notice run next dev",
  "▲ Next.js 16.3.5 (Turbopack)",
  "- Local:         http://localhost:3000",
  "- Environments: .env.local",
  "✓ Ready in 2.5s",
  "✓ Running next.config.ts took 389ms",
  "",
  get("/", "2.6s", "946ms", "1686ms"),
  ...WARN,
  timedOut("a"),
  ...repeat(TIMEOUT, 2),
  timedOut("b"),
  ...repeat(TIMEOUT, 5),
  "○ Compiling /_error ...",
  image("c", 1920, "17.2s", "14.4s", "2.8s"),
  image("c", 1920, "17.2s", "14.4s", "2.8s"),
  image("d", 1920, "17.9s", "15.5s", "2.3s"),
  image("d", 1920, "17.9s", "15.5s", "2.4s"),
  image("e", 1920, "18.0s", "15.7s", "2.3s"),
  image("e", 1920, "18.1s", "15.7s", "2.5s"),
  image("f", 1920, "18.3s", "16.0s", "2.3s"),
  image("f", 1920, "18.3s", "16.0s", "2.3s"),
  timedOut("f"), timedOut("d"), timedOut("a"), timedOut("b"), timedOut("e"), timedOut("c"),
  timedOut("a"), timedOut("d"), timedOut("f"), timedOut("b"), timedOut("e"), timedOut("c"),
  ...repeat(TIMEOUT, 2),
  image("a", 1920, "59s", "59s", "268ms"),
  image("a", 1920, "59s", "59s", "271ms"),
  image("b", 1920, "58s", "57s", "146ms"),
  image("b", 1920, "58s", "57s", "147ms"),
  timedOut("b"),
  "○ Compiling /contact ...",
  "✓ Finished writing to filesystem cache in 26.9s",
  "✓ Finished writing to filesystem cache in 29.1s",
  get("/contact", "5.6min", "5.3min", "16.5s"),
  get("/contact", "5.6min", "5.5min", "3.1s"),
  get("/contact", "5.6min", "5.5min", "2.7s"),
  get("/contact", "5.2min", "5.2min", "3.4s"),
  get("/contact", "5.6min", "5.5min", "2.9s"),
  get("/contact", "7.1min", "7.0min", "2.4s"),
  ...repeat([RSC], 18),
  "○ Compiling /capabilities ...",
  get("/capabilities", "6.4s", "5.4s", "1023ms"),
  ...repeat(FETCH_FAILED, 3),
  image("a", 1080, "1230ms", "983ms", "247ms"),
  image("a", 1080, "1231ms", "983ms", "249ms"),
  image("f", 1080, "555ms", "403ms", "152ms"),
  image("f", 1080, "555ms", "403ms", "152ms"),
  image("b", 1080, "566ms", "485ms", "81ms"),
  image("b", 1080, "567ms", "485ms", "82ms"),
  get("/contact", "1155ms", "394ms", "761ms"),
  SMOOTH,
  ...TIMEOUT,
  image("g", 640, "8.8s", "8.6s", "228ms"),
  image("g", 640, "8.9s", "8.6s", "308ms"),
  get("/", "10.2s", "9.4s", "807ms"),
  ...WARN,
  get("/contact", "2.5s", "1587ms", "875ms"),
  ...repeat(NOT_FOUND_HERO, 2),
  get("/contact", "275ms", "24ms", "250ms"),
  get("/", "1320ms", "479ms", "841ms"),
  SMOOTH,
  ...WARN,
  get("/", "557ms", "242ms", "315ms"),
  ...WARN,
  get("/", "509ms", "27ms", "481ms"),
  ...WARN,
  get("/", "1273ms", "406ms", "866ms"),
  ...WARN,
  compiled("540ms"), compiled("317ms"), compiled("371ms"),
  get("/", "321ms", "96ms", "225ms"),
  ...WARN,
  compiled("839ms"),
  get("/", "582ms", "214ms", "368ms"),
  compiled("498ms"),
  ...WARN,
  compiled("535ms"),
  get("/", "599ms", "116ms", "483ms"),
  ...WARN,
  compiled("398ms"),
  get("/", "327ms", "93ms", "234ms"),
  compiled("355ms"), compiled("436ms"), compiled("305ms"),
  get("/", "563ms", "200ms", "363ms"),
  ...WARN,
  compiled("798ms"),
  get("/", "792ms", "325ms", "467ms"),
  ...WARN,
  get("/capabilities", "599ms", "159ms", "441ms"),
  SMOOTH,
  get("/", "223ms", "36ms", "188ms"),
  compiled("362ms"),
  get("/", "341ms", "89ms", "251ms"),
  compiled("1881ms"),
  get("/", "2.2s", "140ms", "2.1s"),
  compiled("3.6s"),
  get("/capabilities", "363ms", "76ms", "286ms"),
  SMOOTH,
  get("/", "223ms", "42ms", "181ms"),
  compiled("1573ms"), compiled("321ms"),
  get("/", "241ms", "68ms", "172ms"),
  compiled("1796ms"),
  get("/", "44s", "1343ms", "43s"),
  get("/", "8.5s", "2.9s", "5.6s"),
  get("/", "7.2s", "2.1s", "5.1s"),
  get("/", "512ms", "31ms", "482ms"),
  ...WARN,
  get("/", "1834ms", "476ms", "1358ms"),
  ...WARN,
  compiled("2.7s"),
  ...showcaseBlocks(14),
  compiled("1754ms"), compiled("842ms"),
  get("/", "591ms", "130ms", "460ms"),
  compiled("1257ms"),
  get("/", "1087ms", "269ms", "818ms"),
  get("/", "7.3s", "1511ms", "5.7s"),
  ...WARN,
  ...notFoundExplorer("[browser] ./components/device-showcase.tsx:21:1"),
  ...notFoundVsCode("[browser] ./components/device-showcase.tsx:22:1"),
  "",
  `${PROMPT}git add .`,
  ...WORKING_COPY,
  `${PROMPT}git commit -m "Hero Section Update"`,
  "[ContactPage-Review 2009ddb] Hero Section Update",
  " 29 files changed, 5356 insertions(+), 226 deletions(-)",
  ...CREATED,
  `${PROMPT}git push`,
  "Enumerating objects: 77, done.",
  "Counting objects: 100% (77/77), done.",
  "Delta compression using up to 8 threads",
  "Compressing objects: 100% (44/44), done.",
  "Writing objects: 100% (47/47), 271.89 KiB | 1.94 MiB/s, done.",
  "Total 47 (delta 22), reused 0 (delta 0), pack-reused 0 (from 0)",
  "remote: Resolving deltas: 100% (22/22), completed with 21 local objects.",
  "To https://github.com/TemmsTech/temmstech.git",
  "   7a14455..2009ddb  ContactPage-Review -> ContactPage-Review",
  `${PROMPT}npm run dev`,
  "npm notice run temmstech@0.1.0 dev",
  "npm notice run next dev",
  "▲ Next.js 16.3.5 (Turbopack)",
  "- Local:         http://localhost:3000",
  "- Environments: .env.local",
  "✓ Ready in 4.4s",
  "✓ Running next.config.ts took 226ms",
  "",
  get("/", "4.1s", "2.5s", "1557ms"),
  ...WARN,
];
