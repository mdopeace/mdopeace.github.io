import type { ComponentPropsWithRef, ReactNode } from "react";
import { ComicVideo, type ComicPanelVideo } from "./ComicVideo";
import { Surface } from "./Surface";
import { cx } from "./tokens";
import styles from "./comic-panel.module.css";

export type { ComicPanelVideo } from "./ComicVideo";

export type ComicPanelProps = ComponentPropsWithRef<"figure"> & {
  caption?: ReactNode;
} & (
  | { media?: ReactNode; video?: never }
  | { media?: never; video: ComicPanelVideo }
);

export function ComicPanel({ caption, media, video, children, className, ...props }: ComicPanelProps) {
  return (
    <Surface as="figure" padding={0} border="strong" {...props} className={cx(styles.panel, className)}>
      {video ? <ComicVideo key={video.src} {...video} /> : media}
      {children != null && <div className={styles.body}>{children}</div>}
      {caption != null && <figcaption className={styles.caption}>{caption}</figcaption>}
    </Surface>
  );
}
