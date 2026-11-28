import { expect, test } from "@playwright/test";
import { expectAccessible, expectTextContrast, openForAudit, themes } from "./accessibility";

for (const theme of themes) {
  test(`${theme}: home and support dialog meet WCAG A/AA axe rules`, async ({ page, isMobile }) => {
    await openForAudit(page, "/", theme, isMobile);
    await expectAccessible(page, "home");
    const thought = page.locator("#contact [data-bubble-variant=thought]");
    await expect(thought).toHaveAttribute("data-tail", "bottom-start");
    await expectTextContrast(thought, undefined, "svg path");
    const bubble = (await thought.boundingBox())!;
    const art = (await page.locator("#contact .contact-art").boundingBox())!;
    expect(bubble.x).toBeGreaterThan(art.x);
    expect(bubble.x + bubble.width).toBeLessThan(art.x + art.width);
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
    for (const name of ["SpeechBubble", "Burst"]) {
      await show(name);
      const text = preview.getByText(name === "Burst" ? "POW! Copied!" : /Every good story/);
      for (const tone of ["default", "accent", "emphasis"]) {
        await page.getByLabel("Tone", { exact: true }).selectOption(tone);
        await expectTextContrast(text, name === "Burst" ? "::after" : undefined);
      }
      await expectAccessible(page, name);
      if (name === "SpeechBubble") {
        await page.getByLabel("Variant", { exact: true }).selectOption("thought");
        for (const tone of ["default", "accent", "emphasis"]) {
          await page.getByLabel("Tone", { exact: true }).selectOption(tone);
          await expectTextContrast(text, undefined, "svg path");
        }
        await expectAccessible(page, "Thought bubble");
      }
    }
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
