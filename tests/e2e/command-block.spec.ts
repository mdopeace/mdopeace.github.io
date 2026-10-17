import { test, expect } from "@playwright/test";

// The command block and the requirements each take half the measure. The
// copy button sits below the command rather than beside it: half of 62ch is
// 261px, and a command line plus a button side by side needs ~308px, which
// wrapped the command onto three lines.


test.describe("command block is a 50/50 split", () => {
  test("the command column is wider than the requirements column", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    const halves = await page.evaluate(() =>
      [...document.querySelectorAll("article")].map((a) => {
        const grid = a
          .querySelector("code")!
          .closest('.install')!;
        const [cmd, req] = [grid.firstElementChild!, grid.lastElementChild!];
        return {
          name: a.querySelector("h2")!.textContent,
          cmd: Math.round(cmd.getBoundingClientRect().width),
          req: Math.round(req.getBoundingClientRect().width),
        };
      }),
    );

    for (const h of halves) {
      // 60/40: the command needs ~308px for two lines plus the button, which
      // does not fit in half of a 62ch measure.
      expect(
        h.cmd / h.req,
        `${h.name}: ratio is ${(h.cmd / h.req).toFixed(2)}, want ~1.5-1.7`,
      ).toBeGreaterThan(1.4);
      expect(h.cmd / h.req).toBeLessThan(1.75);
    }
  });

  test("the grid resolves to two columns at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");
    const cols = await page.evaluate(() => {
      const grid = document
        .querySelector("article code")!
        .closest('.install')!;
      return getComputedStyle(grid).gridTemplateColumns.split(" ");
    });
    expect(cols, "should be two columns at 1440px").toHaveLength(2);
  });

  test("requirements sit outside the bordered command box", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    const borders = await page.evaluate(() =>
      [...document.querySelectorAll("article")].map((a) => {
        const grid = a
          .querySelector("code")!
          .closest('.install')!;
        const [cmd, req] = [grid.firstElementChild!, grid.lastElementChild!];
        return {
          name: a.querySelector("h2")!.textContent,
          cmdBorder: getComputedStyle(cmd).borderTopWidth,
          reqBorder: getComputedStyle(req).borderTopWidth,
          reqLeftOfCmd: req.getBoundingClientRect().left > cmd.getBoundingClientRect().left,
        };
      }),
    );
    for (const b of borders) {
      expect(parseFloat(b.cmdBorder), `${b.name}: command lost its border`).toBeGreaterThan(0);
      expect(parseFloat(b.reqBorder), `${b.name}: requirements should not be boxed`).toBe(0);
      expect(b.reqLeftOfCmd, `${b.name}: requirements not to the right`).toBe(true);
    }
  });

  test("each command stays on one line", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    const heights = await page.evaluate(() =>
      [...document.querySelectorAll("article code")].map((c) =>
        Math.round(c.getBoundingClientRect().height),
      ),
    );
    // 13px monospace at 1.55 line-height is ~20px; a wrapped line is ~40px.
    for (const h of heights) {
      expect(h, "command wrapped onto a second line").toBeLessThan(28);
    }
  });

  test("the copy button sits beside the command, not below it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/index.html");

    const geo = await page.evaluate(() => {
      const box = document
        .querySelector("article code")!
        .closest('.cmd')!;
      const btn = box.querySelector("button")!;
      const first = box.querySelector("code")!;
      const br = btn.getBoundingClientRect();
      const fr = first.getBoundingClientRect();
      return {
        inside: box.contains(btn),
        // Beside = to the right of the command text, sharing its row.
        toRight: br.left > fr.left + fr.width - 2,
        sameRow: br.top < fr.bottom && fr.top < br.bottom,
      };
    });
    expect(geo.inside, "button should be in the command box").toBe(true);
    expect(geo.toRight, "button should be to the right of the command").toBe(true);
    expect(geo.sameRow, "button should share the command's row").toBe(true);
  });


});