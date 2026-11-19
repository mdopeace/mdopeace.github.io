import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

// Checks read the built page — what ships is what's tested. Run `npm run build` first.
assert.ok(
  existsSync("out/index.html"),
  "out/index.html missing — run `npm run build` first",
);
const html = readFileSync("out/index.html", "utf8");

test("the page shows the WhatsApp handle and requires phone numbers in wa.me links", () => {
  const hrefs = [...html.matchAll(/\shref="([^"]*)"/g)].map((match) => match[1]);
  const invalidLinks = hrefs.filter(
    (href) => href.includes("wa.me") && !/wa\.me\/\+?\d{6,}/.test(href),
  );
  assert.deepEqual(invalidLinks, []);
  assert.match(html, />\s*WhatsApp: @mdopeace\s*<\//);
});

test("the playground ships as a public directory route with portfolio links", () => {
  const playground = readFileSync("out/playground/index.html", "utf8");
  assert.match(html, /href="\/playground\/"/);
  assert.ok(html.includes("Explore playground"));
  assert.ok(playground.includes("Small parts. A shared language."));
  assert.ok(playground.includes("Design decisions"));
  assert.match(playground, /rel="canonical" href="https:\/\/mdopeace.github.io\/playground\/"/);
  assert.ok(!existsSync("out/components-preview/index.html"));
});

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
    "brew tap vidplabs/vidp\nbrew install --cask vidp",
  ]);
});

test("page ships its accessibility and identity hooks", () => {
  assert.ok(
    html.includes('aria-live="polite"'),
    "copy button aria-live missing",
  );
  assert.match(
    html,
    /<link rel="icon" href="[^"]*\/icon\.svg(?:\?[^"]*)?"[^>]*>/,
    "local SVG favicon missing",
  );
});

test("support dialog ships both provider links and dialog hooks", () => {
  assert.ok(html.includes('aria-haspopup="dialog"'));
  assert.match(html, /<dialog\b[^>]*aria-labelledby="[^"]+"/);
  assert.ok(html.includes("Fuel the next build"));
  assert.ok(html.includes('role="switch"'));
  assert.ok(!html.includes(">AUTO<"));
  assert.ok(
    html.includes("https://github.com/sponsors/mdopeace"),
    "GitHub Sponsors link missing",
  );
  assert.ok(
    html.includes("https://buymeacoffee.com/mdopeace"),
    "Buy Me a Coffee link missing",
  );
});
