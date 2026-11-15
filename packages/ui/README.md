# @mdopeace/ui

React building blocks used by the portfolio and its interactive playground.
This is a separate package in the same repository, not a separate repository.

## Status and rights

The reusable package is licensed under [MIT](./LICENSE), with copyright
attributed to Md Mostafijur Rahman. Others may use, modify, redistribute and sell
copies under MIT's terms, including retaining the copyright and license notice.
MIT does not require a visible credit link in an application's interface.

The package remains marked `private` as a guard against accidental npm publishing;
this publishing setting does not change its MIT license. See [NOTICE](./NOTICE)
for scope and third-party rights. Portfolio text, personal identity, artwork,
project logos and screenshots are outside this package and its MIT grant.

## Requirements

React 19, React DOM 19, and a build tool that supports CSS Modules, such as Next.js
or Vite. The output is ESM JavaScript with TypeScript declarations and separate
CSS Modules. This is not a plain HTML widget bundle. React is a peer dependency,
so consumers share their application's React installation.

## Use in this repository

```sh
npm ci
npm run build:ui
```

The root workspace links the package. App code and playground snippets use the
same public imports as other consumers:

```tsx
import "@mdopeace/ui/tokens.css";
import { Button } from "@mdopeace/ui/Button";
import { Surface } from "@mdopeace/ui/Surface";
import { Text } from "@mdopeace/ui/Typography";

export function Example() {
  return (
    <Surface>
      <Text>Built from shared foundations.</Text>
      <Button>Continue</Button>
    </Surface>
  );
}
```

Add `"use client"` to a Next.js consumer component when supplying event handlers
or state. Interactive library modules preserve their own client directives.
Named root imports are also available, but component subpaths let server-only
consumers avoid importing interactive exports unnecessarily.

## Styles and themes

Import `@mdopeace/ui/tokens.css` once in the application's global entry or root
layout. It supplies namespaced `--ui-*` values and a reduced-motion token override.
Set `data-theme="light"` or `data-theme="dark"` on the HTML element to choose a
theme. Theme persistence and switching belong to the consuming application.

Component styles are CSS Modules imported by their JavaScript. They include
component-local sizing, focus, list resets and accessible hidden text. The
package has no Tailwind, Next.js, portfolio body styles, or global element reset
dependency. Tokens do not set the document background, font or body margin.
Consumers can set their own body styles and override the `--ui-*` tokens.

## Build, pack and test another project

```sh
npm run build:ui
npm run pack:ui
npm run test:package
```

Packing creates a local `mdopeace-ui-<version>.tgz` archive. To try it elsewhere,
install that archive with `npm install /absolute/path/to/mdopeace-ui-<version>.tgz`
(replace `<version>` with the package version).
No package registry or repository publication is involved. The package test
installs the archive into an isolated consumer and verifies rendering, styles,
types and interactive behavior without the portfolio's aliases or CSS reset.

Rebuild after package source edits; generated `dist` files and archives are
ignored by Git. The portfolio's dev, test and production build scripts build the
package first. The maintainer-controlled **UI Release** workflow publishes the
validated archive and checksum under `ui-v<version>` on GitHub Releases; it does
not publish to npm. See the [release guide](https://github.com/mdopeace/mdopeace.github.io/blob/main/docs/ui-release.md) for App setup,
version-only PRs, protected auto-merge and recovery behavior.

## Scope

Generic layout, typography, controls, fields, navigation, surfaces, badges,
dialogs, disclosure, code examples and clipboard behavior live here. Portfolio
sections, content, device artwork and game logic stay in the app.

Read the repository's [contribution guidelines](https://github.com/mdopeace/mdopeace.github.io/blob/main/CONTRIBUTING.md) and
[code of conduct](https://github.com/mdopeace/mdopeace.github.io/blob/main/CODE_OF_CONDUCT.md) before proposing changes.
