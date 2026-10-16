import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";

const byslug = (slug: string) => projects.find((p) => p.slug === slug) as Project;

test("quicktodo states the problem it solves, not just its features", () => {
  const qt = byslug("quicktodo");
  assert.match(
    qt.problem,
    /standup|scrum|forget|interrupt|deep|requirement|testflight|publish/i,
    "the problem field must say why the app exists, not list capabilities",
  );
});

test("quicktodo leads with its engineering proof", () => {
  const qt = byslug("quicktodo");
  assert.match(qt.problem, /65KB of tests/i);
});

test("every project's problem field is not a bare feature list", () => {
  for (const p of projects) {
    const sentences = p.problem.split(/(?<=\.)\s+/).filter(Boolean);
    assert.ok(
      sentences.length >= 2,
      `${p.slug} reads as a feature list, not a problem statement`,
    );
  }
});

test("vidp keeps its uninstall feature, which is what makes the WIP line land", () => {
  const vd = byslug("vidp");
  assert.match(vd.problem, /uninstall/i);
});

test("the context stack is stated once, not as a chip grid", () => {
  const src = readFileSync("components/Context.tsx", "utf8");
  const dayStackMentions = (src.match(/dayStack/g) ?? []).length;
  assert.equal(
    dayStackMentions,
    1,
    "dayStack appears in the prose and again in the pill list — that is the skills-grid pattern the spec banned",
  );
  assert.doesNotMatch(src, /rounded-full/, "the chip list duplicates the prose");
});