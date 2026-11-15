import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { Stack } from "./Layout";
import { Heading } from "./Typography";
import { cx, type Size } from "./tokens";
import styles from "./ui.module.css";
export type SectionProps = Omit<ComponentPropsWithRef<"section">, "title"> & {
  title: string;
  description?: ReactNode;
  size?: Size;
  heading?: ReactNode;
};
export function Section({
  title,
  description,
  size = "md",
  heading,
  children,
  className,
  ...props
}: SectionProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      {...props}
      className={cx(styles.section, className)}
      data-size={size}
    >
      <Stack gap={8}>
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
