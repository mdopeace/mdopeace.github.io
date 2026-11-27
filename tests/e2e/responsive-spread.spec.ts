import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`the comic spread reflows at ${width}px without changing reading order`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "The test sets its own viewport.");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(await page.locator("main > section").evaluateAll(sections => sections.map(section => section.id))).toEqual([
      "story", "work", "experience", "now", "contact",
    ]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const intro = await page.locator("#top .hero-copy").boundingBox();
    const game = await page.getByRole("region", { name: "Pocket Tetris game" }).boundingBox();
    expect(intro).not.toBeNull();
    expect(game).not.toBeNull();
    if (width >= 768) {
      expect(game!.x).toBeGreaterThan(intro!.x + intro!.width);
      expect(game!.y).toBeGreaterThan(intro!.y);
      expect(game!.height).toBeLessThan(intro!.height);
    } else {
      expect(game!.y).toBeGreaterThan(intro!.y + intro!.height);
    }
    await expect(page.getByRole("link", { name: "Explore the playground" })).toHaveAttribute("href", "/playground/");
    await page.getByRole("link", { name: "Explore the playground" }).click();
    await expect(page).toHaveURL(/\/playground\/$/);
    await expect(page.getByRole("navigation", { name: "Component library" })).toBeVisible();
  });
}
