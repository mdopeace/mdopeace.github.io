import { createElement, type ReactElement, type ComponentPropsWithRef } from "react";
import {
  cx,
  responsive,
  spaceValue,
  type Align,
  type Justify,
  type Responsive,
  type Size,
  type Space,
} from "./tokens";
import styles from "./ui.module.css";

type LayoutTag = "div" | "section" | "article" | "nav" | "ul" | "ol";
type LayoutProps<T extends LayoutTag> = Omit<ComponentPropsWithRef<T>, "as"> & {
  as?: T;
  gap?: Responsive<Space>;
  align?: Responsive<Align>;
  justify?: Responsive<Justify>;
};
export type StackProps<T extends LayoutTag = "div"> = LayoutProps<T>;
export function Stack<T extends LayoutTag = "div">({
  as,
  gap = 4,
  align = "stretch",
  justify = "start",
  className,
  style,
  ...props
}: StackProps<T>): ReactElement {
  return createElement(as ?? "div", {
    ...props,
    className: cx(styles.stack, className),
    style: {
      ...responsive("gap", gap, spaceValue),
      ...responsive("align", align),
      ...responsive("justify", justify, (v) =>
        v === "between" ? "space-between" : v,
      ),
      ...style,
    },
  });
}
export type InlineProps<T extends LayoutTag = "div"> = LayoutProps<T> & {
  wrap?: Responsive<boolean>;
};
export function Inline<T extends LayoutTag = "div">({
  as,
  gap = 3,
  align = "center",
  justify = "start",
  wrap = true,
  className,
  style,
  ...props
}: InlineProps<T>): ReactElement {
  return createElement(as ?? "div", {
    ...props,
    className: cx(styles.inline, className),
    style: {
      ...responsive("gap", gap, spaceValue),
      ...responsive("align", align),
      ...responsive("justify", justify, (v) =>
        v === "between" ? "space-between" : v,
      ),
      ...responsive("wrap", wrap, (v) => (v ? "wrap" : "nowrap")),
      ...style,
    },
  });
}
type GridTag = "div" | "ul" | "ol";
export type GridProps<T extends GridTag = "div"> = ComponentPropsWithRef<T> & {
  as?: T;
  columns?: Responsive<1 | 2 | 3 | 4>;
  gap?: Responsive<Space>;
  align?: Responsive<Align>;
};
export function Grid<T extends GridTag = "div">({
  as,
  columns = 1,
  gap = 4,
  align = "stretch",
  className,
  style,
  ...props
}: GridProps<T>): ReactElement {
  return createElement(as ?? "div", {
    ...props,
    className: cx(styles.grid, className),
    style: {
      ...responsive("columns", columns),
      ...responsive("gap", gap, spaceValue),
      ...responsive("align", align),
      ...style,
    },
  });
}
export type ContainerProps = ComponentPropsWithRef<"div"> & {
  size?: Size;
  paddingInline?: Responsive<Space>;
};
export function Container({
  size = "lg",
  paddingInline = { base: 3, sm: 4 },
  className,
  style,
  ...props
}: ContainerProps): ReactElement {
  return (
    <div
      {...props}
      data-size={size}
      className={cx(styles.container, className)}
      style={{ ...responsive("pad", paddingInline, spaceValue), ...style }}
    />
  );
}
