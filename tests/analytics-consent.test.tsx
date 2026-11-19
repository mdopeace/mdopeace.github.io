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
  render(<AnalyticsConsent measurementId="" />);
  expect(screen.queryByRole("button", { name: "Accept" })).toBeNull();
  expect(screen.queryByRole("region", { name: "Analytics cookies" })).toBeNull();
  expect(idle).not.toHaveBeenCalled();
  expect(tag()).toBeNull();
  expect(queue()).toBeUndefined();
});

it("fails closed when storage is blocked", () => {
  vi.spyOn(localStorage, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  render(<AnalyticsConsent measurementId={testId} />);
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));
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
  trackAnalytics("sticker_found");
  expect(queue()?.map((entry) => Array.from(entry)).at(-1)).toEqual([
    "event", "sticker_found", undefined,
  ]);
});

it("lets a visitor withdraw consent and moves focus to the privacy note", async () => {
  render(<AnalyticsConsent measurementId={testId} />);
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));
  expect(localStorage.getItem(storageKey)).toBe("accepted");
  expect(idle).toHaveBeenCalledTimes(1);
  const privacy = screen.getByText(/Privacy note/i);
  await act(async () => {});
  expect(document.activeElement).toBe(privacy);
  fireEvent.click(screen.getByRole("button", { name: "Turn off analytics" }));
  expect(localStorage.getItem(storageKey)).toBe("declined");
  expect(screen.getByRole("button", { name: "Allow analytics" })).toBeTruthy();
  await act(async () => {});
  expect(document.activeElement).toBe(privacy);
});
