import type { CSSProperties } from "react";

export const spaces = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20] as const;
export type Space = (typeof spaces)[number];
export type Responsive<T> = T | { base: T; sm?: T; md?: T; lg?: T };
export type Size = "sm" | "md" | "lg";
export type Tone = "default" | "subtle" | "accent" | "info" | "emphasis";
export type Elevation = "none" | "sm" | "md" | "lg" | "xl";
export type Align = "start" | "center" | "end" | "stretch";
export type Justify = "start" | "center" | "end" | "between";
export type Variant = "primary" | "secondary" | "ghost" | "emphasis";
export type Stateful<T> =
  { value: T; defaultValue?: never } | { value?: never; defaultValue?: T };

/** CSS variables retain native inline-style overrides and inherit mobile first. */
export function responsive<T extends string | number | boolean>(
  name: string,
  value: Responsive<T>,
  map: (value: T) => string = String,
): CSSProperties {
  const values = typeof value === "object" ? value : { base: value };
  return Object.fromEntries(
    ["base", "sm", "md", "lg"].map((bp) => {
      const value = (values as Partial<Record<string, T>>)[bp];
      return [`--${name}-${bp}`, value === undefined ? "initial" : map(value)];
    }),
  ) as CSSProperties;
}
export const spaceValue = (value: Space) => `var(--ui-space-${value})`;
export const cx = (...values: (string | false | undefined)[]) =>
  values.filter(Boolean).join(" ");

export type AccessibleName =
  { "aria-label": string } | { "aria-labelledby": string };
