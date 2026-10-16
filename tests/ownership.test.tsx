import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// He is one of two developers on a four-person platform team (one manager,
// one lead). He does not own the platform work outright, so the page must not
// claim he does — an inflated ownership claim is the exact thing a reader
// with interview experience catches.
test("the page does not claim sole ownership of the platform work", () => {
  const src = readFileSync("components/Context.tsx", "utf8");
  assert.doesNotMatch(
    src,
    /I own the platform work/i,
    "claims sole ownership of work his team owns",
  );
  assert.doesNotMatch(src, /\bI own\b/);
});

test("platform work is attributed to the team he is part of", () => {
  const src = readFileSync("components/Context.tsx", "utf8");
  assert.match(
    src,
    /team|part of|alongside/i,
    "must attribute the platform work to a team rather than to him alone",
  );
});

test("infraScope is described as shared work, not personal territory", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { Context } = await import("../components/Context");
  const html = renderToStaticMarkup(<Context />);

  assert.doesNotMatch(html, /I own/i);
  assert.match(html, /team/i);
});

test("the sentence stays short and does not become a resume bullet", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { Context } = await import("../components/Context");
  const html = renderToStaticMarkup(<Context />);

  const paras = html.match(/<p>[\s\S]*?<\/p>/g) ?? [];
  assert.ok(paras.length <= 2, "Day job should be two short paragraphs, not a list");
});