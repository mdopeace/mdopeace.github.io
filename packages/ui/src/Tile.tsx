import type { ComponentPropsWithRef, CSSProperties } from "react";
import { cx } from "./tokens";
import styles from "./tile.module.css";

export type TileProps = ComponentPropsWithRef<"span"> & {
  size?: "sm" | "md" | "lg";
  faceColor?: string;
  textColor?: string;
  frameColor?: string;
  inset?: boolean;
};

/** A decorative framed face. Wrap in a link or button for interaction. */
export function Tile({
  size = "sm", faceColor, textColor, frameColor, inset = true,
  className, style, children, ...props
}: TileProps) {
  return (
    <span
      {...props}
      className={cx(styles.tile, className)}
      data-size={size}
      data-inset={inset}
      style={{
        "--tile-face": faceColor,
        "--tile-text": textColor,
        "--tile-frame": frameColor,
        ...style,
      } as CSSProperties}
    >
      <span className={styles.face}>{children}</span>
    </span>
  );
}
