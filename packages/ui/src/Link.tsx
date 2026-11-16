import type { ComponentPropsWithRef } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import { ControlIcon, type ControlAppearance } from "./Button";
import { cx } from "./tokens";
import styles from "./ui.module.css";

export type LinkProps = Omit<ComponentPropsWithRef<"a">, "href"> &
  Omit<ControlAppearance, "variant"> & {
    href: string;
    variant?: "text" | "nav" | ControlAppearance["variant"];
    externalIndicator?: boolean;
  };
export function Link({
  variant = "text",
  size = "md",
  iconTone = "inherit",
  externalIndicator = false,
  startIcon,
  startIconSize,
  endIcon,
  children,
  className,
  target,
  rel,
  ...props
}: LinkProps) {
  const safeRel =
    target === "_blank"
      ? [
          ...new Set(`${rel ?? ""} noopener noreferrer`.trim().split(/\s+/)),
        ].join(" ")
      : rel;
  return (
    <a
      {...props}
      target={target}
      rel={safeRel}
      data-size={size}
      data-variant={variant}
      className={cx(
        variant === "text" || variant === "nav" ? styles.link : styles.control,
        className,
      )}
    >
      <ControlIcon tone={iconTone} size={startIconSize}>{startIcon}</ControlIcon>
      {children}
      <ControlIcon tone={iconTone}>
        {endIcon ??
          (externalIndicator ? (
            <FaArrowRightLong focusable="false" style={{ transform: "rotate(-45deg)" }} />
          ) : null)}
      </ControlIcon>
    </a>
  );
}
