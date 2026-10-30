# TemmsTech

Next.js App Router, React, TypeScript, Tailwind CSS v4, source-owned shadcn UI, Three.js, and Playwright.

## Run locally

Use Node.js 24 LTS, then `npm ci` and `npm run dev`. Open http://localhost:3000. On this Windows machine use `npm.cmd` if the PowerShell launcher fails.

## Routes and content

- `/`: company homepage with laptop/phone and tablet transitions.
- `/capabilities`: capabilities landing page.
- `/work`: six owner-supplied websites and a separate sample-concept collection.
- `/approach`: process landing page.
- `/contact`: conversation and brief-composer page.

Navbar links navigate to pages. The logo returns home. Supporting pages have distinct compositions: image-led capability and starting-point cards, a visual website archive and concept lab, delivery/collaboration photo cards, and a guided contact brief. Each route has a distinct hero and a sticky scroll spy. Small UI components and verified data are shared; homepage sections are not repeated. Copy remains provisional and stock photographs do not represent the actual team.

The homepage initially renders four previous-work cards; Show more reveals additional cards in batches of four. The Work page shows the full collection.

Product Explorations appears only on the Work page. The Approach page demonstrates the supplied rounded-square section reveal between delivery, collaboration, and contact. Ready device/reveal transitions pace fast wheel and trackpad gestures in both directions; touch, keyboard, scrollbar dragging, explicit anchors, and reduced-motion navigation remain native. No global scroll lock is used.

The six real website records in `data/device-showcase.ts` feed both hero devices and previous-work cards. `data/projects.ts` owns explicitly labelled sample concepts. `data/page.ts` and `data/pages.ts` own section and route introductions. Capabilities and process data live in `data/services.ts` and `data/approach.ts`.

## Structure

- `app/`: routes, metadata, root landmarks, theme tokens.
- `components/`: shared UI, ImageCard, ProjectCard, ConceptCard, PageIntro; shadcn primitives in `ui/`.
- `modules/`: page/feature composition, each with a public `index.tsx`.
- `hooks/`: reusable interaction and scroll lifecycles.
- `types/`, `data/`, `lib/`: domain types, structured content, framework-independent helpers.
- `skills/`: authoritative design, engineering, and testing conventions.
- `tests/e2e/`: homepage, routes, showcase, and tablet regression tests.
- `public/`: local website captures, models, and brand assets.

Read `AGENTS.md` and relevant skills before changes; update existing rules when recurring decisions change.

## Design and motion

Logo cyan, deep navy surfaces, cool off-white backgrounds, and darker cobalt accents. Capability/process cards share square photo-over-text panels. Real work cards use actual local website captures; sample concepts retain their illustrative previews.

Hero devices straighten and zoom into capabilities. After the cards, the tablet rises from below, rotates toward the viewer, and zooms into previous work. Preview corners remain attached to the device; final camera framing matches the real section at handoff. Explicit section links reveal native content. Reduced motion and model failure provide ordinary readable content without an empty runway.

Captures date from 2026-09-22 and should be refreshed when the source websites change. Makinde Bibitayo's saved hero capture contains a source-site preview-loading error; replace it once a clean source preview is available. Captures are not live iframes. Model licensing/credits are in `public/models/ATTRIBUTION.md` and the footer credits link.

## Validation

Install Chromium once with `npx playwright install chromium`. Run `npm run check`, or run `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run test:e2e` separately. E2E requires a fresh production build and starts its own server on port 3100. Use `npm run test:e2e:report` for retained failures.

Tests cover Chromium desktop, tablet, and mobile, including normal-motion handoff/reversal, reduced motion, model failure, delayed loading, early navbar hiding, routes, and contact interactions. They do not claim Safari or Firefox coverage. Unsplash images require network access and can occasionally time out. On this Windows machine test-server teardown can require stopping that specific server PID after all results print.

## Before launch

- Set the verified contact email in `data/site.ts`. Until then the brief composer only prepares and copies text; nothing is submitted. A configured email opens a draft in the visitor's mail client.
- Review provisional page copy, stock imagery, and sample concepts. The owner supplied the aggregate “used by millions” positioning; no per-project usage claims have been invented.
- Set the production domain and canonical/social metadata. Search indexing is intentionally disabled in root metadata until launch review is complete.
- No backend, analytics, or social accounts are configured.

## Review deployments

The local folder is linked to the `temmstech` Vercel project in `makinde-bibitayo-s-projects`. Run the validation commands above, then `npx vercel deploy --target=preview` for subsequent review builds. Keep search indexing disabled and verify the generated URL before sharing it. No custom domain is configured. Vercel classified its initial bootstrap deployment as production; the boss review uses the subsequent Preview deployment. Local environment files and generated reports are excluded from deployment uploads; never commit `.vercel` or `.env.local`.

Node.js is pinned to the tested 24.x major so hosting upgrades do not silently change the runtime. The contact composer and sample concepts remain review placeholders until the launch checklist is completed.

ESLint 9 is pinned for compatibility with the current Next.js lint plugins. Upgrade the lint toolchain together.

## Design guidance

The four project-scoped Emil Kowalski skills are installed in .agents/skills and tracked in skills-lock.json. AGENTS.md maps them to the existing TemmsTech skills, which own project-specific conventions. These are development documentation, not application dependencies, and are excluded from deployment uploads.
