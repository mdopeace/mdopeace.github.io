import type { ComponentPropsWithRef, CSSProperties } from "react";
import { cx } from "./tokens";
import styles from "./ui.module.css";
export type DividerProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  orientation?: "horizontal" | "vertical";
  variant?: "solid" | "dashed";
  decorative?: boolean;
};
export function Divider({
  orientation = "horizontal",
  variant = "solid",
  decorative = true,
  className,
  style,
  ...props
}: DividerProps) {
  return (
    <div
      {...props}
      role={decorative ? undefined : "separator"}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cx(styles.divider, className)}
      style={{ "--divider-style": variant, ...style } as CSSProperties}
    />
  );
}
