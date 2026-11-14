"use client";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { useControllable } from "@/hooks/useControllable";
import { ControlIcon } from "./Button";
import { cx, type Size, type AccessibleName } from "./tokens";
import styles from "./ui.module.css";

type State =
  | { checked: boolean; defaultChecked?: never }
  | { checked?: never; defaultChecked?: boolean };
export type SwitchProps = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "checked" | "defaultChecked" | "children"
> &
  State &
  AccessibleName & {
    size?: Size;
    onCheckedChange?: (checked: boolean) => void;
    checkedIcon?: ReactNode;
    uncheckedIcon?: ReactNode;
  };
export function Switch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  size = "md",
  checkedIcon,
  uncheckedIcon,
  className,
  style,
  ...props
}: SwitchProps) {
  const [isChecked, setChecked] = useControllable(
    checked,
    defaultChecked,
    onCheckedChange,
  );
  return (
    <span
      className={cx(styles.switch, className)}
      style={style}
      data-size={size}
    >
      <input
        {...props}
        type="checkbox"
        role="switch"
        checked={isChecked}
        onChange={(event) => {
          onChange?.(event);
          setChecked(event.target.checked);
        }}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb}>
          <ControlIcon>{isChecked ? checkedIcon : uncheckedIcon}</ControlIcon>
        </span>
      </span>
    </span>
  );
}
