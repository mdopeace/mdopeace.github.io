import { expect, test } from "@playwright/test";
import axe from "axe-core";

declare global {
  interface Window {
    axe: typeof axe;
  }
}

test("the 60-second summary is in the first viewport and covers the essentials", async ({ page }) => {
  await page.goto("/");
  const summary = page.getByRole("region", { name: "60-second TL;DR" });
  await expect(summary).toBeInViewport({ ratio: 1 });
  for (const detail of [
    "Md Mostafijur Rahman", "software engineer in Bengaluru", "Tracxn",
    "QuickTodo", "Vidp", "Cookieater", "Component Library",
  ]) {
    await expect(summary).toContainText(detail);
  }
  await expect(summary.getByRole("link", { name: "md.correo.e@gmail.com" }))
    .toHaveAttribute("href", "mailto:md.correo.e@gmail.com");
  await expect(summary.getByRole("link", { name: "Telegram" }))
    .toHaveAttribute("href", "https://t.me/mdopeace");
  await expect(summary.getByRole("link", { name: "Contact" }))
    .toHaveAttribute("href", "#contact");
  await expect(summary.getByText(/\bCV\b/)).toHaveCount(0);
});

test("copy email offers the email link when clipboard writing fails", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: async () => { throw new Error("Clipboard access denied"); },
    });
  });
  await page.goto("/");
  const contact = page.locator("#contact");
  const copy = contact.getByRole("button", { name: "Copy email" });
  await copy.click();
  await expect(contact.getByRole("status").filter({ hasText: "Could not copy" }))
    .toHaveText("Could not copy. Use Start a conversation to email me.");
  await expect(contact.getByText("POW! Copied!")).toHaveCount(0);
  await expect(copy).toBeEnabled();
  await expect(contact.getByRole("link", { name: "Start a conversation" }))
    .toHaveAttribute("href", "mailto:md.correo.e@gmail.com");
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: comic styling, navigation, disclosure, clipboard and support`, async ({ page, context }) => {
    await page.addInitScript(theme => { if (!localStorage.getItem("portfolio-theme")) localStorage.setItem("portfolio-theme", theme); }, theme);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const style = await page.locator("h1").evaluate(e => {
      const s = getComputedStyle(e);
      return { size: parseFloat(s.fontSize), leading: parseFloat(s.lineHeight), weight: s.fontWeight };
    });
    expect(style.weight).toBe("900");
    expect(style.leading / style.size).toBeCloseTo(0.86, 2);
    expect(await page.locator(".hero-name").evaluate(e => getComputedStyle(e).textShadow)).not.toBe("none");
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Work", exact: true }).click();
    expect(new URL(page.url()).hash).toBe("");
    await expect(page.locator("#work")).toBeFocused();
    const project = page.locator("#work article").filter({ has: page.getByRole("heading", { name: "Vidp", exact: true }) });
    await project.getByRole("button", { name: "Read more" }).click();
    await expect(project.getByRole("button", { name: "Read less" })).toHaveAttribute("aria-expanded", "true");
    await project.getByRole("button", { name: "Read less" }).click();
    await project.getByRole("button", { name: "Copy", exact: true }).click();
    await expect(project.getByRole("status")).toHaveText("Copied to clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("brew tap vidplabs/vidp\nbrew install --cask vidp");
    const contact = page.locator("#contact");
    const copyEmail = contact.getByRole("button", { name: "Copy email" });
    await page.clock.install();
    await copyEmail.click();
    const burst = contact.getByRole("status").filter({ hasText: "POW! Copied!" });
    await expect(burst).toBeVisible();
    await expect(burst).toHaveAttribute("aria-live", "polite");
    await expect(burst.getByText("Email address copied to clipboard.")).toBeAttached();
    await expect(burst.locator(":scope > div")).toHaveCSS("animation-name", "none");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("md.correo.e@gmail.com");
    await page.clock.runFor(1400);
    await expect(burst).toHaveCount(0);
    const support = page.getByRole("button", { name: "Support my work" });
    await support.click();
    const dialog = page.getByRole("dialog", { name: "Fuel the next build" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "GitHub Sponsors" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(support).toBeFocused();
    const previousOverflow = await page.evaluate(() => document.body.style.overflow);
    for (const closeWithForm of [true, false]) {
      await support.click();
      await expect(dialog).toBeVisible();
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      if (closeWithForm) {
        await dialog.evaluate(element => {
          const form = document.createElement("form");
          form.method = "dialog";
          const submit = document.createElement("button");
          submit.textContent = "Native close";
          form.append(submit);
          element.append(form);
          form.requestSubmit(submit);
          form.remove();
        });
      } else {
        await dialog.evaluate(element => (element as HTMLDialogElement).close());
      }
      await expect(dialog).not.toBeVisible();
      await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
      await expect(support).toBeFocused();
    }
    const toggle = page.getByRole("switch", { name: "Dark mode" });
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme === "dark" ? "light" : "dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme === "dark" ? "light" : "dark");
  });

  test(`${theme}: migrated Game Boy controls start, play, pause and resume`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    await page.goto("/");
    const game = page.getByRole("region", { name: "Pocket Tetris game" });
    const rotate = game.getByRole("button", { name: "Rotate piece", exact: true });
    await expect(rotate).toBeDisabled();
    await game.getByRole("button", { name: "START GAME", exact: true }).click();
    await expect(rotate).toBeEnabled({ timeout: 10000 });
    await rotate.hover();
    expect(await rotate.evaluate(e => getComputedStyle(e).transform)).toBe("none");
    await game.getByRole("button", { name: "Hold piece", exact: true }).click();
    await expect(game.getByRole("status")).toContainText("Piece held");
    await game.getByRole("button", { name: "Hard drop piece", exact: true }).click();
    await expect(game.getByRole("status")).toContainText("Piece placed");
    await game.getByRole("button", { name: "Pause game", exact: true }).click();
    await expect(rotate).toBeDisabled();
    await expect(game.getByRole("button", { name: "RESUME", exact: true })).toBeVisible();
    await game.getByRole("button", { name: "RESUME", exact: true }).click();
    await expect(rotate).toBeEnabled();
    await rotate.focus();
    await page.keyboard.press("Enter");
    await expect(rotate).toBeEnabled();
    await game.getByRole("button", { name: "Reset game", exact: true }).click();
    await expect(game.getByRole("status")).toContainText("New game started");
  });

  test(`${theme}: the summary, email action, and analytics notice pass axe`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    await page.goto("/");
    // The consent prompt stays hidden until Md provides a measurement ID.
    await expect(page.getByRole("region", { name: "Analytics cookies" })).toHaveCount(0);
    await expect(page.getByText(/Privacy note/i)).toBeVisible();
    await page.addScriptTag({ content: axe.source });
    const violations = await page.evaluate(async () => {
      const { violations } = await window.axe.run({
        include: [["[aria-labelledby='portfolio-summary']"], ["#contact"], [".analytics-privacy"]],
      });
      return violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }));
    });
    expect(violations).toEqual([]);
  });

}
