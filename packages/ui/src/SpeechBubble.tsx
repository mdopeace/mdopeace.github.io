import type { ComponentPropsWithRef } from "react";
import { Surface } from "./Surface";
import { cx, type Size, type Tone } from "./tokens";
import styles from "./speech-bubble.module.css";

export type SpeechBubbleProps = ComponentPropsWithRef<"div"> & {
  tail?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  tone?: Tone;
  size?: Size;
};

export function SpeechBubble({
  tail = "bottom-start", tone = "default", size = "md", className, ...props
}: SpeechBubbleProps) {
  return (
    <Surface
      {...props}
      tone={tone}
      padding={size === "sm" ? 3 : size === "md" ? 4 : 5}
      border="strong"
      radius="none"
      className={cx(styles.bubble, className)}
      data-tail={tail}
      data-size={size}
    />
  );
}
