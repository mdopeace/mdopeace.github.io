import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { site } from "../data/site";
import { Contact } from "../components/Contact";

test("contact exposes the three real channels", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(<Contact />);

  assert.match(html, new RegExp(`mailto:${site.email.replace(/\./g, "\\.")}`));
  assert.match(html, /github\.com\/mdopeace/);
  assert.match(html, /linkedin\.com\/in\/mdopeace/);
});

test("contact carries no trace of the clone author's handles", async () => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const html = renderToStaticMarkup(<Contact />);

  assert.doesNotMatch(html, /iammostak/i);
  assert.doesNotMatch(html, /telegram/i);
});

test("there is no contact form and no backend", () => {
  const src = readFileSync("components/Contact.tsx", "utf8");
  assert.doesNotMatch(src, /<form/i);
  assert.doesNotMatch(src, /<input/i);
  assert.doesNotMatch(src, /<textarea/i);
  assert.doesNotMatch(src, /emailjs|action=|fetch\(/i);
});

test("external contact links open safely", () => {
  const src = readFileSync("components/Contact.tsx", "utf8");
  assert.match(src, /rel="noopener noreferrer"/);
});