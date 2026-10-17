import { test, expect } from "@playwright/test";

// Link treatment. QuickTodo's footer links carry no underline and separate
// with a middot; the project's own links do the same. Project links here keep
// the underline because they are the only route to source, releases and tap.

test.describe("links", () => {
  test("project links stay underlined — they are the route to the code", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const deco = await page
      .locator(".links a")
      .first()
      .evaluate((n) => getComputedStyle(n).textDecorationLine);
    expect(deco, "project links should keep the underline").toContain("underline");
  });

  test("contact links take QuickTodo's quieter treatment", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const decos = await page
      .locator(".contact a")
      .evaluateAll((els) => els.map((e) => getComputedStyle(e).textDecorationLine));
    expect(decos.length).toBe(3);
    for (const d of decos) expect(d).toBe("none");
  });

  test("links are separated by a middot, not only a gap", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    for (const list of [".links", ".contact"]) {
      // Two .links lists exist (one per project), so count per list rather
      // than across the whole page: separators are per <ul>.
      const lists = page.locator(list);
      for (let i = 0; i < (await lists.count()); i++) {
        const ul = lists.nth(i);
        const items = await ul.locator("li").count();
        expect(
          await ul.locator("li + li").count(),
          `every item after the first needs a separator`,
        ).toBe(items - 1);
      }

      const firstSep = await page
        .locator(`${list} li + li`)
        .first()
        .evaluate((n) => getComputedStyle(n, "::before").content);
      expect(firstSep, `${list} separator should be a middot`).toBe('"·"');
    }
  });

  test("the separator is faint and not mistaken for a link", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const colour = await page
      .locator(".links li + li")
      .first()
      .evaluate((n) => getComputedStyle(n, "::before").color);
    // --faint #82868d on --panel #0e0f11 is 5.25:1; the links themselves use
    // --muted #9aa1ab. The separator must be the dimmer of the two.
    expect(colour).toBe("rgb(130, 134, 141)");
  });

  test("every link still has the palette colour and hover brighten", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const link = page.locator(".links a").first();
    expect(await link.evaluate((n) => getComputedStyle(n).color)).toBe(
      "rgb(154, 161, 171)",
    );
    await link.hover();
    expect(await link.evaluate((n) => getComputedStyle(n).color)).toBe(
      "rgb(242, 243, 245)",
    );
  });

  test("separated links do not overflow on a phone", async ({ page }) => {
    for (const width of [320, 375]) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto("/index.html");
      const over = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(over, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});