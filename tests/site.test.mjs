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
  assert.doesNotMatch(html, /prefers-color-scheme: light\)[\s\S]{0,80}body/);
  assert.doesNotMatch(html, /Poppins|fonts\.googleapis|fonts\.gstatic/);
  assert.match(html, /-apple-system, BlinkMacSystemFont/);
});

test("theme-color meta is present", () => {
  assert.match(html, /name="theme-color" content="#16171a"/);
});

// --- contrast ------------------------------------------------------------
const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin(((n >> 16) & 255) / 255) + 0.7152 * lin(((n >> 8) & 255) / 255) +
    0.0722 * lin((n & 255) / 255);
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
    assert.ok(r >= 4.5, `${label}: ${TOKENS[fg]} on ${TOKENS[bg]} is ${r.toFixed(2)}:1`);
  });
}

// --- assets --------------------------------------------------------------
test("favicon is the hotlinked GitHub avatar, no .ico", () => {
  assert.match(html, /avatars\.githubusercontent\.com\/u\/99809028\?s=64/);
  assert.match(html, /apple-touch-icon/);
  assert.doesNotMatch(html, /favicon\.ico/);
});

test("screenshot is hotlinked to the quicktodo repo, no local copy", () => {
  assert.match(
    html,
    /raw\.githubusercontent\.com\/mdopeace\/quicktodo\/main\/docs\/screenshots\/completed\.png/,
  );
  assert.doesNotMatch(html, /quicktodo-hero/);
});

test("no local image files are needed to render the page", () => {
  assert.equal(existsSync("public"), false, "public/ should not exist");
});

// --- weight --------------------------------------------------------------
test("the page ships no separate script or stylesheet files", () => {
  for (const f of readdirSync(".")) {
    if (/\.(js|css)$/.test(f) && f !== "playwright.config.ts") {
      assert.fail(`unexpected shippable asset: ${f}`);
    }
  }
  assert.equal((html.match(/<script[^>]+src=/g) || []).length, 0, "no external scripts");
  assert.equal((html.match(/<link[^>]+stylesheet/g) || []).length, 0, "no external stylesheets");
});

// --- content -------------------------------------------------------------
test("exactly the two live projects, and no clone or WIP names", () => {
  for (const banned of [
    "focus-pulse", "cookieater", "unpakr", "lyst", "headphonezone",
    "animoto", "zee5", "playo", "medimed", "tax-calculator",
  ]) {
    assert.ok(!html.toLowerCase().includes(banned), `banned project present: ${banned}`);
  }
  assert.equal((html.match(/<article>/g) || []).length, 2);
});

test("contact details are the real ones, never the clone author's", () => {
  assert.match(html, /mailto:md\.correo\.e@gmail\.com/);
  assert.match(html, /github\.com\/mdopeace"/);
  assert.match(html, /linkedin\.com\/in\/mdopeace/);
  assert.doesNotMatch(html, /iammostak/i);
  assert.doesNotMatch(html, /mdzeroseven/i);
  assert.doesNotMatch(html, /telegram/i);
});

test("brew commands are the verified ones", () => {
  assert.match(html, /brew tap mdopeace\/quicktodo\nbrew install --cask quicktodo/);
  assert.match(html, /brew tap mdopeace\/vidp\nbrew install --cask vidp/);
});

test("vidp has no image and does not fake one", () => {
  const vidp = html.slice(html.indexOf("<h2>Vidp</h2>"));
  assert.doesNotMatch(vidp.slice(0, 400), /<img/);
  assert.match(html, /Screenshot coming — the product page isn't out yet\./);
  assert.doesNotMatch(html, /mdopeace\.github\.io\/vidp/);
});

test("quicktodo states the problem, not just a feature list", () => {
  assert.match(html, /Standup hands me five things/);
});

test("the loop explains what the hero does not, and names both apps", () => {
  const loop = html.slice(html.indexOf("How this happened"));
  // \s+ because the copy is line-wrapped in the source.
  assert.match(loop, /Streaming is split across/);
  assert.match(loop, /so I built\s+vidp/);
  assert.match(loop, /so I built QuickTodo to hold/);
  assert.match(loop, /QuickTodo to hold\s+them/);
  assert.equal((html.match(/class="n" aria-hidden/g) || []).length, 3);
});

test("platform work is attributed to a team, no headcount", () => {
  assert.match(html, /Part of the platform team, where we handle/);
  for (const leak of [/two developers/i, /2 developers/i, /manager/i, /team lead/i]) {
    assert.doesNotMatch(html, leak, `team composition leaked: ${leak}`);
  }
});

test("the day-job stack is stated once, not as a chip grid", () => {
  const dayJob = html.slice(html.indexOf("Day job"), html.indexOf("Get in touch"));
  for (const tool of ["React", "Next.js", "Astro", "Express", "MongoDB", "AWS Lambda"]) {
    assert.equal(
      (dayJob.match(new RegExp(tool.replace(".", "\\."), "g")) || []).length,
      1,
      `${tool} should appear exactly once`,
    );
  }
  assert.doesNotMatch(dayJob, /rounded-full/);
});

test("no banned voice, and no exclamation marks in the copy", () => {
  assert.doesNotMatch(html, /passionate|results-driven|enthusiast|available for/i);
  // Visible copy only — <!doctype html> and comments legitimately contain "!".
  const copy = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ");
  assert.ok(!copy.includes("!"), "no exclamation marks in visible copy");
});

test("there is no contact form or backend", () => {
  assert.doesNotMatch(html, /<form|<input|<textarea|emailjs|action=/i);
});
