import type { ProjectLink } from "@/data/projects";

export default function LinkList({
  items,
  quiet = false,
  className = "",
}: {
  items: (ProjectLink & { rel?: string })[];
  quiet?: boolean;
  className?: string;
}) {
  // Project links keep the underline: they are 14px and are often the only
  // route to the source, the releases and the tap, so they need the
  // affordance rather than colour alone. The contact set is a set, not
  // content references, so it takes the quieter treatment (quiet).
  return (
    <ul className={`links flex flex-wrap gap-y-1 ${className}`}>
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            rel={item.rel}
            className={quiet ? "no-underline" : undefined}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
