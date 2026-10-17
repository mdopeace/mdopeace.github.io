import { test, expect } from "@playwright/test";

// The text column is taller than the screenshot, so a top-aligned image
// leaves a large empty block under it. The image column should be centred
// against the text, so the slack splits above and below rather than pooling
// in one place.

async function imageSlack(page: import("@playwright/test").Page, slug: string) {
  return page.evaluate((s) => {
    const card = [...document.querySelectorAll("article")].find(
      (a) =>
        a.querySelector("h2")?.textContent?.trim().toLowerCase() === s,
    ) as HTMLElement;
    const imgCol = card.firstElementChild as HTMLElement;
    const textCol = imgCol.nextElementSibling as HTMLElement;
    // Measure the <img> itself. The grid column div stretches to the full row
    // height, so measuring the div reports zero slack no matter what.
    const media = (imgCol.querySelector("img") ??
      imgCol.firstElementChild) as HTMLElement;
    const mb = media.getBoundingClientRect();
    const tb = textCol.getBoundingClientRect();
    return {
      above: Math.round(mb.top - tb.top),
      below: Math.round(tb.bottom - mb.bottom),
      imgH: Math.round(mb.height),
      textH: Math.round(tb.height),
    };
  }, slug);
}

test.describe("project card image alignment", () => {
  test("quicktodo's image is vertically centred against its text", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const m = await imageSlack(page, "quicktodo");

    // Nothing should pool entirely below the image.
    expect(
      m.below,
      `image leaves ${m.below}px of dead space below it (image ${m.imgH}px, text ${m.textH}px)`,
    ).toBeLessThan(48);
    expect(Math.abs(m.above - m.below), "image is not centred").toBeLessThan(48);
  });

  test("both cards have their image column centred", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    for (const slug of ["quicktodo", "vidp"]) {
      const m = await imageSlack(page, slug);
      expect(
        Math.abs(m.above - m.below),
        `${slug}: image is top-aligned, slack pools below`,
      ).toBeLessThan(48);
    }
  });

  test("cards are still rows at desktop and stacked on a phone", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const cols = await page.evaluate(() => {
      const card = document.querySelector("article") as HTMLElement;
      return getComputedStyle(card).gridTemplateColumns.split(" ").length;
    });
    expect(cols, "desktop card is not a two-column row").toBe(2);

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/index.html");
    const colsMobile = await page.evaluate(() => {
      const card = document.querySelector("article") as HTMLElement;
      return getComputedStyle(card).gridTemplateColumns.split(" ").length;
    });
    expect(colsMobile, "mobile card did not stack").toBe(1);
  });

  test("no content is clipped by centring", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    await expect(page.getByText("brew install --cask quicktodo")).toBeVisible();
    await expect(page.getByRole("link", { name: "Homebrew tap" }).first()).toBeVisible();

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});