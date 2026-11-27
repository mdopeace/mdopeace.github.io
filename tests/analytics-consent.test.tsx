import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import AnalyticsConsent from "@/components/analytics/AnalyticsConsent";
import { trackAnalytics } from "@/components/analytics/events";

const storageKey = "portfolio-analytics-consent";
const testId = "G-TEST123456";
const tag = () => document.head.querySelector<HTMLScriptElement>('script[src*="googletagmanager"]');
const queue = () => (window as Window & { dataLayer?: IArguments[] }).dataLayer;
const idle = vi.fn<(callback: IdleRequestCallback) => number>();

beforeEach(() => {
  idle.mockClear().mockReturnValue(1);
  window.requestIdleCallback = idle;
  window.cancelIdleCallback = vi.fn();
  delete (window as Window & { dataLayer?: IArguments[] }).dataLayer;
});

it("does not schedule analytics while consent is pending or declined, including on return", () => {
  const visit = render(<AnalyticsConsent measurementId={testId} />);
  expect(screen.getByRole("region", { name: "Analytics cookies" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Privacy settings" })).toBeTruthy();
  expect(idle).not.toHaveBeenCalled();
  expect(tag()).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Decline" }));
  expect(localStorage.getItem(storageKey)).toBe("declined");
  visit.unmount();
  render(<AnalyticsConsent measurementId={testId} />);
  expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  expect(idle).not.toHaveBeenCalled();
  expect(tag()).toBeNull();
  expect(queue()).toBeUndefined();
});

it("hides the consent prompt and never schedules analytics when the measurement ID is empty", () => {
  localStorage.setItem(storageKey, "accepted");
  render(<AnalyticsConsent measurementId="" />);
  expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  expect(screen.queryByRole("region", { name: "Analytics cookies" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Privacy settings" })).toBeNull();
  expect(idle).not.toHaveBeenCalled();
  expect(tag()).toBeNull();
  expect(queue()).toBeUndefined();
});

it.each(["Accept", "Decline"])("fails closed on %s when storage is blocked", (choice) => {
  vi.spyOn(localStorage, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  render(<AnalyticsConsent measurementId={testId} />);
  fireEvent.click(screen.getByRole("button", { name: choice }));
  expect(idle).not.toHaveBeenCalled();
  expect(tag()).toBeNull();
});

it("waits for idle after accepting and starts sending events only after the script loads", () => {
  render(<AnalyticsConsent measurementId={testId} />);
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));
  expect(idle).toHaveBeenCalledTimes(1);
  expect(tag()).toBeNull();
  expect(queue()).toBeUndefined();

  // jsdom doesn't load external scripts. Run the queued task and signal load locally.
  act(() => idle.mock.calls[0][0]({ didTimeout: false, timeRemaining: () => 50 }));
  const script = tag();
  expect(script?.src).toBe(`https://www.googletagmanager.com/gtag/js?id=${testId}`);
  trackAnalytics("tetris_play");
  expect(queue()).toEqual([]);
  fireEvent.load(script!);
  expect(queue()?.map((entry) => entry[0])).toEqual(["js", "config"]);
  trackAnalytics("tetris_play");
  expect(queue()?.map((entry) => Array.from(entry)).at(-1)).toEqual([
    "event", "tetris_play", undefined,
  ]);
});

it("reopens the notice from Privacy settings and clears analytics cookies on withdrawal", async () => {
  render(<AnalyticsConsent measurementId={testId} />);
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));
  expect(localStorage.getItem(storageKey)).toBe("accepted");
  expect(idle).toHaveBeenCalledTimes(1);
  const settings = screen.getByRole("button", { name: "Privacy settings" });
  await act(async () => {});
  expect(document.activeElement).toBe(settings);
  document.cookie = "_ga=test; Path=/";
  document.cookie = "_ga_TEST123456=test; Path=/";
  fireEvent.click(settings);
  fireEvent.click(screen.getByRole("button", { name: "Decline" }));
  expect(localStorage.getItem(storageKey)).toBe("declined");
  expect(document.cookie).not.toMatch(/_ga/);
  await act(async () => {});
  expect(document.activeElement).toBe(settings);
});

it("stops active tracking when withdrawal cannot be saved", () => {
  localStorage.setItem(storageKey, "accepted");
  vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  const now = vi.spyOn(performance, "now").mockReturnValue(0);
  render(<AnalyticsConsent measurementId={testId} />);
  act(() => idle.mock.calls[0][0]({ didTimeout: false, timeRemaining: () => 50 }));
  fireEvent.load(tag()!);
  now.mockReturnValue(2000);

  fireEvent.click(screen.getByRole("button", { name: "Privacy settings" }));
  fireEvent.click(screen.getByRole("button", { name: "Decline" }));
  expect(localStorage.getItem(storageKey)).toBe("accepted");
  expect(tag()).toBeNull();
  trackAnalytics("tetris_play");
  expect(queue()?.map((entry) => entry[0])).toEqual(["js", "config"]);

  fireEvent.click(screen.getByRole("button", { name: "Privacy settings" }));
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));
  expect(idle).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button", { name: "Privacy settings" })).toBeTruthy();
});

it("reports only scroll milestones beyond the depth at tracking start", () => {
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(window.innerHeight + 1000);
  vi.stubGlobal("scrollY", 525);
  try {
    render(<AnalyticsConsent measurementId={testId} />);
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    act(() => idle.mock.calls[0][0]({ didTimeout: false, timeRemaining: () => 50 }));
    fireEvent.load(tag()!);

    window.scrollY = 600;
    fireEvent.scroll(window);
    expect(queue()?.map((entry) => entry[0])).toEqual(["js", "config"]);

    window.scrollY = 800;
    fireEvent.scroll(window);
    expect(queue()?.slice(2).map((entry) => Array.from(entry))).toEqual([
      ["event", "scroll_depth", { percent: 75 }],
    ]);
  } finally {
    vi.unstubAllGlobals();
  }
});
