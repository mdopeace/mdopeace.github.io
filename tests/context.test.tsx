import { test } from "node:test";
import assert from "node:assert/strict";
import { site } from "../data/site";
import { Context } from "../components/Context";

test("context states the role and the day stack", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(<Context />);

  assert.match(html, /Software Engineer at Tracxn, Bengaluru, since January 2023/);
  for (const tool of site.dayStack) {
    assert.ok(html.includes(tool), `missing day-stack tool: ${tool}`);
  }
});

test("context mentions the infra scope, not just features", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(<Context />);

  assert.match(html, /logging and error tracking/);
  assert.match(html, /app framework and build/);
});

test("context is a plain list, not a skills grid with icons or bars", () => {
  const src = require("node:fs").readFileSync("components/Context.tsx", "utf8") as string;
  assert.doesNotMatch(src, /<svg/i);
  assert.doesNotMatch(src, /<img/i);
  assert.doesNotMatch(src, /proficiency|percentage|width=\{|level/i);
});