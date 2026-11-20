# Contributing

Thanks for taking an interest in the portfolio and its UI library. Please follow
the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Feedback first

Bug reports, accessibility findings, reproducible examples and design feedback
are welcome through repository issues. Include the page or component, browser,
theme, viewport, steps to reproduce, and expected behavior. Do not post secrets,
personal information or code that you are not entitled to share.

## Code contributions and ownership

The reusable UI package is MIT-licensed; see [its license](./packages/ui/LICENSE).
The portfolio's original content and branding remain rights reserved. Licensing
the UI for reuse does not automatically transfer copyright to users, nor does it
transfer contributors' rights to the maintainer.

External code and asset contributions are not being accepted for merging while
the project's contributor terms are being decided. Open an issue to discuss a
proposal before writing or submitting a patch. Maintainer approval of an idea
is not approval of a copyright assignment or a license change.

Contributors retain rights in their original contributions unless a separate,
valid agreement states otherwise. A pull request, sign-off, credit line or code
of conduct does not by itself give the maintainer sole ownership. Any required
assignment or contributor agreement must be settled before a contribution is
accepted. Nothing here overrides applicable law or GitHub's terms.

Keep third-party notices and provenance intact. Do not copy code, artwork or
documentation from another project without first checking its license and
identifying the source. Do not add generated build files or dependency archives.

## Local development

```sh
npm ci
npm run dev
```

The reusable code is in [packages/ui](./packages/ui/README.md); portfolio-specific
compositions remain in `components/`. Run `npm run build:ui` after changing package
source to update its compiled output. Restart or reload the app as needed.

Before review, run:

```sh
npm run test:ui
npm run lint
npm run build
npm test
npm run test:e2e
npm run test:package
```

Check keyboard behavior, reduced motion, mobile layouts and both themes. Public
APIs and copied playground examples must stay aligned. Releases and publishing
are maintainer-controlled actions; preparing an archive does not publish it.

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

## Animation and accessibility

For every change, honor `prefers-reduced-motion` and keep layout stable during
animations and transitions. Use one persistent live region per status message.
Keep controls keyboard reachable with visible focus and give them accurate roles,
names, and states, including unavailable playground controls. Dialogs must trap
focus, close on Escape, and restore focus on dismissal. Meet WCAG AA contrast in
light and dark themes. Test keyboard and reduced-motion behavior with Playwright
and run `@axe-core/playwright` on affected pages and states in both themes at
1440 px and 390 px.
