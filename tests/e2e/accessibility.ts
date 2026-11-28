import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

export const themes = ["light", "dark"] as const;

export async function openForAudit(page: Page, path: string, theme: (typeof themes)[number], isMobile: boolean) {
  await page.setViewportSize(isMobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
  await page.addInitScript(theme => localStorage.setItem("portfolio-theme", theme), theme);
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
  await page.evaluate(() => document.fonts.ready);
}

export async function expectAccessible(page: Page, state: string) {
  await test.step(`axe · ${state}`, async () => {
    await page.evaluate(async () => {
      const finite = document.getAnimations().filter(animation =>
        Number.isFinite(animation.effect?.getComputedTiming().endTime),
      );
      await Promise.allSettled(finite.map(animation => animation.finished));
    });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(violations.map(({ id, nodes }) => ({
      id,
      nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    }))).toEqual([]);
  });
}

export async function expectTextContrast(locator: Locator, backgroundPseudo?: string, svgBackground?: string) {
  const { ratio, foregroundColor, backgroundColor } = await locator.evaluate(async (element, { pseudo, svgBackground }) => {
    // A tone change fades the entire preview, not just the text node.
    // Let the new preview settle before measuring its final contrast.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const preview = element.closest('[aria-label="Live preview"]') ?? element;
    const animations = preview.getAnimations({ subtree: true }).filter(animation =>
      Number.isFinite(animation.effect?.getComputedTiming().endTime),
    );
    await Promise.allSettled(animations.map(animation => animation.finished));
    const foregroundColor = getComputedStyle(element).color;
    const svgFace = svgBackground && element.querySelector(svgBackground);
    const backgroundColor = svgFace ? getComputedStyle(svgFace).fill : getComputedStyle(element, pseudo).backgroundColor;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    function luminance(color: string) {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data;
      if (alpha !== 255) throw new Error(`Expected an opaque contrast color, got ${color}`);
      const linear = [r, g, b].map(value => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }
    const foreground = luminance(foregroundColor);
    const background = luminance(backgroundColor);
    return {
      ratio: (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05),
      foregroundColor,
      backgroundColor,
    };
  }, { pseudo: backgroundPseudo, svgBackground });
  expect(ratio, `Text contrast of ${foregroundColor} on ${backgroundColor}`).toBeGreaterThanOrEqual(4.5);
}
