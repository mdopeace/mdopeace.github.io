import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, type Size, type Variant, type AccessibleName } from "./tokens";
import styles from "./ui.module.css";

export type ControlAppearance = {
  variant?: Variant;
  size?: Size;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};
export type ButtonProps = ComponentPropsWithRef<"button"> &
  ControlAppearance & { loading?: boolean } & (
    ({ iconOnly: true } & AccessibleName) | { iconOnly?: false }
  );
export function ControlIcon({ children }: { children: ReactNode }) {
  return children ? (
    <span className={styles.icon} aria-hidden="true">
      {children}
    </span>
  ) : null;
}
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconOnly = false,
  type = "button",
  disabled,
  startIcon,
  endIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-size={size}
      data-variant={variant}
      data-icon-only={iconOnly}
      className={cx(styles.control, className)}
    >
      <ControlIcon>{startIcon}</ControlIcon>
      {children}
      <ControlIcon>{endIcon}</ControlIcon>
    </button>
  );
}
