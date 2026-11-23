import { expect, test, type Locator } from "@playwright/test";

type Scenario = {
  setup: (properties: Locator, preview: Locator) => Promise<unknown>;
  check?: string[];
  unavailable?: string[];
};

const scenarios: Record<string, Scenario[]> = {
  Badge: [
    {
      setup: properties => properties.getByLabel("Solid fill").uncheck(),
      check: ["Tone"],
    },
    {
      setup: properties => properties.getByLabel("Square shape").check(),
      check: ["Control size"],
    },
  ],
  Burst: [{
    setup: properties => properties.getByLabel("Show burst").uncheck(),
    check: ["Announce feedback"],
    unavailable: ["Tone", "Size", "Animate entry"],
  }],
  Button: [
    {
      setup: properties => properties.getByLabel("Icon only").check(),
      check: ["Label"],
      unavailable: ["Leading icon"],
    },
    {
      setup: properties => properties.getByLabel("Loading").check(),
      unavailable: ["Disabled"],
    },
    {
      setup: properties => properties.getByLabel("Disabled").check(),
      check: ["Loading"],
    },
  ],
  ConsentNote: [{
    setup: properties => properties.getByLabel("Open notice").uncheck(),
    unavailable: ["Preview width"],
  }],
  "Content & feedback": [{
    setup: (_, preview) => preview.getByRole("button", { name: "Read more" }).click(),
    unavailable: ["Collapsed lines"],
  }],
  Field: [{
    setup: properties => properties.getByLabel("Disabled").check(),
    unavailable: ["Read only"],
  }],
  Image: [{
    setup: properties => properties.getByLabel("Unavailable source").check(),
    check: ["Radius"],
    unavailable: ["Fit"],
  }],
  Link: [{
    setup: properties => properties.getByLabel("Variant").selectOption("nav"),
    check: ["Size"],
  }],
  SpeechBubble: [{
    setup: properties => properties.getByLabel("Variant", { exact: true }).selectOption("caption"),
    unavailable: ["Direction"],
  }],
  Sticker: [{
    setup: properties => properties.getByLabel("Found", { exact: true }).check(),
    check: ["Found tone", "Found pattern", "Found icon"],
  }],
  TextInput: [{
    setup: properties => properties.getByLabel("Disabled").check(),
    unavailable: ["Read only"],
  }],
};

async function snapshot(preview: Locator, target?: string) {
  await preview.page().mouse.move(0, 0);
  await preview.scrollIntoViewIfNeeded();
  return preview.evaluate(async (stage, target) => {
    // Wait for layout and finite transitions so an intermediate frame cannot
    // make two otherwise identical choices look different.
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const animations = stage.getAnimations({ subtree: true })
      .filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime));
    await Promise.allSettled(animations.map(animation => animation.finished));

    const properties = [
      "animation-name", "background-color", "background-image", "background-size",
      "border-color", "border-style", "border-width", "border-radius", "box-shadow",
      "clip-path", "color", "cursor", "display", "fill", "filter", "font-family",
      "font-size", "font-weight", "gap", "grid-template-columns", "left", "top",
      "right", "bottom", "letter-spacing", "line-height", "object-fit", "opacity",
      "text-decoration-line", "text-transform", "transform",
    ];
    const style = (computed: CSSStyleDeclaration) => properties.map(property => computed.getPropertyValue(property));
    const round = (value: number) => Math.round(value * 10) / 10;
    const sample = target ? stage.querySelector(target) : stage;
    if (!sample) throw new Error(`Missing preview sample: ${target}`);
    const frame = sample.getBoundingClientRect();
    const elements = target ? [sample, ...sample.querySelectorAll("*")] : [...sample.querySelectorAll("*")];
    const rendered = elements.flatMap(element => {
      // A resized frame alone does not establish that the example resized.
      if (element.hasAttribute("data-width")) return [];
      const computed = getComputedStyle(element);
      if (!element.getClientRects().length || computed.visibility === "hidden") return [];

      const box = element.getBoundingClientRect();
      const text = [...element.childNodes]
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent).join("").trim();
      const pseudo = ["::before", "::after"].map(selector => {
        const generated = getComputedStyle(element, selector);
        return generated.content === "none" || generated.content === "normal"
          ? null
          : [generated.content, style(generated)];
      });
      return [{
        box: [round(box.x - frame.x), round(box.y - frame.y), round(box.width), round(box.height)],
        text,
        style: style(computed),
        pseudo,
      }];
    });
    return { dom: sample.outerHTML, rendered: JSON.stringify(rendered) };
  }, target);
}

