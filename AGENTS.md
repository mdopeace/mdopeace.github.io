<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Playground grouping and order

Keep the groups in this fixed order. New groups require Md's approval.

1. **Actions** — Buttons and other controls that trigger actions.
2. **Layout & Style** — Layout, dividers, typography, surfaces, badges, and tiles.
3. **Forms** — Inputs, selection controls, and field wrappers.
4. **Navigation** — Links, navbars, and navigation lists.
5. **Media** — Images and other media components.
6. **Composition** — Content and feedback patterns, notices, dialogs, and code examples.
7. **Comic** — Speech bubbles, bursts, stickers, and other comic-style components.

Within each group, put simple, standalone pieces before components that wrap or
combine others.

In the same PR, add every new `@mdopeace/ui` component to the right group in the
[playground catalog](./app/playground/Playground.tsx) and the
[UI README table](./packages/ui/README.md), add a playground demo and tests, and
update the [Playwright catalog order test](./tests/e2e/playground.spec.ts).

Every playground control must visibly change the preview, as checked by
[the Playwright controls tests](./tests/e2e/playground-controls.spec.ts). Disable
controls in states where they can't apply.
