import type { ReactNode } from "react";

// Requirements sit beside the project name. Informational, so they carry no
// hover or pointer of their own — a pill that looks clickable and isn't is a
// trap. --muted on --panel is a verified 4.5:1 pair.
export default function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-full border border-line px-2 py-1 text-[11px] leading-none text-muted whitespace-nowrap">
      {children}
    </li>
  );
}
