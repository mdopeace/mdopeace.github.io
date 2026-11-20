"use client";
import { useClipboard } from "@mdopeace/ui/hooks/useClipboard";
import { Button } from "@mdopeace/ui/Button";
import { Burst } from "@mdopeace/ui/Burst";
import { Text } from "@mdopeace/ui/Typography";
import styles from "./email-action.module.css";

const copyError = "Could not copy. Use Start a conversation to email me.";

export function EmailAction({ email }: { email: string }) {
  const { copy, status } = useClipboard();
  const copying = status === "copying";
  return (
    <div className={styles.wrap}>
      {status === "success" && (
        <Burst size="sm" animated aria-hidden="true" className={styles.burst}>
          POW! Copied!
        </Burst>
      )}
      <Button
        variant="secondary"
        size="lg"
        aria-disabled={copying || undefined}
        onClick={() => {
          if (!copying) void copy(email);
        }}
      >
        Copy email
      </Button>
      {status === "error" && <Text size="caption" aria-hidden="true">{copyError}</Text>}
      <Text size="caption" className="sr-only" role="status">
        {status === "success" ? "Email address copied to clipboard." : status === "error" ? copyError : ""}
      </Text>
    </div>
  );
}
