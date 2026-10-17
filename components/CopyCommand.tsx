"use client";

import { useState } from "react";

// Styled and behaved like QuickTodo's copy button: same done/failed colours
// from that page's stylesheet, the same 1400ms flash, and the same
// "press ⌘C" fallback for when writeText rejects — which it does when the
// clipboard permission is denied or the document is not focused, and the
// presence of navigator.clipboard does not rule that out.
export function CopyCommand({
  tap,
  install,
}: {
  tap: string;
  install: string;
}) {
  const [label, setLabel] = useState("copy");
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const command = `${tap}\n${install}`;

  const flash = (text: string, next: typeof state) => {
    setLabel(text);
    setState(next);
    setTimeout(() => {
      setLabel("copy");
      setState("idle");
    }, 1400);
  };

  const onClick = () => {
    if (!navigator.clipboard) return flash("press ⌘C", "failed");
    navigator.clipboard.writeText(command).then(
      () => flash("copied", "done"),
      () => flash("press ⌘C", "failed"),
    );
  };

  return (
    <div className="mt-5 flex max-w-[62ch] items-center gap-3 rounded-lg border border-amberline bg-amberbg px-3 py-2">
      <code className="min-w-0 font-mono text-xs break-words whitespace-pre-line text-amber">
        {tap}
        {"\n"}
        {install}
      </code>
      <button
        type="button"
        onClick={onClick}
        aria-live="polite"
        className={`shrink-0 cursor-pointer rounded-[5px] border bg-none px-2 py-[3px] font-sans text-[11px] transition-colors ${
          state === "done"
            ? "border-[#2c4a32] text-[#3fb950]"
            : state === "failed"
              ? "border-amberline text-amber"
              : "border-line text-muted hover:border-faint hover:text-text"
        }`}
      >
        {label}
      </button>
    </div>
  );
}