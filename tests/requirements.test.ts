import { test } from "node:test";
import assert from "node:assert/strict";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";

const byslug = (slug: string) => projects.find((p) => p.slug === slug) as Project;

// Both casks depend on macos: :ventura, and vidp's cask has no `arch`
// stanza while its releases are arm64-only. Homebrew will happily install a
// build that cannot launch, so the page has to say so.
test("both projects state the macOS requirement", () => {
  for (const p of projects) {
    assert.ok(
      p.requires?.some((r) => /^macOS 13/.test(r)),
      `${p.slug} must state its macOS requirement, got: ${JSON.stringify(p.requires)}`,
    );
  }
});

test("vidp states it is Apple Silicon only", () => {
  const vidp = byslug("vidp");
  assert.ok(
    vidp.requires?.some((r) => /Apple Silicon/i.test(r)),
    "vidp releases are arm64-only and the page must say so",
  );
});

test("quicktodo runs on both architectures, so it must not claim arm64-only", () => {
  const qt = byslug("quicktodo");
  assert.ok(
    !qt.requires?.some((r) => /Apple Silicon only/i.test(r)),
    "quicktodo supports Intel and Apple Silicon",
  );
});