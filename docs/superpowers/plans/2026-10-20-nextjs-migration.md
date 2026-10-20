# Migrate portfolio to Next.js — Implementation Plan

**Goal:** Replace the hand-written static page with an identical-looking Next.js static export, same URL, same content, same link-check test.

**Architecture:** Next.js App Router, TypeScript, Tailwind v4, `output: 'export'`. One page (`app/page.tsx`) composing five section components, a typed `data/projects.ts` + `ProjectCard`, reusable primitives (`Section`, `Tag`, `CodeBlock`, `CopyButton`, `LinkList`), deployed by GitHub Actions to GitHub Pages.

**Tech Stack:** next (latest via create-next-app), react, tailwindcss v4, typescript strict. No other runtime deps.

## Global constraints
- Parity: content, ordering, and palette values verbatim from `index.html`/`style.css` — colors are contrast-verified, do not invent new ones.
- Plain `<img>` for all images (hotlinked on purpose). No `next/image`, no image proxy.
- No `basePath`/`baseUrl` — user site serves from root.
- Keep `npm test` as `node --test tests/site.test.mjs`.
- Delete `index.html`, `style.css`, `script.js` only after parity is verified.
- Contact links keep `rel="noopener noreferrer"` verbatim (currently a no-op without `target="_blank"`).

## File map
| File | Role |
|---|---|
| `app/layout.tsx` | metadata: title, description, `viewport.themeColor: "#16171a"`, icon/apple-touch-icon → the two avatar URLs; `<html lang="en">`; body classes |
| `app/globals.css` | `@theme` tokens (bg/panel/line/text/muted/faint/amber-bg/amber-line/amber/done/done-line, font stack); base rules Tailwind can't express cleanly: `:focus-visible` amber ring, middot `li:not(:last-child)::after` separators, webkit scrollbar for the command box — carrying the original "why" comments |
| `app/page.tsx` | composes the five sections |
| `components/Section.tsx` | `{ label: string; children }` — border-top, 64px padding, uppercase 11px faint label |
| `components/Tag.tsx` | `{ children }` — rounded requirement pill |
| `components/CodeBlock.tsx` | `.cmd` box: `lines: string[]` + CopyButton; `white-space: pre` scroll behavior here |
| `components/CopyButton.tsx` | `"use client"` port of `script.js`: same 1400ms flash, "copied"/"done" + "press ⌘C"/"failed" paths, `aria-live="polite"`, timeout clear on unmount |
| `components/LinkList.tsx` | `{ items: {label, href}[]; quiet?: boolean }` — `quiet` = no underline (contact set) |
| `components/ProjectCard.tsx` | composes Tag + CodeBlock + LinkList; data from `data/projects.ts` |
| `components/sections/Hero.tsx` | h1/role/lede/tagline |
| `components/sections/Projects.tsx` | maps data array → ProjectCard |
| `components/sections/Story.tsx` | numbered loop; prose as JSX |
| `components/sections/DayJob.tsx` | prose |
| `components/sections/Contact.tsx` | LinkList quiet |
| `data/projects.ts` | `Project` type (name, logo, shot, shotAlt, pills[], tagline, paragraphs[], commands[], links[{label,href}]) + the two projects, copy verbatim |
| `next.config.ts` | `output: 'export'` — that's all |
| `tests/site.test.mjs` | same link check, reading `out/index.html` with a clear "run npm run build first" error; plus built-HTML assertions: both `data-copy` values (newline intact), `aria-live="polite"`, avatar icon `<link>`s |
| `.github/workflows/test.yml` | add `npm ci` + `npm run build` before `npm test` |
| `.github/workflows/deploy.yml` | new: build → `actions/upload-pages-artifact` (path `out`) → `actions/deploy-pages`; `pages: write` + `id-token: write` |
| `.gitignore` | merge in `.next/`, `out/`, `next-env.d.ts` |

## Tasks
1. **Scaffold.** Run `create-next-app` (TS, Tailwind, App Router, no src dir, npm) in a temp dir, copy configs in — the repo's existing files conflict with in-place install. Keep package.json name/private/test script; add dev/build/start; commit the lockfile. Remove any scaffolded `app/icon*.svg` (favicon stays hotlinked). *Check:* `npm run build` succeeds. Commit.
2. **Layout + theme.** Port palette into `@theme`, base rules into `globals.css`, metadata into `layout.tsx`. *Check:* build passes; `out/index.html` head has title, description, theme-color, both icon links. Commit.
3. **Primitives + data (3a).** `data/projects.ts`, `Section`, `Tag`, `CodeBlock`, `CopyButton`, `LinkList`, `ProjectCard` — compile-checked, not yet mounted. **Sections + page (3b).** The five sections + `page.tsx`. *Check:* build passes; `npm test` green. Commit.
4. **CI + deploy.** Update test workflow, add deploy workflow. *Check:* `npm run build && npm test` locally; link test excludes LinkedIn. Commit.
5. **Parity + cleanup.** Serve `out/` locally; browser-compare against live site at desktop, ~876px wrap point, iPad-mini width; click both copy buttons, confirm both flash paths; delete `index.html`, `style.css`, `script.js`. Commit. Flag one-time repo setting: Settings → Pages → Source → GitHub Actions.

## Review focus (things tests won't catch)
- GitHub Pages serving the export at root (asset URLs absolute from `/`) — verified by serving `out/` locally in Task 5.
- Tailwind flex values drifting from the verified 320px/420px bases — checked at wrap point in Task 5.
- `data-copy` newline surviving JSX → HTML serialization — pinned by the Task 3 test.
- Clipboard "press ⌘C" fallback path — exercised in the Task 5 browser check.
- Any copy change during the port — diff built HTML text against current page in Task 5.
