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
    for (const tone of ["default", "accent", "emphasis"]) {
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

test("the catalog lists groups and components in order", async ({ page }) => {
  await page.goto("/playground/");
  const navigation = page.getByRole("navigation", { name: "Component library" });
  const lists = navigation.getByRole("list");
  const catalog = [
    ["Actions", ["Button"]],
    ["Layout & Style", ["Layout & Divider", "Typography", "Surface", "Badge", "Tile"]],
    ["Forms", ["TextInput", "Select", "Checkbox", "Switch", "Field"]],
    ["Navigation", ["Link", "NavbarLinks", "Navbar", "NavigationList"]],
    ["Media", ["Image"]],
    ["Composition", ["Content & feedback", "ConsentNote", "Dialog", "CodeExample"]],
    ["Comic", ["SpeechBubble", "Burst", "Sticker"]],
  ] as const;

  await expect(lists).toHaveCount(catalog.length);
  for (const [index, [group, components]] of catalog.entries()) {
    const list = lists.nth(index);
    await expect(list).toHaveAccessibleName(group);
    await expect(list.getByRole("button")).toHaveText([...components]);
  }
});

test("ConsentNote is narrower in the narrow preview", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/playground/");
  await page.getByRole("button", { name: "ConsentNote", exact: true }).click();

  const notice = page.getByRole("region", { name: "Consent notice" });
  const previewWidth = page.getByRole("combobox", { name: "Preview width" });
  await previewWidth.selectOption("wide");
  const wideWidth = await notice.evaluate((node) => node.getBoundingClientRect().width);

  await previewWidth.selectOption("narrow");
  await expect.poll(() => notice.evaluate((node) => node.getBoundingClientRect().width))
    .toBeLessThan(wideWidth);
});

test("Burst is centered and fits every preview width and size", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "Burst", exact: true }).click();

  const preview = page.getByRole("group", { name: "Live preview" });
  const widthControl = page.getByRole("combobox", { name: "Preview width" });
  const sizeControl = page.getByRole("combobox", { name: "Size", exact: true });

  for (const width of ["narrow", "wide"]) {
    await widthControl.selectOption(width);
    for (const size of ["sm", "md", "lg"]) {
      await test.step(`${width} / ${size}`, async () => {
        await sizeControl.selectOption(size);
        const container = preview.locator(`[data-width="${width}"]`);
        const burst = container.locator(`[data-visible="true"][data-size="${size}"]`);
        await expect(burst).toBeVisible();
        await preview.evaluate(async (node) => {
          await Promise.allSettled(node.getAnimations({ subtree: true }).map((animation) => animation.finished));
        });
        await page.evaluate(() => document.fonts.ready.then(() => undefined));

        const gaps = await burst.evaluate((node) => {
          const bounds = node.getBoundingClientRect();
          const wrapper = node.closest("[data-width]")!.getBoundingClientRect();
          return {
            left: bounds.left - wrapper.left,
            right: wrapper.right - bounds.right,
            top: bounds.top - wrapper.top,
            bottom: wrapper.bottom - bounds.bottom,
            horizontalOverflow: node.scrollWidth - node.clientWidth,
          };
        });
        expect(Math.abs(gaps.left - gaps.right), JSON.stringify(gaps)).toBeLessThanOrEqual(2);
        expect(Math.min(gaps.left, gaps.right, gaps.top, gaps.bottom)).toBeGreaterThanOrEqual(0);
        expect(gaps.horizontalOverflow).toBeLessThanOrEqual(0);
      });
    }
  }
});

test("comic previews wrap at 320px and honor the browser's motion preference", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/playground/");
  await page.getByRole("button", { name: "SpeechBubble", exact: true }).click();
  await page.getByRole("combobox", { name: "Preview width" }).selectOption("narrow");
  const bubble = page.locator("[data-tail]");
  for (const tail of ["bottom-start", "bottom-end", "top-start", "top-end"]) {
    await page.getByRole("combobox", { name: "Tail", exact: true }).selectOption(tail);
    await bubble.evaluate((node) => { node.textContent = "UnbrokenCaption".repeat(12); });
    await expect(bubble).toHaveCSS("overflow-wrap", "anywhere");
    expect(await bubble.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    expect(await bubble.evaluate((node) => getComputedStyle(node, "::after").backgroundColor))
      .toBe(await bubble.evaluate((node) => getComputedStyle(node).backgroundColor));
  }

  await page.getByRole("button", { name: "Burst", exact: true }).click();
  await page.getByRole("checkbox", { name: "Announce feedback" }).check();
  const face = page.locator('[data-tone="accent"][data-size="md"] > div').filter({ hasText: "POW! Copied!" });
  await expect(face).toHaveCSS("animation-name", /fade/);
  await expect(face).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(face).not.toHaveCSS("animation-name", "none");
  await page.getByRole("checkbox", { name: "Animate entry" }).uncheck();
  await expect(face).toHaveCSS("animation-name", "none");
});
