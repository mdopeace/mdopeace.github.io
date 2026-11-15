import type { ComponentPropsWithRef } from "react";
import { cx, type Size } from "./tokens";
import styles from "./ui.module.css";
export type SelectProps = Omit<ComponentPropsWithRef<"select">, "size"> & {
  size?: Size;
};
export function Select({ size = "md", className, ...props }: SelectProps) {
  return (
    <select
      {...props}
      data-size={size}
      className={cx(styles.select, className)}
    />
  );
}
