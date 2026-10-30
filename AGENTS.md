# Working on TemmsTech

Read the relevant project skill before making changes:

- UI, tokens, responsive behavior, motion, accessibility: `skills/temmstech-design/SKILL.md`
- TypeScript, modules, components, hooks, content, utilities: `skills/temmstech-engineering/SKILL.md`
- Tests and validation: `skills/temmstech-testing/SKILL.md`

These files own recurring project decisions. When a change introduces a reusable rule, update its existing skill in the same change. Resolve conflicting guidance at its source; do not create overlapping rules. Create a new skill only for a distinct recurring concern with no existing owner. Numeric visual values belong in the theme; skills document how to use them.

The homepage and supporting landing pages are implemented. Keep sample projects explicitly labelled, and do not invent clients, results, metrics, history, contact details, or credentials. Contact configuration and launch readiness are documented in README.md.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Supplemental design skills

Project-scoped upstream guidance from emilkowalski/skills lives in .agents/skills/: emil-design-eng, review-animations, apple-design, and animate. Read the relevant SKILL.md when designing or reviewing interactions. The TemmsTech skills above remain authoritative for project-specific decisions; do not duplicate upstream guidance. The installed revisions are recorded in skills-lock.json.
