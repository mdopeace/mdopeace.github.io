"use client";
import { useSyncExternalStore } from "react";
import { PiMoonStarsBold, PiSunBold } from "react-icons/pi";
import { Switch } from "@mdopeace/ui/Switch";

type Theme = "light" | "dark";
let transitionTimer: ReturnType<typeof setTimeout> | undefined;
function snapshot(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
function serverSnapshot(): Theme {
  return "light";
}
function subscribe(notify: () => void) {
  window.addEventListener("portfolio-theme-change", notify);
  return () => window.removeEventListener("portfolio-theme-change", notify);
}
function applyTheme(theme: Theme, animateFallback: boolean) {
  const root = document.documentElement;
  clearTimeout(transitionTimer);
  if (animateFallback) root.dataset.themeTransition = "true";
  root.dataset.theme = theme;
  transitionTimer = setTimeout(() => {
    delete root.dataset.themeTransition;
  }, 200);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#1b1b1b" : "#f5efdf");
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch {
    /* Apply for this visit even without storage. */
  }
  window.dispatchEvent(new Event("portfolio-theme-change"));
}
function chooseTheme(theme: Theme) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    applyTheme(theme, false);
  } else if (document.startViewTransition) {
    void document.startViewTransition(() => applyTheme(theme, false)).finished.catch(() => {});
  } else {
    applyTheme(theme, true);
  }
}
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return (
    <Switch
      aria-label="Dark mode"
      size="sm"
      checked={theme === "dark"}
      onCheckedChange={(dark) => chooseTheme(dark ? "dark" : "light")}
      checkedIcon={<PiMoonStarsBold />}
      uncheckedIcon={<PiSunBold />}
    />
  );
}
