import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { chromium } from "@playwright/test";

const require = createRequire(import.meta.url);
const scratch = mkdtempSync(join(tmpdir(), "mdopeace-ui-consumer-"));
let browser;
let server;
try {
  execFileSync("npm", ["pack", "--workspace", "@mdopeace/ui", "--pack-destination", scratch], { stdio: "pipe" });
  const archive = join(scratch, readdirSync(scratch).find(file => file.endsWith(".tgz")));
  const app = JSON.parse(readFileSync("package.json", "utf8"));
  writeFileSync(join(scratch, "package.json"), JSON.stringify({ private: true, type: "module" }));
  execFileSync("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefer-offline", archive,
    `react@${app.dependencies.react}`, `react-dom@${app.dependencies["react-dom"]}`, "@types/react@^19", "@types/react-dom@^19"],
  { cwd: scratch, stdio: "pipe" });
  const installed = join(scratch, "node_modules/@mdopeace/ui");
  const packageFiles = readdirSync(installed, { recursive: true });
  assert.ok(packageFiles.includes("LICENSE") && packageFiles.includes("NOTICE"));
  assert.ok(!packageFiles.some(file => file.startsWith("src/") || file.includes("portfolio")));
  for (const file of packageFiles.filter(file => file.endsWith(".js"))) {
    assert.ok(!readFileSync(join(installed, file), "utf8").includes("@/"), `app alias in ${file}`);
  }
  assert.match(readFileSync(join(installed, "dist/Switch.js"), "utf8"), /^"use client"/);
  writeFileSync(join(scratch, "main.tsx"), `
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Field, TextInput, Switch, Surface, Text, CodeExample, Navbar, NavbarLinks, Image } from "@mdopeace/ui";
import "@mdopeace/ui/tokens.css";
function App() {
  const [count, setCount] = useState(0);
  const [activeId, setActiveId] = useState("intro");
  return <Surface>
    <Navbar label="Consumer navigation" brand={<Text>UI</Text>}>
      <NavbarLinks items={[{id:"intro",label:"Intro",href:"#intro"},{id:"docs",label:"Docs",href:"#docs"}]} activeId={activeId} onSelect={(id,event) => {event.preventDefault();setActiveId(id);}} />
    </Navbar>
    <Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='160'%3E%3Crect width='240' height='160' fill='%23f5cb56'/%3E%3C/svg%3E" alt="Consumer illustration" width={240} height={160} />
    <Text>Independent consumer</Text>
    <Button onClick={() => setCount(value => value + 1)}>Count {count}</Button>
    <Field label="Name" description="Your display name">{props => <TextInput {...props} />}</Field>
    <Switch aria-label="Notifications" />
    <CodeExample code={'<Button>Save</Button>\\n'} />
  </Surface>;
}
createRoot(document.getElementById("root")!).render(<App />);
`);
  writeFileSync(join(scratch, "tsconfig.json"), JSON.stringify({ compilerOptions: {
    target: "ES2020", lib: ["ES2020", "DOM"], module: "ESNext", moduleResolution: "Bundler",
    jsx: "react-jsx", strict: true, skipLibCheck: true, noEmit: true,
  }, include: ["main.tsx"] }));
  execFileSync(process.execPath, [require.resolve("typescript/bin/tsc"), "-p", join(scratch, "tsconfig.json")], { stdio: "pipe" });
  await build({ absWorkingDir: scratch, entryPoints: ["main.tsx"], bundle: true, format: "esm", outfile: "bundle.js", jsx: "automatic", logLevel: "silent" });
  const html = '<!doctype html><html lang="en"><head><title>Independent UI consumer</title><link rel="stylesheet" href="/bundle.css"></head><body><button id="native">Native button</button><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>';
  server = createServer((request, response) => {
    const file = request.url === "/bundle.js" ? "bundle.js" : request.url === "/bundle.css" ? "bundle.css" : null;
    response.setHeader("Content-Type", file?.endsWith(".js") ? "application/javascript" : file ? "text/css" : "text/html");
    response.end(file ? readFileSync(join(scratch, file)) : html);
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  browser = await chromium.launch();
  const context = await browser.newContext({ reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.getByRole("button", { name: "Count 0" }).click();
  await page.getByRole("button", { name: "Count 1" }).waitFor();
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  assert.equal(await page.getByRole("link", { name: "Docs", exact: true }).getAttribute("aria-current"), "page");
  await page.locator('[data-image-state="loaded"]').waitFor();
  await page.getByRole("textbox", { name: "Name" }).fill("Ada");
  assert.equal(await page.getByRole("textbox", { name: "Name" }).inputValue(), "Ada");
  const toggle = page.getByRole("switch", { name: "Notifications" });
  await toggle.focus();
  await page.keyboard.press("Space");
  assert.ok(await toggle.isChecked());
  for (const theme of ["light", "dark"]) {
    await page.evaluate(theme => { document.documentElement.dataset.theme = theme; }, theme);
    for (const width of [320, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Consumer overflow at ${width}px`);
      const size = await page.getByRole("textbox", { name: "Name" }).evaluate(el => getComputedStyle(el).height);
      assert.equal(size, "40px");
    }
  }
  // The host's unrelated button retains native styling without a global reset.
  assert.equal(await page.locator("#native").evaluate(el => getComputedStyle(el).textTransform), "none");
  await page.getByRole("button", { name: "Copy code" }).click();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), "<Button>Save</Button>\n");
  assert.deepEqual(errors, []);
  console.log("Package archive, isolated imports/types, client directives, native controls, CSS without Tailwind, themes and exact copy: passed.");
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  rmSync(scratch, { recursive: true, force: true });
}
