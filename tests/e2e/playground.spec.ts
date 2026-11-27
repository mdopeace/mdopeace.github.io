import { expect, test } from "@playwright/test";
import { catalog } from "./playground-catalog";

test("Dialog sizes share the same page gutters on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/playground/");
  await page.getByRole("button", { name: "Dialog", exact: true }).click();
  const sizes = page.getByRole("combobox", { name: "Size", exact: true });
  const trigger = page.getByRole("button", { name: "Open example dialog" });
  const dialog = page.getByRole("dialog", { name: "Room for one idea." });
  for (const size of ["sm", "md", "lg"]) {
    await sizes.selectOption(size);
    await trigger.click();
    await expect(dialog).toHaveCSS("width", "366px");
    await expect(dialog).toHaveAttribute("data-size", size);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  }
});

test("Surface previews corner and paper textures and generates usage", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "Surface", exact: true }).click();
  const stage = page.getByRole("group", { name: "Live preview" });
  await expect(stage.locator('[data-texture="halftone"]')).toHaveCount(0);
  const texture = page.getByRole("combobox", { name: "Surface texture" });
  await texture.selectOption("halftone");
  const surface = stage.locator('[data-texture="halftone"]');
  await expect(surface).toBeVisible();
  expect(await surface.evaluate(element => getComputedStyle(element, "::before").backgroundImage)).toContain("radial-gradient");
  await expect(page.getByLabel("Usage example", { exact: true })).toContainText('texture="halftone"');
  await texture.selectOption("halftone-soft");
  const soft = stage.locator('[data-texture="halftone-soft"]');
  await expect(soft).toBeVisible();
  await expect.poll(() => soft.evaluate(element => getComputedStyle(element, "::before").opacity)).toBe("0.12");
  await expect(page.getByLabel("Usage example", { exact: true })).toContainText('texture="halftone-soft"');
  for (const [paper, spacing] of [["paper", "6px"], ["paper-soft", "7px"]]) {
    await texture.selectOption(paper);
    const sample = stage.locator(`[data-texture="${paper}"]`);
    await expect(sample).toHaveCSS("background-image", /radial-gradient/);
    await expect(sample).toHaveCSS("background-size", `${spacing} ${spacing}`);
    await expect(page.getByLabel("Usage example", { exact: true })).toContainText(`texture="${paper}"`);
  }
});

test("Typography previews both display sizes and updates the usage example", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "Typography", exact: true }).click();
  const heading = page.getByRole("group", { name: "Live preview" })
    .getByRole("heading", { level: 3, name: "Make the useful thing." });
  const size = page.getByRole("combobox", { name: "Heading size", exact: true });
  const code = page.getByLabel("Usage example", { exact: true });
  const fontSize = () => heading.evaluate(element => parseFloat(getComputedStyle(element).fontSize));
  const feature = await fontSize();
  await size.selectOption("display");
  await expect(heading).toHaveAttribute("data-size", "display");
  await expect(code).toContainText('size="display"');
  await expect.poll(fontSize).toBeGreaterThan(feature);
  const display = await fontSize();
  await size.selectOption("display-compact");
  await expect(heading).toHaveAttribute("data-size", "display-compact");
  await expect(code).toContainText('size="display-compact"');
  await expect.poll(fontSize).toBeLessThan(display);
  const weight = page.getByRole("combobox", { name: "Heading weight", exact: true });
  await weight.selectOption("bold");
  await expect(heading).toHaveCSS("font-weight", "700");
  await expect(code).toContainText('weight="bold"');
  await weight.selectOption("black");
  await expect(heading).toHaveCSS("font-weight", "900");
  await weight.selectOption("default");
  await expect(code).not.toContainText("weight=");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("raised buttons use shared padding and icon gaps at each size", async ({ page }) => {
  await page.goto("/playground/");
  const preview = page.getByRole("group", { name: "Live preview" });
  const button = preview.getByRole("button", { name: "Make something" });
  const size = page.getByRole("combobox", { name: "Size", exact: true });
  for (const [value, padding, gap] of [
    ["sm", "4px 8px", "8px"],
    ["md", "8px 12px", "12px"],
    ["lg", "12px 16px", "12px"],
  ]) {
    await size.selectOption(value);
    await expect(button).toHaveCSS("padding", padding);
    await expect(button).toHaveCSS("gap", gap);
  }
});

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: code frames stay flat and Burst matches raised Button depth`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    await page.goto("/playground/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const catalog = page.getByRole("navigation", { name: "Component library" });
    const preview = page.getByRole("group", { name: "Live preview" });
    await expect(preview.getByRole("button", { name: "Make something" })).toHaveCSS("box-shadow", /3px 3px 0px 0px/);

    await catalog.getByRole("button", { name: "Burst", exact: true }).click();
    await expect(preview.locator('[data-visible="true"][data-size]')).toHaveCSS("filter", /drop-shadow\(.*3px 3px 0px\)/);

    await catalog.getByRole("button", { name: "CodeExample", exact: true }).click();
    const demo = preview.locator('[data-ui-surface][data-border="standard"]');
    const snippet = page.locator('[data-ui-surface][data-border="none"]').filter({
      has: page.getByLabel("Usage example", { exact: true }),
    });
    await expect(demo).toHaveCSS("box-shadow", "none");
    await expect(demo).toHaveCSS("border-top-width", "2px");
    await expect(demo).toHaveCSS("padding", "16px");
    await expect(snippet).toHaveCSS("box-shadow", "none");
    await expect(snippet).toHaveCSS("border-top-width", "1px");
    await expect(snippet).toHaveCSS("border-inline-start-width", "0px");
  });

  test(`${theme}: portfolio and playground footers share caption typography`, async ({ page }) => {
    await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
    const typography = [];
    for (const path of ["/", "/playground/"]) {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const caption = page.getByRole("contentinfo").locator('p[data-font="mono"]');
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
    const tryIt = project.getByRole("link", { name: "Explore the playground", exact: true });
    await expect(tryIt).toHaveAttribute("href", "/playground/");
    await tryIt.focus();
    await expect(tryIt).toHaveCSS("outline-style", "solid");
    await page.keyboard.press("Enter");
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
  await expect(previewWidth).toBeVisible();
  await previewWidth.selectOption("wide");
  const wideWidth = await notice.evaluate((node) => node.getBoundingClientRect().width);

  await previewWidth.selectOption("narrow");
  await expect.poll(() => notice.evaluate((node) => node.getBoundingClientRect().width))
    .toBeLessThan(wideWidth);
});

test("Burst has no width control and is centered at every size", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "Burst", exact: true }).click();

  const preview = page.getByRole("group", { name: "Live preview" });
  const widthControl = page.getByRole("combobox", { name: "Preview width" });
  const sizeControl = page.getByRole("combobox", { name: "Size", exact: true });

  await expect(widthControl).toHaveCount(0);
  const container = preview.locator('[data-width="wide"]');
  for (const size of ["sm", "md", "lg"]) {
    await test.step(size, async () => {
      await sizeControl.selectOption(size);
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
      expect(Math.abs(gaps.top - gaps.bottom), JSON.stringify(gaps)).toBeLessThanOrEqual(2);
      expect(Math.min(gaps.left, gaps.right, gaps.top, gaps.bottom)).toBeGreaterThanOrEqual(0);
      expect(gaps.horizontalOverflow).toBeLessThanOrEqual(0);
    });
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
