import type { ComponentPropsWithRef } from "react";
import { cx } from "./tokens";
import styles from "./ui.module.css";
export type BadgeProps = ComponentPropsWithRef<"span"> & {
  variant?: "outline" | "solid";
  decoration?: "none" | "index" | "stamp";
  stretch?: boolean;
  tilt?: "left" | "right";
  shape?: "label" | "square";
  tone?: "default" | "accent" | "info" | "emphasis" | "success";
  size?: "sm" | "md";
};
export function Badge({
  variant = "outline",
  decoration = "none",
  stretch = false,
  tilt,
  shape = "label",
  tone = "default",
  size = "sm",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      data-decoration={decoration}
      data-tilt={tilt}
      data-shape={shape}
      data-stretch={stretch || undefined}
      data-size={size}
      data-tone={tone}
      data-variant={variant}
      className={cx(styles.badge, className)}
    />
  );
}
