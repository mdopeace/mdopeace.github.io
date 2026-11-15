import { expect, test } from "@playwright/test";

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
    await expect(page).toHaveURL(/#work$/);
    const project = page.locator("#work article").filter({ has: page.getByRole("heading", { name: "Vidp", exact: true }) });
    await project.getByRole("button", { name: "Read more" }).click();
    await expect(project.getByRole("button", { name: "Read less" })).toHaveAttribute("aria-expanded", "true");
    await project.getByRole("button", { name: "Read less" }).click();
    await project.getByRole("button", { name: "Copy", exact: true }).click();
    await expect(project.getByRole("status")).toHaveText("Copied to clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("brew tap vidplabs/vidp\nbrew install --cask vidp");
    const support = page.getByRole("button", { name: "Support my work" });
    await support.click();
    const dialog = page.getByRole("dialog", { name: "Fuel the next build" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "GitHub Sponsors" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(support).toBeFocused();
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

}
