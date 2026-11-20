import { useState, createRef } from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@mdopeace/ui/Button";
import { SpeechBubble } from "@mdopeace/ui/SpeechBubble";
import { Burst } from "@mdopeace/ui/Burst";
import { Sticker } from "@mdopeace/ui/Sticker";
import { ConsentNote } from "@mdopeace/ui/ConsentNote";
import { Tile } from "@mdopeace/ui/Tile";
import { Link } from "@mdopeace/ui/Link";
import { Switch } from "@mdopeace/ui/Switch";
import { Dialog } from "@mdopeace/ui/Dialog";
import { useClipboard } from "@mdopeace/ui/hooks/useClipboard";
import ThemeToggle from "@/components/ThemeToggle";
import ComponentPreview from "@/app/playground/Playground";
import { Field } from "@mdopeace/ui/Field";
import { TextInput } from "@mdopeace/ui/TextInput";
import { Select } from "@mdopeace/ui/Select";
import { Checkbox } from "@mdopeace/ui/Checkbox";
import { NavigationList } from "@mdopeace/ui/NavigationList";
import { CodeExample } from "@mdopeace/ui/CodeExample";
import { Image } from "@mdopeace/ui/Image";
import { Navbar } from "@mdopeace/ui/Navbar";
import { NavbarLinks } from "@mdopeace/ui/NavbarLinks";
import { elementCode, HighlightedCode, jsxText, completeExample } from "@/app/playground/snippets";

function clipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

it("renders the text Button with link styling and native keyboard activation", async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  const onSubmit = vi.fn();
  render(
    <form onSubmit={onSubmit}>
      <Link href="#details">Details</Link>
      <Button variant="text" iconOnly aria-label="Show details" onClick={onClick}>Show details</Button>
    </form>,
  );
  const button = screen.getByRole<HTMLButtonElement>("button", { name: "Show details" });
  expect(button.type).toBe("button");
  expect(button.hasAttribute("data-icon-only")).toBe(false);
  expect(button.className).toBe(screen.getByRole("link", { name: "Details" }).className);
  await user.tab();
  await user.tab();
  expect(document.activeElement).toBe(button);
  await user.keyboard("[Space][Enter]");
  expect(onClick).toHaveBeenCalledTimes(2);
  expect(onSubmit).not.toHaveBeenCalled();
});

describe("comic components", () => {
  it("renders a long caption with native div attributes and a ref across tail and tone changes", () => {
    const ref = createRef<HTMLDivElement>();
    const caption = "AnUnbrokenCaption".repeat(12);
    const { rerender } = render(
      <SpeechBubble ref={ref} id="caption" lang="en" tail="top-end" tone="info">{caption}</SpeechBubble>,
    );
    const bubble = screen.getByText(caption);
    expect(bubble).toBe(ref.current);
    expect(bubble.tagName).toBe("DIV");
    expect(bubble.id).toBe("caption");
    expect(bubble.lang).toBe("en");
    rerender(<SpeechBubble ref={ref} tail="bottom-start" tone="emphasis">{caption}</SpeechBubble>);
    expect(screen.getByText(caption)).toBe(bubble);
    expect(bubble.tabIndex).toBe(-1);
  });

  it("keeps a feedback status mounted as its message changes and leaves static text silent", () => {
    const { rerender } = render(<Burst>POW!</Burst>);
    expect(screen.getByText("POW!")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    rerender(<Burst status animated />);
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toBe("");
    rerender(<Burst status animated>Copied!</Burst>);
    expect(screen.getByRole("status")).toBe(status);
    expect(status.textContent).toBe("Copied!");
  });

  it("keeps decorative stickers out of the tab order and exposes interactive state and keyboard activation", async () => {
    const user = userEvent.setup();
    const click = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <>
        <Sticker>Decorative star</Sticker>
        <Sticker ref={ref} onClick={click} aria-label="Collect star"><span aria-hidden>★</span></Sticker>
      </>,
    );
    const decoration = screen.getByText("Decorative star");
    expect(decoration.getAttribute("aria-hidden")).toBe("true");
    const button = screen.getByRole("button", { name: "Collect star", description: "Not found" });
    expect(ref.current).toBe(button);
    expect(button.tagName).toBe("BUTTON");
    await user.tab();
    expect(document.activeElement).toBe(button);
    await user.keyboard("[Space][Enter]");
    expect(click).toHaveBeenCalledTimes(2);
    rerender(<Sticker><a href="#star">Decorative link</a></Sticker>);
    expect(screen.getByText("Decorative link").closest("[aria-hidden='true']")?.hasAttribute("inert")).toBe(true);
    rerender(<Sticker ref={ref} found onClick={click} aria-label="Collect star"><span aria-hidden>★</span></Sticker>);
    expect(screen.getByRole("button", { name: "Collect star", description: "Found" })).toBe(ref.current);
  });

  it("leaves visibility controlled, exposes both actions and permits tabbing through the page without storage", async () => {
    const user = userEvent.setup();
    const accept = vi.fn();
    const decline = vi.fn();
    const storageRead = vi.spyOn(localStorage, "getItem");
    const storageWrite = vi.spyOn(localStorage, "setItem");
    const storageRemove = vi.spyOn(localStorage, "removeItem");
    const storageClear = vi.spyOn(localStorage, "clear");
    const note = (open: boolean) => (
      <>
        <button>Before</button>
        <ConsentNote open={open} onAccept={accept} onDecline={decline}>Allow reminders?</ConsentNote>
        <button>After</button>
      </>
    );
    const { rerender } = render(note(false));
    expect(screen.queryByText("Allow reminders?")).toBeNull();
    rerender(note(true));
    expect(screen.getByRole("region", { name: "Consent notice" }).textContent).toContain("Allow reminders?");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Before" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Accept" }));
    await user.keyboard("[Enter]");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Decline" }));
    await user.keyboard("[Space]");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "After" }));
    expect(accept).toHaveBeenCalledTimes(1);
    expect(decline).toHaveBeenCalledTimes(1);
    rerender(note(false));
    expect(screen.queryByRole("region")).toBeNull();
    for (const operation of [storageRead, storageWrite, storageRemove, storageClear]) {
      expect(operation).not.toHaveBeenCalled();
    }
  });
});

