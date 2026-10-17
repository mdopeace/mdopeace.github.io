import { test, expect } from "@playwright/test";

// Every value here was measured from mdopeace.github.io/quicktodo, not
// assumed. Its structure is:
//   body > .wrap (max-width 980, padding 0 24px) > section (padding 64px 0)
// so sections carry ZERO horizontal padding, and the border-top spans the
// 932px content box — not the 980px wrap. An earlier version put
// max-width and 24px padding on each section, which made the rules stick
// out 24px past the text on both sides.

const VIEWPORTS = [375, 768, 1024, 1440];

function ref(vw: number) {
  return {
    wrapW: Math.min(vw, 980),
    gutter: 24,
    contentW: Math.min(vw, 980) - 48,
    sectionPadX: 0,
    sectionPadY: 64,
    heroPadTop: 72,
    heroPadBottom: 64,
  };
}

async function measure(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const wrap = document.querySelector("main")!.parentElement as HTMLElement;
    const sec = document.querySelector("section") as HTMLElement;
    const hdr = document.querySelector("header") as HTMLElement;
    const wcs = getComputedStyle(wrap);
    const scs = getComputedStyle(sec);
    const hcs = getComputedStyle(hdr);
    const sr = sec.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    const label = (sec.querySelector("h2, p") as HTMLElement).getBoundingClientRect();
    return {
      wrapX: Math.round(wr.x),
      wrapW: Math.round(wr.width),
      wrapPadX: parseFloat(wcs.paddingLeft),
      sectionX: Math.round(sr.x),
      sectionW: Math.round(sr.width),
      sectionPadX: parseFloat(scs.paddingLeft),
      sectionPadY: parseFloat(scs.paddingTop),
      labelX: Math.round(label.x),
      heroPadTop: parseFloat(hcs.paddingTop),
      heroPadBottom: parseFloat(hcs.paddingBottom),
      heroPadX: parseFloat(hcs.paddingLeft),
    };
  });
}

test.describe("measure matches the quicktodo page", () => {
  for (const vw of VIEWPORTS) {
    test(`geometry at ${vw}px`, async ({ page }) => {
      const r = ref(vw);
      await page.setViewportSize({ width: vw, height: 900 });
      await page.goto("/");
      const m = await measure(page);

      expect(m.wrapW, `wrap width at ${vw}px`).toBe(r.wrapW);
      expect(m.wrapPadX, `wrap gutter at ${vw}px`).toBe(r.gutter);
      expect(m.sectionW, `section width at ${vw}px`).toBe(r.contentW);

      // The whole point: sections carry no horizontal padding, so the rule
      // spans exactly the content box.
      expect(m.sectionPadX, `section horizontal padding at ${vw}px`).toBe(r.sectionPadX);
      expect(m.sectionPadY, `section vertical padding at ${vw}px`).toBe(r.sectionPadY);
      expect(m.labelX - m.sectionX, "label is inset from the section").toBe(0);

      expect(m.heroPadTop, `hero top padding at ${vw}px`).toBe(r.heroPadTop);
      expect(m.heroPadBottom, `hero bottom padding at ${vw}px`).toBe(r.heroPadBottom);
      expect(m.heroPadX, "hero carries no horizontal padding of its own").toBe(0);
    });
  }

  test("the rule spans the content box, not the full 980px wrap", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const m = await measure(page);

    // 24px of wrap gutter on each side must NOT be inside the border.
    expect(m.sectionX, "section starts outside the gutter").toBe(m.wrapX + 24);
    expect(m.sectionW, "border is 24px wider on each side than the text").toBe(932);
  });

  test("section labels align with the rule and the body text", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const xs = await page.evaluate(() =>
      [...document.querySelectorAll("section")]
        .map((s) => {
          const l = s.querySelector("h2, p") as HTMLElement;
          return Math.round(l.getBoundingClientRect().x);
        })
        .concat([
          Math.round(
            (document.querySelector("header h1") as HTMLElement).getBoundingClientRect().x,
          ),
        ]),
    );
    expect(new Set(xs).size, `left edges disagree: ${xs.join(", ")}`).toBe(1);
  });

  test("project cards stay inside the content width", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const m = await measure(page);
    const card = (await page.locator("article").first().boundingBox())!;
    expect(card.x, "card escapes the content box").toBeGreaterThanOrEqual(m.sectionX);
    expect(card.x + card.width, "card overflows the content box").toBeLessThanOrEqual(
      m.sectionX + m.sectionW,
    );
  });
});