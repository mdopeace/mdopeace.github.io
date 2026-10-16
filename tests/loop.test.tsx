import { test } from "node:test";
import assert from "node:assert/strict";
import { loopSteps } from "../data/site";
import { Loop } from "../components/Loop";

test("loop renders every step in order, numbered", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(<Loop />);

  const positions = loopSteps.map((s) => html.indexOf(s.slice(0, 24)));
  assert.ok(positions.every((p) => p > -1), "every step renders");
  for (let i = 1; i < positions.length; i++) {
    assert.ok(positions[i] > positions[i - 1], "steps keep their order");
  }
  assert.match(html, /01/, "first step is numbered");
  assert.match(html, /03/, "last step is numbered");
});

test("loop appears after the projects in the page", () => {
  const page = require("node:fs").readFileSync("app/page.tsx", "utf8") as string;
  assert.ok(
    page.indexOf("ProjectCard") < page.indexOf("<Loop"),
    "loop must come after the projects, not as a hook before them",
  );
});