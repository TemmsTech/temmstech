---
name: temmstech-engineering
description: Implement TemmsTech features using its TypeScript, module boundaries, component, content, hook, and utility conventions.
---

# Engineering conventions

## Ownership and imports

- `app/` owns routes, metadata, and layout composition. Keep business and section implementation in `modules/`.
- Page composition owns content imports and passes typed props into section modules. Reuse section layouts through content/collection props, shared cards, and preview composition; do not copy a section to change its wording. Keep module-specific types in the module and shared intro/action types in `types/content.ts`.
- Each feature lives in `modules/<feature>/` with named implementation files and an `index.tsx` public API. Consumers import `@/modules/<feature>`; internal sibling imports may be relative. Export public types from the entry point only when consumers need them.
- `components/` contains reusable presentation; `components/ui/` contains owned shadcn primitives. Page sections belong in modules. Prefer focused props and composition over duplicated variants or speculative generic components.
- All reusable custom hooks live in `hooks/`. Add `hooks/index.ts` when there are hooks to export. Do not create unused hooks or empty barrels.
- `lib/` owns framework-independent helpers. `lib/utils.ts` owns `cn` for conditional/conflicting Tailwind classes. Put meaningful repeated visual variants in a component or CVA definition; do not abstract every repeated class.
- Use `@/*` for project imports. Short same-folder imports are acceptable. Do not traverse multiple parent directories.

## TypeScript and React

- Use `type` aliases consistently for project types; use interfaces only when declaration merging is required. Infer locals and straightforward return types. Explicitly type public props and domain boundaries. Prefer `ComponentProps` for native props, `import type` for types, and `satisfies` for validating content without discarding inference.
- Shared types go in focused `types/<domain>.ts` files; feature-only types stay in that module. Do not duplicate a shape or make a global catchall file. Avoid `any`, unsafe casts, non-null assertions, and unnecessary generics. Narrow `unknown` at external boundaries. Introduce runtime validation when actual untrusted inputs arrive.
- Server Components are the default. Add `"use client"` only at the boundary that needs state, effects, handlers, or browser APIs. Keep client props serializable and secrets on the server. Prefer derived values over synchronized state.
- Use named component exports, descriptive names, two-space indentation, double quotes, and semicolons. Framework route defaults are the exception to named exports. Comments explain only non-obvious behavior or constraints.

## Content and dependencies

- Position TemmsTech as a multidisciplinary software, app, hardware, and AI engineering company. Capability categories illustrate scope; they must not imply a fixed industry niche. The owner has confirmed this broad expertise; the owner also supplied the aggregate “products used by millions” positioning. Preserve that wording without inventing exact counts, named products, clients, credentials, or per-product results. Sample portfolio concepts remain separately labelled.

- Structured reusable content belongs in typed `data/<domain>.ts` files. Local one-off UI labels can remain beside their markup. Metadata uses `data/site.ts`; service/project collections use stable IDs. Illustrative projects are explicitly typed and labelled as samples; owner-supplied websites share ShowcaseProject data between the hero and previous-work cards. Detailed case studies still require verified content. Contact destinations come only from the central contact configuration; never guess an email or social URL.
- Search existing components, helpers, tokens, data, and skills before adding an abstraction. Abstract repetition when its meaning is stable; small coincidental repetition is acceptable.
- Use npm and commit `package-lock.json`. Install packages only for implemented needs. shadcn is source-owned UI, not a required runtime library; `components.json` supports adding primitives later. Review generated code and dependencies before accepting it.
- Upgrade lint tooling as a compatible set. The current Next.js React/import/accessibility plugins require ESLint 9; do not upgrade ESLint alone or disable rules to hide incompatibility.

## Device showcase

`DeviceShowcase` accepts typed website names, live URLs, and local desktop/mobile captures. `useDeviceMotion` owns scroll/visibility listeners; `lib/device-scene.ts` lazy-loads Three.js, adapts the supplied GLBs' screen UVs, and disposes GPU resources. Mesh names and laptop atlas coordinates are specific to these models; revalidate them when replacing assets. Wait for source-site preloaders and entrance sequences before capturing. Visitors do not depend on external iframes.

The screen portal uses an inert, aria-hidden DOM preview cloned from the target section, with duplicate IDs removed. Content and styling remain owned by the actual section. Keep all four preview corners attached to the model screen for the entire transition; never interpolate the panel independently toward viewport bounds. Move the camera until the physical screen covers the viewport, using the laptop on desktop/tablet and phone below 768px. Reconcile the content's internal scale/offset with the real section at handoff. Dispose the preview and restore source visibility on cleanup.

At transition start, the secondary phone uses a lightweight canvas preview derived from the target section's DOM text and theme tokens. It moves behind the laptop in 3D, so depth occlusion remains natural. The main DOM portal masks any device still in front of it; never paint the portal over a foreground device. Restore project textures and poses when reversing out of the transition.

`TabletTransition` accepts source/target section IDs; `useTabletTransition` owns its native scroll lifecycle and `tablet-scene` owns the supplied Microsoft model. Share inert DOM cloning, screen projection, and GPU disposal helpers with the hero; do not duplicate section content. The tablet portal supplies its own measured screen aspect ratio and appears below the outgoing section as it scrolls away. Render only during scroll/resize, clean up on preference changes/unmount/context loss, and keep the original work section interactive after handoff.

Recurring decisions belong here or in the design/testing skill. Update the owning skill with the implementation; keep one authoritative rule.

Device cameras align their final screen top-left with the viewport origin; native sections must reach that same origin at handoff. Share explicit anchor navigation detection through `observeSectionNavigation`, and restore the real section for links instead of leaving an inert preview active.

Tablet transition timing spans the outgoing section boundary plus the reserved runway; finish only when the real target reaches the viewport top. The tablet camera aligns its final screen top-left to the viewport origin, preserving a static in-screen preview. Refresh the inert preview on re-entry to reflect disclosure state. Keep explicit anchor navigation interactive and avoid adding layout height after asset loading.

## Supporting pages

App routes /capabilities, /work, /approach, and /contact compose modules through their public exports. Each route has its own composition in modules/company-pages and route-specific content in data/pages.ts. Share small components and verified data, not entire homepage sections by default. PageIntro is an optional composition helper, not a mandatory page template. Real website records remain in data/device-showcase.ts; sample concepts remain in data/projects.ts. Navigation owns route URLs in data/navigation.ts. Remount the navbar content per pathname so its mobile disclosure and scroll state reset on navigation. Supporting pages link to the dedicated contact page through a compact next-step section; only the homepage retains its full CTA. Reuse ProjectBrief for the actual brief interaction. The logo links home.

SectionNav uses the reusable useScrollSpy hook in hooks/: passive scroll events, requestAnimationFrame batching, resize observation, and full cleanup. Scrolling updates only the active indicator, never focus or the URL. Section IDs and labels are typed data in data/pages.ts. ImageCard accepts children for concise lists, tags, and disclosure content; keep page composition outside shared primitives.

SectionReveal accepts fromId/toId and delegates lifecycle to useSectionReveal. Reuse createSectionPreview for inert copies with no duplicate IDs. Render only during scroll/resize and restore native content on cleanup. paceScroll owns shared wheel pacing: select the nearest ready transition range, cap traversal speed using the theme duration, discard overscroll at the boundary, reverse immediately, and cancel on direct navigation or other input. Each animation registers its live geometry and unregisters on cleanup; reduced-motion and failed states expose no paced range.
