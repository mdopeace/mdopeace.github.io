# Portfolio Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace a cloned learning-phase portfolio at `mdopeace.github.io` with a static Next.js site that leads with Md Mostafijur Rahman's name and ships two live macOS projects.

**Architecture:** Fresh `create-next-app` scaffold (App Router + TypeScript + Tailwind v4), exported statically via `output: 'export'` to the `gh-pages` branch. One page, five sections. All copy and project data live in typed modules so a third project is a data entry.

**Tech Stack:** Next.js 16.4.2 · React 19.3.0 · TypeScript `^5` · Tailwind CSS v4 · Node v26.12.0 / npm 11.20.0

**Spec:** `docs/superpowers/specs/2026-10-16-portfolio-redesign-design.md`

> **Note on plan location:** the session is in plan mode, which restricts writes to `/Users/mdrahman/.opencode/plan`. Move this file to `docs/superpowers/plans/2026-10-16-portfolio-redesign.md` when execution begins. The spec at the path above is already committed to the repo and is unaffected.

---

## Global Constraints

Applies to every task. Values are verbatim from the spec — do not substitute.

- **Nothing is committed to `main` or pushed.** Local only, per the user. No task in this plan runs `git push`, and no task creates a commit on `main`. Task 11 is the only commit step and it commits to a new branch. Re-pointing `origin` (Task 11, Step 1) edits local `.git/config` and contacts nothing.
- **Do not copy `passivearn`'s `next.config.ts`.** It contains `redirects()` and `rewrites()`, both unsupported with `output: 'export'`.
- **`basePath` stays empty.** This is an apex user/org site, not a project subpath.
- **`cacheComponents` and `partialPrefetching` are removed** from `next.config.ts` — `cacheComponents` is incompatible with static export.
- **Dark theme only.** No theme switcher, no `prefers-color-scheme` block.
- **Palette is fixed.** Only these values may be used:
  `--bg:#16171a` · `--panel:#0e0f11` · `--line:#2a2c31` · `--text:#f2f3f5` · `--muted:#9aa1ab` · `--faint:#82868d` · `--amber-bg:#1a1710` · `--amber-line:#3a3222` · `--amber:#948464`
  Any new colour requires a ≥4.5:1 contrast check against its background first.
- **Font stack is fixed:** `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`. No webfont. Poppins is dropped.
- **Content measure:** `--maxw: 980px`.
- **Only QuickTodo and Vidp appear.** `focus-pulse`, `cookieater`, `unpakr`, `music` are unlisted until live. No learning-phase clones (lyst, headphonezone, animoto, zee5, playo, Medimed, tax-calculator).
- **No `iammostak` and no `mdzeroseven` anywhere** in new source.
- **No hotlinked images.** Screenshot files are copied into `public/`. Never `raw.githubusercontent.com` — that is the practice being fixed.
- **No `next/image`.** Use plain `<img>`. Keeps `images.unoptimized` a belt-and-braces flag rather than load-bearing.
- **Voice:** first person, present tense, plain. No "passionate developer", no "results-driven", no exclamation marks. No contact form, no backend.

---

## Review Focus

Five input classes or failure modes most likely to bite, given the spec. Each has a test pinned to the task that owns the code.

1. **Reader has never seen the site and only reads the first screen.** The name, role, and the loop must all be legible without scrolling. *(Task 5, Step 3 — `hero-copy.test.ts` asserts all five required strings are present in the rendered hero.)*
2. **The vidp project card has no image, because the landing page and screenshot don't exist yet.** A reader must not perceive it as broken — and must not be shown a fabricated screenshot. *(Task 6, Step 2 — asserts the card renders no `<img>` and shows the stated fallback line.)*
3. **The site is served by GitHub Pages, which runs Jekyll and silently drops `_next/`.** The live site would 404 on every JS/CSS chunk while `npm run build` passed clean. *(Task 1, Step 6 — asserts `out/.nojekyll` exists.)*
4. **A visitor taps a `brew install` line and it fails.** The commands must be the real, currently-working ones from the taps. *(Task 6, Step 4 — pins exact command strings against the verified taps.)*
5. **A reader on a phone.** Project cards and the brew blocks must not overflow or clip. *(Task 8, Step 3 — Playwright assertions at 375px.)*

