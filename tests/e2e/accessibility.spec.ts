import { expect, test } from "@playwright/test";
import { expectAccessible, expectTextContrast, openForAudit, themes } from "./accessibility";

for (const theme of themes) {
  test(`${theme}: home and support dialog meet WCAG A/AA axe rules`, async ({ page, isMobile }) => {
    await openForAudit(page, "/", theme, isMobile);
    await expectAccessible(page, "home");
    const thought = page.locator('.contact-thought[data-variant="thought"]');
    await expect(thought).toHaveAttribute("data-tail", "bottom-start");
    await expect(thought).toHaveCSS("animation-name", "none");
    await expectTextContrast(thought.locator('[aria-hidden="true"]'), "::after");
    await expect(page.locator(".contact-art")).toHaveAttribute("data-ui-surface", "default");
    await expect(page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Backend & data" }) }))
      .toHaveAttribute("data-ui-surface", "default");
    await page.getByRole("button", { name: "Support my work" }).click();
    await expect(page.getByRole("dialog", { name: "Fuel the next build" })).toBeVisible();
    await expectAccessible(page, "support dialog");
  });

  test(`${theme}: playground and comic previews meet WCAG A/AA axe rules`, async ({ page, isMobile }) => {
    await openForAudit(page, "/playground/", theme, isMobile);
    await expectAccessible(page, "playground");
    const catalog = page.getByRole("navigation", { name: "Component library" });
    const preview = page.getByRole("group", { name: "Live preview" });
    const show = (name: string) => catalog.getByRole("button", { name, exact: true }).click();

    for (const name of ["Badge", "Checkbox"]) {
      await show(name);
      await expectAccessible(page, name);
    }
    await show("SpeechBubble");
    const bubble = preview.locator("[data-tail]");
    const toneControl = page.getByLabel("Tone", { exact: true });
    for (const variant of ["speech", "shout", "thought", "whisper", "caption"]) {
      await page.getByLabel("Variant", { exact: true }).selectOption(variant);
      const shaped = variant === "thought" || variant === "shout";
      for (const tone of ["default", "accent", "emphasis"]) {
        await toneControl.selectOption(tone);
        await expect(bubble).toHaveAttribute("data-ui-surface", tone);
        await expectTextContrast(shaped ? bubble.locator('[aria-hidden="true"]') : bubble, shaped ? "::after" : undefined);
      }
      await expectAccessible(page, `SpeechBubble · ${variant}`);
    }
    await show("Burst");
    for (const tone of ["default", "accent", "emphasis"]) {
      await toneControl.selectOption(tone);
      await expectTextContrast(preview.getByText("POW! Copied!"), "::after");
    }
    await expectAccessible(page, "Burst");
    await show("Sticker");
    await page.getByRole("checkbox", { name: "Interactive", exact: true }).check();
    const star = preview.getByRole("button", { name: "Star" });
    await expectAccessible(page, "sticker available");
    await star.focus();
    await page.keyboard.press("Enter");
    await expect(star).toBeFocused();
    await expect(star).toBeDisabled();
    for (const tone of ["default", "accent", "emphasis"]) {
      await page.getByLabel("Found tone").selectOption(tone);
      await page.getByLabel("Found pattern").selectOption("grid");
      await page.getByLabel("Found icon").check();
      await expectTextContrast(star.getByText("Star", { exact: true }));
      await expectAccessible(page, `sticker found · ${tone}`);
    }
    await page.getByRole("checkbox", { name: "Found", exact: true }).uncheck();
    await expectAccessible(page, "sticker reset with icon enabled");

    await show("ConsentNote");
    await expect(preview.getByRole("region", { name: "Consent notice" })).toBeVisible();
    await expectAccessible(page, "consent notice");
    await preview.getByRole("button", { name: "Decline" }).click();
    await expect(page.getByRole("checkbox", { name: "Open notice" })).toBeFocused();
    await expect(preview.getByRole("status")).toHaveText("Declined");

    await show("Dialog");
    const trigger = preview.getByRole("button", { name: "Open example dialog" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Room for one idea." });
    const close = dialog.getByRole("button", { name: "Close example dialog" });
    const last = dialog.getByRole("button", { name: "Got it" });
    await expect(close).toBeFocused();
    await expect(close).toHaveCSS("outline-style", "solid");
    await expect(dialog).toHaveCSS("animation-name", /fade/);
    await expect(dialog).toHaveCSS("transform", "none");
    await expectAccessible(page, "playground dialog");
    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("unavailable playground properties remain discoverable and ignore activation", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "Burst", exact: true }).click();
  const show = page.getByLabel("Show burst");
  const announce = page.getByLabel("Announce feedback");
  await show.uncheck();

  const tone = page.getByRole("combobox", { name: "Tone" });
  await expect(tone).toBeDisabled();
  await tone.focus();
  await expect(tone).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("ArrowDown");
  await expect(tone).toHaveValue("accent");
  await page.keyboard.press("Tab");
  const size = page.getByRole("combobox", { name: "Size" });
  await expect(size).toBeFocused();
  await expect(size).toBeDisabled();
  await page.keyboard.press("Tab");
  const animate = page.getByRole("checkbox", { name: "Animate entry" });
  await expect(animate).toBeFocused();
  await expect(animate).toBeDisabled();
  await page.keyboard.press("Space");
  await expect(animate).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(announce).toBeFocused();

  const status = page.getByRole("group", { name: "Live preview" }).getByRole("status");
  await expect(status).toBeEmpty();
  await page.keyboard.press("Space");
  await expect(status).toBeEmpty();
  const preview = page.getByRole("group", { name: "Live preview" });
  const before = await preview.boundingBox();
  await show.check();
  expect(await preview.boundingBox()).toEqual(before);
  await expect(status).toHaveText("POW! Copied!");
  await expect(page.getByRole("group", { name: "Live preview" }).getByRole("status")).toHaveCount(1);
});
