import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";

// Checks read the built page — what ships is what's tested. Run `npm run build` first.
assert.ok(
  existsSync("out/index.html"),
  "out/index.html missing — run `npm run build` first",
);
const html = readFileSync("out/index.html", "utf8");

test("robots.txt allows crawling and references the sitemap", () => {
  const robots = readFileSync("out/robots.txt", "utf8");
  assert.match(robots, /^User-Agent: \*$/im);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, /^Sitemap: https:\/\/mdopeace\.github\.io\/sitemap\.xml$/m);
});

test("the sitemap lists the home and playground URLs", () => {
  const sitemap = readFileSync("out/sitemap.xml", "utf8");
  assert.ok(sitemap.includes("<loc>https://mdopeace.github.io/</loc>"));
  assert.ok(sitemap.includes("<loc>https://mdopeace.github.io/playground/</loc>"));
});

test("the home page has its canonical URL and structured data", () => {
  assert.ok(html.includes('<link rel="canonical" href="https://mdopeace.github.io/"/>'));
  const script = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
  assert.ok(script, "JSON-LD script missing");
  const jsonLd = JSON.parse(script[1]);
  const types = jsonLd["@graph"].map((item) => item["@type"]);
  assert.ok(types.includes("Person"));
  assert.ok(types.includes("WebSite"));
  assert.doesNotMatch(script[1], /"(?:telephone|email|image)"\s*:/);
});

test("the home page ships a single Open Graph image with alt text and Twitter alt text", () => {
  const alt = readFileSync("app/opengraph-image.alt.txt", "utf8").trim();
  assert.equal([...html.matchAll(/<meta property="og:image"/g)].length, 1);
  assert.ok(html.includes(`<meta property="og:image:alt" content="${alt}"`));
  assert.ok(html.includes(`<meta name="twitter:image:alt" content="${alt}"`));
});

test("the page links to Telegram and omits WhatsApp", () => {
  const hrefs = [...html.matchAll(/\shref="([^"]*)"/g)].map((match) => match[1]);
  assert.deepEqual(hrefs.filter((href) => href.includes("wa.me")), []);
  assert.doesNotMatch(html, /WhatsApp/);
  assert.match(html, /href="https:\/\/t\.me\/[A-Za-z0-9_]{5,}"/);
});

test("the playground ships as a public directory route with portfolio links", () => {
  const playground = readFileSync("out/playground/index.html", "utf8");
  assert.match(html, /href="\/playground\/"/);
  assert.match(html, />Try it</);
  assert.ok(playground.includes("Small parts. A shared language."));
  assert.ok(playground.includes("Design decisions"));
  assert.match(playground, /rel="canonical" href="https:\/\/mdopeace.github.io\/playground\/"/);
  assert.ok(!existsSync("out/components-preview/index.html"));
});

// LinkedIn blocks bots (405/999) — exclude rather than weaken the whole check.
const SKIP_BOT_WALL = /linkedin\.com/;

const LINKS = [...html.matchAll(/(?:href|src)="(https:\/\/[^"]+)"/g)].map(
  (m) => m[1],
);

test("every external link resolves", async () => {
  const results = await Promise.all(
    LINKS.map(async (url) => {
      try {
        const r = await fetch(url, { method: "HEAD", redirect: "follow" });
        return { url, status: r.status };
      } catch {
        return { url, status: 0 };
      }
    }),
  );

  const broken = results.filter(
    (r) => !SKIP_BOT_WALL.test(r.url) && (r.status < 200 || r.status >= 400),
  );
  assert.deepEqual(
    broken,
    [],
    `broken links:\n${broken.map((b) => `  ${b.status} ${b.url}`).join("\n")}`,
  );
});

test("copy commands survive the build byte-for-byte", () => {
  // Decode &#10; so the payload, not the serialization, is pinned.
  const payloads = [...html.matchAll(/data-copy="([^"]*)"/g)].map((m) =>
    m[1].replaceAll("&#10;", "\n"),
  );
  assert.deepEqual(payloads, [
    "brew tap vidplabs/vidp\nbrew install --cask vidp",
    "brew tap mdopeace/quicktodo\nbrew install --cask quicktodo",
  ]);
});

test("page ships its accessibility and identity hooks", () => {
  assert.ok(
    html.includes('aria-live="polite"'),
    "copy button aria-live missing",
  );
  assert.match(
    html,
    /<link rel="icon" href="[^"]*\/icon\.svg(?:\?[^"]*)?"[^>]*>/,
    "local SVG favicon missing",
  );
});

test("support dialog ships both provider links and dialog hooks", () => {
  assert.ok(html.includes('aria-haspopup="dialog"'));
  assert.match(html, /<dialog\b[^>]*aria-labelledby="[^"]+"/);
  assert.ok(html.includes("Fuel the next build"));
  assert.ok(html.includes('role="switch"'));
  assert.ok(!html.includes(">AUTO<"));
  assert.ok(
    html.includes("https://github.com/sponsors/mdopeace"),
    "GitHub Sponsors link missing",
  );
  assert.ok(
    html.includes("https://buymeacoffee.com/mdopeace"),
    "Buy Me a Coffee link missing",
  );
});

const analyticsFiles = readdirSync("out", { recursive: true })
  .filter((file) => typeof file === "string" && /\.(?:html|js|txt)$/.test(file) && statSync(`out/${file}`).isFile());
import nextEnv from "@next/env";

// Match `next build`: read .env.production unless the variable is already set (even empty).
nextEnv.loadEnvConfig(process.cwd(), false);
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

test("the default static export contains no GA ID, loader, or command queue", { skip: Boolean(measurementId) }, () => {
  for (const file of analyticsFiles) {
    const contents = readFileSync(`out/${file}`, "utf8");
    assert.doesNotMatch(
      contents,
      /["'`]G-[A-Z0-9]{5,}["'`]|googletagmanager\.com|google-analytics\.com|allow_google_signals/,
      file,
    );
  }
});

test("the production static export ships only Md's GA ID and leaves its HTML free of analytics scripts", { skip: !measurementId }, () => {
  const productionId = "G-YD5K1KK209";
  assert.equal(measurementId, productionId);

  let hasBundledId = false;
  for (const file of analyticsFiles) {
    const contents = readFileSync(`out/${file}`, "utf8");
    const ids = [...contents.matchAll(/\bG-[A-Z0-9]{5,}\b/g)].map(([id]) => id);
    for (const id of ids) assert.equal(id, productionId, `Unexpected GA ID in ${file}`);

    hasBundledId ||= file.endsWith(".js") && ids.includes(productionId);
    if (file.endsWith(".html")) {
      assert.doesNotMatch(contents, /<script\b[^>]*\bsrc\s*=\s*[^>]*googletagmanager\.com/i, file);
      for (const [, script] of contents.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
        assert.doesNotMatch(script, /\bdataLayer\b|\bgtag\s*\(\s*\\?["']config\\?["']/, file);
      }
    }
  }
  assert.ok(hasBundledId, "Production GA ID missing from built JavaScript");
});
