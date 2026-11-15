import { useState, createRef } from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@mdopeace/ui/Button";
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
import { elementCode, HighlightedCode, jsxText, completeExample } from "@/app/playground/snippets";

function clipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}
describe("component playground", () => {
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
