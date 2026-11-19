"use client";
import { useClipboard } from "@mdopeace/ui/hooks/useClipboard";
import { Button } from "@mdopeace/ui/Button";
import { Burst } from "@mdopeace/ui/Burst";
import { Stack } from "@mdopeace/ui/Layout";
import { Text } from "@mdopeace/ui/Typography";
export function EmailAction({ email }: { email: string }) {
  const { copy, status } = useClipboard();
  return (
    <Stack gap={2} align="start">
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
        className={status === "success" ? undefined : "sr-only"}
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
    </Stack>
  );
}
