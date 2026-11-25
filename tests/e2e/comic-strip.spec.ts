import { expect, test } from "@playwright/test";
import { expectAccessible, expectTextContrast, openForAudit, themes } from "./accessibility";

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
  page.on("request", request => {
    if (request.url().endsWith("/paper-plane.webm")) requests.push(request.url());
  });
  await page.goto("/playground/");
  await page.getByRole("button", { name: "ComicStrip", exact: true }).click();
  const strip = page.getByRole("group", { name: "Paper plane story" });
  const frame = strip.getByRole("img", { name: "A paper plane glides past a yellow sun" });
  const video = frame.locator("video");
  const poster = frame.locator("img");
  const playback = strip.getByRole("button", { name: "Animate panel" });
  const status = strip.getByRole("status");
  await expect(status).toHaveCount(1);
  await expect(status).toHaveText("Showing the still image.");
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
  await expect(video).toHaveCSS("opacity", "1");
  await expect(status).toHaveText("Video playing.");
  await expect(playback).toHaveAttribute("aria-pressed", "true");
  expect(await video.evaluate(node => (node as HTMLVideoElement).duration)).toBeCloseTo(3);

  await page.keyboard.press("Space");
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveCSS("opacity", "0");
  await expect(playback).toBeFocused();
  await expect(status).toHaveText("Video paused.");
  await page.keyboard.press("Enter");
  await expect(video).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(video).toHaveJSProperty("paused", true);
  await expect(video).toHaveCSS("opacity", "0");
  await expect(playback).toBeDisabled();
  await expect(playback).toBeFocused();
  await expect(status).toHaveText("Showing the still image.");
  expect(await frame.boundingBox()).toEqual(before);
  expect(await strip.boundingBox()).toEqual(stripBefore);
});

for (const theme of themes) {
  test(`${theme}: panel and strip states pass axe`, async ({ page, isMobile }) => {
    await openForAudit(page, "/playground/", theme, isMobile);
    const preview = page.getByRole("group", { name: "Live preview" });
    await page.getByRole("button", { name: "ComicPanel", exact: true }).click();
    await expectTextContrast(preview.locator("figcaption"));
    await expectAccessible(page, "comic panel");
    await page.getByRole("button", { name: "ComicStrip", exact: true }).click();
    await expectAccessible(page, "comic strip with reduced motion");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const playback = preview.getByRole("button", { name: "Animate panel" });
    await expect(playback).toHaveAttribute("aria-pressed", "true");
    await expectAccessible(page, "comic strip with video playing");
    await playback.click();
    await expect(playback).toHaveAttribute("aria-pressed", "false");
    await expectAccessible(page, "comic strip with video paused");
  });
}
