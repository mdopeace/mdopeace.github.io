import type { ReactNode } from "react";

export default function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-line py-16">
      <p className="mb-6 text-[11px] font-semibold tracking-[0.1em] text-faint uppercase">
        {label}
      </p>
      {children}
    </section>
  );
}
