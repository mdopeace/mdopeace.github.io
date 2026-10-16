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
  assert.ok(
    existsSync("out/.nojekyll"),
    "out/.nojekyll missing — Jekyll will drop _next/",
  );
});