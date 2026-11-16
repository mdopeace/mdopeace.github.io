import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: portfolio and playground footers share caption typography`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    const typography = [];
    for (const path of ["/", "/playground/"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const caption = page.getByRole("contentinfo").locator("p");
      await expect(caption).toHaveAttribute("data-font", "mono");
      await expect(caption).toHaveAttribute("data-size", "caption");
      typography.push(await caption.evaluate(element => {
        const style = getComputedStyle(element);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
        };
      }));
    }
    expect(typography[0].fontFamily).toMatch(/mono/i);
    expect(typography[1]).toEqual(typography[0]);
  });

  test(`${theme}: discover and use the public component playground`, async ({ page, context }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link")).toHaveCount(1);
    await expect(footer.getByRole("link", { name: "Back to top" })).toHaveAttribute("href", "#top");
    const project = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Component Library", exact: true }) });
    await expect(project.getByRole("link", { name: "Explore playground" })).toHaveAttribute("href", "/playground/");
    await project.getByRole("link", { name: "Explore playground" }).click();
    await expect(page).toHaveURL(/\/playground\/$/);
    await expect(page).toHaveTitle("Component Playground · Md Mostafijur Rahman");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://mdopeace.github.io/playground/");
    await expect(page.getByRole("heading", { name: "Design decisions" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const navigation = page.getByRole("navigation", { name: "Component library" });
    await expect(navigation.getByRole("button")).toHaveCount(19);
    await navigation.getByRole("button", { name: "Tile", exact: true }).click();
    await expect(page.getByRole("img", { name: "Game Boy mark" })).toHaveText("GB");
    await page.getByRole("combobox", { name: "Appearance", exact: true }).selectOption("paused");
    const tile = page.getByRole("img", { name: "paused indicator" });
    await expect(tile.locator("span")).toHaveCSS("background-color", "rgb(240, 174, 85)");
    await page.getByRole("checkbox", { name: "Inset depth" }).uncheck();
    await expect(tile).toHaveAttribute("data-inset", "false");
    await navigation.getByRole("button", { name: "Checkbox", exact: true }).click();
    const sample = page.getByRole("checkbox", { name: "Send me build notes" });
    await sample.focus();
    await page.keyboard.press("Space");
    await expect(sample).toBeChecked();
    const source = await page.getByLabel("Usage example", { exact: true }).textContent();
    await page.getByRole("button", { name: "Copy code", exact: true }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source);
    await navigation.getByRole("button", { name: "Badge", exact: true }).click();
    const badge = page.locator('[data-decoration]').filter({ hasText: "Work in progress" });
    await page.getByRole("checkbox", { name: "Solid fill" }).uncheck();
    for (const tone of ["default", "accent", "info", "emphasis"]) {
      await page.getByRole("combobox", { name: "Tone", exact: true }).selectOption(tone);
      const foreground = tone === "emphasis"
        ? theme === "light" ? "rgb(161, 60, 36)" : "rgb(240, 139, 107)"
        : theme === "light" ? "rgb(37, 35, 31)" : "rgb(246, 240, 223)";
      await expect(badge).toHaveCSS("color", foreground);
    }
    await page.reload();
    await expect(navigation).toBeVisible();
    await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
