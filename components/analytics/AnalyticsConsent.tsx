"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Badge } from "@mdopeace/ui/Badge";
import { Button } from "@mdopeace/ui/Button";
import { ConsentNote } from "@mdopeace/ui/ConsentNote";
import { Container, Stack } from "@mdopeace/ui/Layout";
import { Text } from "@mdopeace/ui/Typography";
import { GA_COOKIE_DAYS, GA_MEASUREMENT_ID } from "@/components/analytics/config";
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

function clearAnalyticsCookies(id: string) {
  const labels = window.location.hostname.split(".");
  const domains = labels.slice(0, -1).map((_, index) => `Domain=${labels.slice(index).join(".")}; `);
  for (const name of ["_ga", `_ga_${id.slice(2)}`]) {
    for (const domain of ["", ...domains]) {
      document.cookie = `${name}=; ${domain}Path=/; Max-Age=0`;
    }
  }
}

export default function AnalyticsConsent({ measurementId = GA_MEASUREMENT_ID }: { measurementId?: string }) {
  const enabled = /^G-[A-Z0-9]+$/.test(measurementId);
  const bannerRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLButtonElement>(null);
  const openedBySettings = useRef(false);
  const promptId = useId();
  const descriptionId = useId();
  const statusId = useId();
  const [reviewing, setReviewing] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [decisionOverride, setDecisionOverride] = useState<Decision | null>(null);
  const decisionOverrideRef = useRef<Decision | null>(null);
  const restoreFocus = useCallback(() => {
    const target = openedBySettings.current
      ? settingsRef.current
      : document.getElementById("main-content") ?? settingsRef.current;
    openedBySettings.current = false;
    target?.focus({ preventScroll: true });
  }, []);
  const subscribe = useCallback((notify: () => void) => {
    function updateFromStorage(event: StorageEvent) {
      if (event.key !== storageKey && event.key !== null) return;
      if (readDecision()) {
        if (promptRef.current?.contains(document.activeElement)) restoreFocus();
        setReviewing(false);
      } else {
        setDismissed(false);
      }
      notify();
    }
    window.addEventListener("storage", updateFromStorage);
    window.addEventListener(storageKey, notify);
    return () => {
      window.removeEventListener("storage", updateFromStorage);
      window.removeEventListener(storageKey, notify);
    };
  }, [restoreFocus]);

  const savedDecision = useSyncExternalStore(subscribe, readDecision, () => undefined);
  const decision = decisionOverride ?? savedDecision;
  const savedStatus = reviewing && decision ? (decision === "accepted" ? "On" : "Off") : null;
  const open = enabled && (reviewing || (decision === null && !dismissed));

  useEffect(() => {
    if (!enabled) return;
    if (decision === "accepted") {
      return scheduleAnalytics(
        measurementId,
        () => (decisionOverrideRef.current ?? readDecision()) === "accepted",
      );
    }
    if (decision === "declined") clearAnalyticsCookies(measurementId);
  }, [decision, enabled, measurementId]);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!open || !banner) return;
    const root = document.documentElement;
    const setClearance = () => root.style.setProperty("--consent-clearance", `${banner.getBoundingClientRect().height}px`);
    setClearance();
    const observer = new ResizeObserver(setClearance);
    observer.observe(banner);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--consent-clearance");
    };
  }, [open]);

  function decide(nextDecision: Decision) {
    let override: Decision | null = null;
    try {
      window.localStorage.setItem(storageKey, nextDecision);
    } catch {
      override = "declined";
    }
    decisionOverrideRef.current = override;
    setDecisionOverride(override);
    if (override === null) window.dispatchEvent(new Event(storageKey));
    setReviewing(false);
    setDismissed(true);
    queueMicrotask(restoreFocus);
  }

  if (!enabled) return null;

  return (
    <>
      <Stack gap={2} align="start" className={styles.privacy}>
        <Text size="caption" tone="muted">
          Privacy note. If enabled, Google Analytics loads only with your consent to count
          visits and see which sections people explore. You can decline and use the whole site.
        </Text>
        <Button
          ref={settingsRef}
          variant="text"
          size="sm"
          aria-controls={promptId}
          aria-expanded={open}
          onClick={() => {
            openedBySettings.current = true;
            setReviewing(true);
            requestAnimationFrame(() => promptRef.current?.focus({ preventScroll: true }));
          }}
        >
          Privacy settings
        </Button>
      </Stack>
      <Container ref={bannerRef} className={styles.banner}>
        <ConsentNote
          id={promptId}
          ref={promptRef}
          tabIndex={-1}
          open={open}
          layout="stacked"
          aria-label="Analytics cookies"
          aria-describedby={savedStatus ? `${statusId} ${descriptionId}` : descriptionId}
          onAccept={() => decide("accepted")}
          onDecline={() => decide("declined")}
        >
          <Stack gap={1} align="start">
            {savedStatus && <Badge id={statusId}>Analytics is {savedStatus.toLowerCase()}</Badge>}
            <Text id={descriptionId} size="sm">
              Allow Google Analytics cookies to measure visits, scrolling, time spent, and Game Boy plays?
              Cookies last up to {GA_COOKIE_DAYS} days. Declining won’t limit the site.
            </Text>
          </Stack>
        </ConsentNote>
      </Container>
    </>
  );
}
