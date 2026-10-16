import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { site } from "../data/site";

const src = readFileSync("components/Hero.tsx", "utf8");

test("hero leads with the name and states the role", () => {
  assert.ok(
    src.indexOf("site.name") < src.indexOf("site.role"),
    "name must be rendered before role",
  );
  assert.match(src, /<h1/);
  assert.equal(site.name, "Md Mostafijur Rahman");
  assert.equal(site.role, "Software Engineer");
  assert.equal(site.company, "Tracxn");
  assert.equal(site.location, "Bengaluru");
});

test("hero renders the name, role and place from site data", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { Hero } = await import("../components/Hero");
  const html = renderToStaticMarkup(Hero());

  assert.match(html, /<h1[^>]*>[\s\S]*Md Mostafijur Rahman/);
  assert.match(html, /Software Engineer at Tracxn, Bengaluru — web by day\./);
});

test("hero tells the loop in his words", () => {
  assert.match(src, /no Mac player felt right/i);
  assert.match(src, /ideas for improving it/i);
  assert.match(src, /Both are on Homebrew/i);
});

test("hero has no banned voice", () => {
  assert.doesNotMatch(src, /passionate/i);
  assert.doesNotMatch(src, /results-driven/i);
  assert.doesNotMatch(src, /enthusiast/i);
  assert.doesNotMatch(src, /available for/i);
  assert.ok(!src.includes("!"), "no exclamation marks");
});