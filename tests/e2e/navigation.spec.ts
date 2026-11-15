import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: navigation tracks sections and moves its highlight`, async ({ page, isMobile }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    const marker = nav.locator('span[data-ready="true"]');
    const colorTrack = nav.locator('div[aria-hidden="true"][data-ready="true"]');
    // Decorative copies must not create additional keyboard or screen-reader links.
    await expect(nav.getByRole("link")).toHaveCount(6);
    for (const [label, id] of [["Story", "story"], ["Work", "work"], ["Experience", "experience"], ["Now", "now"], ["Contact", "contact"]]) {
      await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ behavior: "instant" }));
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute("aria-current", "location");
      await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
      await expect(page).not.toHaveURL(/#/);
    }
    const experience = nav.getByRole("link", { name: "Experience", exact: true });
    await experience.click();
    await expect(experience).toHaveAttribute("aria-current", "location");
    await expect(page.locator("#experience")).toBeFocused();
    const emphasis = theme === "light" ? "rgb(161, 60, 36)" : "rgb(240, 139, 107)";
    await expect(marker).toHaveCSS("background-color", emphasis);
    await expect(colorTrack.locator("a").first()).toHaveCSS("color", emphasis);
    if (!isMobile) {
      const work = nav.getByRole("link", { name: "Work", exact: true });
      const target = await work.boundingBox();
      // Move the pointer directly: hover() scrolls sticky links out of the
      // page's scroll-padding region before hovering, unlike a real pointer.
      await page.mouse.move(target!.x + target!.width / 2, target!.y + target!.height / 2);
      await expect(work).toHaveAttribute("data-highlighted", "true");
      await expect.poll(async () => Math.abs((await marker.boundingBox())!.x - target!.x)).toBeLessThan(1);
      await expect.poll(async () => Math.abs((await marker.boundingBox())!.width - target!.width)).toBeLessThan(1);
      await page.mouse.move(0, 0);
      await expect(experience).toHaveAttribute("data-highlighted", "true");
      // Keyboard preview highlights the focused link without changing the section.
      await page.keyboard.press("Shift");
      const story = nav.getByRole("link", { name: "Story", exact: true });
      await story.evaluate(element => element.focus({ preventScroll: true }));
      await expect(story).toHaveAttribute("data-highlighted", "true");
      await expect(experience).toHaveAttribute("aria-current", "location");
    }
    // The global reduced-motion rule uses a near-zero !important duration.
    expect(await marker.evaluate(element => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
  });
}