describe("Tile", () => {
  it("supports branded content, decorative indicators and native refs without adding controls", () => {
    const ref = createRef<HTMLSpanElement>();
    const { rerender } = render(<Tile ref={ref} aria-label="Game Boy" faceColor="#a13c24">GB</Tile>);
    expect(ref.current).toBe(screen.getByLabelText("Game Boy"));
    expect(ref.current?.textContent).toBe("GB");
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<Tile ref={ref} aria-hidden="true" faceColor="#9bdc74" />);
    expect(ref.current?.getAttribute("aria-hidden")).toBe("true");
    expect(ref.current?.textContent).toBe("");
  });
});
describe("navigation and media building blocks", () => {
  it("keeps current destinations controlled, decorative labels unfocusable and native clicks cancellable", async () => {
    const user = userEvent.setup();
    const select = vi.fn((_id, event) => event.preventDefault());
    const ref = createRef<HTMLDivElement>();
    const items = [{ id: "one", label: "One", href: "#one" }, { id: "two", label: "Two", href: "#two" }];
    render(<Navbar label="Demo" brand={<span>Brand</span>} actions={<Button>Account</Button>}><NavbarLinks ref={ref} items={items} activeId="one" onSelect={select} /></Navbar>);
    expect(screen.getByRole("navigation", { name: "Demo" })).toBeTruthy();
    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "One" }).getAttribute("aria-current")).toBe("page");
    expect([...ref.current!.querySelectorAll('[aria-hidden="true"] a')].every(link => link.getAttribute("tabindex") === "-1")).toBe(true);
    await user.click(screen.getByRole("link", { name: "Two" }));
    expect(select).toHaveBeenCalledWith("two", expect.anything());
    expect(screen.getByRole("link", { name: "One" }).getAttribute("aria-current")).toBe("page");
  });

  it("preserves the image frame through errors and resets loading for a new source", async () => {
    const ref = createRef<HTMLImageElement>();
    const onError = vi.fn();
    const { container, rerender } = render(<Image ref={ref} src="/missing.png" alt="Example artwork" width={640} height={400} onError={onError} />);
    const frame = container.querySelector("[data-image-state]")!;
    expect(frame.getAttribute("data-image-state")).toBe("loading");
    expect((frame as HTMLElement).style.getPropertyValue("--image-ratio")).toBe("1.6");
    fireEvent.error(ref.current!);
    expect(frame.getAttribute("data-image-state")).toBe("error");
    expect(screen.getByRole("img", { name: "Example artwork" })).toBe(frame);
    expect(onError).toHaveBeenCalledTimes(1);
    rerender(<Image ref={ref} src="/working.png" alt="Example artwork" width={640} height={400} />);
    const replacement = container.querySelector("[data-image-state]")!;
    expect(replacement.getAttribute("data-image-state")).toBe("loading");
    Object.defineProperty(ref.current, "naturalWidth", { value: 640 });
    fireEvent.load(ref.current!);
    await waitFor(() => expect(replacement.getAttribute("data-image-state")).toBe("loaded"));
  });

  it("reveals cached images even when their load event preceded hydration", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(32);
    const { container } = render(<Image src="/cached.png" alt="" width={32} height={32} radius="md" />);
    await waitFor(() => expect(container.querySelector("[data-image-state]")?.getAttribute("data-image-state")).toBe("loaded"));
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("ignores a previous source's late decode after switching images", async () => {
    let resolveDecode!: () => void;
    const { container, rerender } = render(<Image src="/slow.png" alt="Artwork" width={100} height={100} />);
    const oldImage = screen.getByRole("img");
    Object.defineProperty(oldImage, "naturalWidth", { value: 100 });
    Object.defineProperty(oldImage, "decode", { value: () => new Promise<void>(resolve => { resolveDecode = resolve; }) });
    fireEvent.load(oldImage);
    rerender(<Image src="/new.png" alt="Artwork" width={100} height={100} />);
    await act(async () => resolveDecode());
    expect(container.querySelector("[data-image-state]")?.getAttribute("data-image-state")).toBe("loading");
  });
});
describe("component playground", () => {
  it.each([
    ["SpeechBubble", "Every good story starts with a little curiosity."],
    ["Burst", "POW! Copied!"],
    ["Sticker", "Star"],
    ["ConsentNote", "Would you like to enable reminders?"],
  ])("exposes the %s demo and copies its public import", async (name, sample) => {
    const user = userEvent.setup();
    const write = vi.fn().mockResolvedValue(undefined);
    clipboard(write);
    render(<ComponentPreview />);
    await user.click(screen.getByRole("button", { name }));
    expect(within(screen.getByRole("group", { name: "Live preview" })).getByText(sample, { exact: true })).toBeTruthy();
    await user.selectOptions(screen.getByLabelText("Preview width"), "narrow");
    if (name === "Sticker") {
      await user.click(screen.getByLabelText("Interactive"));
      await user.click(screen.getByRole("button", { name: "Star", description: "Not found" }));
      expect(screen.getByRole("button", { name: "Star", description: "Found" })).toBeTruthy();
    }
    if (name === "ConsentNote") {
      const preview = within(screen.getByRole("group", { name: "Live preview" }));
      const status = preview.getByRole("status");
      const openNotice = screen.getByLabelText("Open notice");
      expect(status.textContent).toBe("");
      for (const [action, result] of [["Accept", "Accepted"], ["Decline", "Declined"]]) {
        preview.getByRole("button", { name: action }).focus();
        await user.keyboard("[Enter]");
        expect(preview.queryByRole("region", { name: "Consent notice" })).toBeNull();
        expect(document.activeElement).toBe(openNotice);
        expect(preview.getByRole("status")).toBe(status);
        expect(status.textContent).toBe(result);
        await user.keyboard("[Space]");
        expect(preview.getByRole("region", { name: "Consent notice" })).toBeTruthy();
        expect(status.textContent).toBe("");
      }
    }
    if (name === "Burst") {
      await user.click(screen.getByLabelText("Announce feedback"));
      await user.click(screen.getByLabelText("Show burst"));
    }
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(write).toHaveBeenCalledWith(expect.stringContaining(`import { ${name} } from "@mdopeace/ui/${name}";`));
    if (name === "Burst") {
      const copied = write.mock.calls[0][0];
      expect(copied).toContain('"use client";');
      expect(copied).toContain("useState(null");
      expect(copied).toContain('onClick={() => setMessage("POW! Copied!")}');
      expect(copied).toMatch(/<Burst\b[^>]*\bstatus\b[^>]*>\s*\{message\}\s*<\/Burst>/);
    }
  });

  it("exposes Tile presets and includes the public import in copied examples", async () => {
    const user = userEvent.setup();
    const write = vi.fn().mockResolvedValue(undefined);
    clipboard(write);
    render(<ComponentPreview />);
    await user.click(screen.getByRole("button", { name: "Tile" }));
    expect(screen.getByRole("img", { name: "Game Boy mark" }).textContent).toBe("GB");
    await user.selectOptions(screen.getByLabelText("Appearance"), "paused");
    await user.click(screen.getByLabelText("Inset depth"));
    expect(screen.getByRole("img", { name: "paused indicator" }).getAttribute("data-inset")).toBe("false");
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('import { Tile } from "@mdopeace/ui/Tile";'));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('faceColor="#f0ae55"'));
  });
  it("uses plain escaped JSX labels and supplies imports and state for complete examples", () => {
    expect(jsxText("Make something")).toBe("Make something");
    expect(jsxText("Save <draft> & {notes}")).toBe("Save &lt;draft&gt; &amp; &#123;notes&#125;");
    const code = completeExample(elementCode("Switch", ['aria-label="Example"', "checked={checked}", "onCheckedChange={setChecked}"]), "const [checked, setChecked] = useState(false);", true);
    expect(code).toContain('"use client";');
    expect(code).toContain('import { useState } from "react";');
    expect(code).toContain('import { Switch } from "@mdopeace/ui/Switch";');
    expect(code).toContain("const [checked, setChecked] = useState(false);");
    expect(code).toContain("export default function Example()");
  });
  it("formats self-closing examples and highlights without changing copied text", () => {
    const code = elementCode("Switch", ['aria-label="Example"', "checked={checked}", "onCheckedChange={setChecked}", false]);
    expect(code).toBe('<Switch\n  aria-label="Example"\n  checked={checked}\n  onCheckedChange={setChecked}\n/>');
    const { container } = render(<HighlightedCode code={code} />);
    expect(container.textContent).toBe(code);
    expect(container.querySelector('[data-syntax="component"]')?.textContent).toBe("<Switch");
    expect(container.querySelector('[data-syntax="string"]')?.textContent).toBe('"Example"');
  });
  it("adds decorative indentation guides while preserving multiline source and highlighting", () => {
    const code = 'function Example() {\n  /* nested\n    comment */\n\treturn <Button>Save</Button>;\n}\n';
    const { container } = render(<HighlightedCode code={code} />);
    expect(container.querySelector("code")?.textContent).toBe(code);
    const guides = container.querySelectorAll<HTMLElement>('[aria-hidden="true"]');
    expect([...guides].map((guide) => guide.style.width)).toEqual(["2ch", "4ch", "2ch"]);
    expect([...guides].every((guide) => guide.textContent === "")).toBe(true);
    expect([...container.querySelectorAll('[data-syntax="comment"]')].map((part) => part.textContent).join("\n")).toBe('/* nested\n    comment */');
  });
  it("keeps short examples inline but expands long props and nested content", () => {
    expect(elementCode("Heading", ["level={3}", 'size="feature"'], "Make the useful thing.")).toBe('<Heading level={3} size="feature">Make the useful thing.</Heading>');
    expect(elementCode("Divider", ['variant="solid"', false])).toBe('<Divider variant="solid" />');
    expect(elementCode("Text", ['title="' + "Long content ".repeat(10) + '"'], "Text")).toContain("\n");
    expect(elementCode("Stack", ["gap={4}"], "<Text>One</Text>\n<Text>Two</Text>")).toContain("\n  <Text>One</Text>\n");
    expect(elementCode("Stack", ["gap={5}"], "<Text>One</Text>\n<Text>Two</Text>")).toBe('<Stack gap={5}>\n  <Text>One</Text>\n  <Text>Two</Text>\n</Stack>');
    expect(elementCode("Grid", ["columns={2}", "gap={4}"], "{/* Content */}")).toBe('<Grid columns={2} gap={4}>\n  {/* Content */}\n</Grid>');
  });
  it("applies live properties, preserves accessible icon names and resets the example", async () => {
    const user = userEvent.setup();
    render(<ComponentPreview />);
    await user.selectOptions(screen.getByLabelText("Size"), "lg");
    await user.click(screen.getByLabelText("Icon only"));
    const button = screen.getByRole("button", { name: "Make something" });
    expect(button.getAttribute("data-size")).toBe("lg");
    expect(button.getAttribute("data-icon-only")).toBe("true");
    await user.selectOptions(screen.getByLabelText("Variant"), "text");
    expect(screen.queryByLabelText("Icon only")).toBeNull();
    expect(button.textContent).toBe("Make something");
    await user.selectOptions(screen.getByLabelText("Variant"), "primary");
    expect(button.getAttribute("data-icon-only")).toBe("false");
    await user.click(button);
    expect(screen.getByText("Activated 1 time")).toBeTruthy();
    await user.click(screen.getByLabelText("Disabled"));
    expect((button as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "Reset example" }));
    expect((screen.getByLabelText("Size") as HTMLSelectElement).value).toBe("md");
    expect(screen.getByRole("button", { name: "Make something" }).getAttribute("data-icon-only")).toBe("false");
  });
  it("updates copied usage and isolates state when changing components", async () => {
    const user = userEvent.setup();
    const write = vi.fn().mockResolvedValue(undefined);
    clipboard(write);
    render(<ComponentPreview />);
    await user.selectOptions(screen.getByLabelText("Variant"), "ghost");
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(write).toHaveBeenCalledWith(expect.stringContaining('variant="ghost"'));
    await user.click(screen.getByRole("button", { name: "Switch" }));
    await user.click(screen.getByRole("switch", { name: "Example setting" }));
    expect((screen.getByRole("switch", { name: "Example setting" }) as HTMLInputElement).checked).toBe(true);
    await user.click(screen.getByRole("button", { name: "Button" }));
    expect((screen.getByLabelText("Variant") as HTMLSelectElement).value).toBe("primary");
  });
});
describe("clipboard behavior", () => {
  it("copies exact bytes, resets success, and retains actionable failure state", async () => {
    vi.useFakeTimers();
    const write = vi.fn().mockResolvedValue(undefined);
    clipboard(write);
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      expect(await result.current.copy("first\nsecond")).toBe(true);
    });
    expect(write).toHaveBeenCalledWith("first\nsecond");
    expect(result.current.status).toBe("success");
    act(() => vi.advanceTimersByTime(1400));
    expect(result.current.status).toBe("idle");
    write.mockRejectedValue(new Error("Denied"));
    await act(async () => {
      expect(await result.current.copy("retry")).toBe(false);
    });
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.status).toBe("error");
    expect(result.current.error?.message).toBe("Denied");
    act(() => result.current.reset());
    expect(result.current.status).toBe("idle");
  });
  it("handles unavailable clipboard, stale responses and unmount cleanup", async () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });
    const { result, unmount } = renderHook(() => useClipboard());
    await act(async () => {
      expect(await result.current.copy("x")).toBe(false);
    });
    expect(result.current.status).toBe("error");
    let resolveOld!: () => void;
    clipboard(
      vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise<void>((resolve) => {
              resolveOld = resolve;
            }),
        )
        .mockResolvedValue(undefined),
    );
    let older!: Promise<boolean>;
    act(() => {
      older = result.current.copy("old");
    });
    await act(async () => {
      await result.current.copy("new");
    });
    await act(async () => {
      resolveOld();
      expect(await older).toBe(false);
    });
    expect(result.current.status).toBe("success");
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
it("keeps native button semantics, refs, attributes and disabled/loading behavior", async () => {
  const click = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  const { rerender } = render(
    <Button ref={ref} data-example="yes" onClick={click}>
      Save
    </Button>,
  );
  expect(ref.current?.type).toBe("button");
  expect(ref.current?.dataset.example).toBe("yes");
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(click).toHaveBeenCalledTimes(1);
  rerender(
    <Button loading onClick={click}>
      Save
    </Button>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
});
it("merges safe new-tab rel tokens and retains normal anchor behavior", () => {
  render(
    <>
      <Link href="https://example.com" target="_blank" rel="me noopener">
        External
      </Link>
      <Link href="#local">Local</Link>
    </>,
  );
  expect(screen.getByText("External").getAttribute("rel")).toBe(
    "me noopener noreferrer",
  );
  expect(screen.getByText("Local").getAttribute("target")).toBe(null);
});
it("supports keyboard Switch operation, controlled requests and native form props", async () => {
  const change = vi.fn();
  const ref = createRef<HTMLInputElement>();
  const { rerender } = render(
    <Switch
      ref={ref}
      aria-label="Setting"
      name="setting"
      defaultChecked
      onCheckedChange={change}
    />,
  );
  const input = screen.getByRole("switch", {
    name: "Setting",
  }) as HTMLInputElement;
  input.focus();
  await userEvent.keyboard(" ");
  expect(input.checked).toBe(false);
  expect(change).toHaveBeenCalledWith(false);
  expect(ref.current).toBe(input);
  expect(input.name).toBe("setting");
  rerender(
    <Switch aria-label="Setting" checked={false} onCheckedChange={change} />,
  );
  await userEvent.click(input);
  expect(change).toHaveBeenLastCalledWith(true);
  expect(input.checked).toBe(false);
  rerender(
    <Switch aria-label="Setting" checked disabled onCheckedChange={change} />,
  );
  change.mockClear();
  await userEvent.click(input);
  expect(change).not.toHaveBeenCalled();
});
function ModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Details"
        description="Description"
        closeLabel="Close details"
      >
        <Button>Content</Button>
      </Dialog>
    </>
  );
}
it("keeps modal semantics during exit, restores focus and previous scroll state", () => {
  vi.useFakeTimers();
  document.body.style.overflow = "clip";
  render(<ModalExample />);
  const trigger = screen.getByRole("button", { name: "Open" });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog", {
    name: "Details",
  }) as HTMLDialogElement;
  expect(document.body.style.overflow).toBe("hidden");
  const descriptionId = dialog.getAttribute("aria-describedby");
  expect(document.getElementById(descriptionId!)?.textContent).toBe(
    "Description",
  );
  fireEvent.click(screen.getByRole("button", { name: "Content" }));
  expect(dialog.open).toBe(true);
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(dialog.open).toBe(true);
  act(() => vi.advanceTimersByTime(180));
  expect(dialog.open).toBe(false);
  expect(document.body.style.overflow).toBe("clip");
  expect(document.activeElement).toBe(trigger);
  document.body.style.overflow = "";
});
it("supports a smaller title while preserving the dialog's accessible name", () => {
  const { rerender } = render(<Dialog defaultOpen title="Details" closeLabel="Close details" />);
  const dialog = screen.getByRole("dialog", { name: "Details" });
  const title = within(dialog).getByRole("heading", { level: 2, name: "Details" });
  expect(title.getAttribute("data-size")).toBe("dialog");
  rerender(<Dialog defaultOpen title="Details" titleSize="feature" closeLabel="Close details" />);
  expect(dialog.getAttribute("aria-labelledby")).toBe(title.id);
  expect(title.getAttribute("data-size")).toBe("feature");
});
it("restores scrolling and focus after repeated native closes", () => {
  document.body.style.overflow = "clip";
  render(<ModalExample />);
  const trigger = screen.getByRole("button", { name: "Open" });
  for (let attempt = 0; attempt < 3; attempt++) {
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");
    const dialog = screen.getByRole("dialog") as HTMLDialogElement;
    act(() => dialog.close());
    expect(document.body.style.overflow).toBe("clip");
    expect(document.activeElement).toBe(trigger);
  }
  document.body.style.overflow = "";
});
it("keeps scrolling locked until the final modal closes", () => {
  const first = createRef<HTMLDialogElement>();
  const second = createRef<HTMLDialogElement>();
  render(<>
    <Dialog ref={first} defaultOpen title="First" closeLabel="Close first" />
    <Dialog ref={second} defaultOpen title="Second" closeLabel="Close second" />
  </>);
  act(() => first.current!.close());
  expect(document.body.style.overflow).toBe("hidden");
  act(() => second.current!.close());
  expect(document.body.style.overflow).toBe("");
});
it("only dismisses genuine backdrop gestures and unlocks on unmount", () => {
  vi.useFakeTimers();
  const { unmount } = render(<ModalExample />);
  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  const dialog = screen.getByRole("dialog");
  fireEvent.pointerDown(screen.getByRole("button", { name: "Content" }));
  fireEvent.click(dialog);
  act(() => vi.advanceTimersByTime(200));
  expect((dialog as HTMLDialogElement).open).toBe(true);
  fireEvent.pointerDown(dialog);
  fireEvent.click(dialog);
  act(() => vi.advanceTimersByTime(180));
  expect((dialog as HTMLDialogElement).open).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Open" }));
  unmount();
  expect(document.body.style.overflow).toBe("");
});
it("toggles and persists only light/dark themes", async () => {
  document.documentElement.dataset.theme = "light";
  render(<ThemeToggle />);
  const control = screen.getByRole("switch", { name: "Dark mode" });
  await userEvent.click(control);
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(localStorage.getItem("portfolio-theme")).toBe("dark");
  await userEvent.click(control);
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(localStorage.getItem("portfolio-theme")).toBe("light");
});

