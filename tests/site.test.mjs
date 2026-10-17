import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";

const html = readFileSync("index.html", "utf8");

// --- palette -------------------------------------------------------------
const TOKENS = {
  bg: "#16171a",
  panel: "#0e0f11",
  line: "#2a2c31",
  text: "#f2f3f5",
  muted: "#9aa1ab",
  faint: "#82868d",
  "amber-bg": "#1a1710",
  "amber-line": "#3a3222",
  amber: "#948464",
};

test("all nine palette tokens are defined", () => {
  for (const [name, value] of Object.entries(TOKENS)) {
    assert.match(html, new RegExp(`--${name}:\\s*${value}`), `missing --${name}`);
  }
});

test("single dark theme, no webfont", () => {
  assert.doesNotMatch(html, /Poppins|fonts\.googleapis|fonts\.gstatic/);
  assert.match(html, /-apple-system, BlinkMacSystemFont/);
});

// --- contrast ------------------------------------------------------------
const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * lin(((n >> 16) & 255) / 255) +
    0.7152 * lin(((n >> 8) & 255) / 255) +
    0.0722 * lin((n & 255) / 255)
  );
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const [label, fg, bg] of [
  ["body text on page", "text", "bg"],
  ["secondary text on page", "muted", "bg"],
  ["labels on page", "faint", "bg"],
  ["body text on card", "text", "panel"],
  ["secondary text on card", "muted", "panel"],
  ["labels on card", "faint", "panel"],
  ["brew command", "amber", "amber-bg"],
]) {
  test(`${label} meets AA (4.5:1)`, () => {
    const r = ratio(TOKENS[fg], TOKENS[bg]);
    assert.ok(r >= 4.5, `${label}: ${r.toFixed(2)}:1, needs 4.5:1`);
  });
}

// --- assets --------------------------------------------------------------
test("favicon is the hotlinked GitHub avatar, no .ico", () => {
  assert.match(html, /avatars\.githubusercontent\.com\/u\/99809028\?s=64/);
  assert.doesNotMatch(html, /favicon\.ico/);
});

test("screenshot is hotlinked to the quicktodo repo, no local copy", () => {
  assert.match(html, /raw\.githubusercontent\.com\/mdopeace\/quicktodo\//);
  assert.doesNotMatch(html, /quicktodo-hero/);
});

// --- weight --------------------------------------------------------------
test("the page ships no separate script or stylesheet files", () => {
  for (const f of readdirSync(".")) {
    if (/\.(js|css)$/.test(f) && f !== "playwright.config.ts") {
      assert.fail(`unexpected shippable asset: ${f}`);
    }
  }
  assert.equal((html.match(/<script[^>]+src=/g) || []).length, 0);
  assert.equal((html.match(/<link[^>]+stylesheet/g) || []).length, 0);
});

// --- content -------------------------------------------------------------
test("exactly the two live projects, no clones or WIP work", () => {
  for (const banned of [
    "focus-pulse", "cookieater", "unpakr", "lyst", "headphonezone",
    "animoto", "zee5", "playo", "medimed", "tax-calculator",
  ]) {
    assert.ok(!html.toLowerCase().includes(banned), `present: ${banned}`);
  }
  assert.equal((html.match(/<article>/g) || []).length, 2);
});

test("brew commands are the verified ones", () => {
  assert.match(html, /brew tap mdopeace\/quicktodo\nbrew install --cask quicktodo/);
  assert.match(html, /brew tap mdopeace\/vidp\nbrew install --cask vidp/);
});

test("vidp has no image and does not fake one", () => {
  assert.match(html, /Screenshot coming — the product page isn't out yet\./);
  assert.doesNotMatch(html, /mdopeace\.github\.io\/vidp/);
});

test("contact details are the real ones, never the clone author's", () => {
  assert.match(html, /mailto:md\.correo\.e@gmail\.com/);
  assert.doesNotMatch(html, /iammostak|mdzeroseven|telegram/i);
});

test("platform work is attributed to a team, no headcount", () => {
  assert.match(html, /Part of the platform team, where we handle/);
  assert.doesNotMatch(html, /two developers|manager|team lead/i);
});

test("no banned voice, and no exclamation marks in the copy", () => {
  assert.doesNotMatch(html, /passionate|results-driven|enthusiast|available for/i);
  const copy = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ");
  assert.ok(!copy.includes("!"), "no exclamation marks in visible copy");
});

// --- link rot ------------------------------------------------------------
// The one thing that actually decays: these URLs break silently when a repo is
// renamed or a username changes, and nothing else on the page would notice.
const LINKS = [...html.matchAll(/(?:href|src)="(https:\/\/[^"]+)"/g)].map(
  (m) => m[1],
);

test("the page has external links to check", () => {
  assert.ok(LINKS.length >= 10, `only found ${LINKS.length}`);
});

test("every external link resolves", async () => {
  // LinkedIn answers HEAD with 405 and GET with 999 to anything that looks
  // automated, so neither status proves the profile is missing. Verify it
  // separately rather than weakening the check for every other link.
  const SKIP_BOT_WALL = /linkedin\.com/;

  const results = await Promise.all(
    LINKS.map(async (url) => {
      try {
        const r = await fetch(url, { method: "HEAD", redirect: "follow" });
        return { url, status: r.status };
      } catch (e) {
        return { url, status: 0, error: String(e) };
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