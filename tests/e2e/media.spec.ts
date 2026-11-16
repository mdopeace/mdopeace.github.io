import { expect, test } from "@playwright/test";

test("project media reserves space while loading and handles a failed logo", async ({ page }) => {
  let releaseImage!: () => void;
  const pending = new Promise<void>(resolve => { releaseImage = resolve; });
  await page.route("https://raw.githubusercontent.com/mdopeace/quicktodo/main/docs/screenshots/completed.png", async route => {
    await pending;
    await route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="692" height="784"><rect width="692" height="784" fill="#f5cb56"/></svg>' });
  });
  await page.route("https://vidplabs.github.io/icon.png", route => route.fulfill({ status: 404, body: "Missing" }));
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const quicktodo = page.locator("#work article").filter({ has: page.getByRole("heading", { name: "QuickTodo", exact: true }) });
    const image = quicktodo.locator('.project-media [data-image-state]');
    await expect(image).toHaveAttribute("data-image-state", "loading");
    const before = await image.boundingBox();
    releaseImage();
    await expect(image).toHaveAttribute("data-image-state", "loaded");
    const after = await image.boundingBox();
    expect(after!.width).toBeCloseTo(before!.width, 1);
    expect(after!.height).toBeCloseTo(before!.height, 1);
    const vidp = page.locator("#work article").filter({ has: page.getByRole("heading", { name: "Vidp", exact: true }) });
    await vidp.scrollIntoViewIfNeeded();
    const logo = vidp.locator('.project-copy > div > [data-image-state]');
    await expect(logo).toHaveAttribute("data-image-state", "error");
    await expect(logo).toHaveCSS("width", "32px");
    await expect(logo).toHaveCSS("height", "32px");
    await expect(logo).toHaveCSS("border-radius", "8px");
    await expect(logo).toHaveAttribute("aria-hidden", "true");
  } finally {
    releaseImage();
  }
});

test("playground exposes reusable navbar and image states", async ({ page }) => {
  await page.goto("/playground/");
  const catalog = page.getByRole("navigation", { name: "Component library" });
  await catalog.getByRole("button", { name: "Navbar", exact: true }).click();
  const navbar = page.getByRole("navigation", { name: "Example navbar" });
  await navbar.getByRole("link", { name: "Build", exact: true }).click();
  await expect(navbar.getByRole("link", { name: "Build", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page).not.toHaveURL(/#/);
  await catalog.getByRole("button", { name: "Image", exact: true }).click();
  const frame = page.locator('[data-image-state]');
  await expect(frame).toHaveAttribute("data-image-state", "loaded");
  await page.getByRole("checkbox", { name: "Unavailable source" }).check();
  await expect(frame).toHaveAttribute("data-image-state", "error");
  await expect(page.getByRole("img", { name: "A framed UI mark on a yellow background" })).toBeVisible();
  await page.getByRole("checkbox", { name: "Unavailable source" }).uncheck();
  await expect(frame).toHaveAttribute("data-image-state", "loaded");
});
