import { expect, test } from "@playwright/test";

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`Playground text expands and collapses with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.goto("/playground/");
    await page.getByRole("button", { name: "Content & feedback", exact: true }).click();
    const preview = page.getByRole("group", { name: "Live preview" });
    const viewport = preview.locator("[data-expanded]");
    const more = preview.getByRole("button", { name: "Read more" });
    const less = preview.getByRole("button", { name: "Read less" });
    await expect(more).toBeVisible();
    const reduced = reducedMotion === "reduce";
    await expect(viewport).toHaveCSS("transition-property", reduced ? "none" : "height");
    await expect(viewport).toHaveCSS(reduced ? "animation-duration" : "transition-duration", reduced ? "0.12s" : "0.3s");
    await viewport.evaluate(element => {
      const record = (event: Event) => {
        if (event.target !== element) return;
        if (event instanceof AnimationEvent) element.setAttribute("data-motion-ended", event.animationName);
        if (event instanceof TransitionEvent) element.setAttribute("data-motion-ended", event.propertyName);
      };
      element.addEventListener("animationend", record);
      element.addEventListener("transitionend", record);
    });
    const collapsedHeight = await viewport.evaluate(element => element.clientHeight);
    for (const expanded of [true, false]) {
      await viewport.evaluate(element => element.removeAttribute("data-motion-ended"));
      await (expanded ? more : less).click();
      await expect(expanded ? less : more).toHaveAttribute("aria-expanded", String(expanded));
      if (reduced) {
        await expect(viewport).toHaveCSS("animation-duration", "0.12s");
        const fade = await viewport.evaluate(element => getComputedStyle(element).animationName);
        expect(fade).toMatch(/fade/i);
        await expect(viewport).toHaveAttribute("data-motion-ended", fade);
      } else {
        await expect(viewport).toHaveAttribute("data-motion-ended", "height");
      }
      const height = await viewport.evaluate(element => element.clientHeight);
      if (expanded) expect(height).toBeGreaterThan(collapsedHeight);
      else expect(height).toBe(collapsedHeight);
    }
  });

  test(`project links respond to hover with ${reducedMotion} motion`, async ({ page, hasTouch }) => {
    test.skip(hasTouch, "Requires a hover pointer");
    await page.emulateMedia({ reducedMotion });
    await page.goto("/");
    const link = page.getByRole("button", { name: "View project: QuickTodo" });
    await expect(link).toHaveCSS("transition-duration", reducedMotion === "reduce" ? "0.12s" : "0.12s, 0.12s, 0.12s, 0.12s");
    await link.hover();
    if (reducedMotion === "reduce") {
      await expect(link).toHaveCSS("opacity", "0.86");
      await expect(link).toHaveCSS("transform", "none");
    } else {
      await expect(link).toHaveCSS("transform", "matrix(1, 0, 0, 1, 1, 1)");
    }
  });

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
