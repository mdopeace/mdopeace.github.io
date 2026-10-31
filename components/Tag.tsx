import type { ReactNode } from "react";

export default function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-none border-2 border-line px-2 py-1 text-[11px] leading-none text-muted whitespace-nowrap shadow-[2px_2px_0_var(--ink)]">
      {children}
    </li>
  );
}
