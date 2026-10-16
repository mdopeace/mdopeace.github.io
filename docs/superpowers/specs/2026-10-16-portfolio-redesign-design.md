# Portfolio Redesign — Design

**Date:** 2026-10-16
**Status:** awaiting approval
**Scope:** new portfolio site at `mdopeace.github.io`, local only (no commits, no pushes)

---

## Intent

The current portfolio does not represent its owner. It was built during a
web-development learning phase and is a clone of another developer's site
(`iammostak.github.io`) — including his social links, his GitHub stats, and 52 of
his images hotlinked from his repo.

The redesign exists to replace it with a site that shows **who Md Mostafijur
Rahman is and what he can build**, rather than a job-seeker's checklist of
skills, certificates, and clone projects.

## Why now

He is 3+ years into a software engineering role at Tracxn (Bengaluru, since
Jan 2023). His real weekend output — two shipping native macOS apps — is
markedly stronger than the learning-phase work currently on display. The gap
between what he has built and what the site shows is the problem.

## The through-line

**He builds the tool he was missing.**

This is the organising idea of the site, and it is his, not a framing imposed
on it. The full chain:

1. **The gap.** He is a heavy watcher of films, series and anime. Streaming is
   fragmented across platforms with separate subscription fees, and the free
   material available online is buried in ads and buffering. So he downloads,
   and watches offline.
2. **The first build.** There is no Mac player that does that with a clean,
   native feel. So he built **vidp** — a keyboard-driven, libmpv-based player
   that ships with a premium UI/UX. It is live and fully functional, but he is
   not satisfied with it, and there are features he still wants.
3. **The second problem.** Because he is not satisfied, ideas keep arriving at
   the worst moments — mid-codec, mid-feature. They evaporate.
4. **QuickTodo.** So he built the thing that holds them. He tags entries
   `feat:`, `task:`, `fix:`, `impv:` — a personal working habit, not a product
   feature, and the site frames it that way.
5. **Back to vidp.** With the list finally captured, he has the time to work
   through vidp's remaining features.

So the two projects are not a list. They are **one loop with a beginning and an
end**, and the end is still in progress. That incompleteness is honest, and it
reads as someone who finishes rather than someone with a shelf of clones.

The site presents the loop as evidence of how he works.

**Framing call:** vidp is described as a player for local files, which is what it
is and what its README states. No claim about streaming services is implied.

This also resolves the "web day job, native weekend work" split. For a small
focused macOS utility, Swift is the honest choice — both READMEs say "no
Electron, no bloat." The platform switch is a judgement about craft, not a
career change. Web work stays as context, not as a project section.

## Goals

- Lead with the person: name, role, and framing visible without scrolling.
- Present QuickTodo and Vidp with enough depth that two projects do not read thin.
- Sound like a working engineer, not a candidate begging.
- Be maintainable by someone with roughly two free days per weekend — structured
  so a third project can be added later without a redesign.
- Deploy to `mdopeace.github.io`, replacing the old clone.

## Non-goals

- Do **not** showcase `focus-pulse`, `cookieater`, `unpakr`, or `music`. None are
  live. He was explicit about this, twice.
- Do not showcase the learning-phase clones (lyst, headphonezone, animoto,
  zee5, playo, Medimed, tax-calculator).
- No blog, no guestbook, no contact form backend, no theme switcher.
- No build-time content pipeline beyond what two projects need.

## Anti-goals

Things that would make this a failure even if technically correct:

- Looking like a template — "Full Stack Web Developer" as the H1, a grid of
  skill icons, a GitHub contribution heatmap.
- Leading with "hire me" / "available for work" energy.
- Padding the page with unfinished work to make the project count look larger.
- Rebuilding the QuickTodo landing page. It already exists at
  `mdopeace.github.io/quicktodo/` and it is good. The portfolio links to it.

---

## Technical decisions

### Stack

**Scaffold with `create-next-app@latest` (App Router + TypeScript + Tailwind),
then add only what static export needs.**

Versions are **not** hand-pinned in this document. `create-next-app` ships a
known-good, mutually-compatible set — Next, React, TypeScript and Tailwind are
resolved by the tool, not guessed here. Rationale: he already runs this stack in
`passivearn`, so nothing is new to learn; and letting the scaffolder resolve
versions removes the entire class of version-compatibility bugs.

