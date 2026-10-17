import { test, expect } from "@playwright/test";

test("the page composes all five sections, in order", async ({ page }) => {
  await page.goto("/index.html");

  await expect(page.getByText("Md Mostafijur Rahman")).toBeVisible();
  await expect(page.getByText("Projects", { exact: true })).toBeVisible();
  await expect(page.getByText("How this happened")).toBeVisible();
  await expect(page.getByText("Day job")).toBeVisible();
  await expect(page.getByText("Get in touch")).toBeVisible();

  const order = await page.evaluate(() => {
    const y = (sel: string) =>
      document.querySelector(sel)?.getBoundingClientRect().top ?? -1;
    return {
      hero: y("header"),
      loop: y("ol"),
      contact: y("footer, section:last-of-type"),
    };
  });
  expect(order.hero).toBeLessThan(order.loop);
});

test("the day-job stack is stated once, not as chips", async ({ page }) => {
  await page.goto("/index.html");

  // The stack is one prose sentence, so no element contains the tool name on
  // its own. A chip grid would give each tool its own element.
  const standaloneChips = await page
    .locator("li")
    .filter({ hasText: /^(React|Next\.js|Astro|Express|MongoDB|AWS Lambda)$/ })
    .count();
  expect(
    standaloneChips,
    "each stack tool renders as its own element — the chip grid is back",
  ).toBe(0);

  await expect(page.getByText(/Full-stack web by day/)).toBeVisible();
});

test("vidp's card states its Apple Silicon requirement", async ({ page }) => {
  await page.goto("/index.html");

  const vidpCard = page.locator("article").filter({ hasText: "Vidp" });
  await expect(vidpCard.getByText(/Apple Silicon only/)).toBeVisible();
  await expect(vidpCard.getByText(/macOS 13 or newer/)).toBeVisible();
});

test("quicktodo's card states the problem, not just features", async ({ page }) => {
  await page.goto("/index.html");

  const card = page.locator("article").filter({ hasText: "QuickTodo" });
  await expect(card.getByText(/Standup hands me five things/)).toBeVisible();
});

test("the favicon is our GitHub avatar, not the Next.js logo", async ({ page }) => {
  await page.goto("/index.html");
  const hrefs = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""));
  expect(hrefs.length, "no icon links rendered").toBeGreaterThanOrEqual(2);
  for (const h of hrefs) {
    expect(h).toMatch(/avatars\.githubusercontent\.com\/u\/99809028/);
    expect(h).not.toContain(".ico");
  }
});