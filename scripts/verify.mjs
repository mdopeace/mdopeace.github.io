import { existsSync, writeFileSync } from "node:fs";

// GitHub Pages runs Jekyll for branch-sourced sites, which drops any path
// beginning with "_" — including _next/. Without this file the deployed site
// 404s on every JS and CSS chunk while the build passes.
writeFileSync("out/.nojekyll", "");

const required = ["out/index.html", "out/.nojekyll", "out/404.html"];
const missing = required.filter((f) => !existsSync(f));

if (missing.length) {
  console.error("Missing from build output:", missing.join(", "));
  process.exit(1);
}

console.log("Build output OK:", required.join(", "));