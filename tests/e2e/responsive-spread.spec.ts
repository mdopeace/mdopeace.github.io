import { expect, test } from "@playwright/test";

for (const width of [320, 390, 600, 768, 820, 900, 1024, 1152, 1280, 1440, 1920]) {
  test(`the comic spread reflows at ${width}px without changing reading order`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "The test sets its own viewport.");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const sections = page.locator("main > section");
    expect(await sections.evaluateAll(sections => sections.map(section => section.id))).toEqual([
      "story", "work", "experience", "now", "contact",
    ]);
    for (const section of await sections.all()) {
      await expect(section).toHaveCSS("padding-block", width >= 1024 ? "64px" : width >= 768 ? "48px" : "40px");
      await expect(section.locator(":scope > :first-child")).toHaveCSS("gap", width >= 1024 ? "32px" : width >= 768 ? "24px" : "20px");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const hero = page.locator("#top");
    const details = hero.locator(".hero-copy");
    const splitGap = width >= 1280 ? "32px" : width >= 1024 ? "24px" : "20px";
    await expect(details).toHaveCSS("padding", width >= 1024 ? "32px" : width >= 768 ? "24px" : "20px");
    await expect(hero).toHaveCSS("gap", width >= 768 ? splitGap : "16px");
    await expect(page.locator("#contact .contact-grid")).toHaveCSS("gap", width >= 768 ? splitGap : "32px");
    const intro = await details.boundingBox();
    const game = await hero.locator(".gameboy-stage").boundingBox();
    expect(intro).not.toBeNull();
    expect(game).not.toBeNull();
    if (width >= 768) {
      expect(game!.x).toBeGreaterThan(intro!.x + intro!.width);
      expect(game!.y).toBeCloseTo(intro!.y);
      expect(game!.height).toBeCloseTo(intro!.height);
    } else {
      expect(game!.y).toBeGreaterThan(intro!.y + intro!.height);
      expect(game!.x).toBeCloseTo(intro!.x);
      expect(game!.width).toBeCloseTo(intro!.width);
    }
    const device = page.getByRole("region", { name: "Pocket Tetris game" });
    const handheld = (await device.boundingBox())!;
    expect(handheld.width).toBeLessThanOrEqual(width < 768 ? 22 * 16 - 6 : 29 * 16);
    expect(handheld.height).toBeLessThan(game!.height);
    expect(game!.height - handheld.height).toBeLessThan(12);
    expect(handheld.x + handheld.width / 2).toBeCloseTo(game!.x + game!.width / 2, 1);
    expect(handheld.y + handheld.height / 2).toBeCloseTo(game!.y + game!.height / 2, 1);
    for (const name of ["A, rotate piece", "B, hard drop piece"]) {
      const control = (await device.getByRole("button", { name, exact: true }).boundingBox())!;
      expect(control.width).toBeGreaterThanOrEqual(44);
      expect(control.height).toBeGreaterThanOrEqual(44);
    }
    if (width === 390 || width === 600 || width >= 1152) {
      const contact = page.locator("#contact");
      const actions = [
        contact.getByRole("link", { name: "Start a conversation" }),
        contact.getByRole("button", { name: "Copy email" }),
        contact.getByRole("button", { name: "Support my work" }),
      ];
      await expect(actions[0].locator("..")).toHaveCSS("gap", "12px");
      await page.evaluate(() => document.fonts.ready);
      const buttons = await Promise.all(actions.map(action => action.boundingBox()));
      expect(buttons.every(button => button !== null && button.height >= 44)).toBe(true);
      if (width === 390) {
        expect(buttons[2]!.y).toBeGreaterThan(buttons[0]!.y);
      } else {
        for (const button of buttons.slice(1)) {
          expect(button!.y).toBeCloseTo(buttons[0]!.y);
        }
      }
    }
    await expect(page.getByRole("link", { name: "Explore the playground" })).toHaveAttribute("href", "/playground/");
    await page.getByRole("link", { name: "Explore the playground" }).click();
    await expect(page).toHaveURL(/\/playground\/$/);
    await expect(page.getByRole("navigation", { name: "Component library" })).toBeVisible();
  });
}
