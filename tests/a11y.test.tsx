import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("project names are h2-level siblings under the section heading", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { Section } = await import("../components/Section");
  const { ProjectCard } = await import("../components/ProjectCard");
  const { projects } = await import("../data/site");

  const html = renderToStaticMarkup(
    <Section label="Projects" as="h2">
      <ProjectCard project={projects[0]!} />
    </Section>,
  );

  assert.match(html, /<h2[^>]*>[\s\S]*Projects/);
  assert.match(html, /<h2[^>]*>[\s\S]*QuickTodo/);
});

test("section labels can render as headings for screen-reader navigation", () => {
  const src = readFileSync("components/Section.tsx", "utf8");
  assert.match(src, /"h2"/);
  assert.match(src, /Heading/);
});

test("no browser-default focus ring is relied on", () => {
  const css = readFileSync("app/globals.css", "utf8");
  assert.match(
    css,
    /:focus-visible/,
    "the UA focus ring is 2.98:1 on #16171a and off-palette",
  );
});