it("closes through Escape and honors reduced motion without an exit delay", () => {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: true,
  } as MediaQueryList);
  render(<ModalExample />);
  const trigger = screen.getByRole("button", { name: "Open" });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = screen.getByRole("dialog") as HTMLDialogElement;
  fireEvent.keyDown(screen.getByRole("button", { name: "Close details" }), {
    key: "Escape",
  });
  expect(dialog.open).toBe(false);
  expect(document.activeElement).toBe(trigger);
  expect(document.body.style.overflow).toBe("");
});

it("interrupts a dialog exit when the controlled parent reopens it", () => {
  vi.useFakeTimers();
  const { rerender } = render(
    <Dialog title="Details" closeLabel="Close details" open>
      <p>Body</p>
    </Dialog>,
  );
  const dialog = screen.getByRole("dialog") as HTMLDialogElement;
  rerender(
    <Dialog title="Details" closeLabel="Close details" open={false}>
      <p>Body</p>
    </Dialog>,
  );
  act(() => vi.advanceTimersByTime(90));
  rerender(
    <Dialog title="Details" closeLabel="Close details" open>
      <p>Body</p>
    </Dialog>,
  );
  act(() => vi.advanceTimersByTime(180));
  expect(dialog.open).toBe(true);
  expect(dialog.dataset.closing).toBeUndefined();
  expect(document.body.style.overflow).toBe("hidden");
});

