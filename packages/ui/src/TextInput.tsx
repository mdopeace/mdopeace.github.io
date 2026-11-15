import type { ComponentPropsWithRef } from "react";
import { cx, type Size } from "./tokens";
import styles from "./ui.module.css";
export type TextInputProps = Omit<ComponentPropsWithRef<"input">, "size"> & {
  size?: Size;
};
export function TextInput({
  size = "md",
  type = "text",
  className,
  ...props
}: TextInputProps) {
  return (
    <input
      {...props}
      type={type}
      data-size={size}
      className={cx(styles.textInput, className)}
    />
  );
}
