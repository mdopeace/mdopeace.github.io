import type { ComponentPropsWithRef } from "react";
import { Surface } from "./Surface";
import { cx, type Size, type Tone } from "./tokens";
import styles from "./speech-bubble.module.css";

export type SpeechBubbleProps = ComponentPropsWithRef<"div"> & {
  variant?: "speech" | "shout" | "thought" | "whisper" | "caption";
  tail?: "none" | `${"top" | "bottom"}-${"start" | "center" | "end"}` | "inline-start" | "inline-end";
  tone?: Extract<Tone, "default" | "accent" | "emphasis">;
  size?: Size;
};

export function SpeechBubble({
  variant = "speech",
  tail = variant === "caption" ? "none" : "bottom-start",
  tone = "default", size = "md", className, children, dangerouslySetInnerHTML, ...props
}: SpeechBubbleProps) {
  const shaped = variant === "shout" || variant === "thought";
  return (
    <Surface
      {...props}
      tone={tone}
      padding={size === "sm" ? 3 : size === "md" ? 4 : 5}
      border="strong"
      radius="none"
      className={cx(styles.bubble, className)}
      data-variant={variant}
      data-tail={tail}
      data-size={size}
      dangerouslySetInnerHTML={shaped ? undefined : dangerouslySetInnerHTML}
    >
      {shaped ? (
        <>
          <span className={styles.outline} aria-hidden="true" />
          {dangerouslySetInnerHTML ? <div dangerouslySetInnerHTML={dangerouslySetInnerHTML} /> : children}
        </>
      ) : children}
    </Surface>
  );
}
