import { expect, test } from "@playwright/test";
import { expectAccessible, expectTextContrast, openForAudit, themes } from "./accessibility";

test("Playground ComicPanel previews an optional title and regular caption", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "ComicPanel", exact: true }).click();
  const caption = page.getByRole("group", { name: "Live preview" }).locator("figcaption");
  await expect(caption.locator("strong")).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Caption title" }).check();
  await expect(caption.locator("strong")).toHaveText("1. Find a spark");
  await expect(caption.getByText("Start with one observation worth drawing.")).toHaveCSS("font-weight", "400");
  await expect(page.getByLabel("Usage example", { exact: true })).toContainText('captionTitle="1. Find a spark"');
});

test("Playground ComicStrip exposes caption alignment and its generated code", async ({ page }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "ComicStrip", exact: true }).click();
  const strip = page.getByRole("group", { name: "Paper plane story" });
  await expect(strip).not.toHaveAttribute("data-align-captions", "true");
  await page.getByRole("checkbox", { name: "Align captions" }).check();
  await expect(strip).toHaveAttribute("data-align-captions", "true");
  await expect(page.getByLabel("Usage example", { exact: true })).toContainText("alignCaptions");
});

for (const theme of themes) {
  test(`${theme}: nested project panels use standard borders while playground defaults to strong`, async ({ page, isMobile }) => {
    await openForAudit(page, "/", theme, isMobile);
    await page.getByRole("button", { name: "View project: QuickTodo" }).click();
    const quickTodo = page.getByRole("group", { name: "QuickTodo comic strip" }).getByRole("figure");
    await expect(quickTodo).toHaveCount(3);
    const projectPanels = page.locator("#work dialog figure");
    await expect(projectPanels).toHaveCount(12);
    for (const panel of await projectPanels.all()) {
      await expect(panel).toHaveCSS("border-top-width", "2px");
      await expect(panel).toHaveCSS("box-shadow", /5px 5px 0px 0px/);
    }
    await page.goto("/playground/");
    const preview = page.getByRole("group", { name: "Live preview" });
    for (const component of ["ComicPanel", "ComicStrip"]) {
      await page.getByRole("button", { name: component, exact: true }).click();
      const panels = preview.getByRole("figure");
      await expect(panels).toHaveCount(component === "ComicPanel" ? 1 : 3);
      for (const panel of await panels.all()) await expect(panel).toHaveCSS("border-top-width", "3px");
      await page.getByLabel("Panel border", { exact: true }).selectOption("standard");
      for (const panel of await panels.all()) await expect(panel).toHaveCSS("border-top-width", "2px");
      await expect(page.getByLabel("Usage example", { exact: true })).toContainText('border="standard"');
    }
  });
}

