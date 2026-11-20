"use client";

import { useEffect } from "react";

function clearHash() {
  if (window.location.hash) {
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  }
}

export function getSectionLinkTarget(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = event.target instanceof Element ? event.target.closest("a") : null;
  if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return null;
  const href = anchor.getAttribute("href");
  if (!href?.startsWith("#") || href.length === 1) return null;
  try {
    return document.getElementById(decodeURIComponent(href.slice(1)));
  } catch {
    return null;
  }
}

export function navigateToSection(target: HTMLElement) {
  const temporaryFocus = !target.hasAttribute("tabindex") && target.tabIndex < 0;
  if (temporaryFocus) {
    target.tabIndex = -1;
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start" });
  clearHash();
}

/** Preserve native anchor destinations without adding fragments to history. */
export function SectionNavigation() {
  useEffect(() => {
    const initialId = window.location.hash.slice(1);
    if (initialId) {
      try {
        document.getElementById(decodeURIComponent(initialId))?.scrollIntoView();
      } catch { /* Ignore malformed fragments. */ }
      clearHash();
    }

    const navigate = (event: MouseEvent) => {
      const target = getSectionLinkTarget(event);
      if (!target) return;
      event.preventDefault();
      navigateToSection(target);
    };
    document.addEventListener("click", navigate);
    return () => document.removeEventListener("click", navigate);
  }, []);
  return null;
}
