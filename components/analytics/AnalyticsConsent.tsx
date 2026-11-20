"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@mdopeace/ui/Button";
import { ConsentNote } from "@mdopeace/ui/ConsentNote";
import { Text } from "@mdopeace/ui/Typography";
import { GA_MEASUREMENT_ID } from "@/components/analytics/config";
import { scheduleAnalytics } from "@/components/analytics/scheduleAnalytics";

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

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(storageKey, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(storageKey, notify);
  };
}

export default function AnalyticsConsent({ measurementId = GA_MEASUREMENT_ID }: { measurementId?: string }) {
  const savedDecision = useSyncExternalStore(subscribe, readDecision, () => undefined);
  const [dismissed, setDismissed] = useState(false);
  const [decisionOverride, setDecisionOverride] = useState<Decision | null>(null);
  const decisionOverrideRef = useRef<Decision | null>(null);
  const accepted = (decisionOverride ?? savedDecision) === "accepted";
  const showChoice = Boolean(measurementId && savedDecision);
  const privacyRef = useRef<HTMLParagraphElement>(null);

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
      <ConsentNote
        open={Boolean(measurementId) && savedDecision === null && !dismissed}
        aria-label="Analytics cookies"
        onAccept={() => decide("accepted")}
        onDecline={() => decide("declined")}
      >
        <Text>May this site use analytics cookies to measure visits and how people explore?</Text>
      </ConsentNote>
      <Text ref={privacyRef} tabIndex={-1} size="caption" tone="muted">
        Privacy note. If enabled, Google Analytics loads only with your consent to count
        visits and see which sections people explore. You can decline and use the whole site.
        {showChoice && " You can change your choice below."}
      </Text>
      {showChoice ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => decide(accepted ? "declined" : "accepted")}
        >
          {accepted ? "Turn off analytics" : "Allow analytics"}
        </Button>
      ) : null}
    </div>
  );
}
