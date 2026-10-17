import { test } from "node:test";
import assert from "node:assert/strict";
import { site, projects, loopSteps } from "../data/site";
import type { Project } from "../data/projects";

test("exactly two projects, both native macOS apps", () => {
  assert.equal(projects.length, 2);
  assert.deepEqual(
    projects.map((p) => p.slug).sort(),
    ["quicktodo", "vidp"],
  );
});

test("no unlisted or clone project appears anywhere in the data", () => {
  const text = JSON.stringify(projects).toLowerCase();
  for (const banned of [
    "focus-pulse",
    "cookieater",
    "unpakr",
    "music",
    "lyst",
    "headphonezone",
    "animoto",
    "zee5",
    "playo",
    "medimed",
    "tax-calculator",
  ]) {
    assert.ok(!text.includes(banned), `banned project present: ${banned}`);
  }
});

test("vidp has no image and does not fake one", () => {
  const vidp = projects.find((p) => p.slug === "vidp") as Project;
  assert.equal(vidp.image, null);
  assert.ok(
    vidp.imageFallback && vidp.imageFallback.length > 0,
    "vidp needs an honest fallback line, not silence",
  );
});

test("quicktodo has a real screenshot, hotlinked to its own repo", () => {
  const qt = projects.find((p) => p.slug === "quicktodo") as Project;
  assert.ok(qt.image, "quicktodo has 8 real screenshots available");
  assert.match(
    qt.image!,
    /^https:\/\/raw\.githubusercontent\.com\/mdopeace\/quicktodo\//,
    "must point at the quicktodo repo so a new screenshot lands here",
  );
});

test("brew commands are the real verified ones", () => {
  const qt = projects.find((p) => p.slug === "quicktodo") as Project;
  assert.equal(qt.brew?.tap, "brew tap mdopeace/quicktodo");
  assert.equal(qt.brew?.install, "brew install --cask quicktodo");
  const vd = projects.find((p) => p.slug === "vidp") as Project;
  assert.equal(vd.brew?.tap, "brew tap mdopeace/vidp");
  assert.equal(vd.brew?.install, "brew install --cask vidp");
});

test("every project link is an absolute https URL", () => {
  for (const p of projects) {
    for (const l of p.links) {
      assert.match(l.href, /^https:\/\//, `${p.slug}: ${l.href}`);
    }
  }
});

test("vidp has no live-page link because that page does not exist", () => {
  const vd = projects.find((p) => p.slug === "vidp") as Project;
  assert.ok(
    !vd.links.some((l) => l.href.includes("mdopeace.github.io")),
    "mdopeace.github.io/vidp/ is a 404 and must not be presented as live",
  );
});

test("contact details are the real ones, not the clone author's", () => {
  assert.equal(site.email, "md.correo.e@gmail.com");
  assert.equal(site.github, "https://github.com/mdopeace");
  assert.equal(site.linkedin, "https://www.linkedin.com/in/mdopeace");
  assert.ok(!JSON.stringify(site).includes("iammostak"));
});

test("the loop has exactly three steps", () => {
  assert.equal(loopSteps.length, 3);
});