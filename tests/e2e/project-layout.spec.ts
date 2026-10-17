import { test, expect } from "@playwright/test";

// The two-column grid split the 980px measure in half, producing 454x982
// cards — a 2.2:1 vertical ribbon where text wrapped to ~40 characters.
// These tests pin the row layout instead.

const CARD_MAX_ASPECT = 1.15; // width/height — no taller than roughly square

async function cardBox(page: import("@playwright/test").Page) {
  return page.locator("article").first().boundingBox();
}

test.describe("project layout", () => {
  test("cards use the full content measure, not half of it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const box = await cardBox(page);
    expect(box!.width, "card is only using half the measure").toBeGreaterThan(700);
  });

  test("cards are not taller than they are wide", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const box = await cardBox(page);
    const aspect = box!.width / box!.height;
    expect(
      aspect,
      `card aspect is ${aspect.toFixed(2)}:1 (${Math.round(box!.width)}x${Math.round(box!.height)}) — still a vertical ribbon`,
    ).toBeGreaterThan(CARD_MAX_ASPECT);
  });

  test("both projects are still on the page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("article")).toHaveCount(2);
    await expect(page.getByRole("heading", { name: "QuickTodo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Vidp" })).toBeVisible();
  });

  test("every piece of content survives the layout change", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // "the ones QuickTodo holds" appears in vidp's copy too, so match the
    // heading rather than the body text.
    const qt = page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "QuickTodo", exact: true }) });
    await expect(qt.getByText("A todo app that lives in your Mac menu bar.")).toBeVisible();
    await expect(qt.getByText(/Standup hands me five things/)).toBeVisible();
    await expect(qt.getByText("brew install --cask quicktodo")).toBeVisible();
    await expect(qt.getByText("macOS 13 or newer")).toBeVisible();
    for (const link of ["Source", "Releases", "Live page", "Homebrew tap"]) {
      await expect(qt.getByRole("link", { name: link })).toBeVisible();
    }

    const vd = page
      .locator("article")
      .filter({ has: page.getByRole("heading", { name: "Vidp", exact: true }) });
    await expect(vd.getByText("A keyboard-driven video player built on libmpv.")).toBeVisible();
    await expect(vd.getByText(/Apple Silicon only/)).toBeVisible();
    await expect(vd.getByText("Screenshot coming")).toBeVisible();
  });

  test("screenshot sits beside the text, not above it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const img = await page
      .locator('img[src*="raw.githubusercontent.com/mdopeace/quicktodo"]')
      .boundingBox();
    const heading = await page
      .locator("article")
      .first()
      .getByRole("heading", { name: "QuickTodo" })
      .boundingBox();

    // Beside means the image sits in the same grid row as the text: the image
    // is left of the heading, and its vertical centre falls inside the text
    // column's span. Vertical overlap with the h3 is not the test — the image
    // is centred against the whole column, not against the heading.
    expect(
      img!.x + img!.width,
      "image is not to the left of the text — they are stacked",
    ).toBeLessThanOrEqual(heading!.x);

    const textCol = (await page
      .locator("article")
      .first()
      .locator(":scope > div")
      .nth(1)
      .boundingBox())!;
    const imgMid = img!.y + img!.height / 2;
    expect(
      imgMid,
      "image centre is outside the text column — not a shared row",
    ).toBeGreaterThanOrEqual(textCol.y);
    expect(imgMid).toBeLessThanOrEqual(textCol.y + textCol.height);
  });

  test("still no horizontal overflow, and fine on a phone", async ({ page }) => {
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });

  test("the projects section is not taller than the viewport twice over", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const cards = page.locator("article");
    const first = (await cards.first().boundingBox())!;
    const second = (await cards.nth(1).boundingBox())!;
    const sectionHeight = second.y + second.height - first.y;
    expect(
      sectionHeight,
      "the projects section is unreasonably tall",
    ).toBeLessThan(1400);
  });
});