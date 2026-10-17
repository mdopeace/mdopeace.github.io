import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const layout = readFileSync("app/layout.tsx", "utf8");
const CDN = "avatars.githubusercontent.com/u/99809028";

// Hotlinked deliberately: a favicon is cosmetic and low-stakes, so tracking
// the GitHub avatar automatically beats keeping a copy that drifts. (The
// screenshot stays local — that one is content, and a broken image matters.)
test("the favicon points at the GitHub avatar CDN, not a local file", () => {
  assert.match(layout, /avatars\.githubusercontent\.com\/u\/99809028/);
  assert.doesNotMatch(
    layout,
    /"\/avatar-32\.png"/,
    "must not reference a local copy — that is the drift being removed",
  );
});

test("no avatar image is committed to the repo", () => {
  for (const f of ["public/avatar-32.png", "public/avatar-180.png"]) {
    assert.equal(existsSync(f), false, `${f} should be deleted, not hotlinked`);
  }
});

test("sized variants are requested so the tab icon is not a 68KB photo", () => {
  assert.match(layout, /\?s=64/, "tab favicon should request a 64px variant");
  assert.match(layout, /\?s=180/, "apple-touch-icon should request a 180px variant");
});

test("both colour schemes are declared so dark mode does not tint the photo", () => {
  assert.match(layout, /media:\s*"\(prefers-color-scheme: light\)"/);
  assert.match(layout, /media:\s*"\(prefers-color-scheme: dark\)"/);
});

test("the shipped HTML links the CDN, with no local icon and no .ico", () => {
  const html = readFileSync("out/index.html", "utf8");
  assert.ok(html.includes(CDN), "built HTML does not link the avatar CDN");
  assert.match(html, /apple-touch-icon/);
  assert.doesNotMatch(html, /favicon\.ico/);
  assert.doesNotMatch(html, /\/avatar-\d+\.png/);
});

test("the avatar CDN and the screenshot use different hosts on purpose", () => {
  // Both are hotlinked to their source of truth, but via different CDNs:
  // avatars.githubusercontent for the profile pic, raw.githubusercontent for
  // the screenshot. Mixing them up or folding one into a local copy drifts.
  const html = readFileSync("out/index.html", "utf8");
  assert.ok(html.includes("avatars.githubusercontent.com/u/99809028"));
  assert.ok(html.includes("raw.githubusercontent.com/mdopeace/quicktodo"));
});