describe("library form and documentation components", () => {
  it("connects field names, help, errors and required semantics without duplicate IDs", () => {
    render(<>
      <Field label="Your name" description="Use your preferred name." error="A name is required." required>{field => <TextInput {...field} />}</Field>
      <Field label="Material">{field => <Select {...field}><option>Paper</option></Select>}</Field>
    </>);
    const input = screen.getByRole("textbox", { name: "Your name" }) as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids.map(id => document.getElementById(id)?.textContent)).toEqual(["Use your preferred name.", "A name is required."]);
    expect(screen.getByRole("combobox", { name: "Material" }).id).not.toBe(input.id);
  });
  it("supports checkbox keyboard activation, descriptive feedback and native disabled state", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { rerender } = render(<Checkbox label="Build notes" description="Occasional updates." error="Confirm your choice." onChange={change} />);
    const input = screen.getByRole("checkbox", { name: "Build notes" }) as HTMLInputElement;
    await user.click(screen.getByText("Build notes"));
    expect(input.checked).toBe(true);
    input.focus();
    await user.keyboard(" ");
    expect(input.checked).toBe(false);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    rerender(<Checkbox label="Build notes" disabled onChange={change} />);
    const calls = change.mock.calls.length;
    await user.click(input);
    expect(change).toHaveBeenCalledTimes(calls);
  });
  it("retains link semantics and active state while selecting local entries", async () => {
    const user = userEvent.setup();
    const select = vi.fn();
    render(<NavigationList label="Docs" activeId="overview" onSelect={select} groups={[{label:"Start",items:[{id:"overview",label:"Overview",href:"/overview"},{id:"controls",label:"Controls"},{id:"later",label:"Later",disabled:true}]}]} />);
    expect(screen.getByRole("link", {name:"Overview"}).getAttribute("href")).toBe("/overview");
    expect(screen.getByRole("link", {name:"Overview"}).getAttribute("aria-current")).toBe("page");
    await user.click(screen.getByRole("button", {name:"Controls"}));
    expect(select).toHaveBeenCalledWith("controls");
    await user.click(screen.getByRole("button", {name:"Later"}));
    expect(select).toHaveBeenCalledTimes(1);
  });
  it("copies exact code and renders markup as escaped text in both languages", async () => {
    const user = userEvent.setup();
    const write = vi.fn().mockResolvedValue(undefined);
    clipboard(write);
    const code = '<Button>Save & finish</Button>\n<script>alert("example")</script>';
    const { container, rerender } = render(<CodeExample code={code} />);
    expect(screen.getByLabelText("Code example").textContent).toBe(code);
    expect(container.querySelector("script")).toBeNull();
    await user.click(screen.getByRole("button", {name:"Copy code"}));
    expect(write).toHaveBeenCalledWith(code);
    expect(screen.getByRole("status").textContent).toBe("Example copied.");
    rerender(<CodeExample code={code} language="text" />);
    expect(screen.getByLabelText("Code example").textContent).toBe(code);
    expect(container.querySelector("[data-syntax]")).toBeNull();
  });
});
