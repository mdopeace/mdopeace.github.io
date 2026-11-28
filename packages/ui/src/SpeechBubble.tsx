import type { ComponentPropsWithRef } from "react";
import { Surface } from "./Surface";
import { cx, type Size, type Tone } from "./tokens";
import styles from "./speech-bubble.module.css";

export type SpeechBubbleProps = ComponentPropsWithRef<"div"> & {
  variant?: "speech" | "thought";
  tail?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  tone?: Extract<Tone, "default" | "accent" | "emphasis">;
  size?: Size;
};

export function SpeechBubble({
  variant = "speech", tail = "bottom-start", tone = "default", size = "md",
  className, children, ...props
}: SpeechBubbleProps) {
  const thought = variant === "thought";
  return (
    <Surface
      {...props}
      tone={tone}
      padding={size === "sm" ? 3 : size === "md" ? 4 : 5}
      border={thought ? "none" : "strong"}
      elevation={thought ? "none" : "lg"}
      radius="none"
      className={cx(styles.bubble, className)}
      data-bubble-variant={variant}
      data-tail={tail}
      data-size={size}
    >
      {thought && (
        <>
          <svg className={styles.cloud} viewBox="0 0 208 80" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <path transform="scale(1.3 1)" vectorEffect="non-scaling-stroke" d="M31 69 C16 73 5 63 7 50 C-2 38 5 23 20 22 C22 10 36 5 49 11 C58 1 76 1 87 9 C99 2 117 6 123 16 C139 13 152 22 150 35 C163 44 159 58 146 63 C141 75 124 77 113 71 C104 80 86 80 76 73 C62 81 44 78 37 70 Z" />
          </svg>
          <svg className={styles.dots} viewBox="0 0 26 26" aria-hidden="true">
            <g className={styles.dotTrail}>
              <circle cx="17" cy="7" r="5" />
              <circle cx="6" cy="20" r="3" />
            </g>
          </svg>
        </>
      )}
      {children}
    </Surface>
  );
}
