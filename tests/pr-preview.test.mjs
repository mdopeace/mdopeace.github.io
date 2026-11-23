import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

// Run against out/ after a preview build, with the same base path.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
assert.ok(basePath, "Set NEXT_PUBLIC_BASE_PATH to the preview build's base path");

const home = readFileSync("out/index.html", "utf8");
const playground = readFileSync("out/playground/index.html", "utf8");

test("preview pages load Next assets and link to each other under the base path", () => {
  for (const html of [home, playground]) {
    const assets = [...html.matchAll(/\s(?:href|src)="([^"]*\/_next\/[^"]*)"/g)];
    assert.ok(assets.length > 0, "Next asset URLs missing");
    for (const [, url] of assets) {
      assert.ok(url.startsWith(`${basePath}/_next/`), url);
      const path = url.slice(basePath.length).split("?")[0];
      assert.ok(existsSync(`out${path}`), `Missing exported asset: ${path}`);
    }
  }
  assert.ok(home.includes(`href="${basePath}/playground/"`));
  assert.ok(playground.includes(`href="${basePath}/"`));
});

test("preview pages use prefixed images and a noindex directive without analytics", () => {
  assert.ok(home.includes(`src="${basePath}/contact-maker.webp"`));
  assert.match(home, /data-variant="thought" data-tail="bottom-start"/);
  for (const html of [home, playground]) {
    assert.ok(html.includes(`property="og:image" content="https://mdopeace.github.io${basePath}/opengraph-image.png"`));
    assert.match(html, /<meta name="robots" content="noindex, nofollow"\s*\/>/);
    assert.doesNotMatch(html, /googletagmanager\.com|google-analytics\.com|\bgtag\s*\(/i);
  }
});
