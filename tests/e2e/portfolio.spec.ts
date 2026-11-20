import { expect, test } from "@playwright/test";
import axe from "axe-core";

declare global {
  interface Window {
    axe: typeof axe;
  }
}

test("the character card opens from the first viewport and covers the essentials", async ({ page }) => {
  await page.goto("/");
  const copy = page.locator("header#top p").filter({ hasText: /^At Tracxn, I work across the web platform\./ });
  const trigger = copy.getByRole("button", { name: "See my character card" });
  await expect(trigger).toBeInViewport();
  await expect(trigger).toHaveAttribute("type", "button");
  await expect(trigger).toHaveCSS("text-decoration-line", "underline");
  await expect(trigger).toHaveCSS("color", await copy.evaluate(el => getComputedStyle(el).color));
  await trigger.focus();
  await trigger.press("Enter");
  const summary = page.getByRole("dialog", { name: "Character Card" });
  await expect(summary).toBeVisible();
  await expect(summary.getByRole("button", { name: "Close character card" })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  const title = summary.getByRole("heading", { level: 2, name: "Character Card" });
  const fontSize = await title.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  const heroFontSize = await page.locator("#top h1").evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSize).toBeLessThan(heroFontSize);
  await expect(summary).toHaveCSS("border-top-width", "3px");
  await expect(summary).toHaveCSS("border-radius", "0px");
  await expect(summary.locator("dt")).toHaveText(["Class", "Guild / Base", "Powers"]);
  await expect(summary.locator("dd").nth(0)).toHaveText("Software Engineer");
  await expect(summary.locator("dd").nth(1)).toHaveText("Tracxn since 2023 · Bengaluru");
  await expect(summary.locator("dt").nth(1).locator("..")).toHaveCSS("align-items", "center");
  const powers = summary.getByRole("list", { name: "Powers" }).getByRole("listitem");
  await expect(powers).toHaveText([
    "JavaScript", "TypeScript", "React", "Next.js", "Express", "MongoDB", "AWS Lambda", "Swift", "SwiftUI",
    "+ Learns new powers with AI",
  ]);
  expect(await summary.evaluate(el => el.scrollWidth)).toBe(await summary.evaluate(el => el.clientWidth));
  const projects = summary.getByRole("list", { name: "Selected projects" }).getByRole("listitem");
  await expect(projects).toHaveCount(3);
  for (const [index, [name, id, description]] of [
    ["QuickTodo", "quicktodo", "Mac menu bar to-do app built with SwiftUI."],
    ["Vidp", "vidp", "Keyboard-driven macOS video player built on libmpv."],
    ["Cookieater", "cookieater", "Chrome and Firefox extension for editing cookies."],
  ].entries()) {
    await expect(projects.nth(index).getByRole("link", { name })).toHaveAttribute("href", `#${id}`);
    await expect(projects.nth(index).getByText(description, { exact: true })).toBeVisible();
    await expect(page.locator(`#work article#${id}`).getByRole("heading", { name })).toBeAttached();
  }
  await expect(summary.getByRole("link", { name: "Email" }))
    .toHaveAttribute("href", "mailto:md.correo.e@gmail.com");
  await expect(summary.getByRole("link", { name: "Telegram" }))
    .toHaveAttribute("href", "https://t.me/mdopeace");
  await expect(summary.getByRole("link", { name: "Contact", exact: true })).toHaveCount(0);
  await expect(summary.getByRole("link", { name: "View CV", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(summary).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

for (const width of [360, 390, 430]) {
  test(`the character card matches the hero edges at ${width}px`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile layout");
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: "See my character card" }).click();
    const dialog = page.getByRole("dialog", { name: "Character Card" });
    await expect(dialog).toBeVisible();
    const hero = await page.locator("#top").evaluate(el => {
      const { left, right } = el.getBoundingClientRect();
      return { left, right };
    });
    const edges = await dialog.evaluate(el => {
      const { left, right } = el.getBoundingClientRect();
      return { left, right };
    });
    expect(edges).toEqual(hero);
    expect(await dialog.evaluate(el => el.scrollWidth - el.clientWidth)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  });
}

for (const method of ["click", "keyboard"] as const) {
  test(`A project link in the character card closes it and focuses the project via ${method}`, async ({ page }) => {
    if (method === "click") await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.getByRole("button", { name: "See my character card" }).click();
    const summary = page.getByRole("dialog", { name: "Character Card" });
    const link = summary.getByRole("link", { name: "Vidp", exact: true });
    if (method === "keyboard") {
      await link.focus();
      await page.keyboard.press("Enter");
    } else {
      await link.click();
    }
    await expect(summary).toBeHidden();
    await expect(page.locator("#work article#vidp")).toBeFocused();
    await expect(page.locator("#work article#vidp")).toBeInViewport();
    expect(new URL(page.url()).hash).toBe("");
  });
}

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
    const bounds = await burst.boundingBox();
    expect(bounds).not.toBeNull();
    const { x, y, width, height } = bounds!;
    expect(height).toBeLessThan(width);
    expect(await burst.getByText("POW! Copied!", { exact: true })
      .evaluate(label => label.getClientRects().length)).toBe(1);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x + width).toBeLessThanOrEqual(page.viewportSize()!.width);
    for (const element of await contact.getByRole("heading")
      .or(contact.getByRole("button"))
      .or(contact.getByRole("link", { name: "Start a conversation" }))
      .all()) {
      const box = (await element.boundingBox())!;
      expect(x < box.x + box.width && x + width > box.x &&
        y < box.y + box.height && y + height > box.y).toBe(false);
    }
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

  test(`${theme}: the character card and email action pass axe`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    await page.goto("/");
    await page.addScriptTag({ content: axe.source });
    await page.getByRole("button", { name: "See my character card" }).click();
    const summary = page.getByRole("dialog", { name: "Character Card" });
    await expect(summary).toBeVisible();
    const audit = (selector: string) => page.evaluate(async selector => {
      const { violations } = await window.axe.run(selector);
      return violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }));
    }, selector);
    expect(await audit("dialog[open]")).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(summary).toBeHidden();
    expect(await audit("#contact")).toEqual([]);
  });

}
