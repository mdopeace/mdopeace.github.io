"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { ConsentNote } from "@mdopeace/ui/ConsentNote";
import { Text } from "@mdopeace/ui/Typography";
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

export default function AnalyticsConsent({ measurementId }: { measurementId: string }) {
  const savedDecision = useSyncExternalStore(subscribe, readDecision, () => undefined);
  const [dismissed, setDismissed] = useState(false);
  const accepted = savedDecision === "accepted";

  useEffect(() => {
    if (measurementId && accepted) {
      return scheduleAnalytics(measurementId, () => readDecision() === "accepted");
    }
  }, [measurementId, accepted]);

  function decide(decision: Decision) {
    try {
      window.localStorage.setItem(storageKey, decision);
      window.dispatchEvent(new Event(storageKey));
    } catch {
      // A blocked store grants no consent.
    }
    setDismissed(true);
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
      <Text size="caption" tone="muted">
        Privacy note. If enabled, Google Analytics loads only with your consent and uses
        Md’s personal analytics property. You can decline and use the whole site.
      </Text>
    </div>
  );
}
