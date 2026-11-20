"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@mdopeace/ui/Button";
import { FeedbackLabel } from "@mdopeace/ui/FeedbackLabel";
import { ConsentNote } from "@mdopeace/ui/ConsentNote";
import { Text } from "@mdopeace/ui/Typography";
import { GA_MEASUREMENT_ID } from "@/components/analytics/config";
import { scheduleAnalytics } from "@/components/analytics/scheduleAnalytics";
import styles from "./analytics-consent.module.css";

type Decision = "accepted" | "declined";
const storageKey = "portfolio-analytics-consent";

function readDecision() {
  try {
    const decision = window.localStorage.getItem(storageKey);
    return decision === "accepted" || decision === "declined" ? decision : null;
  } catch {
    return null;
  }
}

export default function AnalyticsConsent({ measurementId = GA_MEASUREMENT_ID }: { measurementId?: string }) {
  const privacyRef = useRef<HTMLParagraphElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const choiceRef = useRef<HTMLButtonElement>(null);
  const promptDescriptionId = useId();
  const subscribe = useCallback((notify: () => void) => {
    function updateFromStorage(event: StorageEvent) {
      if (event.key !== storageKey && event.key !== null) return;
      const active = document.activeElement;
      const decision = readDecision();
      if ((promptRef.current?.contains(active) && decision) ||
          (choiceRef.current === active && !decision)) {
        privacyRef.current?.focus();
      }
      notify();
    }
    window.addEventListener("storage", updateFromStorage);
    window.addEventListener(storageKey, notify);
    return () => {
      window.removeEventListener("storage", updateFromStorage);
      window.removeEventListener(storageKey, notify);
    };
  }, []);
  const savedDecision = useSyncExternalStore(subscribe, readDecision, () => undefined);
  const [dismissed, setDismissed] = useState(false);
  const [decisionOverride, setDecisionOverride] = useState<Decision | null>(null);
  const decisionOverrideRef = useRef<Decision | null>(null);
  const accepted = (decisionOverride ?? savedDecision) === "accepted";
  const showChoice = Boolean(measurementId && savedDecision);

  useEffect(() => {
    if (measurementId && accepted) {
      return scheduleAnalytics(
        measurementId,
        () => (decisionOverrideRef.current ?? readDecision()) === "accepted",
      );
    }
  }, [measurementId, accepted]);

  function decide(decision: Decision) {
    let override: Decision | null = null;
    try {
      window.localStorage.setItem(storageKey, decision);
    } catch {
      override = "declined";
    }
    decisionOverrideRef.current = override;
    setDecisionOverride(override);
    if (override === null) window.dispatchEvent(new Event(storageKey));
    setDismissed(true);
    queueMicrotask(() => privacyRef.current?.focus());
  }

  return (
    <div className="analytics-privacy">
      <Text ref={privacyRef} tabIndex={-1} size="caption" tone="muted">
        Privacy note. If enabled, Google Analytics loads only with your consent to count
        visits and see which sections people explore. You can decline and use the whole site.
        <span className={styles.choice} data-visible={showChoice} aria-hidden={!showChoice || undefined}>
          {" You can change your choice below."}
        </span>
      </Text>
      <ConsentNote
        ref={promptRef}
        open={Boolean(measurementId) && savedDecision === null && !dismissed}
        aria-label="Analytics cookies"
        aria-describedby={promptDescriptionId}
        onAccept={() => decide("accepted")}
        onDecline={() => decide("declined")}
      >
        <Text id={promptDescriptionId}>May this site use analytics cookies to measure visits and how people explore?</Text>
      </ConsentNote>
      <Button
        ref={choiceRef}
        variant="ghost"
        size="sm"
        className={styles.choice}
        data-visible={showChoice}
        inert={!showChoice}
        aria-hidden={!showChoice || undefined}
        onClick={() => decide(accepted ? "declined" : "accepted")}
      >
        <FeedbackLabel active={accepted} idle="Allow analytics" feedback="Turn off analytics" />
      </Button>
    </div>
  );
}
