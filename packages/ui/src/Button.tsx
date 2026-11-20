import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, type Size, type Variant, type AccessibleName } from "./tokens";
import styles from "./ui.module.css";

export type IconTone = "inherit" | "emphasis" | "muted" | "success";

export type ControlAppearance = {
  variant?: Variant;
  size?: Size;
  iconTone?: IconTone;
  startIcon?: ReactNode;
  startIconSize?: Size;
  endIcon?: ReactNode;
};
export type ButtonProps = ComponentPropsWithRef<"button"> &
  Omit<ControlAppearance, "variant"> & { variant?: Variant | "text"; loading?: boolean } & (
    ({ iconOnly: true } & AccessibleName) | { iconOnly?: false }
  );
export function ControlIcon({ children, tone = "inherit", size }: { children: ReactNode; tone?: IconTone; size?: Size }) {
  return children ? (
    <span className={styles.icon} data-tone={tone} data-size={size} aria-hidden="true">
      {children}
    </span>
  ) : null;
}
export function Button({
  variant = "primary",
  size = "md",
  iconTone = "inherit",
  loading = false,
  iconOnly = false,
  type = "button",
  disabled,
  startIcon,
  startIconSize,
  endIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  const isText = variant === "text";
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-size={isText ? undefined : size}
      data-variant={variant}
      data-icon-only={isText ? undefined : iconOnly}
      className={cx(isText ? styles.link : styles.control, className)}
    >
      <ControlIcon tone={iconTone} size={startIconSize}>{startIcon}</ControlIcon>
      {children}
      <ControlIcon tone={iconTone}>{endIcon}</ControlIcon>
    </button>
  );
}
