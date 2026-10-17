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
    // No horizontal padding and no max-width: the page wrapper owns the
    // measure and the gutter, so the rule spans the content box exactly.
    <section className="border-t border-line py-16">
      <Heading className="mb-6 text-[11px] font-semibold tracking-[0.1em] text-faint uppercase">
        {label}
      </Heading>
      {children}
    </section>
  );
}