import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

// Checks read the built page — what ships is what's tested. Run `npm run build` first.
assert.ok(
  existsSync("out/index.html"),
  "out/index.html missing — run `npm run build` first",
);
const html = readFileSync("out/index.html", "utf8");

// LinkedIn blocks bots (405/999) — exclude rather than weaken the whole check.
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
  // Decode &#10; so the payload, not the serialization, is pinned.
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