test("the strip preserves panel reading order as it reflows", async ({ page, isMobile }) => {
  await page.goto("/playground/");
  await page.getByRole("button", { name: "ComicStrip", exact: true }).click();
  const strip = page.getByRole("group", { name: "Paper plane story" });
  const captions = strip.locator("figcaption");
  await expect(captions).toHaveText(["1. Find a spark", "2. Take flight", "3. Keep exploring"]);
  const positions = () => strip.getByRole("figure").evaluateAll(panels =>
    panels.map(panel => ({ x: panel.getBoundingClientRect().x, y: panel.getBoundingClientRect().y })),
  );
  const expectStack = async () => {
    const [first, second, third] = await positions();
    expect(first.x).toBe(second.x);
    expect(second.x).toBe(third.x);
    expect(first.y).toBeLessThan(second.y);
    expect(second.y).toBeLessThan(third.y);
  };

  if (isMobile) {
    await expectStack();
  } else {
    const [first, second, third] = await positions();
    expect(first.y).toBe(second.y);
    expect(second.y).toBe(third.y);
    expect(first.x).toBeLessThan(second.x);
    expect(second.x).toBeLessThan(third.x);
  }
  await page.getByLabel("Preview width").selectOption("narrow");
  await expectStack();
  await expect(captions).toHaveText(["1. Find a spark", "2. Take flight", "3. Keep exploring"]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
});

test("the clip fades between playing and still states without moving its frame", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/paper-plane.webm", route => route.continue());
  page.on("request", request => {
    if (request.url().endsWith("/paper-plane.webm")) requests.push(request.url());
  });
  await page.goto("/playground/");
  await page.getByRole("button", { name: "ComicStrip", exact: true }).click();
  const strip = page.getByRole("group", { name: "Paper plane story" });
  const frame = strip.getByRole("img", { name: "A paper plane glides past a yellow sun" });
  const spark = strip.getByRole("img", { name: "A red lightning bolt inside a starburst" });
  const video = frame.locator("video");
  const poster = frame.locator("img");
  const playback = strip.getByRole("button", { name: "Animate panel" });
  const status = strip.getByRole("status");
  await expect(status).toHaveCount(1);
  await expect(status).toBeVisible();
  await expect(status).toHaveText("Showing the still image.", { useInnerText: true });
  const activeStatus = status.locator("[data-active='true']");
  await expect(activeStatus).toHaveCSS("transition-property", "opacity, visibility");
  await expect.poll(() => activeStatus.evaluate(el => getComputedStyle(el).transitionDuration.split(",")[0].trim())).toBe("0.12s");
  await expect(spark).toHaveCSS("transition-property", "opacity");
  await expect(spark).toHaveCSS("transition-duration", "0.12s");
  await expect.poll(() => poster.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(432);
  await expect(video).not.toHaveAttribute("src");
  await expect(video).toHaveCSS("opacity", "0");
  await expect(video).toHaveCSS("transition-property", "opacity");
  await expect(video).toHaveCSS("transition-duration", "0.12s");
  await expect(video).toHaveCSS("transform", "none");
  await expect(playback).toBeDisabled();
  await playback.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(playback).toBeFocused();
  await expect(playback).toHaveCSS("outline-style", "solid");
  await playback.hover({ force: true });
  await expect(playback).toHaveCSS("transform", "none");
  await page.keyboard.press("Space");
  await expect(playback).toHaveAttribute("aria-pressed", "false");
  expect(requests).toHaveLength(0);
  const before = await frame.boundingBox();
  const stripBefore = await strip.boundingBox();

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(video).toHaveJSProperty("muted", true);
  await expect(video).toHaveJSProperty("loop", true);
  await expect(video).toHaveJSProperty("paused", false);
  await expect(video).toHaveCSS("transition-duration", "0.18s");
  await expect(spark).toHaveCSS("transition-duration", "0.18s");
  await expect(video).toHaveCSS("opacity", "1");
  await expect(status).toHaveText("Video playing.", { useInnerText: true });
  await expect.poll(() => activeStatus.evaluate(el => getComputedStyle(el).transitionDuration.split(",")[0].trim())).toBe("0.18s");
  await expect(playback).toHaveAttribute("aria-pressed", "true");
  expect(await video.evaluate(node => (node as HTMLVideoElement).duration)).toBeCloseTo(3);
  const loadedRequests = requests.length;
  const background = await playback.evaluate(button => getComputedStyle(button).backgroundColor);

  await page.keyboard.press("Space");
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveCSS("opacity", "0");
  await expect(playback).toBeFocused();
  await expect(playback).toHaveCSS("background-color", background);
  await expect(status).toHaveText("Video paused.", { useInnerText: true });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(status).toHaveText("Showing the still image.", { useInnerText: true });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(status).toHaveText("Video paused.", { useInnerText: true });
  await expect(video).toHaveJSProperty("paused", true);
  await page.keyboard.press("Enter");
  await expect(video).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveCSS("opacity", "0");
  await expect(playback).toBeDisabled();
  await expect(playback).toBeFocused();
  await expect(status).toHaveText("Showing the still image.", { useInnerText: true });
  expect(await frame.boundingBox()).toEqual(before);
  expect(await strip.boundingBox()).toEqual(stripBefore);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(status).toHaveText("Video playing.", { useInnerText: true });
  expect(requests).toHaveLength(loadedRequests);
});

for (const theme of themes) {
  test(`${theme}: panel fits both preview widths and comic states pass axe`, async ({ page, isMobile }) => {
    await openForAudit(page, "/playground/", theme, isMobile);
    const preview = page.getByRole("group", { name: "Live preview" });
    await page.getByRole("button", { name: "ComicPanel", exact: true }).click();
    const panel = preview.getByRole("figure");
    const artwork = panel.getByRole("img");
    const widthControl = page.getByLabel("Preview width");
    await expectTextContrast(preview.locator("figcaption"));
    for (const width of ["wide", "narrow"]) {
      await widthControl.selectOption(width);
      const container = preview.locator(`[data-width="${width}"]`);
      const containerBox = (await container.boundingBox())!;
      const panelBox = (await panel.boundingBox())!;
      const artworkBox = (await artwork.boundingBox())!;
      expect(panelBox.x).toBeGreaterThanOrEqual(containerBox.x);
      expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width);
      expect(artworkBox.x).toBeGreaterThan(panelBox.x);
      expect(artworkBox.x + artworkBox.width).toBeLessThan(panelBox.x + panelBox.width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
      await expectAccessible(page, `comic panel with ${width} preview`);
    }
    await widthControl.selectOption("wide");
    await page.getByRole("button", { name: "ComicStrip", exact: true }).click();
    const playback = preview.getByRole("button", { name: "Animate panel" });
    await expectTextContrast(playback);
    await expectAccessible(page, "comic strip with reduced motion");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(playback).toHaveAttribute("aria-pressed", "true");
    await expectAccessible(page, "comic strip with video playing");
    await playback.click();
    await expect(playback).toHaveAttribute("aria-pressed", "false");
    await expectAccessible(page, "comic strip with video paused");

    await page.route("**/paper-plane.webm", route => route.abort());
    await page.getByRole("button", { name: "Reset example" }).click();
    await expect(playback).toBeDisabled();
    await expect(playback).toHaveAccessibleDescription("Video unavailable. Showing the still image.");
    await expect(preview.getByRole("status")).toBeVisible();
    await expectAccessible(page, "comic strip with an unavailable video");
  });

  test(`${theme}: playback status stays AA throughout its animation`, async ({ page, isMobile }) => {
    await openForAudit(page, "/playground/", theme, isMobile);
    // Keep the animation seekable even if it finishes before the test samples it.
    await page.getByRole("button", { name: "ComicStrip", exact: true }).click();
    const strip = page.getByRole("group", { name: "Paper plane story" });
    const playback = strip.getByRole("button", { name: "Animate panel" });
    const status = strip.getByRole("status");
    const activeStatus = status.locator("[data-active='true']");

    const expectStatusFade = async (duration: string) => {
      await expect(activeStatus).toHaveCSS("opacity", "1");
      await expect(activeStatus).toHaveCSS("transition-property", "opacity, visibility");
      await expect.poll(() => activeStatus.evaluate(el => getComputedStyle(el).transitionDuration.split(",")[0].trim())).toBe(duration);
      const ratio = await activeStatus.evaluate(message => {
        const color = getComputedStyle(message).color;
        const background = getComputedStyle(message.closest("figure")!).backgroundColor;
        const context = document.createElement("canvas").getContext("2d")!;
        const luminance = (value: string) => {
          context.fillStyle = value;
          context.fillRect(0, 0, 1, 1);
          const channels = Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3), channel => {
            const linear = channel / 255;
            return linear <= 0.04045 ? linear / 12.92 : ((linear + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const foreground = luminance(color);
        const surface = luminance(background);
        return (Math.max(foreground, surface) + 0.05) / (Math.min(foreground, surface) + 0.05);
      });
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    };

    const statusBox = async () => {
      const [message, panel] = await Promise.all([status.boundingBox(), strip.boundingBox()]);
      return {
        width: message!.width,
        height: message!.height,
        x: message!.x - panel!.x,
        y: message!.y - panel!.y,
      };
    };

    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(status).toHaveText("Video playing.", { useInnerText: true });
    const before = await statusBox();
    await playback.click();
    await expect(status).toHaveText("Video paused.", { useInnerText: true });
    expect(await statusBox()).toEqual(before);
    await expectStatusFade("0.18s");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(status).toHaveText("Showing the still image.", { useInnerText: true });
    expect(await statusBox()).toEqual(before);
    await expectStatusFade("0.12s");
  });
}
