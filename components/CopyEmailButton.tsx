"use client";

import { useEffect, useRef, useState } from "react";

export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(timer.current ?? undefined), []);

  const flashCopied = () => {
    setCopied(true);
    clearTimeout(timer.current ?? undefined);
    timer.current = setTimeout(() => setCopied(false), 1400);
  };

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      flashCopied();
      setCopyFailed(false);
    } catch {
      clearTimeout(timer.current ?? undefined);
      setCopied(false);
      setCopyFailed(true);
    }
  }

  return (
    <div className="copy-email-wrap">
      <button className="copy-email-button" type="button" onClick={copyEmail}>
        {copied ? "Copied!" : "Copy email"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied
          ? "Email address copied to clipboard."
          : copyFailed
            ? "Could not copy the address. Use Start a conversation to email me."
            : ""}
      </span>
    </div>
  );
}
