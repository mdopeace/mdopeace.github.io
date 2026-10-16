export function Section({
  label,
  as: Heading = "p",
  children,
}: {
  label: string;
  /** Section labels are headings so a screen reader can navigate by them. */
  as?: "h2" | "p";
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-[980px] border-t border-line px-page py-16">
      <Heading className="mb-6 text-[11px] font-semibold tracking-[0.1em] text-faint uppercase">
        {label}
      </Heading>
      {children}
    </section>
  );
}