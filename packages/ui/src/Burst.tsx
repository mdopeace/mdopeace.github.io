import type { ComponentPropsWithRef } from "react";
import { cx, type Size, type Tone } from "./tokens";
import styles from "./burst.module.css";

export type BurstProps = ComponentPropsWithRef<"div"> & {
  size?: Size;
  tone?: Extract<Tone, "default" | "accent" | "emphasis">;
  animated?: boolean;
  status?: boolean;
};

export function Burst({
  children, size = "md", tone = "accent", animated = false, status = false,
  className, ...props
}: BurstProps) {
  return (
    <div
      {...props}
      {...(status ? { role: "status", "aria-live": "polite", "aria-atomic": true } : {})}
      className={cx(styles.burst, className)}
      data-animated={animated || undefined}
      data-tone={tone}
      data-size={size}
    >
      {children != null && <div className={styles.face}>{children}</div>}
    </div>
  );
}
