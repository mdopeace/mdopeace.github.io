import { expect, test, type Locator } from "@playwright/test";
import { expectAccessible, openForAudit, themes } from "./accessibility";

const projects = [
  { id: "quicktodo", href: "https://mdopeace.github.io/quicktodo/", stills: 3 },
  { id: "vidp", href: "https://vidplabs.github.io/", stills: 3 },
  { id: "cookieater", href: "https://mdopeace.github.io/cookieater/", stills: 3 },
  { id: "component-library", href: "/playground/", stills: 1 },
] as const;

function documentBounds(frames: Locator) {
  return frames.evaluateAll(elements => elements.map(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x: x + scrollX, y: y + scrollY, width, height };
  }));
}

for (const theme of themes) {
  test(`${theme}: each project has an ordered comic strip with a Try it link`, async ({ page, isMobile }) => {
    await openForAudit(page, "/", theme, isMobile);
    const work = page.locator("#work");
    await expect(work.locator("article")).toHaveCount(projects.length);

    for (const { id, href, stills } of projects) {
      const project = work.locator(`article#${id}`);
      const strip = project.getByRole("group", { name: "Project comic strip" });
      await expect(strip).toHaveCount(1);
      await expect(strip.locator("figure")).toHaveCount(3);
      const captions = strip.locator("figure > figcaption");
      await expect(captions).toHaveText([/^Problem\s+\S/, /^Idea\s+\S/, /^Result\s+\S/]);
      for (const caption of await captions.all()) await expect(caption).toBeVisible();
      await expect(project.getByRole("link", { name: "Try it", exact: true })).toHaveAttribute("href", href);
      const images = strip.locator("figure img");
      await expect(images).toHaveCount(stills);
      const sources = new Set();
      for (const image of await images.all()) {
        await expect(image).toHaveAttribute("src", /\/projects\/[^/]+\.webp$/);
        await expect(image).toHaveAttribute("loading", "lazy");
        await expect(image).toHaveAttribute("alt", /\S/);
        sources.add(await image.getAttribute("src"));
      }
      expect(sources.size).toBe(stills);
      await expect(strip.locator("video")).toHaveCount(0);
      expect(await strip.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expectAccessible(page, "project comic strips");
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`project stills reserve space and fade in with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route("**/projects/*.webp", async route => {
      if (!route.request().url().endsWith("-logo.webp")) await pending;
      await route.continue();
    });

    try {
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.evaluate(() => document.fonts.ready);
      const frames = page.locator("#work figure [data-image-state]");
      await expect(frames).toHaveCount(10);
      await expect(frames.first()).toHaveAttribute("data-image-state", "loading");
      const before = await documentBounds(frames);
      for (const { width, height } of before) {
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);
      }
      const firstImage = frames.first().locator("img");
      await expect(firstImage).toHaveCSS("opacity", "0");
      await expect(firstImage).toHaveCSS("transition-property", "opacity");
      await expect(firstImage).toHaveCSS("transition-duration", reducedMotion === "reduce" ? "0.12s" : "0.18s");
      release();
      for (const frame of await frames.all()) {
        await frame.scrollIntoViewIfNeeded();
        await expect(frame).toHaveAttribute("data-image-state", "loaded");
        const { width, height, naturalWidth, naturalHeight } = await frame.locator("img").evaluate((img: HTMLImageElement) => ({
          width: Number(img.getAttribute("width")),
          height: Number(img.getAttribute("height")),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        }));
        expect(width).toBe(naturalWidth);
        expect(height).toBe(naturalHeight);
      }
      await expect(firstImage).toHaveCSS("opacity", "1");
      expect(await documentBounds(frames)).toEqual(before);
    } finally {
      release();
    }
  });
}

test("a failed project logo retains its space", async ({ page }) => {
  await page.route("**/projects/vidp-logo.webp", route => route.fulfill({ status: 404, body: "Missing" }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const logo = page.locator("#vidp [data-image-state]").first();
  await logo.scrollIntoViewIfNeeded();
  await expect(logo).toHaveAttribute("data-image-state", "error");
  await expect(logo).toHaveCSS("width", "32px");
  await expect(logo).toHaveCSS("height", "32px");
  await expect(logo).toHaveCSS("border-radius", "0px");
  await expect(logo).toHaveAttribute("aria-hidden", "true");
});

test("playground exposes reusable navbar and image states", async ({ page }) => {
  await page.goto("/playground/");
  const catalog = page.getByRole("navigation", { name: "Component library" });
  await catalog.getByRole("button", { name: "Navbar", exact: true }).click();
  const navbar = page.getByRole("navigation", { name: "Example navbar" });
  await navbar.getByRole("link", { name: "Build", exact: true }).click();
  await expect(navbar.getByRole("link", { name: "Build", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page).not.toHaveURL(/#/);
  await catalog.getByRole("button", { name: "Image", exact: true }).click();
  const frame = page.locator('[data-image-state]');
  await expect(frame).toHaveAttribute("data-image-state", "loaded");
  await page.getByRole("checkbox", { name: "Unavailable source" }).check();
  await expect(frame).toHaveAttribute("data-image-state", "error");
  await expect(page.getByRole("img", { name: "A framed UI mark on a yellow background" })).toBeVisible();
  await page.getByRole("checkbox", { name: "Unavailable source" }).uncheck();
  await expect(frame).toHaveAttribute("data-image-state", "loaded");
});
