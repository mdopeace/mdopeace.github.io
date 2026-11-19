import { expect, test } from "@playwright/test";

test("sticker hunt updates progress and restores it on reload", async ({ page }) => {
  await page.goto("/");
  const progress = page.getByRole("status", { name: "Sticker hunt progress" });
  const stickers = page.getByRole("button", { name: /^Sticker:/ });
  const sticker = page.getByRole("button", { name: "Sticker: Zap!" });

  await expect(stickers).toHaveCount(6);
  await expect(progress).toHaveText("0 of 6 found");
  await sticker.click();
  await expect(progress).toHaveText("1 of 6 found");
  await expect(sticker).toHaveAttribute("data-found", "true");
  await expect(sticker).toBeDisabled();

  await page.reload();
  await expect(progress).toHaveText("1 of 6 found");
  await expect(sticker).toHaveAccessibleDescription("Found");
});

test("sticker hunt works with the keyboard when localStorage is blocked", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });

  await page.goto("/");
  const progress = page.getByRole("status", { name: "Sticker hunt progress" });
  const sticker = page.getByRole("button", { name: "Sticker: Zap!" });
  await expect(progress).toHaveText("0 of 6 found");
  await sticker.focus();
  await page.keyboard.press("Enter");
  await expect(progress).toHaveText("1 of 6 found");
  await page.keyboard.press("Space");
  await expect(progress).toHaveText("1 of 6 found");
  await expect(sticker).toBeFocused();
  expect(errors).toEqual([]);
});
