import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const projects = readFileSync("data/projects.ts", "utf8");

// Hotlinked to the quicktodo repo so a new screenshot lands here without a
// copy step. raw.githubusercontent is used rather than jsdelivr because its
// cache is max-age=300 — jsdelivr holds for 7 days, which would mean a
// changed screenshot never appearing.
const RAW = "https://raw.githubusercontent.com/mdopeace/quicktodo/main/docs/screenshots/";

test("quicktodo's screenshot is hotlinked to its own repo", () => {
  assert.ok(projects.includes(`${RAW}completed.png`), "not hotlinked");
});

test("the image URL pins the file that is the project's hero", () => {
  // completed.png is the hero in quicktodo/docs/index.html and its README.
  assert.match(projects, /completed\.png/);
});

test("no screenshot is committed to this repo", () => {
  assert.equal(
    existsSync("public/quicktodo-hero.png"),
    false,
    "the local copy should be gone, not kept alongside the hotlink",
  );
});

test("the url is pinned to the main branch and the screenshots folder", () => {
  // A renamed branch silently breaks every image on the site.
  assert.match(projects, /mdopeace\/quicktodo\/main\/docs\/screenshots\//);
});

test("the shipped HTML hotlinks the image and serves no local copy", () => {
  const html = readFileSync("out/index.html", "utf8");
  assert.ok(html.includes(`${RAW}completed.png`), "built HTML does not hotlink");
  assert.doesNotMatch(html, /\/quicktodo-hero\.png/);
});

test("vidp still has no image, and still fakes nothing", () => {
  const vidp = readFileSync("data/projects.ts", "utf8");
  assert.match(vidp, /imageFallback:\s*"Screenshot coming/);
});