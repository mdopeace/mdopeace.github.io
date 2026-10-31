# Md Mostafijur Rahman — portfolio

Personal portfolio for [mdopeace.github.io](https://mdopeace.github.io/). It brings together who I am, how I approach problems, my experience, and the projects I have built or am working on.

The visual direction is retro, comic-inspired, and deliberately playful. The page includes a playable Pocket Tetris Gameboy in the hero, a custom mascot illustration, and light, dark, and system color themes.

## What’s on the page

- **How I think** — the problems and motivations behind my work.
- **Selected work** — QuickTodo and Vidp, with project context, build commands, and links.
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

- `components/sections/` contains the portfolio sections.
- `data/projects.ts` contains project descriptions, install commands, and links.
- `components/hero/TetrisGameboy.tsx` contains the game UI and input handling.
- `components/SiteHeader.tsx` and `components/ThemeToggle.tsx` contain the navigation and theme controls.
- `app/globals.css` contains the shared styles, responsive layouts, and light/dark theme tokens.
- `app/icon.svg` contains the squircle-masked favicon artwork.
