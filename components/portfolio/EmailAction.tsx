"use client";
import { useClipboard } from "@mdopeace/ui/hooks/useClipboard";
import { Button } from "@mdopeace/ui/Button";
import { Burst } from "@mdopeace/ui/Burst";
import { Text } from "@mdopeace/ui/Typography";
import { cx } from "@mdopeace/ui/tokens";
import styles from "./email-action.module.css";

export function EmailAction({ email }: { email: string }) {
  const { copy, status } = useClipboard();
  return (
    <div className={styles.wrap}>
      <Button
        variant="secondary"
        size="lg"
        loading={status === "copying"}
        onClick={() => void copy(email)}
      >
        Copy email
      </Button>
      <Burst
        size="sm"
        status
        animated
        aria-atomic="true"
        className={cx(styles.burst, status === "success" ? undefined : "sr-only")}
      >
        {status === "success" && (
          <>
            <span aria-hidden="true">POW! Copied!</span>
            <span className="sr-only">Email address copied to clipboard.</span>
          </>
        )}
      </Burst>
      <Text size="caption" role="status" className={status === "error" ? undefined : "sr-only"}>
        {status === "error" ? "Could not copy. Use Start a conversation to email me." : ""}
      </Text>
    </div>
  );
}
