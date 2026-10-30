---
name: temmstech-testing
description: Validate TemmsTech changes with TypeScript, ESLint, production builds, and maintainable Playwright E2E tests.
---

# Validation

Run `npm run typecheck`, `npm run lint`, `npm run build`, then `npm run test:e2e` (or `npm run check`). Type checking generates Next route types first, so it works on a clean checkout. Rebuild after application changes before E2E testing: Playwright starts the production build on the dedicated port in `playwright.config.ts` and deliberately refuses to reuse an unknown server.

Install Chromium once with `npx playwright install chromium`; Linux CI may need `npx playwright install --with-deps chromium`. Use `npm ci` for reproducible installs. The initial suite covers Chromium desktop, tablet, and mobile layouts; it does not claim Firefox, Safari, or real-device coverage. Add browsers when support requirements justify them.

Keep E2E tests under `tests/e2e/<feature>.spec.ts`. Assert user-observable outcomes with role/label locators and web-first expectations. Keep expected important copy independent of production data so accidental content removal fails a test. Use test IDs only when no stable accessible locator exists. Avoid sleeps, CSS implementation assertions, fragile snapshots, and shared test state.

The homepage suite owns loading, section reachability, runtime errors, overflow, desktop/mobile anchor navigation, Escape/focus behavior, keyboard skipping, sample disclosures, and the project-brief action. Account for state-dependent accessible names in toggle locators. Browser projects request reduced motion for deterministic anchor navigation; inspect normal motion separately. Clipboard tests grant browser permissions and verify the copied text. Never treat copying or opening an email draft as successful submission. Add tests for meaningful new navigation, forms, error states, and interactions. Extract fixtures/helpers only once repeated setup warrants it. No empty helper frameworks.

Device tests cover WebGL readiness, automatic website playback, unavailable-model fallback, reduced motion, and normal-motion scroll reversal. Inspect screens visually for capture timing and UV orientation. E2E uses local captures rather than external websites.

Tablet transition tests cover in-screen content, viewport fill, interactive handoff, reversal, reduced motion, and failed model loading across the configured viewport projects. Scope portal locators to their owning transition.

On failure inspect the retained trace, screenshot, and HTML report (`npm run test:e2e:report`). CI forbids `.only` and allows two retries; retries do not excuse an unexplained failure. Exclude generated reports from version control.

Before finishing UI changes, check keyboard use, focus visibility, zoom, narrow widths, and reduced motion as relevant. Automated smoke tests are not a complete accessibility audit. Update this skill when a recurring test or validation convention changes.

Tablet regression checks compare preview/native heading bounds just before handoff and cover normal-motion work links, delayed model loading, and preview content on reversal. Do not validate only that the canvas appears; confirm the next section occupies the matching viewport position and becomes interactive.

Laptop and phone tests also compare preview/native heading coordinates immediately before handoff and exercise the capabilities link with normal motion.

Navbar checks include a small initial scroll: its hidden state must expose the hero's dark page backdrop rather than a light strip. Visually inspect this early-scroll state as well as full section handoffs.

Page tests cover direct route loading, one page-level heading, overflow, logo navigation, and every real website destination separately from sample concepts. Navigation tests must assert route changes rather than hash scrolling. Tablet tests continue to exercise homepage #work deep links and an interactive real-site link after handoff.

Scroll-spy tests cover all supporting routes: anchor selection, manual scroll reversal, a single active location, preserved keyboard focus, unchanged URL during manual scrolling, and narrow-screen overflow.

Direct hash-navigation checks wait for the document load event before asserting native anchor placement; DOMContentLoaded alone does not guarantee the browser has positioned the fragment. A delayed model fetch remains gated independently.

The homepage must not render Product Explorations; sample-concept disclosure checks use /work. Section-reveal checks on /approach cover expansion, interactive handoff, reversal, inert/ID-free previews, reduced motion, and direct links. Exercise large real wheel gestures as well as programmatic scroll positions to verify pacing.
