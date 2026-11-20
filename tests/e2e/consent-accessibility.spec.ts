import { expect, test } from "@playwright/test";
import { expectAccessible, openForAudit, themes } from "./accessibility";

for (const theme of themes) {
  test(`${theme}: analytics consent is a named, keyboard-accessible notice`, async ({ page, isMobile }) => {
    test.skip(!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, "Requires the production consent notice");
    await openForAudit(page, "/", theme, isMobile);
    const prompt = page.getByRole("region", { name: "Analytics cookies" });
    await expect(prompt).toHaveAccessibleDescription(/measure visits/);
    await expectAccessible(page, "analytics consent banner");

    const privacy = page.getByText(/^Privacy note\./);
    const privacyOffset = () => privacy.evaluate(element => (element as HTMLElement).offsetTop);
    const before = await privacyOffset();
    const accept = prompt.getByRole("button", { name: "Accept" });
    const decline = prompt.getByRole("button", { name: "Decline" });
    await accept.focus();
    await page.keyboard.press("Tab");
    await expect(decline).toBeFocused();
    await expect(decline).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
    await expect(prompt).toBeHidden();
    await expect(privacy).toBeFocused();
    expect(await privacyOffset()).toBe(before);
    await page.keyboard.press("Tab");
    const allow = page.getByRole("button", { name: "Allow analytics" });
    await expect(allow).toBeFocused();
    await expect(allow).toBeInViewport({ ratio: 1 });
    await expect(allow).toHaveCSS("outline-style", "solid");

    // Scan the page from its initial scroll position after checking the footer's
    // keyboard interaction. The sticky header can overlap passing content.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expectAccessible(page, "analytics declined");
  });
}

test("analytics consent updates across tabs without losing focus", async ({ page, context }) => {
  test.skip(!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, "Requires the production consent notice");
  await page.goto("/");
  await page.getByRole("button", { name: "Accept", exact: true }).focus();
  const otherTab = await context.newPage();
  await otherTab.goto("/");
  await otherTab.getByRole("button", { name: "Decline", exact: true }).click();
  await expect(page.getByRole("region", { name: "Analytics cookies" })).toBeHidden();
  await expect(page.getByText(/^Privacy note\./)).toBeFocused();
});

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`analytics banner and choice animate with ${reducedMotion} motion`, async ({ page }) => {
    test.skip(!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, "Requires the production consent notice");
    await page.emulateMedia({ reducedMotion });
    await page.route("https://www.googletagmanager.com/**", route => route.abort());
    await page.goto("/");
    const banner = page.locator('[aria-label="Analytics cookies"]');
    const duration = reducedMotion === "reduce" ? 0.12 : 0.18;
    await expect(banner).toHaveCSS("transition-property", "opacity, display");
    expect(await banner.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBe(duration);
    await banner.getByRole("button", { name: "Decline" }).click();
    await expect(banner).toHaveAttribute("inert", "");
    await expect(banner).toBeHidden();

    const allow = page.getByRole("button", { name: "Allow analytics" });
    await expect(allow).toHaveCSS("transition-property", "opacity, display");
    expect(await allow.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBe(duration);
    const width = (await allow.boundingBox())!.width;
    await allow.click();
    const withdraw = page.getByRole("button", { name: "Turn off analytics" });
    await expect(withdraw.locator('[data-active="true"]')).toHaveCSS("transition-property", "opacity, visibility");
    expect(await withdraw.locator('[data-active="true"]').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBe(0.12);
    expect((await withdraw.boundingBox())!.width).toBe(width);
    await withdraw.click();
    await expect(allow).toBeVisible();
    await expect(page.getByText(/^Privacy note\./)).toBeFocused();
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`the tracked Game Boy start changes its overlay with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const overlay = page.locator(".tetris-overlay");
    await expect(overlay).toHaveCSS("transition-property", "opacity, display");
    expect(await overlay.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration)))
      .toBe(reducedMotion === "reduce" ? 0.12 : 0.18);
    const title = overlay.locator(".tetris-overlay-title");
    await expect(title).toHaveCSS("animation-name", "tetris-overlay-fade");
    await expect(title).toHaveCSS("animation-duration", "0.12s");
    await expect(title).toHaveCSS("transform", "none");
  });
}
