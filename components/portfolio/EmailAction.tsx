"use client";
import { useClipboard } from "@mdopeace/ui/hooks/useClipboard";
import { Button } from "@mdopeace/ui/Button";
import { FeedbackLabel } from "@mdopeace/ui/FeedbackLabel";
import { Stack } from "@mdopeace/ui/Layout";
import { Text } from "@mdopeace/ui/Typography";
export function EmailAction({ email }: { email: string }) {
  const { copy, status } = useClipboard();
  return (
    <Stack gap={2}>
      <Button
        variant="secondary"
        size="lg"
        loading={status === "copying"}
        onClick={() => void copy(email)}
      >
        <FeedbackLabel active={status === "success"} idle="Copy email" feedback="Copied!" />
      </Button>
      <Text
        size="caption"
        role="status"
        aria-live="polite"
        className={status === "error" ? undefined : "sr-only"}
      >
        {status === "success"
          ? "Email address copied to clipboard."
          : status === "error"
            ? "Could not copy. Use Start a conversation to email me."
            : ""}
      </Text>
    </Stack>
  );
}