async function auditControl(control: Locator, preview: Locator, component: string, label: string) {
  const { type, options, original } = await control.evaluate((element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) => ({
    type: element.type,
    options: element instanceof HTMLSelectElement ? [...element.options].map(option => option.value) : [],
    original: element instanceof HTMLInputElement && element.type === "checkbox" ? String(element.checked) : element.value,
  }));
  const choices = new Set(type === "select-one" ? options : type === "checkbox" ? ["false", "true"] : [original, "Preview control test", ""]);
  expect(choices.size, `${component} / ${label}`).toBeGreaterThan(1);

  const set = async (value: string) => {
    if (type === "select-one") await control.selectOption(value);
    else if (type === "checkbox") await control.setChecked(value === "true");
    else await control.fill(value);
  };
  const seen = new Map<string, Awaited<ReturnType<typeof snapshot>>>();
  // Measure the badge itself. Its size-matched reference controls also resize.
  const target = component === "Badge" && label === "Control size" ? "[data-decoration]" : undefined;
  for (const choice of choices) {
    await set(choice);
    // A modal makes its own properties inert. Open it at each selected size.
    if (component === "Dialog") await preview.getByRole("button", { name: "Open example dialog" }).click();
    if (component === "Image") await expect(preview.locator('[data-image-state="loading"]')).toHaveCount(0);
    const current = await snapshot(preview, target);
    for (const [previous, before] of seen) {
      const description = `${component} / ${label}: ${JSON.stringify(previous)} → ${JSON.stringify(choice)}`;
      expect.soft(current.dom !== before.dom, `${description} / DOM`).toBe(true);
      expect.soft(current.rendered !== before.rendered, `${description} / rendered output`).toBe(true);
    }
    seen.set(choice, current);
    if (component === "Dialog") {
      await preview.page().keyboard.press("Escape");
      await expect(preview.getByRole("dialog")).toBeHidden();
    }
  }
  await set(original);
}

test("each catalog property changes the rendered preview", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/playground/");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const catalog = page.getByRole("navigation", { name: "Component library" });
  const components = await catalog.getByRole("button").allTextContents();
  const properties = page.getByRole("complementary", { name: "Playground properties" });
  const preview = page.locator('[role="group"][aria-label="Live preview"]');
  const reset = page.getByRole("button", { name: "Reset example" });
  expect(components.length).toBeGreaterThan(0);

  for (const component of components) {
    await test.step(component, async () => {
      await catalog.getByRole("button", { name: component, exact: true }).click();
      await reset.click();
      await page.emulateMedia({ reducedMotion: component === "Burst" ? "no-preference" : "reduce" });
      const labels = await properties.locator("select, input, textarea").evaluateAll(
        controls => controls.map(control => (control as HTMLInputElement).labels?.[0]?.textContent?.trim() ?? ""),
      );
      expect(labels.length).toBeGreaterThan(0);
      expect(labels).not.toContain("");
      const unchecked = new Set(labels);
      for (const label of labels) {
        const control = properties.getByLabel(label, { exact: true });
        if (await control.isDisabled()) continue;
        await test.step(label, () => auditControl(control, preview, component, label));
        unchecked.delete(label);
      }
      for (const scenario of scenarios[component] ?? []) {
        await reset.click();
        await scenario.setup(properties, preview);
        for (const label of scenario.unavailable ?? []) {
          await expect(properties.getByLabel(label, { exact: true })).toBeDisabled();
        }
        for (const label of scenario.check ?? []) {
          const control = properties.getByLabel(label, { exact: true });
          await expect(control).toBeEnabled();
          await test.step(label, () => auditControl(control, preview, component, label));
          unchecked.delete(label);
        }
      }
      expect([...unchecked], `${component} has properties with no enabled test case`).toEqual([]);
    });
  }
});
