import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`comic and playground state changes animate with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/playground/");
    const preview = page.getByRole("group", { name: "Live preview" });
    const catalog = page.getByRole("navigation", { name: "Component library" });
    const pick = (name: string) => catalog.getByRole("button", { name, exact: true }).click();
    const duration = reducedMotion === "reduce" ? "0.12s" : "0.18s";

    await pick("Burst");
    await expect(preview).toHaveCSS("animation-duration", duration);
    const artwork = preview.locator("[data-visible]");
    const face = artwork.locator(":scope > div");
    await expect(face).toHaveCSS("animation-duration", duration);
    if (reducedMotion === "reduce") await expect(face).toHaveCSS("transform", "none");
    await page.getByLabel("Show burst").uncheck();
    await expect(artwork).toHaveCSS("transition-property", "opacity, visibility");
    await expect(artwork).toHaveCSS("transition-duration", new RegExp(duration.replace(".", "\\.")));
    await expect(preview).toHaveCSS("animation-duration", duration);
    await expect(artwork).toBeHidden();
    await page.getByLabel("Show burst").check();
    await expect(artwork).toHaveCSS("opacity", "1");

    await pick("ConsentNote");
    const notice = preview.locator("[data-open]");
    await notice.getByRole("button", { name: "Decline" }).click();
    await expect(notice).toHaveCSS("transition-property", "opacity, display");
    await expect(notice).toHaveCSS("transition-duration", new RegExp(duration.replace(".", "\\.")));
    await expect(notice).toHaveAttribute("inert", "");
    await expect(notice).toBeHidden();
    await page.getByLabel("Open notice").check();
    await expect(notice).toHaveCSS("opacity", "1");

    await pick("Dialog");
    const trigger = preview.getByRole("button", { name: "Open example dialog" });
    const dialog = preview.locator("dialog");
    await trigger.click();
    await expect(dialog).toHaveCSS("animation-duration", duration);
    if (reducedMotion === "reduce") await expect(dialog).toHaveCSS("transform", "none");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveAttribute("data-closing", "true");
    await expect(dialog).toHaveCSS("animation-duration", duration);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test(`Burst width control fades in both directions with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => {
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (callback) => {
        const transition = start(callback);
        void transition.ready.then(() => {
          const root = document.documentElement;
          root.dataset.testWidthFade = ["old", "new"]
            .map(side => getComputedStyle(root, `::view-transition-${side}(root)`).animationDuration)
            .join(" / ");
        });
        return transition;
      };
    });
    await page.goto("/playground/");
    const catalog = page.getByRole("navigation", { name: "Component library" });
    const consent = catalog.getByRole("button", { name: "ConsentNote", exact: true });
    const burst = catalog.getByRole("button", { name: "Burst", exact: true });
    const width = page.getByRole("combobox", { name: "Preview width" });
    const root = page.locator("html");
    const duration = reducedMotion === "reduce" ? "0.12s" : "0.18s";

    await consent.click();
    await expect(width).toBeVisible();
    await burst.press("Enter");
    await expect(width).toHaveCount(0);
    await expect(burst).toBeFocused();
    await expect(root).toHaveAttribute("data-test-width-fade", `${duration} / ${duration}`);

    await root.evaluate(node => node.removeAttribute("data-test-width-fade"));
    await consent.press("Enter");
    await expect(width).toBeVisible();
    await expect(consent).toBeFocused();
    await expect(root).toHaveAttribute("data-test-width-fade", `${duration} / ${duration}`);
  });

  test(`theme swaps use a snapshot fade with ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => {
      localStorage.setItem("portfolio-theme", "light");
      const start = document.startViewTransition.bind(document);
      document.startViewTransition = (callback) => {
        const transition = start(callback);
        void transition.ready.then(() => {
          const sheet = getComputedStyle(document.documentElement, "::view-transition-new(root)");
          document.documentElement.dataset.testThemeAnimation = sheet.animationDuration;
        });
        return transition;
      };
    });
    await page.goto("/");
    await page.getByRole("switch", { name: "Dark mode" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator("html")).toHaveAttribute("data-test-theme-animation",
      new RegExp(reducedMotion === "reduce" ? "0\\.12s" : "0\\.18s"));
  });
}
