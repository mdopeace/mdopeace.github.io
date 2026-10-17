import { test, expect } from "@playwright/test";

// Serves the real static export, so these assert the artifact a deploy would
// copy. `serve` does NOT run Jekyll, so this suite cannot prove the deploy
// survives Jekyll — tests/verify-script.test.ts covers .nojekyll emission and
// the first real deploy is the only proof of Jekyll behaviour.

test("hero is complete above the fold at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toContainText("Md Mostafijur Rahman");

  // Scoped to the hero: "web by day" also appears in the Day job section.
  const hero = page.locator("header");
  await expect(hero.getByText("web by day")).toBeVisible();
  await expect(hero.getByText("no Mac player felt right")).toBeVisible();
  await expect(hero.getByText("Both are on Homebrew")).toBeVisible();

  // All four must be inside the first screen, not merely on the page.
  const box = await hero.boundingBox();
  expect(box, "hero has no box").not.toBeNull();
  expect(box!.height, "hero is taller than the 375x812 viewport").toBeLessThanOrEqual(812);
});

test("no horizontal overflow at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("brew commands render in full without clipping at 375px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  for (const cmd of [
    "brew tap mdopeace/quicktodo",
    "brew install --cask quicktodo",
    "brew tap mdopeace/vidp",
    "brew install --cask vidp",
  ]) {
    const el = page.getByText(cmd, { exact: true }).first();
    await expect(el).toBeVisible();
    const clipped = await el.evaluate(
      (n) => n.scrollWidth > n.clientWidth + 1,
    );
    expect(clipped, `${cmd} is clipped`).toBe(false);
  }
});

test("both projects are on the page, vidp with no image", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "QuickTodo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vidp" })).toBeVisible();
  await expect(page.getByText("Screenshot coming")).toBeVisible();

  const vidpArticle = page.locator("article").filter({ hasText: "Vidp" });
  await expect(vidpArticle.locator("img")).toHaveCount(0);
});

test("quicktodo screenshot actually loaded", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const img = page.locator('img[src*="raw.githubusercontent.com/mdopeace/quicktodo"]');
  await expect(img).toBeVisible();
  const ok = await img.evaluate((n: HTMLImageElement) => n.complete && n.naturalWidth > 0);
  expect(ok, "screenshot failed to load").toBe(true);
});

test("no request 404s, so _next assets survived", async ({ page }) => {
  const failures: string[] = [];
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  expect(failures, failures.join("\n")).toEqual([]);
});

test("page is styled dark, not unstyled HTML", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor,
  );
  expect(bg).toBe("rgb(22, 23, 26)"); // #16171a
});

test("no link points at the clone author or a dead vidp page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const hrefs = await page.locator("a").evaluateAll((as) =>
    as.map((a) => (a as HTMLAnchorElement).href),
  );
  expect(hrefs.join("\n")).not.toMatch(/iammostak/i);
  expect(hrefs.join("\n")).not.toMatch(/mdopeace\.github\.io\/vidp/);
});