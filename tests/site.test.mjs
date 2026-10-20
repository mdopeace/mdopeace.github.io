import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

// The portfolio ships as a static export: GitHub Pages serves out/index.html,
// so every check reads the built page, not the source. What that page does not
// have is the old failure mode: a dozen external URLs that break silently when
// a repo is renamed or a username changes, with nothing else on the page
// noticing.
assert.ok(
  existsSync("out/index.html"),
  "out/index.html missing — run `npm run build` first",
);
const html = readFileSync("out/index.html", "utf8");

// LinkedIn answers HEAD with 405 and GET with 999 to anything automated, so
// neither status proves a missing profile. Excluded rather than weakening the
// check for every other URL.
const SKIP_BOT_WALL = /linkedin\.com/;

const LINKS = [...html.matchAll(/(?:href|src)="(https:\/\/[^"]+)"/g)].map(
  (m) => m[1],
);

test("every external link resolves", async () => {
  const results = await Promise.all(
    LINKS.map(async (url) => {
      try {
        const r = await fetch(url, { method: "HEAD", redirect: "follow" });
        return { url, status: r.status };
      } catch {
        return { url, status: 0 };
      }
    }),
  );

  const broken = results.filter(
    (r) => !SKIP_BOT_WALL.test(r.url) && (r.status < 200 || r.status >= 400),
  );
  assert.deepEqual(
    broken,
    [],
    `broken links:\n${broken.map((b) => `  ${b.status} ${b.url}`).join("\n")}`,
  );
});

test("copy commands survive the build byte-for-byte", () => {
  // JSX strings serialize through HTML escaping (&#10; or a literal newline
  // are both valid); decode before comparing so the payload — not the
  // serialization — is what's pinned.
  const payloads = [...html.matchAll(/data-copy="([^"]*)"/g)].map((m) =>
    m[1].replaceAll("&#10;", "\n"),
  );
  assert.deepEqual(payloads, [
    "brew tap mdopeace/quicktodo\nbrew install --cask quicktodo",
    "brew tap mdopeace/vidp\nbrew install --cask vidp",
  ]);
});

test("page ships its accessibility and identity hooks", () => {
  assert.ok(
    html.includes('aria-live="polite"'),
    "copy button aria-live missing",
  );
  assert.ok(
    html.includes(
      'rel="icon" href="https://avatars.githubusercontent.com/u/99809028?s=64"',
    ),
    "avatar icon link missing",
  );
  assert.ok(
    html.includes(
      'rel="apple-touch-icon" href="https://avatars.githubusercontent.com/u/99809028?s=180"',
    ),
    "apple-touch-icon missing",
  );
});
