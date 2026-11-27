import { expect, test, type Locator } from "@playwright/test";
import { expectAccessible, openForAudit, themes } from "./accessibility";

const projects = [
  { id: "vidp", name: "Vidp", href: "https://vidplabs.github.io/", stills: 3 },
  { id: "quicktodo", name: "QuickTodo", href: "https://mdopeace.github.io/quicktodo/", stills: 3 },
  { id: "cookieater", name: "Cookieater", href: "https://mdopeace.github.io/cookieater/", stills: 3 },
  { id: "component-library", name: "Component Library", href: "/playground/", stills: 3 },
] as const;

function documentBounds(frames: Locator) {
  return frames.evaluateAll(elements => elements.map(element => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x: x + scrollX, y: y + scrollY, width, height };
  }));
}

test("the first two projects fit together after the Work jump on a laptop", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "The test sets a laptop viewport.");
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto("/");
  await page.getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Work", exact: true }).click();
  await expect(page.locator("#work")).toBeFocused();
  const cards = page.locator("#work article");
  await expect(cards).toHaveCount(4);
  expect(await cards.evaluateAll(items => items.map(item => item.id))).toEqual(projects.map(project => project.id));
  await expect(cards.nth(0)).toBeInViewport({ ratio: 1 });
  await expect(cards.nth(1)).toBeInViewport({ ratio: 1 });
  const [vidp, quickTodo, cookieater, library] = await documentBounds(cards);
  expect(quickTodo.y).toBe(vidp.y);
  expect(quickTodo.x).toBeGreaterThan(vidp.x + vidp.width);
  expect(vidp.width).toBeGreaterThan(quickTodo.width);
  expect(cookieater.y).toBe(library.y);
  expect(library.width).toBeGreaterThan(cookieater.width);
});

