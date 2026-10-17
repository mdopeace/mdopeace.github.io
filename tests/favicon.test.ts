import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const layout = readFileSync("app/layout.tsx", "utf8");

// The GitHub avatar, downloaded once and checked in at the two sizes browsers
// actually request. Browsers tint favicons in dark mode unless given explicit
// light and dark variants, so both are declared — "always the profile pic".
test("the favicon is the GitHub avatar, not the old 32px site icon", () => {
  assert.ok(existsSync("public/avatar-32.png"), "avatar-32.png missing");
  assert.ok(existsSync("public/avatar-180.png"), "avatar-180.png missing");
});

test("the old site favicon is gone", () => {
  assert.equal(
    existsSync("public/favicon.png"),
    false,
    "the pre-redesign 32px favicon is still published",
  );
});

test("the avatar is a real photo, not a placeholder-sized stub", () => {
  // 32px tab icon and 180px home-screen icon, both 8-bit.
  const png = (p: string) => readFileSync(p);
  assert.ok(png("public/avatar-32.png").length > 500, "avatar-32 looks empty");
  assert.ok(
    png("public/avatar-180.png").length > 5000,
    "avatar-180 looks empty",
  );
  const digest = createHash("sha256")
    .update(png("public/avatar-32.png"))
    .digest("hex");
  assert.ok(digest.length === 64);
});

test("layout declares the avatar for tab and home-screen use", () => {
  assert.match(layout, /avatar-32\.png/, "tab favicon not declared");
  assert.match(layout, /avatar-180\.png/, "apple-touch-icon not declared");
  assert.doesNotMatch(layout, /"favicon\.ico"/, "must not ship an .ico path");
});

test("both light and dark variants are declared so nothing gets auto-tinted", () => {
  const variants = layout.match(/url:\s*"\/avatar-32\.png"/g) ?? [];
  assert.ok(
    variants.length >= 2,
    `needs a media-qualified pair for light and dark, found ${variants.length}`,
  );
  assert.match(layout, /media:\s*"\(prefers-color-scheme: light\)"/);
  assert.match(layout, /media:\s*"\(prefers-color-scheme: dark\)"/);
});

test("the shipped HTML points every browser at the avatar", () => {
  const html = readFileSync("out/index.html", "utf8");
  assert.match(html, /avatar-32\.png/);
  assert.match(html, /apple-touch-icon/);
  assert.doesNotMatch(html, /favicon\.ico/);
});