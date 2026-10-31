"use client";

import { useState } from "react";

export default function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setCopyFailed(false);
    } catch {
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
