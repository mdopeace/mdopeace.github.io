import { expect, test } from "@playwright/test";
import { expectAccessible, expectTextContrast, openForAudit, themes } from "./accessibility";

for (const theme of themes) {
  test(`${theme}: collecting stickers preserves focus, layout, and accessibility`, async ({ page, isMobile }) => {
    await openForAudit(page, "/", theme, isMobile);
    const progress = page.getByRole("status", { name: "Sticker hunt progress" });
    const stickers = page.getByRole("button", { name: /^Sticker:/ });
    await expect(stickers).toHaveCount(6);

    // Offset geometry excludes viewport scrolling and CSS transforms.
    const geometry = () => stickers.evaluateAll(elements => elements.map(element => {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = element as HTMLElement;
      return [offsetLeft, offsetTop, offsetWidth, offsetHeight];
    }));
    const before = await geometry();
    await expect(progress).toHaveText("0 of 6 found");
    await expect(progress).toHaveAttribute("aria-atomic", "true");
    await expectTextContrast(progress);

    for (let index = 0; index < 6; index++) {
      const sticker = stickers.nth(index);
      await expect(sticker).toHaveJSProperty("tabIndex", 0);
      await sticker.focus();
      await expect(sticker).toHaveCSS("outline-style", "solid");
      await page.keyboard.press("Enter");
      await expect(sticker).toBeFocused();
      await expect(sticker).toBeDisabled();
      await expect(sticker).toHaveAccessibleDescription("Found");
      await expect(progress).toHaveText(`${index + 1} of 6 found`);
      expect(await geometry()).toEqual(before);
      const label = sticker.locator(":scope > span:not([hidden])");
      await expect(label).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expectTextContrast(label);
      if (index === 0) await expectAccessible(page, "first sticker found");
    }
    await expectAccessible(page, "all stickers found");
  });
}
