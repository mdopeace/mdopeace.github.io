import type { ComponentPropsWithRef } from "react";
import { Button } from "./Button";
import { Surface } from "./Surface";
import { cx } from "./tokens";
import styles from "./consent-note.module.css";

export type ConsentNoteProps = ComponentPropsWithRef<"div"> & {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  acceptLabel?: string;
  declineLabel?: string;
  layout?: "stacked" | "bar";
};

export function ConsentNote({
  open, onAccept, onDecline, acceptLabel = "Accept", declineLabel = "Decline",
  layout = "stacked", children, className, role = "region", "aria-label": label = "Consent notice", ...props
}: ConsentNoteProps) {
  return (
    <Surface {...props} data-open={open} data-layout={layout} inert={!open} aria-hidden={!open || undefined} role={role} aria-label={label} border="strong" className={cx(styles.note, className)}>
      <div>{children}</div>
      <div className={styles.actions}>
        <Button onClick={onAccept}>{acceptLabel}</Button>
        <Button variant="secondary" onClick={onDecline}>{declineLabel}</Button>
      </div>
    </Surface>
  );
}
