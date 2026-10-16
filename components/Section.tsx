export function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-[980px] border-t border-line px-page py-16">
      <p className="mb-6 text-[11px] font-semibold tracking-[0.1em] text-faint uppercase">
        {label}
      </p>
      {children}
    </section>
  );
}