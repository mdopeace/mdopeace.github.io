import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync("app/globals.css", "utf8");

test("all nine palette tokens are defined", () => {
  const expected: Record<string, string> = {
    "--color-bg": "#16171a",
    "--color-panel": "#0e0f11",
    "--color-line": "#2a2c31",
    "--color-text": "#f2f3f5",
    "--color-muted": "#9aa1ab",
    "--color-faint": "#82868d",
    "--color-amberbg": "#1a1710",
    "--color-amberline": "#3a3222",
    "--color-amber": "#948464",
  };
  for (const [token, value] of Object.entries(expected)) {
    assert.match(css, new RegExp(`${token}:\\s*${value}`), `missing ${token}`);
  }
});

test("no light-mode block and no webfont", () => {
  assert.doesNotMatch(css, /prefers-color-scheme/);
  assert.doesNotMatch(css, /Poppins/);
  assert.doesNotMatch(css, /fonts\.googleapis/);
});

test("layout uses no webfont and carries the portfolio metadata", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.doesNotMatch(layout, /next\/font\/google/);
  assert.doesNotMatch(layout, /Geist/);
  assert.match(layout, /#16171a/);
  assert.match(layout, /Md Mostafijur Rahman/);
  assert.match(layout, /Tracxn/);
});