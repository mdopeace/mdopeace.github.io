import { test, expect } from "@playwright/test";

// The portfolio must use the same measure, gutters, and vertical rhythm as
// the QuickTodo landing page, at every viewport. Reference values were
// measured from mdopeace.github.io/quicktodo and live in
// quicktodo/docs/index.css semantics: .wrap { max-width: 980px; padding: 0
// 24px }, section { padding: 64px 0 }, hero padding-top 72px.

const VIEWPORTS = [375, 768, 1024, 1440];

/** Reference values from the QuickTodo landing page, per viewport width. */
function quickTodoReference(vw: number) {
  return {
    contentWidth: vw >= 1024 ? 932 : vw - 48,
    gutter: 24,
    sectionPadY: 64,
    heroPadTop: 72,
  };
}

test.describe("measure matches the quicktodo page", () => {
  for (const vw of VIEWPORTS) {
    test(`content width and gutters at ${vw}px`, async ({ page }) => {
      const ref = quickTodoReference(vw);
      await page.setViewportSize({ width: vw, height: 900 });
      await page.goto("/");

      const m = await page.evaluate(() => {
        const sections = [...document.querySelectorAll("section")];
        const first = sections[0] as HTMLElement;
        const cs = getComputedStyle(first);
        const r = first.getBoundingClientRect();
        return {
          sectionW: Math.round(r.width),
          padLeft: parseFloat(cs.paddingLeft),
          contentW: Math.round(r.width - parseFloat(cs.paddingLeft) * 2),
          sectionPadY: parseFloat(cs.paddingTop),
          heroPadTop: parseFloat(
            getComputedStyle(document.querySelector("header") as HTMLElement)
              .paddingTop,
          ),
        };
      });

      expect(m.padLeft, `gutter at ${vw}px`).toBe(ref.gutter);
      expect(m.contentW, `content width at ${vw}px`).toBe(ref.contentWidth);
      expect(m.sectionPadY, `section padding at ${vw}px`).toBe(ref.sectionPadY);
      expect(m.heroPadTop, `hero top padding at ${vw}px`).toBe(ref.heroPadTop);
    });
  }

  test("every section shares the same measure and rhythm", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const widths = await page.evaluate(() =>
      [...document.querySelectorAll("section, header")].map(
        (s) => Math.round(s.getBoundingClientRect().width),
      ),
    );
    expect(new Set(widths).size, `sections disagree: ${widths.join(", ")}`).toBe(1);
    expect(widths[0]).toBe(980);
  });

  test("project cards sit inside the content width, not outside it", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const card = (await page.locator("article").first().boundingBox())!;
    expect(card.width, "card is wider than the 932px content measure").toBeLessThanOrEqual(932);

    const section = (await page.locator("section").first().boundingBox())!;
    expect(card.x, "card escapes the gutter").toBeGreaterThanOrEqual(section.x + 24);
  });
});