import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { site } from "../data/site";

// Team composition was shared as background, not as page content. The page
// should convey "contributor, not sole owner" without publishing headcount.
const htmlish = () => {
  const files = [
    "components/Context.tsx",
    "components/Hero.tsx",
    "data/site.ts",
    "data/projects.ts",
    "app/page.tsx",
  ];
  return files.map((f) => readFileSync(f, "utf8")).join("\n");
};

test("no team headcount appears anywhere on the page", () => {
  const src = htmlish();
  for (const leak of [
    /two developers/i,
    /2 developers/i,
    /\b4\b(?=.*(?:people|person|member|team))/i,
    /manager/i,
    /team lead/i,
  ]) {
    assert.doesNotMatch(src, leak, `team composition leaked into the page: ${leak}`);
  }
});

test("platform work is still attributed to a team", () => {
  assert.match(htmlish(), /team/i, "must not over-correct into claiming sole ownership");
});

test("the sentence is about the work, not the org chart", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { Context } = await import("../components/Context");
  const html = renderToStaticMarkup(<Context />);

  assert.match(html, /platform team/i);
  assert.doesNotMatch(html, /developers? (?:handle|do|own)/i);
  assert.match(html, /handle/);
});

test("infra scope is unchanged and still complete", () => {
  assert.deepEqual(site.infraScope, [
    "app framework and build",
    "logging and error tracking",
    "public and auth pages",
    "UI components",
  ]);
});