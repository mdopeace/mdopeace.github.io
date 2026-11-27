import type { ComponentPropsWithRef } from "react";
import { cx } from "./tokens";
import styles from "./comic-panel.module.css";

export type ComicStripProps = ComponentPropsWithRef<"div"> & {
  alignCaptions?: boolean;
};

export function ComicStrip({ children, className, alignCaptions = false, ...props }: ComicStripProps) {
  return (
    <div {...props} className={cx(styles.strip, className)} data-align-captions={alignCaptions || undefined}>
      <div className={styles.panels}>{children}</div>
    </div>
  );
}
