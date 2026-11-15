import { createElement, type ComponentPropsWithRef } from "react";
import { cx } from "./tokens";
import styles from "./ui.module.css";

export type HeadingProps = ComponentPropsWithRef<"h2"> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "title" | "section" | "display" | "card" | "label" | "feature" | "statement" | "dialog";
  tone?: "default" | "muted" | "emphasis";
};
export function Heading({
  level,
  size = "title",
  tone = "default",
  className,
  ...props
}: HeadingProps) {
  return createElement(`h${level}`, {
    ...props,
    "data-size": size,
    "data-tone": tone,
    className: cx(styles.heading, className),
  });
}
export type TextProps<T extends "p" | "span" | "strong" = "p"> =
  ComponentPropsWithRef<T> & {
    as?: T;
    size?: "xs" | "caption" | "sm" | "body" | "md" | "lg";
    weight?: "regular" | "medium" | "bold" | "black";
    tone?: "default" | "muted" | "subtle" | "emphasis" | "success";
    align?: "start" | "center" | "end";
    font?: "body" | "mono";
    leading?: "normal" | "tight";
    variant?: "body" | "eyebrow" | "callout" | "quote";
  };
export function Text<T extends "p" | "span" | "strong" = "p">({
  as,
  size = "md",
  weight = "regular",
  tone = "default",
  align = "start",
  font = "body",
  leading = "normal",
  variant = "body",
  className,
  style,
  ...props
}: TextProps<T>) {
  return createElement(as ?? "p", {
    ...props,
    "data-size": size,
    "data-weight": weight,
    "data-tone": tone,
    "data-font": font,
    "data-leading": leading,
    "data-variant": variant,
    className: cx(styles.text, className),
    style: { "--text-align": align, ...style },
  });
}
