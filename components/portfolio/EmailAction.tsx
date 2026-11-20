"use client";
import { useEffect, useRef } from "react";
import { useClipboard } from "@mdopeace/ui/hooks/useClipboard";
import { Button } from "@mdopeace/ui/Button";
import { Burst } from "@mdopeace/ui/Burst";
import { Text } from "@mdopeace/ui/Typography";
import styles from "./email-action.module.css";

const copyError = "Could not copy. Use Start a conversation to email me.";

export function EmailAction({ email }: { email: string }) {
  const { copy, status } = useClipboard({ resetDelay: 2300 });
  const button = useRef<HTMLButtonElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const copying = status === "copying";
  const copied = status === "success";

  useEffect(() => {
    const trigger = button.current!;
    const layer = overlay.current!;
    const position = () => {
      const { left, top, width, height } = trigger.getBoundingClientRect();
      const center = left + width / 2;
      layer.style.left = `${center}px`;
      layer.style.top = `${top + height / 2}px`;
    };
    layer.showPopover();
    position();
    const observer = new ResizeObserver(position);
    observer.observe(trigger);
    observer.observe(document.body);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      layer.hidePopover();
    };
  }, []);

  return (
    <div className={styles.wrap} data-copied={copied}>
      <Button
        ref={button}
        className={styles.button}
        variant="secondary"
        size="lg"
        aria-disabled={copying || undefined}
        onClick={() => {
          if (!copying) void copy(email);
        }}
      >
        Copy email
      </Button>
      <div ref={overlay} popover="manual" className={styles.overlay} aria-hidden="true">
        <Burst size="sm" className={styles.burst}>
          POW! Copied!
        </Burst>
      </div>
      <Text size="caption" aria-hidden="true" className={styles.error} data-visible={status === "error"}>
        {copyError}
      </Text>
      <Text size="caption" className="sr-only" role="status">
        {copied ? "Email address copied to clipboard." : status === "error" ? copyError : ""}
      </Text>
    </div>
  );
}
