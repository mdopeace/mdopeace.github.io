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
