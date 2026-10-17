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
  requires,
}: {
  tap: string;
  install: string;
  requires: string[];
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
    // Two halves: the bordered command block on the left, requirements on the
    // right. The border and amber fill belong to the command only — the
    // requirements sit outside them so the block stays a single unit.
    <div className="mt-5 grid max-w-[62ch] items-center gap-x-6 gap-y-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.62fr)]">
      {/* 60/40 rather than 50/50: a command line plus the button beside it
          needs ~308px, which does not fit in half of a 62ch measure. */}
      <div className="flex items-center justify-between gap-3 rounded-[7px] border border-amberline bg-amberbg px-3 py-2.5">
        {/* Two breakable lines rather than one block with a newline: a single
            whitespace-pre-line element cannot shrink below its longest line,
            so it could not wrap and the row overflowed at 320px. */}
        <div className="flex min-w-0 flex-col">
          <code className="font-mono text-[13px] leading-[1.55] break-words text-amber">
            {tap}
          </code>
          <code className="font-mono text-[13px] leading-[1.55] break-words text-amber">
            {install}
          </code>
        </div>
        <button
          type="button"
          onClick={onClick}
          aria-live="polite"
          className={`shrink-0 cursor-pointer rounded-[5px] border bg-none px-2.25 py-[3px] font-sans text-[11px] transition-colors ${
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
      <ul className="text-[11px] leading-[1.5] break-words text-faint">
        {requires.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}