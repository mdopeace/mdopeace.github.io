import type { ComponentPropsWithRef, ReactNode } from "react";
import { ComicVideo, type ComicPanelVideo } from "./ComicVideo";
import { Surface, type SurfaceProps } from "./Surface";
import { cx } from "./tokens";
import styles from "./comic-panel.module.css";

export type { ComicPanelVideo } from "./ComicVideo";

export type ComicPanelProps = ComponentPropsWithRef<"figure"> & {
  caption?: ReactNode;
  captionTitle?: string;
  border?: Extract<SurfaceProps<"figure">["border"], "standard" | "strong">;
} & (
  | { media?: ReactNode; video?: never }
  | { media?: never; video: ComicPanelVideo }
);

export function ComicPanel({ caption, captionTitle, border = "strong", media, video, children, className, ...props }: ComicPanelProps) {
  return (
    <Surface as="figure" padding={0} border={border} {...props} className={cx(styles.panel, className)}>
      {video ? <ComicVideo key={video.src} {...video} /> : media}
      {children != null && <div className={styles.body}>{children}</div>}
      {(caption != null || captionTitle) && (
        <figcaption className={cx(styles.caption, captionTitle && styles.titledCaption)}>
          {captionTitle ? (
            <>
              <strong className={styles.captionTitle}>{captionTitle}</strong>
              {caption != null && <>{" "}<div className={styles.captionDescription}>{caption}</div></>}
            </>
          ) : caption}
        </figcaption>
      )}
    </Surface>
  );
}