---

## File Structure

Created:

```
app/layout.tsx           Root layout, metadata, system font stack
app/globals.css          @import "tailwindcss" + @theme block with the 9 palette tokens
app/page.tsx             Composes the five sections. No content of its own.
components/Hero.tsx      Name, role, the loop
components/ProjectCard.tsx  One project — image OR empty slot, brew block, links
components/Loop.tsx       The numbered 1-2-3 chain, after the projects
components/Context.tsx    Tracxn role, day stack, infra scope
components/Contact.tsx    Email, GitHub, LinkedIn
data/site.ts             Identity, contact, role — typed
data/projects.ts         Typed project array. A third project = a data entry.
tests/*.test.ts          Node:test unit tests over data and rendered output
scripts/verify.mjs       Asserts out/ contents after build (Task 1)
```

Deleted: `src/`, `server/`, `index.html`, `vite.config.js`, `package.json`,
`package-lock.json`, old `public/` (replaced).

---

## Task 1: Scaffold and static-export config

**Files:**
- Delete: `src/`, `server/`, `index.html`, `vite.config.js`, `package.json`, `package-lock.json`, `public/`
- Create: `next.config.ts` (from scaffold, then edited)
- Create: `scripts/verify.mjs`
- Create: `tests/config.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: a buildable Next 16.4.2 app whose `npm run build` writes `out/` with `index.html` and `.nojekyll`. `scripts/verify.mjs` exits non-zero if any required file is missing. Every later task depends on `npm run build` succeeding.

- [ ] **Step 1: Scaffold into a sibling directory**

```bash
cd /Users/mdrahman/mdopeace
npx create-next-app@latest portfolio --ts --tailwind --app --eslint \
  --import-alias "@/*" --use-npm --disable-git
```

`--disable-git` is required — without it the scaffold carries its own `.git`, and moving it into an existing repo corrupts history. `--ts`/`--tailwind` are passed explicitly because the CLI persists preferences between runs and a saved default can silently downgrade to JavaScript without Tailwind.

Expected: `Success! Created portfolio`, and `portfolio/package.json` listing `next: 16.4.2`, `react: 19.3.0`, `tailwindcss: ^4`, `typescript: ^5`.

- [ ] **Step 2: Replace the old tree**

```bash
cd /Users/mdrahman/mdopeace
cp mdopeace.github.io/public/favicon.png portfolio/public/favicon.png
rm -rf mdopeace.github.io/src mdopeace.github.io/server \
       mdopeace.github.io/index.html mdopeace.github.io/vite.config.js \
       mdopeace.github.io/package.json mdopeace.github.io/package-lock.json \
       mdopeace.github.io/public
