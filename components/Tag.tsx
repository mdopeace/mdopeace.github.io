import type { ReactNode } from "react";

export default function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full border border-line px-2 py-1 text-[11px] leading-none text-muted whitespace-nowrap">
      {children}
    </li>
  );
}