for (const theme of themes) {
  test(`${theme}: each compact card opens its full comic and original links`, async ({ page, isMobile }) => {
    await openForAudit(page, "/", theme, isMobile);
    const work = page.locator("#work");
    await expect(work.locator("article")).toHaveCount(projects.length);
    const playground = work.getByRole("link", { name: "Explore the playground", exact: true });
    await expect(playground).toHaveAttribute("data-size", "md");
    if (theme === "dark") {
      const libraryActions = playground.or(work.getByRole("button", { name: "View project: Component Library" }));
      await page.keyboard.press("Tab");
      for (const action of await libraryActions.all()) {
        await action.focus();
        await expect(action).toHaveCSS("outline-width", "3px");
        const ink = await action.evaluate(element => getComputedStyle(element).borderTopColor);
        await expect(action).toHaveCSS("outline-color", ink);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expectAccessible(page, "Selected Work overview");

    for (const { id, name, href, stills } of projects) {
      const project = work.locator(`article#${id}`);
      if (id === "vidp" || id === "component-library") {
        await expect(project).toHaveAttribute("data-texture", "halftone");
      } else {
        await expect(project).not.toHaveAttribute("data-texture");
      }
      const corner = await project.evaluate(element => ({
        mask: getComputedStyle(element, "::before").maskImage,
        accent: getComputedStyle(element, "::after").backgroundImage,
        blocks: getComputedStyle(element, "::after").boxShadow,
      }));
      if (id === "vidp") {
        expect(corner.mask).toMatch(/(?:right top|top right|100% 0(?:px|%))/);
      }
      if (id === "vidp" && !isMobile) {
        expect(corner.accent).toContain("linear-gradient");
      } else {
        expect(corner.accent).toBe("none");
      }
      if (id === "component-library" && !isMobile) {
        expect(corner.blocks).not.toBe("none");
      } else {
        expect(corner.blocks).toBe("none");
      }
      const title = project.getByRole("heading", { name, level: 3, exact: true });
      await expect(title).toHaveCSS("font-weight", "700");
      await expect(title).toHaveCSS("font-size", "20px");
      const stamp = title.locator("..").locator('[data-shape="square"]');
      await expect(stamp).toHaveCSS("border-width", "2px");
      await expect(stamp).toHaveCSS("border-radius", "0px");
      await expect(stamp).not.toHaveAttribute("data-tilt");
      if (id === "component-library") {
        await expect(stamp.locator("svg")).toHaveCSS("fill", "none");
        await expect(stamp.locator("svg")).toHaveCSS("width", "20px");
      } else {
        await expect(stamp.locator("img")).toHaveAttribute("src", new RegExp(`${id}-logo\\.webp$`));
      }
      const frame = project.locator("[data-project-cover]");
      await expect(frame).toHaveCSS("background-image", "none");
      const cover = frame.locator("img");
      await expect(cover).toHaveCount(1);
      await expect(cover).toBeVisible();
      await expect(cover).toHaveAttribute("alt", /\S/);
      await expect(cover).toHaveCSS("object-fit", "contain");
      const aspectRatio = await cover.evaluate((image: HTMLImageElement) => {
        const { width, height } = image.getBoundingClientRect();
        const intrinsic = Number(image.getAttribute("width")) / Number(image.getAttribute("height"));
        return (width / height) / intrinsic;
      });
      expect(aspectRatio).toBeCloseTo(1, 2);
      const trigger = project.getByRole("button", { name: `View project: ${name}` });
      await expect(trigger).toHaveAttribute("data-size", "md");
      const dialog = project.getByRole("dialog", { name, exact: true });
      await expect(dialog).toBeHidden();
      await trigger.press("Enter");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("button", { name: `Close ${name} project` })).toBeFocused();
      await expect(dialog.getByRole("heading", { name, level: 2 })).toHaveAttribute("data-size", "feature");
      const masthead = dialog.locator('[data-texture="halftone"]');
      await expect(masthead).toHaveCount(1);
      await expect(masthead.getByText("Project file", { exact: true })).toBeVisible();
      await expect(masthead.locator('[data-shape="square"][data-tilt="right"]')).toHaveCount(1);
      await expect(masthead.getByRole("list", { name: "Try the project" }).getByRole("link"))
        .toHaveAttribute("data-size", "md");
      await expect(dialog.getByRole("heading", { name: "The story in three panels" })).toBeVisible();
      await expect(dialog.getByRole("heading", { name: "The thinking behind it" })).toBeVisible();
      const softNotes = dialog.locator('[data-texture="halftone-soft"]');
      await expect(softNotes).toHaveCount(1);
      await expect(softNotes.getByRole("heading", { name: "The thinking behind it" })).toBeVisible();
      await expect.poll(() => softNotes.evaluate(el => getComputedStyle(el, "::before").opacity)).toBe("0.12");
      await expect(dialog.getByRole("heading", { name: "Project resources" })).toBeVisible();
      const divider = dialog.locator('[data-orientation="horizontal"][data-tone="muted"]');
      await expect(divider).toHaveCSS("border-top-style", "dashed");
      const chapterInk = await work.evaluate(section => getComputedStyle(section).borderBottomColor);
      await expect(divider).toHaveCSS("border-top-color", chapterInk);
      for (const resource of await dialog.getByRole("list", { name: "Project resources" }).getByRole("link").all()) {
        await expect(resource).toHaveAttribute("data-size", "md");
      }

      const strip = dialog.getByRole("group", { name: `${name} comic strip` });
      await expect(strip).toHaveAttribute("data-align-captions", "true");
      const captions = strip.locator("figure > figcaption");
      await expect(captions).toHaveText([/^Problem\s+\S/, /^Idea\s+\S/, /^Result\s+\S/]);
      await expect(captions.locator("strong")).toHaveText(["Problem", "Idea", "Result"]);
      for (const caption of await captions.all()) {
        await expect(caption.locator("strong")).toHaveCSS("font-weight", "700");
        await expect(caption.locator("div")).toHaveCSS("font-weight", "400");
        await expect(caption).toHaveCSS("row-gap", "8px");
      }
      await dialog.evaluate(element => Promise.all(element.getAnimations().map(animation => animation.finished)));
      const geometry = await strip.locator("figure").evaluateAll(panels => panels.map(panel => {
        const { height: frameHeight, bottom } = panel.firstElementChild!.getBoundingClientRect();
        const { top: y, height } = panel.querySelector("figcaption")!.getBoundingClientRect();
        return { y, height, frameHeight, bottom };
      }));
      for (const [index, caption] of geometry.entries()) {
        expect(caption.y - caption.bottom).toBeCloseTo(0, 0);
        if (index === 0) continue;
        if (isMobile) {
          expect(caption.y).toBeGreaterThan(geometry[index - 1].y);
        } else {
          expect(caption.y).toBeCloseTo(geometry[0].y, 0);
          expect(caption.height).toBeCloseTo(geometry[0].height, 0);
          expect(caption.frameHeight).toBeCloseTo(geometry[0].frameHeight, 0);
        }
      }
      const linkName = id === "component-library" ? "Explore the playground" : `Try it: ${name}`;
      const tryIt = dialog.getByRole("link", { name: linkName, exact: true });
      await expect(tryIt).toHaveAttribute("href", href);
      await expect(tryIt).toHaveAttribute("data-variant", "primary");
      await expect(dialog.getByRole("link", { name: /^Source/ })).toBeVisible();

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
      if (id === "vidp") {
        await expect(dialog.locator('[data-ui-surface="info"][data-texture="halftone"]')).toHaveCount(1);
        await expect(dialog.getByText("Keyboard-driven macOS video player built on libmpv.", { exact: true })).toBeVisible();
        await expect(dialog.getByRole("list", { name: "Project resources" }).getByRole("link"))
          .toHaveText(["Source", "Releases", "Homebrew tap"]);
        await expectAccessible(page, "open project details");
        await expect(dialog.getByText(/I use it every day/)).toBeVisible();
      }
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
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
      const frames = page.locator("#work [data-project-cover] [data-image-state]");
      await expect(frames).toHaveCount(projects.length);
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
  await expect(logo).toHaveCSS("width", "24px");
  await expect(logo).toHaveCSS("height", "24px");
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
