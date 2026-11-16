"use client";
import type { ComponentPropsWithRef, CSSProperties } from "react";
import { useClipboard } from "./hooks/useClipboard";
import { Button } from "./Button";
import { FeedbackLabel } from "./FeedbackLabel";
import { Inline } from "./Layout";
import { Text } from "./Typography";
import { HighlightedCode } from "./HighlightedCode";
import { cx } from "./tokens";
import styles from "./code-example.module.css";
export type CodeExampleProps = Omit<
  ComponentPropsWithRef<"div">,
  "children"
> & {
  code: string;
  title?: string;
  description?: string;
  codeLabel?: string;
  language?: "tsx" | "text";
  border?: "none" | "standard";
  /** Limits only the scrollable code area. Numbers are pixels. */
  maxHeight?: CSSProperties["maxHeight"];
};
export function CodeExample({
  code,
  title = "Usage · React / TSX",
  description,
  codeLabel = "Code example",
  language = "tsx",
  border = "standard",
  maxHeight,
  className,
  ...props
}: CodeExampleProps) {
  const { copy, status } = useClipboard();
  return (
    <div
      {...props}
      data-border={border}
      className={cx(styles.example, className)}
    >
      <Inline justify="between">
        <Text size="caption" font="mono">
          {title}
        </Text>
        <Button
          size="sm"
          variant="ghost"
          loading={status === "copying"}
          onClick={() => void copy(code)}
        >
          <FeedbackLabel
            active={status === "success"}
            idle="Copy code"
            feedback="Copied"
          />
        </Button>
      </Inline>
      <pre tabIndex={0} aria-label={codeLabel} style={{ maxHeight }}>
        {language === "tsx" ? (
          <HighlightedCode code={code} />
        ) : (
          <code>{code}</code>
        )}
      </pre>
      {description && (
        <Text size="caption" tone="muted">
          {description}
        </Text>
      )}
      <span className={styles.srOnly} role="status">
        {status === "success"
          ? "Example copied."
          : status === "error"
            ? "Copy failed. Select the example to copy it manually."
            : ""}
      </span>
    </div>
  );
}
