"use client";

import { useEffect, useRef, useState } from "react";

// writeText rejects when permission is denied or the document isn't
// focused — hence the "press ⌘C" fallback instead of a silent failure.
export default function CopyButton({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const flash = (next: "done" | "failed") => {
    setState(next);
    clearTimeout(timer.current ?? undefined);
    timer.current = setTimeout(() => setState("idle"), 1400);
  };

  const label =
    state === "idle" ? "copy" : state === "done" ? "copied" : "press ⌘C";

  const cls =
    state === "done"
      ? "border-done-line text-done"
      : state === "failed"
        ? "border-amber-line text-amber"
        : "border-line text-muted hover:border-faint hover:text-text";

  return (
    <button
      type="button"
      aria-live="polite"
      data-copy={text}
      onClick={() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(
            () => flash("done"),
            () => flash("failed"),
          );
        } else {
          flash("failed");
        }
      }}
      className={`flex-none cursor-pointer rounded-[5px] border px-[9px] py-[3px] text-[11px] ${cls}`}
    >
      {label}
    </button>
  );
}
