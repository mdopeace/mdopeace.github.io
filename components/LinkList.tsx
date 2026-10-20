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
  // Project links keep the underline (often the only route to the source);
  // contact is a set, so it takes quiet: no underline.
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
