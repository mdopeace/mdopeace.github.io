import { expect, test } from "@playwright/test";

test("navbar controls match the small control height", async ({ page, isMobile }) => {
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const controls = [
    nav.locator("[data-sticker-progress]"),
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
  const progress = page.locator("[data-sticker-progress]");
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
  const progress = page.locator("[data-sticker-progress]");
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
    const progress = page.locator("[data-sticker-progress]");
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
    const feedback = page.locator("[data-visible]").filter({ hasText: "Zap! The first panel has power." });
    await expect(feedback).toHaveCSS("transition-property", "opacity");
    await expect(feedback).toHaveCSS("transition-duration", duration);
    await expect(feedback).toHaveCSS("transform", "none");
    await expect(feedback).toHaveCSS("opacity", "1");
    await sticker.press("Escape");
    await expect(feedback).toHaveAttribute("inert", "");
    await expect(feedback).toHaveCSS("opacity", "0");
    await expect(sticker).toBeFocused();
    expect(await progress.boundingBox()).toEqual(originalProgress);
  });
}

test("finds tell a story, skip collected targets, and leave a trail after dismissal", async ({ page }) => {
  await page.goto("/");
  const status = page.getByRole("status", { name: "Sticker hunt update" });
  const log = page.getByRole("region", { name: "Sticker hunt log" });
  const sticker = (label: string) => page.getByRole("button", { name: `Sticker: ${label}` });
  const zap = sticker("Zap!");
  await expect(page.getByText("Six stickers are hiding in these panels. Find all six to unlock the final panel.", { exact: false })).toBeVisible();
  await expect(status).toBeEmpty();

  await sticker("Cut!").press("Space");
  await expect(status).toHaveText("Cut! found. 1 of 6 found. Find what shipped in Selected work.");
  await zap.press("Enter");
  await expect(zap).toBeFocused();
  await expect(status).toHaveText("Zap! found. 2 of 6 found. Find what shipped in Selected work.");
  const story = page.getByText("Zap! The first panel has power.", { exact: true });
  await expect(story).toBeVisible();
  const cutFeedback = page.locator("[data-visible]").filter({ hasText: "Cut! The rough draft hits the floor." });
  await expect(cutFeedback).toHaveAttribute("inert", "");
  await expect(cutFeedback).toHaveCSS("opacity", "0");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Find what shipped in Selected work." }).first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Hunt log" }).first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Dismiss clue" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Dismiss clue" })).toHaveCount(0);
  await expect(zap).toBeFocused();
  await expect(log.getByRole("link", { name: "Find what shipped in Selected work." })).toHaveAttribute("href", "#work");

  await sticker("Ping!").press("Enter");
  await expect(status).toHaveText("Ping! found. 3 of 6 found. Find what shipped in Selected work.");
  await page.getByRole("button", { name: "Dismiss clue" }).click();
  await expect(sticker("Ping!")).toBeFocused();
  await page.reload();
  await expect(log.getByRole("list", { name: "Sticker collection" }).getByText("6. Ping!")).toBeVisible();
  await expect(log.getByRole("link", { name: "Find what shipped in Selected work." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Dismiss clue" })).toHaveCount(0);
});

test("the sixth sticker links to a persistent six-stamp bonus panel", async ({ page }) => {
  await page.goto("/");
  const finale = page.getByRole("heading", { name: "The final panel" });
  await expect(finale).toHaveCount(0);
  const stickers = page.getByRole("button", { name: /^Sticker:/ });
  for (const sticker of await stickers.all()) await sticker.press("Enter");
  await expect(page.getByRole("status", { name: "Sticker hunt update" }))
    .toContainText("Ping! found. 6 of 6 found. Six stickers, one complete comic.");
  const finishLink = page.getByRole("link", { name: "Read the final panel" }).first();
  await expect(finishLink).toHaveAttribute("href", "#hunt-finale");
  await page.keyboard.press("Tab");
  await expect(finishLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(finale).toBeFocused();
  await expect(finale).toBeInViewport();
  await expect(page.getByRole("list", { name: "Six-stamp cover" }).getByRole("listitem")).toHaveCount(6);
  await page.reload();
  await expect(finale).toBeVisible();
  await expect(page.getByRole("list", { name: "Six-stamp cover" }).getByRole("listitem")).toHaveCount(6);
});
