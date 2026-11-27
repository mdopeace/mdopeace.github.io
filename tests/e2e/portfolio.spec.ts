import { expect, test } from "@playwright/test";
import { expectAccessible, expectTextContrast, openForAudit, themes } from "./accessibility";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

test("the character card opens from the first viewport and covers the essentials", async ({ page }) => {
  await page.goto("/");
  const actions = page.locator("#top .hero-actions");
  const trigger = actions.getByRole("button", { name: "See my character card" });
  await expect(trigger).toBeInViewport();
  for (const action of [
    actions.getByRole("link", { name: "See my work", exact: true }),
    trigger,
    actions.getByRole("link", { name: "How I think", exact: true }),
  ]) {
    await expect(action).toHaveAttribute("data-size", "lg");
    await expect(action).toHaveCSS("height", "48px");
  }
  await expect(trigger).toHaveAttribute("type", "button");
  await expect(trigger).toHaveAttribute("data-variant", "secondary");
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
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

for (const width of [320, 390, 430]) {
  test(`portfolio dialogs match the page edges at ${width}px`, async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile layout");
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const hero = await page.locator("#top").evaluate(el => {
      const { left, right } = el.getBoundingClientRect();
      return { left, right };
    });
    for (const [triggerName, name] of [
      ["See my character card", "Character Card"],
      ["View project: Vidp", "Vidp"],
      ["View project: QuickTodo", "QuickTodo"],
      ["View project: Cookieater", "Cookieater"],
      ["View project: Component Library", "Component Library"],
      ["Support my work", "Fuel the next build"],
    ]) {
      const trigger = page.getByRole("button", { name: triggerName, exact: true });
      await trigger.press("Enter");
      const dialog = page.getByRole("dialog", { name, exact: true });
      await expect(dialog).toBeVisible();
      const measured = await dialog.evaluate(el => {
        const { left, right } = el.getBoundingClientRect();
        return { edges: { left, right }, overflow: el.scrollWidth - el.clientWidth };
      });
      expect(measured.edges).toEqual(hero);
      expect(measured.overflow).toBe(0);
      await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
      await expect(dialog.getByRole("button", { name: /^Close/ })).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    }
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

test("the Evolving stamp sits to the right of the workbench label", async ({ page, isMobile }) => {
  await page.setViewportSize({ width: isMobile ? 320 : 1280, height: 844 });
  await page.goto("/#now");
  const note = page.locator("#now article").filter({ hasText: "On the workbench" });
  const label = note.getByText("On the workbench · 01", { exact: true });
  const stamp = note.getByText("Evolving", { exact: true });
  const [labelBox, stampBox, cardBox] = await Promise.all([label.boundingBox(), stamp.boundingBox(), note.boundingBox()]);
  expect(labelBox).not.toBeNull();
  expect(stampBox).not.toBeNull();
  expect(cardBox).not.toBeNull();
  expect(stampBox!.x).toBeGreaterThan(labelBox!.x + labelBox!.width);
  expect(stampBox!.x + stampBox!.width).toBeLessThan(cardBox!.x + cardBox!.width);
  expect(Math.abs((stampBox!.y + stampBox!.height / 2) - (labelBox!.y + labelBox!.height / 2))).toBeLessThan(2);
});

test("Experience role and toolkit share a lower edge only when side by side", async ({ page, isMobile }) => {
  await page.setViewportSize({ width: isMobile ? 390 : 1280, height: 844 });
  await page.goto("/#experience");
  const experience = page.locator("#experience");
  const role = experience.getByRole("heading", { name: "Software Engineer", exact: true }).locator("xpath=ancestor::article");
  const toolkit = experience.locator(".toolkit-tiles");
  const caption = experience.locator(".toolkit-caption");
  const [left, right, note] = await Promise.all([role.boundingBox(), toolkit.boundingBox(), caption.boundingBox()]);
  if (!left || !right || !note) throw new Error("Missing Experience layout");
  if (isMobile) {
    expect(right.y - left.y - left.height).toBeCloseTo(24);
  } else {
    expect(left.y).toBeCloseTo(right.y);
    expect(left.y + left.height).toBeCloseTo(right.y + right.height);
  }
  expect(note.y - right.y - right.height).toBeCloseTo(16);
  expect(note.x).toBeCloseTo(left.x);
  expect(note.x + note.width).toBeCloseTo(right.x + right.width);
});

test("analytics makes no Google requests until accepted and stops on withdrawal", async ({ page, context }) => {
  test.skip(!measurementId, "Requires a GA measurement ID");
  const key = "portfolio-analytics-consent";
  const googleRequests: string[] = [];
  await page.route(url => /(?:^|\.)(?:googletagmanager|google-analytics)\.com$/.test(url.hostname), async route => {
    googleRequests.push(route.request().url());
    await route.fulfill({
      contentType: "application/javascript",
      body: `document.cookie="_ga=preview; Path=/"; document.cookie="_ga_${measurementId!.slice(2)}=preview; Path=/";`,
    });
  });
  const prompt = page.getByRole("region", { name: "Analytics cookies" });
  const settings = page.getByRole("button", { name: "Privacy settings" });
  await page.goto("/");
  await expect(prompt).toBeInViewport({ ratio: 1 });
  expect(googleRequests).toEqual([]);
  expect((await context.cookies()).filter(cookie => cookie.name.startsWith("_ga"))).toEqual([]);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();

  await prompt.getByRole("button", { name: "Decline", exact: true }).click();
  await page.reload();
  await expect(settings).toBeVisible();
  await expect(prompt).toHaveCount(0);
  expect(googleRequests).toEqual([]);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe("declined");

  await settings.click();
  await expect(prompt).toBeFocused();
  const statusBadge = prompt.locator("[data-variant=outline][data-tone=default]:has(+ p)");
  await expect(statusBadge).toHaveText("Analytics is off");
  await expect(statusBadge).toBeVisible();
  await expect(prompt).toHaveAccessibleDescription(/^Analytics is off Allow/);
  const tagUrl = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  await Promise.all([
    page.waitForResponse(response => response.url() === tagUrl && response.ok()),
    prompt.getByRole("button", { name: "Accept", exact: true }).click(),
  ]);
  await expect.poll(async () => (await context.cookies()).some(cookie => cookie.name === "_ga")).toBe(true);
  expect(googleRequests).toEqual([tagUrl]);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe("accepted");
  await Promise.all([page.waitForResponse(tagUrl), page.reload()]);
  await expect(prompt).toHaveCount(0);
  expect(googleRequests).toEqual([tagUrl, tagUrl]);

  await settings.click();
  await expect(statusBadge).toHaveText("Analytics is on");
  await expect(statusBadge).toBeVisible();
  await expect(prompt).toHaveAccessibleDescription(/^Analytics is on Allow/);
  await prompt.getByRole("button", { name: "Decline", exact: true }).click();
  await expect(settings).toBeFocused();
  await expect.poll(async () => (await context.cookies()).filter(cookie => cookie.name.startsWith("_ga"))).toEqual([]);
  expect(await page.evaluate(id => Reflect.get(window, `ga-disable-${id}`), measurementId)).toBe(true);
  await page.reload();
  await expect(prompt).toHaveCount(0);
  expect(googleRequests).toEqual([tagUrl, tagUrl]);
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
  await expect(contact.getByText("POW! Copied!")).toBeHidden();
  await expect(copy).toBeEnabled();
  await expect(copy).toBeFocused();
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
    await project.getByRole("button", { name: "View project: Vidp" }).click();
    await project.getByRole("button", { name: "Copy", exact: true }).click();
    await expect(project.getByRole("status")).toHaveText("Copied to clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("brew tap vidplabs/vidp\nbrew install --cask vidp");
    await page.keyboard.press("Escape");
    await expect(project.getByRole("dialog")).toBeHidden();
    const contact = page.locator("#contact");
    const copyEmail = contact.getByRole("button", { name: "Copy email" });
    const actions = await contact.getByRole("button").or(contact.getByRole("link")).all();
    await page.clock.install();
    await copyEmail.scrollIntoViewIfNeeded();
    const beforeCopy = await Promise.all(actions.map(action => action.boundingBox()));
    await copyEmail.click();
    const label = contact.getByText("POW! Copied!", { exact: true });
    const overlay = contact.locator(":popover-open");
    await expect(overlay).toHaveCSS("opacity", "1");
    expect(await Promise.all(actions.map(action => action.boundingBox()))).toEqual(beforeCopy);
    const bounds = (await overlay.boundingBox())!;
    const buttonBounds = (await copyEmail.boundingBox())!;
    expect(bounds.width).toBeGreaterThan(buttonBounds.width);
    expect(bounds.x + bounds.width / 2).toBeCloseTo(buttonBounds.x + buttonBounds.width / 2);
    expect(bounds.y + bounds.height / 2).toBeCloseTo(buttonBounds.y + buttonBounds.height / 2);
    expect(await label.evaluate(label => {
      const range = document.createRange();
      range.selectNodeContents(label);
      return range.getClientRects().length;
    })).toBe(1);
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await expect(overlay).toHaveAttribute("aria-hidden", "true");
    await expect(copyEmail).toBeFocused();
    await expect(contact.getByRole("status")).toHaveText("Email address copied to clipboard.");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("md.correo.e@gmail.com");
    await page.clock.runFor(2300);
    await expect(label).toBeHidden();
    await expect(copyEmail).toHaveCSS("opacity", "1");
    await expect(copyEmail).toBeFocused();
    expect(await Promise.all(actions.map(action => action.boundingBox()))).toEqual(beforeCopy);
    const support = page.getByRole("button", { name: "Support my work" });
    await support.click();
    const dialog = page.getByRole("dialog", { name: "Fuel the next build" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription("Choose the way that works best for you. Every bit helps keep useful ideas moving.");
    await expect(dialog.locator('[data-texture="halftone-soft"]')).toHaveCount(1);
    await expect(dialog.getByRole("link", { name: "GitHub Sponsors" })).toHaveAttribute("href", "https://github.com/sponsors/mdopeace");
    await expect(dialog.getByRole("link", { name: "Buy Me a Coffee" })).toHaveAttribute("href", "https://buymeacoffee.com/mdopeace");
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
    const rotate = game.getByRole("button", { name: "A, rotate piece", exact: true });
    await expect(rotate).toBeDisabled();
    await game.getByRole("button", { name: "START GAME", exact: true }).click();
    await expect(rotate).toBeEnabled({ timeout: 10000 });
    await rotate.hover();
    expect(await rotate.evaluate(e => getComputedStyle(e).transform)).toBe("none");
    await game.getByRole("button", { name: "Hold piece", exact: true }).click();
    await expect(game.getByRole("status")).toContainText("Piece held");
    await game.getByRole("button", { name: "B, hard drop piece", exact: true }).click();
    await expect(game.getByRole("status")).toContainText("Piece placed");
    await game.getByRole("button", { name: "Start / Pause, pause game", exact: true }).click();
    await expect(rotate).toBeDisabled();
    await expect(game.getByRole("button", { name: "RESUME", exact: true })).toBeVisible();
    await game.getByRole("button", { name: "RESUME", exact: true }).click();
    await expect(rotate).toBeEnabled();
    await rotate.focus();
    await page.keyboard.press("Enter");
    await expect(rotate).toBeEnabled();
    await game.getByRole("button", { name: "Select, reset game", exact: true }).click();
    await expect(game.getByRole("status")).toContainText("New game started");
  });

}

for (const theme of themes) {
  test(`${theme}: Character Card and copy feedback meet WCAG A/AA axe rules`, async ({ page, isMobile }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator.clipboard, "writeText", {
        value: () => new Promise<void>(resolve => {
          window.addEventListener("finish-copy", () => resolve(), { once: true });
        }),
      });
    });
    await openForAudit(page, "/", theme, isMobile);
    const trigger = page.getByRole("button", { name: "See my character card" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Character Card" });
    await expect(dialog).toBeVisible();
    const divider = dialog.locator('[data-orientation="horizontal"][data-tone="muted"]');
    await expect(divider).toHaveCSS("border-top-style", "dashed");
    const chapterInk = await page.locator("#work").evaluate(section => getComputedStyle(section).borderBottomColor);
    await expect(divider).toHaveCSS("border-top-color", chapterInk);
    await expectAccessible(page, "Character Card");
    const powerBadges = dialog.getByRole("list", { name: "Powers" }).locator("li > span");
    await expect(powerBadges).toHaveCount(10);
    await expect(powerBadges.last()).toHaveText("+ Learns new powers with AI");
    for (const badge of await powerBadges.all()) {
      await expect(badge).toBeVisible();
      await expectTextContrast(badge);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    const contact = page.locator("#contact");
    const copy = contact.getByRole("button", { name: "Copy email" });
    const status = contact.getByRole("status");
    await expect(status).toBeEmpty();
    await copy.focus();
    await page.keyboard.press("Enter");
    await expect(copy).toBeDisabled();
    await expect(copy).toBeFocused();
    await page.clock.install();
    await page.evaluate(() => window.dispatchEvent(new Event("finish-copy")));
    await expect(status).toHaveText("Email address copied to clipboard.");
    await expect(copy).toBeFocused();
    const face = contact.getByText("POW! Copied!", { exact: true });
    await expect(face).toBeVisible();
    await expect(face).toHaveCSS("animation-name", "none");
    const themeInk = await copy.evaluate(el => getComputedStyle(el).borderTopColor);
    await expect(face.locator("..")).toHaveCSS("filter", `drop-shadow(${themeInk} 3px 3px 0px)`);
    await expect.poll(() => face.evaluate(el => getComputedStyle(el, "::before").backgroundColor)).toBe(themeInk);
    await expectAccessible(page, "Contact burst shown");
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`Copy email feedback replays with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => {
      Object.defineProperty(navigator.clipboard, "writeText", { value: async () => {} });
    });
    await page.goto("/");
    await page.clock.install();
    const contact = page.locator("#contact");
    const button = contact.getByRole("button", { name: "Copy email" });
    const overlay = contact.locator(":popover-open");
    const burst = overlay.locator("[data-tone]");
    const status = contact.getByRole("status");
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(status).toHaveText("Email address copied to clipboard.");
    await expect(overlay).toHaveCSS("transition-property", "opacity, visibility");
    if (reducedMotion === "reduce") {
      await expect(overlay).toHaveCSS("transition-duration", "0.12s");
      await expect(burst).toHaveCSS("animation-name", "none");
      await expect(burst).toHaveCSS("transform", "none");
      await expect(burst).toHaveCSS("scale", "none");
    } else {
      await expect(burst).toHaveCSS("animation-duration", "0.3s");
      await expect(burst).toHaveCSS("animation-name", /pop/);
    }
    await expect(overlay).toHaveCSS("outline-style", "solid");
    await page.clock.runFor(1600);
    await page.keyboard.press("Enter");
    await page.clock.runFor(1000);
    await expect(overlay).toHaveCSS("opacity", "1");
    await expect(button).toBeFocused();
    await page.clock.runFor(1400);
    await expect(overlay).toHaveCSS("visibility", "hidden");
    await expect(status).toBeEmpty();
    await expect(button).toHaveCSS("opacity", "1");
  });
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`Character Card has an exit animation and copy errors fade with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(() => {
      Object.defineProperty(navigator.clipboard, "writeText", {
        value: async () => { throw new Error("Clipboard access denied"); },
      });
    });
    await page.goto("/");
    const duration = reducedMotion === "reduce" ? "0.12s" : "0.18s";
    const trigger = page.getByRole("button", { name: "See my character card" });
    const dialog = page.locator("dialog").filter({ hasText: "Character Card" });
    await trigger.press("Enter");
    await expect(dialog).toHaveCSS("animation-duration", duration);
    if (reducedMotion === "reduce") await expect(dialog).toHaveCSS("transform", "none");
    const close = dialog.getByRole("button", { name: "Close character card" });
    await expect(close).toHaveCSS(
      "transition-property",
      reducedMotion === "reduce" ? "opacity, background-color" : "transform, box-shadow, opacity, background-color",
    );
    await expect.poll(() => close.evaluate(el => getComputedStyle(el).transitionDuration.split(",")[0].trim())).toBe("0.12s");
    await dialog.evaluate(element => {
      element.addEventListener("animationstart", event => {
        if (event.target !== element || !element.hasAttribute("data-closing")) return;
        const animation = element.getAnimations().find(item => item instanceof CSSAnimation && item.animationName === (event as AnimationEvent).animationName);
        const keyframes = (animation?.effect as KeyframeEffect | null)?.getKeyframes();
        if (keyframes) element.setAttribute("data-exit-opacity", String(keyframes.at(-1)?.opacity));
      });
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveAttribute("data-exit-opacity", "0");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    const contact = page.locator("#contact");
    await contact.getByRole("button", { name: "Copy email" }).click();
    const error = contact.locator('[data-visible="true"]');
    await expect(error).toHaveText(/Could not copy/);
    await expect(error).toHaveCSS("transition-property", "opacity, display");
    expect(await error.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBe(parseFloat(duration));
  });
}
test("modal interiors use lighter borders and shadows than their frames", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "See my character card" }).click();
  const character = page.getByRole("dialog", { name: "Character Card" });
  await expect(character).toHaveCSS("border-top-width", "3px");
  await expect(character).toHaveCSS("box-shadow", /5px 5px 0px 0px/);
  const innerCards = character.locator("[data-ui-surface]");
  await expect(innerCards).toHaveCount(4);
  for (const card of await innerCards.all()) {
    await expect(card).toHaveCSS("border-top-width", "2px");
    await expect(card).toHaveCSS("box-shadow", /3px 3px 0px 0px/);
  }
  const guild = character.locator("dl > div").filter({ hasText: "Guild / Base" });
  await expect(guild).toHaveCSS("border-top-width", "1px");
  await expect(guild).toHaveCSS("border-bottom-width", "1px");
  await page.keyboard.press("Escape");
  await expect(character).toBeHidden();

  await page.getByRole("button", { name: "Support my work" }).click();
  const support = page.getByRole("dialog", { name: "Fuel the next build" });
  await expect(support).toHaveCSS("box-shadow", /5px 5px 0px 0px/);
  const intro = support.locator('[data-texture="halftone-soft"]');
  await expect(intro).toHaveCSS("border-top-width", "2px");
  await expect(intro).toHaveCSS("box-shadow", "none");
  const options = support.locator("[data-ui-surface]").filter({ has: page.getByRole("link") });
  await expect(options).toHaveCount(2);
  for (const option of await options.all()) {
    await expect(option).toHaveCSS("border-top-width", "2px");
    await expect(option).toHaveCSS("box-shadow", /3px 3px 0px 0px/);
  }
});
