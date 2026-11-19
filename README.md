# Md Mostafijur Rahman — portfolio

Personal portfolio for [mdopeace.github.io](https://mdopeace.github.io/). It brings together who I am, how I approach problems, my experience, and the projects I have built or am working on.

The visual direction is retro, comic-inspired, and deliberately playful. The page includes a playable Pocket Tetris Gameboy in the hero, a custom mascot illustration, and a light/dark theme switch. The operating-system preference is used only for the initial choice when no explicit preference is saved.

## What’s on the page

- **How I think** — the problems and motivations behind my work.
- **Selected work** — QuickTodo, Vidp and Cookieater, with project context, build commands, and links.
- **Experience & toolkit** — my role at Tracxn and technologies I work with.
- **What’s cooking** — current work and ideas in progress.
- **Get in touch** — email and social links.

The Gameboy accepts keyboard input when focused, as well as its on-screen controls. Use the arrow keys to move or soft-drop, **↑** or **X** to rotate, **Z** to rotate the other way, **Space** to hard-drop, **C** or **Shift** to hold a piece, **P** to pause, and **Enter** to start or resume. The controls are also listed below the device.

The interface includes semantic landmarks, visible keyboard focus, a skip link, screen-reader announcements for game state, and reduced-motion support.

## Built with

- Next.js 16 with React 19 and TypeScript
- Tailwind CSS 4 and custom CSS for the visual theme
- [`tetris-toolkit`](https://www.npmjs.com/package/tetris-toolkit) for the Tetris engine
- [`react-icons`](https://www.npmjs.com/package/react-icons) for social and interface icons

## Run locally

Use Node.js 20 or newer, then install dependencies and start the development server:

```sh
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Changes to the app and styles are picked up by the development server.

## Build and check

The site is configured for a static export. Build it with:

```sh
npm run build
```

The exported site is written to `out/`. The test suite reads this built output, so build before running it:

```sh
npm test
```

The tests check external links, the project install commands in the exported HTML, and accessibility-related page hooks. External-link checks need network access.

## Deployment

GitHub Actions builds and tests the static export, then deploys `out/` to GitHub Pages when changes are pushed to `main`. The deployment workflow can also be started manually from the repository’s Actions tab. GitHub Pages must be configured to use **GitHub Actions** as its deployment source.

## Where to edit content

The building blocks, design tokens, component APIs, and migration order are documented in the [component library specification](docs/component-library-plan.md). See the [usage guide](docs/component-library-usage.md) for examples.

Run `npm run dev` and open [the component playground](http://localhost:3000/playground/) to inspect component variants, themes and interactions. The playground is included in production exports and linked from the portfolio. The old `/components-preview` address remains a development-only alias. Run `npm run test:ui` for component behavior tests.

- [`packages/ui/`](./packages/ui/README.md) contains the reusable `@mdopeace/ui` workspace package; `components/portfolio/` contains business compositions.
- `packages/ui/styles/tokens.css` contains shared design values; `styles/theme-motion.css` adds portfolio theme transitions.
- `components/sections/` contains the portfolio sections.
- `data/projects.ts` contains project descriptions, install commands, and links.
- `components/hero/TetrisGameboy.tsx` contains the game UI and input handling.
- `components/SiteHeader.tsx` and `components/ThemeToggle.tsx` contain the navigation and theme controls.
- `app/globals.css` contains the shared styles, responsive layouts, and light/dark theme tokens.
- `app/icon.svg` contains the squircle-masked favicon artwork.


## Reusable UI package and project policies

The portfolio imports the local [`@mdopeace/ui` package](./packages/ui/README.md).
Run `npm run build:ui` to compile it, `npm run pack:ui` to make an installable
archive, and `npm run test:package` to verify that archive in an isolated React
consumer. Nothing is published by these commands.

Read [LICENSE](./LICENSE), [NOTICE](./NOTICE), [contribution guidelines](./CONTRIBUTING.md)
and the [Code of Conduct](./CODE_OF_CONDUCT.md). The package has its own
[MIT license](./packages/ui/LICENSE). The MIT grant applies to the UI package;
portfolio content and branding remain rights reserved under the root license.
Portfolio content and branding are not included in the package.

The [UI release guide](./docs/ui-release.md) explains the App-driven release PR,
required CI, protected auto-merge and versioned GitHub Release archive.

## Analytics

Analytics is disabled by default. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` at build time
to Md’s personal GA4 measurement ID. Leave it unset while the ID is pending.
Turn off Enhanced Measurement in the GA4 web stream so the site controls which
interaction events are sent.
