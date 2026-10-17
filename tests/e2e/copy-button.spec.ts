import { test, expect } from "@playwright/test";

// The command block gains a copy button matching QuickTodo's: same palette
// for done/failed states, aria-live so the change is announced, and a
// "press ⌘C" fallback when the clipboard API rejects.

test.describe("copy button on brew commands", () => {
  test("each project's command block has a copy button", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    await expect(page.getByRole("button", { name: "copy" })).toHaveCount(2);
  });

  test("clicking copies the full two-line command", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    await page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "QuickTodo" }) })
      .getByRole("button", { name: "copy" })
      .click();

    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe(
      "brew tap mdopeace/quicktodo\nbrew install --cask quicktodo",
    );
  });

  test("the button confirms with 'copied' then resets", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    const btn = page.getByRole("button", { name: "copy" }).first();
    await btn.click();
    await expect(page.getByRole("button", { name: "copied" })).toBeVisible();

    // QuickTodo flashes for 1400ms; allow a little slack for CI timing.
    await expect(page.getByRole("button", { name: "copy" }).first()).toBeVisible({
      timeout: 4000,
    });
  });

  test("the button is announced politely", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    await expect(page.getByRole("button", { name: "copy" }).first()).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  test("the button is keyboard reachable and has a visible focus ring", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const btn = page.getByRole("button", { name: "copy" }).first();
    await btn.focus();
    const outline = await btn.evaluate((n) => {
      const s = getComputedStyle(n);
      return { width: s.outlineWidth, style: s.outlineStyle, colour: s.outlineColor };
    });
    expect(outline.style).not.toBe("none");
    expect(parseFloat(outline.width)).toBeGreaterThan(0);
  });

  test("clicking one card's button does not touch the other", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    await page.getByRole("button", { name: "copy" }).nth(1).click();
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe("brew tap mdopeace/vidp\nbrew install --cask vidp");
    await expect(page.getByRole("button", { name: "copy" }).first()).toBeVisible();
  });

  test("the command text is still readable and not clipped", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/index.html");

    // Both commands now share one <code>, so assert on its text content
    // and that the block overflows neither the viewport nor itself.
    for (const [tap, install] of [
      ["brew tap mdopeace/quicktodo", "brew install --cask quicktodo"],
      ["brew tap mdopeace/vidp", "brew install --cask vidp"],
    ]) {
      // Two separate <code> lines, so assert each on its own element.
      await expect(page.getByText(tap, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(install, { exact: true }).first()).toBeVisible();

      for (const cmd of [tap, install]) {
        const code = page.getByText(cmd, { exact: true }).first();
        const clipped = await code.evaluate((n) => n.scrollWidth > n.clientWidth + 1);
        expect(clipped, `${cmd} is clipped`).toBe(false);
      }
    }

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});