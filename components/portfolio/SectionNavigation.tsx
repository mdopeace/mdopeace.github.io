"use client";

import { useEffect } from "react";

/** Preserve native anchor destinations without adding fragments to history. */
export function SectionNavigation() {
  useEffect(() => {
    const clearHash = () => {
      if (window.location.hash) {
        window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
      }
    };
    const initialId = window.location.hash.slice(1);
    if (initialId) {
      try {
        document.getElementById(decodeURIComponent(initialId))?.scrollIntoView();
      } catch { /* Ignore malformed fragments. */ }
      clearHash();
    }

    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const href = anchor.getAttribute("href");
      if (!href?.startsWith("#") || href.length === 1) return;
      let target: HTMLElement | null;
      try {
        target = document.getElementById(decodeURIComponent(href.slice(1)));
      } catch { return; }
      if (!target) return;
      event.preventDefault();
      const temporaryFocus = !target.hasAttribute("tabindex") && target.tabIndex < 0;
      if (temporaryFocus) {
        target.tabIndex = -1;
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start" });
      clearHash();
    };
    document.addEventListener("click", navigate);
    return () => document.removeEventListener("click", navigate);
  }, []);
  return null;
}