mv portfolio/* portfolio/.[!.]* mdopeace.github.io/
rmdir portfolio
```

Expected: `ls -A mdopeace.github.io` shows `app/ node_modules/ public/ next.config.ts tsconfig.json eslint.config.mjs` and no `src/`, no `index.html`.

- [ ] **Step 3: Remove scaffold cruft and fix package identity**

Delete `AGENTS.md` and `README.md`. In `package.json` set `"name": "mdopeace.github.io"`. Leave `homepage` unset — static export writes no `homepage`.

- [ ] **Step 4: Edit `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
```

`cacheComponents` and `partialPrefetching` from the scaffold are deleted, not left in place — `cacheComponents` is incompatible with `output: 'export'`. The `turbopack` block is what makes Tailwind v4 work under Turbopack; keep it.

- [ ] **Step 5: Write the failing test**

`tests/config.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("next.config.ts enables static export and drops cacheComponents", () => {
  const cfg = readFileSync("next.config.ts", "utf8");
  assert.match(cfg, /output:\s*["']export["']/);
  assert.doesNotMatch(cfg, /cacheComponents/);
  assert.doesNotMatch(cfg, /partialPrefetching/);
  assert.doesNotMatch(cfg, /redirects\s*\(/);
  assert.doesNotMatch(cfg, /rewrites\s*\(/);
  assert.doesNotMatch(cfg, /basePath/);
});

test("build output contains .nojekyll", () => {
  assert.ok(existsSync("out/.nojekyll"), "out/.nojekyll missing — Jekyll will drop _next/");
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx tsx --test tests/config.test.ts`
Expected: FAIL — `out/.nojekyll` does not exist yet.

- [ ] **Step 7: Create `scripts/verify.mjs`**

```js
import { existsSync } from "node:fs";

const required = ["out/index.html", "out/.nojekyll", "out/404.html"];
const missing = required.filter((f) => !existsSync(f));

if (missing.length) {
  console.error("Missing from build output:", missing.join(", "));
  process.exit(1);
}
console.log("Build output OK:", required.join(", "));
```

- [ ] **Step 8: Add the `.nojekyll` emission to the build script**

In `package.json`, `"build": "next build && node scripts/verify.mjs"` would fail because `.nojekyll` is not yet emitted. Add a `prebuild` that creates it, or make `verify.mjs` create it if absent — simplest is to have `verify.mjs` write an empty `out/.nojekyll` when missing and only *report* rather than fail. Use this form:

```js
import { existsSync, writeFileSync } from "node:fs";

writeFileSync("out/.nojekyll", "");
const required = ["out/index.html", "out/.nojekyll", "out/404.html"];
const missing = required.filter((f) => !existsSync(f));
if (missing.length) {
  console.error("Missing from build output:", missing.join(", "));
  process.exit(1);
}
console.log("Build output OK:", required.join(", "));
```

GitHub Pages runs Jekyll for branch-sourced sites, which silently drops underscore-prefixed paths. Confirmed by a real scaffold build: `out/` contained `_next/` and no `.nojekyll`.

- [ ] **Step 9: Run test to verify it passes**

```bash
npm run build
npx tsx --test tests/config.test.ts
```
Expected: build succeeds, `Build output OK: out/index.html, out/.nojekyll, out/404.html`, both tests PASS.

- [ ] **Step 10: Confirm no clone references remain**

Run: `grep -rE "iammostak|mdzeroseven" app/ next.config.ts tsconfig.json 2>/dev/null`
Expected: no output.

---

## Task 2: Global stylesheet

**Files:**
- Modify: `app/globals.css` (replace entirely)
- Modify: `app/layout.tsx`
- Create: `tests/theme.test.ts`

**Interfaces:**
- Consumes: the app from Task 1.
- Produces: `app/globals.css` exporting the 9 palette tokens as CSS custom properties, and `app/layout.tsx` setting `themeColor`. Task 5-9 components read these via Tailwind utility classes.

- [ ] **Step 1: Write the failing test**

`tests/theme.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");

test("all nine palette tokens are defined", () => {
  const expected: Record<string, string> = {
    "--color-bg": "#16171a",
    "--color-panel": "#0e0f11",
    "--color-line": "#2a2c31",
    "--color-text": "#f2f3f5",
    "--color-muted": "#9aa1ab",
    "--color-faint": "#82868d",
    "--color-amberbg": "#1a1710",
    "--color-amberline": "#3a3222",
    "--color-amber": "#948464",
  };
  for (const [token, value] of Object.entries(expected)) {
    assert.match(css, new RegExp(`${token}:\\s*${value}`), `missing ${token}`);
  }
});

test("no light-mode block and no webfont", () => {
  assert.doesNotMatch(css, /prefers-color-scheme/);
  assert.doesNotMatch(css, /Poppins/);
  assert.doesNotMatch(css, /fonts\.googleapis/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/theme.test.ts`
Expected: FAIL — the scaffold's `globals.css` still has `--background: #ffffff` and a `prefers-color-scheme` block.

- [ ] **Step 3: Replace `app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #16171a;
  --color-panel: #0e0f11;
  --color-line: #2a2c31;
  --color-text: #f2f3f5;
  --color-muted: #9aa1ab;
  --color-faint: #82868d;
  --color-amberbg: #1a1710;
  --color-amberline: #3a3222;
  --color-amber: #948464;

  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue",
    sans-serif;

  --spacing-page: 24px;
}

body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  line-height: 1.55;
}
```

Tailwind v4 exposes `@theme` values as utilities, so `bg-bg`, `text-muted`, `border-line` all become available. `--spacing-page` gives `px-page` for the container gutter.

The scaffold's `@theme inline` block and `prefers-color-scheme` block are removed entirely.

- [ ] **Step 4: Update `app/layout.tsx`**

Set `metadata.themeColor` to `#16171a`, `metadata.title` to `Md Mostafijur Rahman`, and `metadata.description` to `Software engineer at Tracxn, Bengaluru. Builds macOS apps: QuickTodo and Vidp.` Remove the scaffold's `next/font/google` Geist import — no webfont.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx tsx --test tests/theme.test.ts`
Expected: both tests PASS.

---

## Task 3: Site and project data

**Files:**
- Create: `data/site.ts`
- Create: `data/projects.ts`
- Create: `tests/data.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `site: { name, role, company, location, dayStack: string[], infraScope: string[], email, github, linkedin }` — consumed by Tasks 5, 8, 9.
  - `type Project = { slug, name, tagline, summary, problem, image: string | null, imageFallback: string | null, brew: { tap: string, install: string } | null, links: { label, href }[], featured: boolean }`
  - `projects: Project[]` — consumed by Task 6.
  - `loopSteps: string[]` — consumed by Task 7.

- [ ] **Step 1: Write the failing test**

`tests/data.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { site, projects, loopSteps } from "../data/site";
import type { Project } from "../data/projects";

test("exactly two projects, both native macOS apps", () => {
  assert.equal(projects.length, 2);
  assert.deepEqual(projects.map((p) => p.slug).sort(), ["quicktodo", "vidp"]);
});

test("no unlisted or clone project appears anywhere in the data", () => {
  const text = JSON.stringify(projects);
  for (const banned of ["focus-pulse", "cookieater", "unpakr", "music", "lyst",
    "headphonezone", "animoto", "zee5", "playo", "medimed", "tax-calculator"]) {
    assert.ok(!text.toLowerCase().includes(banned), `banned project present: ${banned}`);
  }
});

test("vidp has no image and does not fake one", () => {
  const vidp = projects.find((p) => p.slug === "vidp") as Project;
  assert.equal(vidp.image, null);
  assert.ok(vidp.imageFallback && vidp.imageFallback.length > 0);
});

test("brew commands are the real verified ones", () => {
  const qt = projects.find((p) => p.slug === "quicktodo") as Project;
  assert.equal(qt.brew?.tap, "brew tap mdopeace/quicktodo");
  assert.equal(qt.brew?.install, "brew install --cask quicktodo");
  const vd = projects.find((p) => p.slug === "vidp") as Project;
  assert.equal(vd.brew?.tap, "brew tap mdopeace/vidp");
  assert.equal(vd.brew?.install, "brew install --cask vidp");
});

test("every project link is an absolute https URL", () => {
  for (const p of projects) {
    for (const l of p.links) {
      assert.match(l.href, /^https:\/\//, `${p.slug}: ${l.href}`);
    }
  }
});

test("contact details are the real ones, not the clone author's", () => {
  assert.equal(site.email, "md.correo.e@gmail.com");
  assert.equal(site.github, "https://github.com/mdopeace");
  assert.equal(site.linkedin, "https://www.linkedin.com/in/mdopeace");
  assert.ok(!JSON.stringify(site).includes("iammostak"));
});

test("the loop has exactly three steps", () => {
  assert.equal(loopSteps.length, 3);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/data.test.ts`
Expected: FAIL — `data/site.ts` does not exist.

- [ ] **Step 3: Create `data/projects.ts`**

```ts
export type Project = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  problem: string;
  image: string | null;
  imageFallback: string | null;
  brew: { tap: string; install: string } | null;
  links: { label: string; href: string }[];
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: "quicktodo",
    name: "QuickTodo",
    tagline: "A todo app that lives in your Mac menu bar.",
    summary:
      "Native SwiftUI menu-bar app. Add with Return, open with ⌘⌥T. No window to manage, no account, no Electron.",
    problem:
      "Day-grouped lists, daily or weekly repeat, inline rename, drag-to-reorder, live search, and a self-updater that verifies the download's SHA-256 and replaces the running bundle in place. 65KB of tests, including ones that exercise the installer and relaunch path.",
    image: "/quicktodo-today.png",
    imageFallback: null,
    brew: {
      tap: "brew tap mdopeace/quicktodo",
      install: "brew install --cask quicktodo",
    },
    links: [
      { label: "Source", href: "https://github.com/mdopeace/quicktodo" },
      { label: "Releases", href: "https://github.com/mdopeace/quicktodo/releases" },
      { label: "Live page", href: "https://mdopeace.github.io/quicktodo/" },
      { label: "Homebrew tap", href: "https://github.com/mdopeace/homebrew-quicktodo" },
    ],
    featured: true,
  },
  {
    slug: "vidp",
    name: "Vidp",
    tagline: "A keyboard-driven video player built on libmpv.",
    summary:
      "Native AppKit player rendering through mpv/OpenGL. Plays mp4, m4v, mov, mkv, webm and avi, from a file or straight from Finder.",
    problem:
      "Built because there was no Mac player that felt native for watching downloaded video. Ships its own libmpv and FFmpeg, integrates with macOS now-playing, and updates itself from the GitHub API. Still a work in progress — the remaining features are the ones QuickTodo holds.",
    image: null,
    imageFallback: "Screenshot coming — the product page isn't out yet.",
    brew: { tap: "brew tap mdopeace/vidp", install: "brew install --cask vidp" },
    links: [
      { label: "Source", href: "https://github.com/mdopeace/vidp" },
      { label: "Releases", href: "https://github.com/mdopeace/vidp/releases" },
      { label: "Homebrew tap", href: "https://github.com/mdopeace/homebrew-vidp" },
    ],
    featured: true,
  },
];
```

No live-page link for vidp — `mdopeace.github.io/vidp/` is a 404 and must not be presented as existing.

- [ ] **Step 4: Create `data/site.ts`**

```ts
import { projects } from "./projects";

export const site = {
  name: "Md Mostafijur Rahman",
  role: "Software Engineer",
  company: "Tracxn",
  location: "Bengaluru",
  since: "January 2023",
  dayStack: ["React", "Next.js", "Astro", "Express", "MongoDB", "AWS Lambda"],
  infraScope: [
    "app framework and build",
    "logging and error tracking",
    "public and auth pages",
    "UI components",
  ],
  email: "md.correo.e@gmail.com",
  github: "https://github.com/mdopeace",
  linkedin: "https://www.linkedin.com/in/mdopeace",
};

export const loopSteps = [
  "No player on Mac felt right, so I built one.",
  "Then I was never satisfied, and the ideas for improving it kept evaporating — so I built a tool to hold them.",
  "With the list finally captured, I can go back and finish vidp.",
];

export { projects };
```

- [ ] **Step 5: Copy the QuickTodo screenshot**

```bash
cp /Users/mdrahman/mdopeace/quicktodo/docs/screenshots/today.png \
   /Users/mdrahman/mdopeace/mdopeace.github.io/public/quicktodo-today.png
```

`today.png` because it is the hero image QuickTodo's own README uses. Copied, not hotlinked.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx tsx --test tests/data.test.ts`
Expected: all tests PASS.

---

## Task 4: Layout shell and page composition

**Files:**
- Modify: `app/page.tsx` (replace entirely)
- Create: `components/Section.tsx`

**Interfaces:**
- Consumes: `data/site.ts` from Task 3.
- Produces: `Section({ label, children })` — a wrapper producing a labelled block with a top rule and 980px measure. Used by Tasks 5, 7, 8, 9.

- [ ] **Step 1: Create `components/Section.tsx`**

```tsx
export function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-page px-page border-t border-line py-16">
      <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">
        {label}
      </p>
      {children}
    </section>
  );
}
```

`max-w-page` resolves from the `--spacing-page` namespace only if a max-width token is added; if Tailwind does not generate it, use `max-w-[980px]` instead. Confirm against the built CSS before committing.

- [ ] **Step 2: Replace `app/page.tsx`**

```tsx
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Loop } from "@/components/Loop";
import { Context } from "@/components/Context";
import { Contact } from "@/components/Contact";
import { Section } from "@/components/Section";
import { projects, site } from "@/data/site";

export default function Home() {
  return (
    <main>
      <Hero />
      <Section label="Projects">
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
      </Section>
      <Loop />
      <Context />
      <Contact />
    </main>
  );
}
```

`site` is imported but unused here — drop it from this import; `Hero` and `Context` read it themselves.

- [ ] **Step 3: Verify the app still builds with stubs**

The five components do not exist yet. Create each as a bare `export function X() { return null; }` so the build passes, then replace them in Tasks 5-9. This is a deliberate build-green checkpoint, not final code.

Run: `npm run build`
Expected: succeeds.

---

## Task 5: Hero

**Files:**
- Create: `components/Hero.tsx`
- Create: `tests/hero-copy.test.ts`

**Interfaces:**
- Consumes: `site` from `data/site.ts`.
- Produces: `Hero()` — the first screen.

- [ ] **Step 1: Write the failing test**

`tests/hero-copy.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("components/Hero.tsx", "utf8");

test("hero leads with the name and states the role", () => {
  assert.ok(src.indexOf("Md Mostafijur Rahman") < src.indexOf("Software Engineer"),
    "name must come before role");
  assert.match(src, /Tracxn/);
  assert.match(src, /web by day/i);
});

test("hero tells the loop", () => {
  assert.match(src, /no Mac player felt right/i);
  assert.match(src, /ideas for improving it/i);
  assert.match(src, /both are on Homebrew/i);
});

test("hero has no banned voice", () => {
  assert.doesNotMatch(src, /passionate/i);
  assert.doesNotMatch(src, /results-driven/i);
  assert.doesNotMatch(src, /enthusiast/i);
  assert.ok(!src.includes("!"), "no exclamation marks");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/hero-copy.test.ts`
Expected: FAIL — `components/Hero.tsx` does not exist.

- [ ] **Step 3: Implement `Hero`**

```tsx
import { site } from "@/data/site";

export function Hero() {
  return (
    <header className="mx-auto max-w-[980px] px-page pb-20 pt-24">
      <h1 className="text-3xl font-semibold tracking-tight text-text">
        {site.name}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {site.role} at {site.company}, {site.location} — web by day.
      </p>
      <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-text">
        I watch a lot of movies, and no Mac player felt right — so I built one.
        Then I kept losing the ideas for improving it, so I built a tool to
        hold them.
      </p>
      <p className="mt-4 text-[15px] text-muted">Both are on Homebrew.</p>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/hero-copy.test.ts`
Expected: all tests PASS.

---

## Task 6: Project card

**Files:**
- Create: `components/ProjectCard.tsx`
- Create: `tests/project-card.test.ts`

**Interfaces:**
- Consumes: `Project` type and `projects` from `data/projects.ts` (Task 3).
- Produces: `ProjectCard({ project }: { project: Project })`.

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";

const src = readFileSync("components/ProjectCard.tsx", "utf8");

test("card renders an image only when one exists", () => {
  assert.match(src, /project\.image\s*\?/,
    "must branch on project.image — vidp has none");
  assert.match(src, /imageFallback/);
  assert.ok(!/<Image|from ["']next\/image["']/.test(src),
    "next/image must not be used");
});

test("card shows the brew block in monospace with amber tokens", () => {
  assert.match(src, /font-mono/);
  assert.match(src, /text-amber/);
  assert.match(src, /bg-amberbg/);
});

test("every link is absolute and opens safely", () => {
  for (const p of projects) {
    for (const l of p.links) assert.match(l.href, /^https:\/\//);
  }
  assert.match(src, /target="_blank"/);
  assert.match(src, /rel="noopener noreferrer"/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx tsx --test tests/project-card.test.ts`
Expected: FAIL — `components/ProjectCard.tsx` does not exist.

- [ ] **Step 3: Implement `ProjectCard`**

```tsx
import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-panel p-5">
      {project.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.image}
          alt={`${project.name} — ${project.tagline}`}
          className="mb-4 rounded-lg border border-line"
        />
      ) : (
        project.imageFallback && (
          <div className="mb-4 flex min-h-32 items-center justify-center rounded-lg border border-dashed border-line px-4 text-center text-sm text-faint">
            {project.imageFallback}
          </div>
        )
      )}

      <h3 className="text-lg font-semibold text-text">{project.name}</h3>
      <p className="mt-1 text-sm text-muted">{project.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{project.summary}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{project.problem}</p>

      {project.brew && (
        <div className="mt-4 rounded-lg border border-amberline bg-amberbg px-3 py-2">
          <code className="block font-mono text-xs text-amber">
            {project.brew.tap}
          </code>
          <code className="mt-1 block font-mono text-xs text-amber">
            {project.brew.install}
          </code>
        </div>
      )}

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {project.links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted underline underline-offset-4 hover:text-text"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </article>
  );
}
```

Plain `<img>` because `next/image` throws `ExportError` under static export without a custom loader. The eslint-disable is required because `@next/next/no-img-element` fires on it.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx tsx --test tests/project-card.test.ts`
Expected: all tests PASS.

---

## Task 7: The loop

**Files:**
- Create: `components/Loop.tsx`

**Interfaces:**
- Consumes: `loopSteps` from `data/site.ts`, `Section` from Task 4.
- Produces: `Loop()`.

- [ ] **Step 1: Implement `Loop`**

```tsx
import { Section } from "./Section";
import { loopSteps } from "@/data/site";

export function Loop() {
  return (
    <Section label="How this happened">
      <ol className="max-w-[62ch] space-y-4">
        {loopSteps.map((step, i) => (
          <li key={step} className="flex gap-4">
            <span className="font-mono text-sm text-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[15px] leading-relaxed text-muted">{step}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

Placed **after** the projects, not before. As a hook it pushed the work below the fold; here it explains the projects.

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: succeeds.

---

## Task 8: Context

**Files:**
- Create: `components/Context.tsx`

**Interfaces:**
- Consumes: `site` from `data/site.ts`, `Section` from Task 4.
- Produces: `Context()`.

- [ ] **Step 1: Implement `Context`**

```tsx
import { Section } from "./Section";
import { site } from "@/data/site";

export function Context() {
  return (
    <Section label="Day job">
      <div className="max-w-[62ch] space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          {site.role} at {site.company}, {site.location}, since {site.since}.
          Full-stack web by day — {site.dayStack.join(", ")}.
        </p>
        <p>
          Alongside features I own the platform work:{" "}
          {site.infraScope.join(", ")}.
        </p>
      </div>
      <ul className="mt-6 flex flex-wrap gap-2">
        {site.dayStack.map((t) => (
          <li
            key={t}
            className="rounded-full border border-line px-3 py-1 text-xs text-muted"
          >
            {t}
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

A plain pill list, not a skills grid — no icons, no proficiency bars. Tracxn is plain text, unlinked.

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: succeeds.

---

## Task 9: Contact

**Files:**
- Create: `components/Contact.tsx`

**Interfaces:**
- Consumes: `site` from `data/site.ts`, `Section` from Task 4.
- Produces: `Contact()`.

- [ ] **Step 1: Implement `Contact`**

```tsx
import { Section } from "./Section";
import { site } from "@/data/site";

export function Contact() {
  return (
    <Section label="Get in touch">
      <ul className="flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
        <li>
          <a href={`mailto:${site.email}`} className="text-text underline underline-offset-4">
            {site.email}
          </a>
        </li>
        <li>
          <a href={site.github} target="_blank" rel="noopener noreferrer"
              className="text-text underline underline-offset-4">
            GitHub
          </a>
        </li>
        <li>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer"
              className="text-text underline underline-offset-4">
            LinkedIn
          </a>
        </li>
      </ul>
    </Section>
  );
}
```

No form, no backend, no EmailJS.

- [ ] **Step 2: Run the full test suite**

Run: `npx tsx --test tests/*.test.ts`
Expected: all PASS.

---

## Task 10: Visual and responsive verification

**Files:**
- Modify: whichever files fail the checks below.

**Interfaces:**
- Consumes: the complete page from Tasks 4-9.
- Produces: a page verified at 375px and 1440px, and a confirmed contrast pass.

- [ ] **Step 1: Add Playwright and write the viewport test**

```bash
npm i -D @playwright/test
npx playwright install chromium
```

```ts
// tests/viewport.spec.ts
import { test, expect } from "@playwright/test";

test.describe("portfolio viewport", () => {
  test("hero is complete above the fold at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Md Mostafijur Rahman",
    );
    await expect(page.getByText("web by day")).toBeVisible();
    await expect(page.getByText("no Mac player felt right")).toBeVisible();
  });

  test("no horizontal overflow at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("brew blocks do not clip at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByText("brew install --cask quicktodo")).toBeVisible();
  });

  test("renders at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
```

Add `webServer: { command: "npm run dev", url: "http://localhost:3000" }` and `use: { baseURL: "http://localhost:3000" }` to `playwright.config.ts`.

- [ ] **Step 2: Run and fix**

Run: `npx playwright test`
Expected: all PASS. If a brew block clips, add `break-all` or `text-xs` to the `<code>` element in Task 6's file.

- [ ] **Step 3: Contrast check every text token against its real background**

Verify with a contrast checker: `--faint #82868d` on `--bg #16171a` and on `--panel #0e0f11`; `--muted #9aa1ab` on both; `--amber #948464` on `--amber-bg #1a1710`. All are inherited from the QuickTodo stylesheet where they already pass AA, but `--faint` and `--muted` were measured against `--bg` only — confirm them against `--panel` too, since project cards use the panel background. Any failure means changing the token, not shipping it.

---

## Task 11: Commit locally

**Files:**
- Nothing created. Repository state only.

**Interfaces:**
- Consumes: everything from Tasks 1-10.
- Produces: one commit on a new local branch. Nothing is pushed.

- [ ] **Step 1: Re-point the stale remote**

The local clone's `origin` still reads `mdzeroseven/mdzeroseven.github.io`. The
repo was already renamed on GitHub — both names resolve to the same repository
(id `534312678`), and GitHub redirects the old URL. Only the local string is
stale. No GitHub write is needed.

Run: `git remote -v`
Expected: `origin` still shows `mdzeroseven/mdzeroseven.github.io` (this is the
pre-existing state this step fixes).

```bash
git remote set-url origin https://github.com/mdopeace/mdopeace.github.io.git
git remote -v
```

Expected after: `origin  https://github.com/mdopeace/mdopeace.github.io.git`.
This edits `.git/config` only. It does not contact GitHub, does not push, and
changes no remote state.

- [ ] **Step 2: Create a branch and commit**

```bash
cd /Users/mdrahman/mdopeace/mdopeace.github.io
git checkout -b portfolio-redesign
git add -A
git commit -m "feat: replace cloned portfolio with Next.js static site"
```

Note `.superpowers/` is untracked brainstorm scaffolding — exclude it:

```bash
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 3: Confirm nothing was pushed**

Run: `git log --oneline -1` and `git status`
Expected: one commit on `portfolio-redesign`, clean tree, no `git push` run at any point.

---

## Deferred — explicitly not in this plan

- Nothing about the remote is deferred. It is fixed in Task 11, Step 1, locally.
- **Deploying to the `gh-pages` branch.** Local-only per the user's instruction. When it happens: `npm run build`, then copy `out/` to the `gh-pages` branch. Confirm `.nojekyll` survived the copy.
- **Vidp's landing page and screenshot.** In progress on the user's side. When it exists: drop the real image at `public/vidp.png`, set `projects[1].image` to `/vidp.png` and `imageFallback` to `null`, and add a `Live page` link. No other change.
- **GitHub profile cleanup.** 22 public repos, mostly learning-phase clones, and a bio reading "full-stack web developer". Out of scope; worth doing separately.
- **Adding a third project.** `data/projects.ts` is the only file that changes.