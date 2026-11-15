"use client";
import type { ComponentPropsWithRef } from "react";
import { FaCheck, FaCopy } from "react-icons/fa6";
import { useClipboard } from "./hooks/useClipboard";
import { Button } from "./Button";
import { FeedbackLabel } from "./FeedbackLabel";
import { Surface } from "./Surface";
import { Stack } from "./Layout";
import styles from "./ui.module.css";
export type CodeBlockProps = ComponentPropsWithRef<"div"> & {
  code: string;
  copyLabel?: string;
  successMessage?: string;
  errorMessage?: string;
};
export function CodeBlock({
  code,
  copyLabel = "Copy",
  successMessage = "Copied to clipboard.",
  errorMessage = "Could not copy. Select the command and copy it manually.",
  ...props
}: CodeBlockProps) {
  const { copy, status } = useClipboard();
  if (!code) return null;
  return (
    <Surface {...props} tone="accent" elevation="none" padding={3}>
      <Stack gap={2}>
        <div className={styles.code}>
          <pre tabIndex={0} aria-label="Installation command">
            <code>{code}</code>
          </pre>
          <Button
            className={styles.codeButton}
            size="sm"
            variant="secondary"
            data-copy={code}
            loading={status === "copying"}
            onClick={() => void copy(code)}
            startIcon={<FeedbackLabel active={status === "success"} idle={<FaCopy />} feedback={<FaCheck />} />}
          >
            <FeedbackLabel active={status === "success"} idle={copyLabel} feedback="Copied" />
          </Button>
        </div>
        <span
          role="status"
          aria-live="polite"
          className={status === "error" ? styles.status : styles.srOnly}
        >
          {status === "success"
            ? successMessage
            : status === "error"
              ? errorMessage
              : ""}
        </span>
      </Stack>
    </Surface>
  );
}
