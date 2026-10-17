import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projects } from "../data/projects";
import type { Project } from "../data/projects";
import { ProjectCard } from "../components/ProjectCard";

const src = readFileSync("components/ProjectCard.tsx", "utf8");

const byslug = (slug: string) => projects.find((p) => p.slug === slug) as Project;

test("card never uses next/image", () => {
  assert.doesNotMatch(src, /next\/image/);
  assert.doesNotMatch(src, /\bImage\b/);
});

test("quicktodo renders its screenshot from the quicktodo repo", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(<ProjectCard project={byslug("quicktodo")} />);

  assert.match(html, /<img[^>]+src="https:\/\/raw\.githubusercontent\.com\//);
  assert.ok(!html.includes("/quicktodo-hero.png"), "no local copy should remain");
});

test("vidp renders no img and states why", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const vidp = byslug("vidp");
  const html = renderToStaticMarkup(<ProjectCard project={vidp} />);

  assert.doesNotMatch(html, /<img/, "vidp has no screenshot and must not fake one");
  assert.match(html, /Screenshot coming/);
  assert.ok(!html.includes("placeholder.png"));
});

test("vidp still ships its brew block and real links", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(<ProjectCard project={byslug("vidp")} />);

  assert.match(html, /brew install --cask vidp/);
  assert.match(html, /github\.com\/mdopeace\/vidp/);
  assert.doesNotMatch(html, /mdopeace\.github\.io/, "no live-page link yet");
});

test("external links open safely", () => {
  assert.match(src, /target="_blank"/);
  assert.match(src, /rel="noopener noreferrer"/);
});

test("brew commands render in monospace with amber tokens", () => {
  // The command block and its copy button live in CopyCommand now; the card
  // only decides whether to render one.
  const cmd = readFileSync("components/CopyCommand.tsx", "utf8");
  assert.match(cmd, /font-mono/);
  assert.match(cmd, /text-amber/);
  assert.match(cmd, /bg-amberbg/);
  assert.match(cmd, /border-amberline/);
  assert.match(src, /<CopyCommand/);
});

test("brew text can wrap on narrow screens", () => {
  const cmd = readFileSync("components/CopyCommand.tsx", "utf8");
  assert.match(cmd, /break-words|whitespace-pre-wrap/);
});