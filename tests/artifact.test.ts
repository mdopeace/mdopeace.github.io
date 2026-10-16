import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const html = readFileSync("out/index.html", "utf8");
const css = readFileSync("app/globals.css", "utf8");

test("the built page declares the dark theme-color, not just the source", () => {
  assert.match(
    html,
    /name="theme-color"[^>]*content="#16171a"/i,
    "theme-color is absent from the built HTML — it must move to the viewport export",
  );
});

test("the shipped 404 page is dark, not the scaffold's white default", () => {
  const notFound = readFileSync("out/404.html", "utf8");
  assert.doesNotMatch(
    notFound,
    /background:\s*#fff/i,
    "the default not-found template still ships a white background",
  );
});

test("no scaffold leftovers are published", () => {
  for (const asset of ["next.svg", "vercel.svg", "file.svg", "globe.svg", "window.svg"]) {
    assert.equal(
      existsSync(join("public", asset)),
      false,
      `${asset} is create-next-app boilerplate and must not ship`,
    );
  }
});

test("the favicon served is ours, not the scaffold's", () => {
  const link = html.match(/rel="icon"[^>]*/i)?.[0] ?? "";
  assert.doesNotMatch(link, /favicon\.ico/, "Next's own icon is winning over ours");
  assert.match(link, /favicon\.png/);
});

test("globals.css carries no light-mode block", () => {
  assert.doesNotMatch(css, /prefers-color-scheme/);
});