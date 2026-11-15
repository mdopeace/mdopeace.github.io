import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: discover and use the public component playground`, async ({ page, context }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Built with my component library" })).toHaveAttribute("href", "/playground/");
    await page.getByRole("link", { name: "Explore playground" }).click();
    await expect(page).toHaveURL(/\/playground\/$/);
    await expect(page).toHaveTitle("Component Playground · Md Mostafijur Rahman");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://mdopeace.github.io/playground/");
    await expect(page.getByRole("heading", { name: "Design decisions" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const navigation = page.getByRole("navigation", { name: "Component library" });
    await expect(navigation.getByRole("button")).toHaveCount(15);
    await navigation.getByRole("button", { name: "Checkbox", exact: true }).click();
    const sample = page.getByRole("checkbox", { name: "Send me build notes" });
    await sample.focus();
    await page.keyboard.press("Space");
    await expect(sample).toBeChecked();
    const source = await page.getByLabel("Usage example", { exact: true }).textContent();
    await page.getByRole("button", { name: "Copy code", exact: true }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(source);
    await page.reload();
    await expect(navigation).toBeVisible();
    await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
