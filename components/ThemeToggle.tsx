"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

function updateThemeColor(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#1b1b1b" : "#f5efdf");
}

function getThemeSnapshot(): Theme {
  const theme = document.documentElement.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : "system";
}

function getServerThemeSnapshot(): Theme {
  return "system";
}

function subscribeToTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemThemeChange = () => {
    if (document.documentElement.dataset.theme === "system")
      updateThemeColor("system");
    onChange();
  };
  window.addEventListener("portfolio-theme-change", onChange);
  media.addEventListener("change", onSystemThemeChange);
  return () => {
    window.removeEventListener("portfolio-theme-change", onChange);
    media.removeEventListener("change", onSystemThemeChange);
  };
}

function chooseTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  updateThemeColor(next);
  try {
    if (next === "system") localStorage.removeItem("portfolio-theme");
    else localStorage.setItem("portfolio-theme", next);
  } catch {
    // The selected theme still applies for this visit if storage is unavailable.
  }
  window.dispatchEvent(new Event("portfolio-theme-change"));
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  return (
    <div
      className="theme-toggle"
      data-theme={theme}
      role="group"
      aria-label="Color theme"
    >
      <span className="theme-toggle-indicator" aria-hidden="true" />
      {(["light", "dark", "system"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-label={item === "system" ? "System" : undefined}
          aria-pressed={theme === item}
          onClick={() => chooseTheme(item)}
        >
          {item === "system" ? "AUTO" : item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
