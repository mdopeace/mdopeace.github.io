import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Every pair below is a real foreground/background combination used on the
// page. These tokens were measured in the QuickTodo stylesheet against --bg
// only; project cards sit on --panel, so those pairs are checked here.

const tokens: Record<string, string> = {
  bg: "#16171a",
  panel: "#0e0f11",
  text: "#f2f3f5",
  muted: "#9aa1ab",
  faint: "#82868d",
  amberbg: "#1a1710",
  amber: "#948464",
};

const srgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const channel = (c: number) =>
  c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

const luminance = (hex: string) => {
  const [r, g, b] = srgb(hex).map(channel);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test("palette tokens match globals.css exactly", () => {
  const css = readFileSync("app/globals.css", "utf8");
  for (const [name, value] of Object.entries(tokens)) {
    assert.match(
      css,
      new RegExp(`--color-${name}:\\s*${value}`),
      `globals.css is missing --color-${name}: ${value}`,
    );
  }
});

const pairs: [string, string, string][] = [
  ["body text on page", "text", "bg"],
  ["secondary text on page", "muted", "bg"],
  ["labels on page", "faint", "bg"],
  ["body text on project card", "text", "panel"],
  ["secondary text on project card", "muted", "panel"],
  ["labels and placeholder on project card", "faint", "panel"],
  ["brew command on its block", "amber", "amberbg"],
];

for (const [label, fg, bgKey] of pairs) {
  test(`${label} meets AA (4.5:1)`, () => {
    const ratio = contrast(tokens[fg], tokens[bgKey]);
    assert.ok(
      ratio >= 4.5,
      `${label}: ${tokens[fg]} on ${tokens[bgKey]} is ${ratio.toFixed(2)}:1, needs 4.5:1`,
    );
  });
}