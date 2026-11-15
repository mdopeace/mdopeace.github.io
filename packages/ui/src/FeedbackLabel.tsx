import type { ReactNode } from "react";
import styles from "./ui.module.css";

/** Both states reserve space so feedback never changes the control width. */
export function FeedbackLabel({ active, idle, feedback }: { active: boolean; idle: ReactNode; feedback: ReactNode }) {
  return (
    <span className={styles.feedback}>
      <span data-active={!active} aria-hidden={active}>{idle}</span>
      <span data-active={active} aria-hidden={!active}>{feedback}</span>
    </span>
  );
}
