import { test, expect } from "@playwright/test";

// One authoritative overflow check for the whole page. This used to be copied
// into six spec files, each asserting the same thing at the same widths.

const WIDTHS = [320, 375, 768, 1024, 1440];

test.describe("layout integrity", () => {
  test("no horizontal overflow at any width", async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/index.html");
      const over = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(over, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test("nothing spills past the content measure", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    const section = (
      await page.locator("section").first().boundingBox()
    )!;
    const spill = await page.evaluate(
      (right) =>
        [...document.querySelectorAll("main *")]
          .map((e) => ({
            tag: e.tagName,
            right: Math.round(e.getBoundingClientRect().right),
          }))
          .filter((e) => e.right > right + 1),
      section.x + section.width,
    );
    expect(spill, JSON.stringify(spill)).toEqual([]);
  });
});