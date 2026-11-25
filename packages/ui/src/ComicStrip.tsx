import type { ComponentPropsWithRef } from "react";
import { cx } from "./tokens";
import styles from "./comic-panel.module.css";

export type ComicStripProps = ComponentPropsWithRef<"div">;

export function ComicStrip({ children, className, ...props }: ComicStripProps) {
  return (
    <div {...props} className={cx(styles.strip, className)}>
      <div className={styles.panels}>{children}</div>
    </div>
  );
}
