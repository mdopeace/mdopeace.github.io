import type { ComponentPropsWithRef } from "react";
import { Inline, Stack } from "./Layout";
import { Link, type LinkProps } from "./Link";
import type { Responsive, Space } from "./tokens";
export type LinkItem = Omit<LinkProps, "children"> & { label: string };
export type LinkGroupProps = ComponentPropsWithRef<"ul"> & {
  items: readonly LinkItem[];
  direction?: "horizontal" | "vertical";
  gap?: Responsive<Space>;
};
export function LinkGroup({
  items,
  direction = "horizontal",
  gap = 3,
  ...props
}: LinkGroupProps) {
  const Layout = direction === "horizontal" ? Inline : Stack;
  return (
    <Layout as="ul" gap={gap} {...props}>
      {items.map(({ label, ...item }) => (
        <li key={item.href}>
          <Link {...item}>{label}</Link>
        </li>
      ))}
    </Layout>
  );
}
