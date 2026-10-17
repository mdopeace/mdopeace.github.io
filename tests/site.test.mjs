import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");

// The portfolio is one hand-written HTML file, in the same category as the
// QuickTodo landing page — which has no tests either. What that page does
// not have is this failure mode: twelve external URLs that break silently
// when a repo is renamed or a username changes, with nothing else on the
// page noticing.

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