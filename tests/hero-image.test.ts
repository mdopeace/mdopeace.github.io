import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";

const SOURCE = "/Users/mdrahman/mdopeace/quicktodo/docs/screenshots";
const byslug = (slug: string) => projects.find((p) => p.slug === slug) as Project;
const sha256 = (p: string) =>
  createHash("sha256").update(readFileSync(p)).digest("hex");

test("quicktodo uses the hero screenshot, not the today one", () => {
  const qt = byslug("quicktodo");
  assert.equal(qt.image, "/quicktodo-hero.png");
  assert.ok(
    !qt.image?.includes("today"),
    "today.png is no longer the hero — completed.png is",
  );
});

test("the hero file exists in public/ and is not a hotlink", () => {
  const qt = byslug("quicktodo");
  assert.match(qt.image!, /^\//, "must be a local path");
  assert.ok(existsSync(`public${qt.image}`), `${qt.image} is missing from public/`);
});

test("the hero is byte-identical to the repo's completed.png", () => {
  // A copy, not a re-encode: the portfolio must not drift from the file the
  // project's own landing page uses as its hero.
  assert.equal(sha256("public/quicktodo-hero.png"), sha256(`${SOURCE}/completed.png`));
});

test("no stray probe files are left in public/", () => {
  const leftovers = ["public/.hero-probe.png", "public/quicktodo-today.png"];
  for (const f of leftovers) {
    assert.equal(existsSync(f), false, `${f} should have been removed`);
  }
});