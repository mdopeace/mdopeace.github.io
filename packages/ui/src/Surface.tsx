import { createElement, type ReactElement, type ComponentPropsWithRef } from "react";
import {
  cx,
  responsive,
  spaceValue,
  type Elevation,
  type Responsive,
  type Space,
  type Tone,
} from "./tokens";
import styles from "./ui.module.css";

type Tag = "div" | "article" | "section" | "li" | "header" | "figure";
export type SurfaceProps<T extends Tag = "div"> = Omit<
  ComponentPropsWithRef<T>,
  "as"
> & {
  as?: T;
  tone?: Tone;
  variant?: "solid" | "soft";
  interactive?: boolean;
  padding?: Responsive<Space>;
  elevation?: Elevation;
  radius?: "none" | "sm" | "md" | "full";
  border?: "none" | "thin" | "standard" | "strong";
};
export function Surface<T extends Tag = "div">({
  as,
  tone = "default",
  variant = "solid",
  interactive = false,
  padding = { base: 4, sm: 6 },
  elevation = "lg",
  radius = "none",
  border = "standard",
  className,
  style,
  ...props
}: SurfaceProps<T>): ReactElement {
  return createElement(as ?? "div", {
    ...props,
    "data-ui-surface": tone,
    "data-surface-variant": variant,
    "data-interactive": interactive || undefined,
    className: cx(styles.surface, className),
    style: {
      ...responsive("pad", padding, spaceValue),
      "--elevation": `var(--ui-shadow-${elevation})`,
      "--radius": `var(--ui-radius-${radius})`,
      "--border-width": {
        none: "0px",
        thin: "var(--ui-border-thin)",
        standard: "var(--ui-border-standard)",
        strong: "var(--ui-border-strong)",
      }[border],
      ...style,
    },
  });
}
