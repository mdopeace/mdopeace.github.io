"use client";
import { useClipboard } from "@/hooks/useClipboard";
import { Button } from "../ui/Button";
import { FeedbackLabel } from "../ui/FeedbackLabel";
import { Stack } from "../ui/Layout";
import { Text } from "../ui/Typography";
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
