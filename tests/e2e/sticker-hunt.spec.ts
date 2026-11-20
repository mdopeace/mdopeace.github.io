import { expect, test } from "@playwright/test";

test("navbar controls match the small control height", async ({ page, isMobile }) => {
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const controls = [
    nav.getByRole("status", { name: "Sticker hunt progress" }),
    nav.getByRole("switch", { name: "Dark mode" }),
    nav.getByRole("link", { name: "Md Mostafijur Rahman, home" }),
  ];
  const heights = await Promise.all(
    controls.map((control) => control.evaluate((element) => element.getBoundingClientRect().height)),
  );
  for (const height of heights) expect(Math.abs(height - 32)).toBeLessThanOrEqual(1);
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
});

test("sticker hunt updates progress and restores it on reload", async ({ page }) => {
  await page.goto("/");
  const progress = page.getByRole("status", { name: "Sticker hunt progress" });
  const stickers = page.getByRole("button", { name: /^Sticker:/ });
  const sticker = page.getByRole("button", { name: "Sticker: Zap!" });
  const storySticker = page.getByRole("button", { name: "Sticker: Cut!" });

  await expect(stickers).toHaveCount(6);
  await expect(progress).toHaveText("0 of 6 found");
  await sticker.click();
  await expect(progress).toHaveText("1 of 6 found");
  await expect(sticker).toHaveAttribute("data-found", "true");
  await expect(sticker).toBeDisabled();
  await expect(sticker).toHaveAttribute("data-found-tone", "accent");
  await expect(sticker).toHaveAttribute("data-pattern", "stripes");

  await storySticker.click();
  await expect(progress).toHaveText("2 of 6 found");
  await expect(storySticker).toHaveAttribute("data-found", "true");
  await expect(storySticker).toHaveAttribute("data-found-tone", "default");
  await expect(storySticker).toHaveAttribute("data-pattern", "grid");

  await page.reload();
  await expect(progress).toHaveText("2 of 6 found");
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

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`sticker and counter animate with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const progress = page.getByRole("status", { name: "Sticker hunt progress" });
    const sticker = page.getByRole("button", { name: "Sticker: Zap!" });
    await sticker.focus();
    const originalProgress = await progress.boundingBox();
    await sticker.press("Enter");
    const duration = reducedMotion === "reduce" ? "0.12s" : "0.18s";
    await expect(sticker).toHaveCSS("animation-name", /reveal/);
    await expect(sticker).toHaveCSS("animation-duration", duration);
    const count = progress.getByText("1 of 6 found", { exact: true });
    await expect(count).toHaveCSS("animation-name", /count/);
    await expect(count).toHaveCSS("animation-duration", duration);
    await expect(count).toHaveCSS("transform", "none");
    await expect(sticker).toBeFocused();
    expect(await progress.boundingBox()).toEqual(originalProgress);
  });
}