**Do not write a `package.json` by hand and do not `npm install next@latest
typescript@latest` ad hoc.** Specifically, bare `typescript@latest` currently
resolves to `7.0.2`, whose compiler is native Go and which ships **no
JavaScript compiler API** — the API Next.js loads TypeScript through. It makes
`next build` fail with "does not have the required TypeScript" despite being
installed ([vercel/next.js#95490](https://github.com/vercel/next.js/issues/95490)).
`create-next-app` pins a working TypeScript; manual installs do not.

Static export (`output: 'export'`) is the only config change required, because
GitHub Pages serves files only and no portfolio needs a server runtime. Two more
are forced by that choice — see "Required config edits" below.

### Scaffold command

**Verified by an actual scaffold and `npm run build` on 2026-10-16.** Node
v26.12.0, npm 11.20.0. Scaffolded output: Next 16.4.2, React 19.3.0,
Tailwind v4, **TypeScript `^5`** — the scaffolder pins a working set, so the
TypeScript 7 problem never arises.

`create-next-app` refuses to write into a directory containing existing files,
so scaffold into a sibling directory and move the result across.

```sh
cd /Users/mdrahman/mdopeace

# 1. scaffold a clean Next app beside the repo
#    --disable-git is REQUIRED: without it the scaffold carries its own .git,
#    and moving it into an existing repo corrupts history.
#    --ts/--tailwind are defaults, but the CLI persists preferences between
#    runs — passing them explicitly prevents a saved default silently
#    downgrading the project to JavaScript without Tailwind.
npx create-next-app@latest portfolio --ts --tailwind --app --eslint \
  --import-alias "@/*" --use-npm --disable-git

# 2. preserve the existing favicon
cp mdopeace.github.io/public/favicon.png portfolio/public/favicon.png

# 3. remove the old Vite/clone tree in place
rm -rf mdopeace.github.io/src mdopeace.github.io/server \
       mdopeace.github.io/index.html mdopeace.github.io/vite.config.js \
       mdopeace.github.io/package.json mdopeace.github.io/package-lock.json \
       mdopeace.github.io/public

# 4. move the scaffold in
mv portfolio/* portfolio/.[!.]* mdopeace.github.io/ 2>/dev/null
rm -rf portfolio
```

The scaffold delivers a working App Router tree, `globals.css` with
`@import "tailwindcss"`, `tsconfig.json`, ESLint config, `app/favicon.ico`, and
a `next.config.ts`.

### Required config edits

The generated `next.config.ts` ships `cacheComponents: true` and
`partialPrefetching: true`. **`cacheComponents` is incompatible with
`output: 'export'`** — it must be removed, not left in place. Three edits total:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  output: "export",               // GitHub Pages serves static files only
  images: { unoptimized: true },  // the default loader throws ExportError on export
  // cacheComponents / partialPrefetching REMOVED — break static export
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};
export default nextConfig;
```

The `turbopack` block is what makes Tailwind v4 work under Turbopack — keep it.
Do **not** copy `passivearn`'s `next.config.ts`: it contains `redirects()` and
`rewrites()`, both of which break `output: 'export'`.

`basePath` stays empty — this is an apex user/org site, not a project subpath.

Also remove the scaffold's `AGENTS.md` and starter `README.md`; replace
`app/page.tsx` and `app/globals.css` wholesale. `globals.css` arrives with a
`prefers-color-scheme` block and a light `--background: #ffffff` — the design is
dark-only (see Theme below), so that block is replaced.

### `.nojekyll` — confirmed by real build

A verified `npm run build` of the scaffold produces `out/` containing `_next/`
and **no `.nojekyll`**. GitHub Pages runs Jekyll for branch-sourced sites, which
silently drops underscore-prefixed paths — so the deploy would 404 on every JS
and CSS chunk while the build passed clean. The build must emit `.nojekyll`
into `out/`.

### Deployment

| URL | Served from | Action |
| `mdopeace.github.io/` | `gh-pages` branch, `mdopeace.github.io` repo | **Replace** — build output goes here |
| `mdopeace.github.io/quicktodo/` | `docs/` folder of the `quicktodo` repo, main branch | **Untouched** |

These are two independent Pages deployments. The new site does not affect the
QuickTodo landing page.

Build → `out/` → push to `gh-pages`. Local only for now; wiring the deploy
workflow is a later step, not part of this build.

### Known wiring issue

The local clone's `origin` points at `mdzeroseven/mdzeroseven.github.io`, but the
live site is `mdopeace/mdopeace.github.io`. `package.json` also still carries
`"homepage": "https://mdzeroseven.github.io"`. Both need correcting before any
deploy. Not a blocker while local-only.

---

## Page structure

Single page, five sections, in this order.

### 1. Hero

Four lines. Name first — a stranger should not have to scroll to learn who the
site belongs to.

```
Md Mostafijur Rahman
Software engineer at Tracxn, Bengaluru — web by day.
I watch a lot of movies, and no Mac player felt right — so I built one.
Then I kept losing the ideas for improving it, so I built a tool to hold them.
Both are on Homebrew.
```

"I watch a lot of movies" starts from something human and recognisable, then
lands on the loop by the fourth line. "Both are on Homebrew" is the proof — the
projects are not claims, they are one command away from installed.

"Web by day" earns its place immediately: it explains why the projects are
native, so the platform switch does not read as a career pivot.

### 2. Projects

Two substantial sections, QuickTodo first (it carries the story, and it is the
one with proof of shipping). Each contains: name + one-line description, a real
screenshot, the problem it solves, how it is installed, and links to source /
releases / live page.

Install commands appear verbatim — `brew tap` / `brew install --cask`. They are
the strongest credibility signal on the page and cost nothing.

Structured as one reusable project component so a third project is a data entry,
not a new section.

### 3. The loop

The full chain from the through-line, as a numbered sequence. Placed *after*
the projects: as drawn it was the hook and pushed the work below the fold; here
it explains the projects rather than teasing them.

1. No player that felt right on Mac → built vidp
2. Not satisfied, and ideas kept evaporating → built QuickTodo to hold them
3. List captured → back to vidp's remaining features

### 4. Context

Tracxn role, since Jan 2023. **Software Engineer**, full-stack, doing web by day
and platform/infra work alongside it.

Stack, as a short list — React, Next.js, Astro, Express, MongoDB, Lambda. Plus
the infra scope stated plainly: app framework and build, logging, error
tracking, public pages, auth pages, UI components. That last part is worth a
line on its own, because owning the build and the error plumbing is
significantly more than "writes features."

Not a skills grid. No icons, no proficiency bars.

### 5. Contact

`md.correo.e@gmail.com` · GitHub `mdopeace` · LinkedIn `in/mdopeace`. Plain
links. No form, no backend.

---

## Content decisions (his calls)

- **Only QuickTodo and Vidp appear.** Other projects are unlisted until live.
- **Tracxn is mentioned by name, unlinked.** Plain text reads as established
  without exposing his employer's site. His call.
- **No photo.** `src/assets/avatar.jpg` is his if he ever wants one; note that
  `src/assets/profile.png` is hotlinked from the clone author and is not usable.
- **Contact details confirmed:** `md.correo.e@gmail.com`,
  `https://www.linkedin.com/in/mdopeace`, GitHub `mdopeace`.
- **Day-job stack, verbatim from him:** React, Next.js, Astro, Express, MongoDB,
  AWS Lambda. His Tracxn designation is *Software Engineer*; the work is
  full-stack — and he also does infra: app framework, build, logging, error
  tracking, public pages, auth pages, UI components.
- Voice is first person, present tense, plain. No "passionate developer", no
  "results-driven", no exclamation marks.

---

## Open items

**Resolved:**

- Vidp screenshot — he is building the vidp landing page and the screenshot will
  come from there. **Until then, placeholder art.** Not a stock image, not a
  fabricated screenshot: an honest placeholder marked as such.
- Vidp live page — none until that landing page exists. The card links to source
  and releases only, and does not pretend otherwise.
- LinkedIn — `https://www.linkedin.com/in/mdopeace`
- Email — `md.correo.e@gmail.com`
- Tracxn — plain text, unlinked
- Photo — none

### Theme — **his decision: option A**

Dark only, no theme switcher. Reuses the QuickTodo landing page palette exactly,
so the portfolio and the project page read as one person's work. Shown as three
rendered directions; he picked A over a neutral-slate alternative and an
editorial large-type alternative.

Tokens, taken verbatim from `quicktodo/docs/index.html:37-50`:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#16171a` | page background |
| `--panel` | `#0e0f11` | project cards, code blocks |
| `--line` | `#2a2c31` | borders, section rules |
| `--text` | `#f2f3f5` | body text |
| `--muted` | `#9aa1ab` | secondary text |
| `--faint` | `#82868d` | labels, meta — **4.84:1, already AA-verified** |
| `--amber-bg` | `#1a1710` | brew command blocks |
| `--amber-line` | `#3a3222` | brew command borders |
| `--amber` | `#948464` | brew command text, accents — **4.89:1, AA-verified** |
| `--maxw` | `980px` | content measure |

Type: system stack, exactly as QuickTodo uses it —
`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`.
No webfont, no Google Fonts. The current portfolio loads Poppins; dropping it is
deliberate.

**Contrast rule:** every text token above is already ≥4.5:1 on its background,
measured in the QuickTodo stylesheet. Do not introduce new colours that are not
in this table without checking the ratio — the two marked values were adjusted
once already precisely because they failed AA.

`theme-color` meta is `#16171a`, matching QuickTodo's.

Do **not** port the scaffold's `prefers-color-scheme` block or its
`--background: #ffffff` — dark only, single palette.

**Still open:**

1. **Git remote.** `origin` points at `mdzeroseven/mdzeroseven.github.io` but the
   live site is `mdopeace/mdopeace.github.io`. Needs re-pointing before any
   deploy. Not a blocker while local-only. Rename or re-point is his call.
2. **GitHub profile cleanup.** His profile still shows 22 public repos, mostly
   learning-phase clones, and a bio reading "full-stack web developer". The
   portfolio can only be as strong as the profile it links to. Out of scope for
   this build, but worth doing.

## Verification

- `npm run build` completes and `out/` contains `index.html`.
- **`out/.nojekyll` exists.** Without it the live site 404s on every JS/CSS
  chunk while the build still passes.
- `cacheComponents` and `partialPrefetching` are **removed** from
  `next.config.ts` — both break static export.
- No `redirects()` or `rewrites()` in `next.config.ts` — both break static
  export.
- `basePath` is empty. This is an apex user/org site, not a project subpath.
- No nested `.git` directory at the repo root (scaffold ran `--disable-git`).
- No reference to `iammostak` in new source. Note `server/db.json` and the old
  `src/Components/` are clone data and are deleted, not preserved.
- No reference to `mdzeroseven`.
- All external links (brew taps, repos, releases, email, LinkedIn) resolve.
- Renders correctly at 375px and 1440px.

## Not verified

- Live deploy behaviour on the `gh-pages` branch — deliberately untested, since
  this build is local-only. The `.nojekyll` requirement is inferred from GitHub
  Pages' documented Jekyll underscore-stripping and confirmed only insofar as a
  real build emits `_next/` without `.nojekyll`; check it on the first real deploy.

## Verified during design

A throwaway scaffold was built in a temp directory and `npm run build` run
against it. That confirmed the flag set, the generated `next.config.ts`, the
absence of `.nojekyll`, and that `output: 'export'` + `images.unoptimized` +
dropping `cacheComponents` builds clean. Everything under "Required config
edits" and ".nojekyll" comes from that run rather than inference. The temp
scaffold is discarded; the real build starts fresh.

## Repo's existing state

Currently Vite + React 18 + JS + CSS modules. The rebuild **deletes** `src/`,
`server/`, `index.html`, `vite.config.js` and the clone's `package.json` scripts,
keeps `public/favicon.png`, and rebuilds in place. `app/`, `components/` and
`data/` exist but are empty.

Screenshot sourcing: copy from the quicktodo repo into `public/`. Do **not**
hotlink `raw.githubusercontent.com` — that is precisely the practice being fixed,
and it would reproduce the original sin with his own assets.