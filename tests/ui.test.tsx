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
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";
import { Switch } from "@/components/ui/Switch";
import { Dialog } from "@/components/ui/Dialog";
import { useClipboard } from "@/hooks/useClipboard";
import ThemeToggle from "@/components/ThemeToggle";

function clipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}
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
