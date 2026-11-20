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
