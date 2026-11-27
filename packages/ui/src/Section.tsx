import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Stack } from "./Layout";
import { Heading } from "./Typography";
import { cx, responsive, spaceValue, type Responsive, type Size, type Space } from "./tokens";
import styles from "./ui.module.css";
export type SectionProps = Omit<ComponentPropsWithRef<"section">, "title"> & {
  title: string;
  description?: ReactNode;
  size?: Size;
  heading?: ReactNode;
  contentGap?: Responsive<Space>;
  padding?: Responsive<Space>;
};
export function Section({
  title,
  description,
  size = "md",
  heading,
  contentGap = 8,
  padding,
  children,
  className,
  style,
  ...props
}: SectionProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      {...props}
      className={cx(styles.section, className)}
      data-size={size}
      data-custom-padding={padding !== undefined || undefined}
      style={padding === undefined ? style : { ...responsive("pad", padding, spaceValue), ...style }}
    >
      <Stack gap={contentGap}>
        <Stack gap={3}>
          <div id={id}>
            {heading ?? (
              <Heading level={2} size="section">
                {title}
              </Heading>
            )}
          </div>
          {description}
        </Stack>
        {children}
      </Stack>
    </section>
  );
}
