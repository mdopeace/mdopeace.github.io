import { setAnalyticsSender, trackAnalytics } from "./events";

function measureEngagement() {
  let visibleSince = document.hidden ? undefined : performance.now();
  let depth = scrollPercent();

  function reportStay() {
    if (visibleSince === undefined) return;
    const seconds = Math.floor((performance.now() - visibleSince) / 1000);
    visibleSince = undefined;
    if (seconds > 0) trackAnalytics("stay_time", { seconds });
  }

  function onVisibility() {
    if (document.hidden) reportStay();
    else visibleSince ??= performance.now();
  }

  function scrollPercent() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? (window.scrollY / max) * 100 : 0;
  }

  function reportScroll() {
    const percent = scrollPercent();
    for (const milestone of [25, 50, 75, 100]) {
      if (depth < milestone && percent >= milestone) {
        depth = milestone;
        trackAnalytics("scroll_depth", { percent: milestone });
      }
    }
  }

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", reportStay);
  window.addEventListener("pageshow", onVisibility);
  window.addEventListener("scroll", reportScroll, { passive: true });

  return () => {
    reportStay();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pagehide", reportStay);
    window.removeEventListener("pageshow", onVisibility);
    window.removeEventListener("scroll", reportScroll);
  };
}

export function scheduleAnalytics(id: string, hasConsent: () => boolean) {
  if (!/^G-[A-Z0-9]+$/.test(id)) return;

  const analyticsWindow = window as Window & { dataLayer?: IArguments[] };
  const disableKey = `ga-disable-${id}`;
  let script: HTMLScriptElement | undefined;
  let stopMeasuring: (() => void) | undefined;

  function load() {
    if (!hasConsent()) return;

    const queue = (analyticsWindow.dataLayer ??= []);
    // The Google tag command queue consumes arguments objects.
    function command(...args: unknown[]) {
      void args;
      // eslint-disable-next-line prefer-rest-params -- Google expects an arguments object.
      queue.push(arguments);
    }

    script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    script.referrerPolicy = "no-referrer";
    script.onload = () => {
      if (!hasConsent()) return;
      Object.assign(window, { [disableKey]: false });
      command("js", new Date());
      command("config", id, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        send_page_view: false,
        page_location: window.location.origin + window.location.pathname,
        page_referrer: "",
      });
      setAnalyticsSender((name, values) => {
        if (hasConsent()) command("event", name, values);
      });
      stopMeasuring = measureEngagement();
    };
    document.head.append(script);
  }

  let cancel: () => void;
  if (typeof window.requestIdleCallback === "function") {
    const idle = window.requestIdleCallback(load);
    cancel = () => window.cancelIdleCallback(idle);
  } else {
    const timeout = window.setTimeout(load, 1500);
    cancel = () => window.clearTimeout(timeout);
  }

  return () => {
    cancel();
    stopMeasuring?.();
    setAnalyticsSender();
    if (script) {
      Object.assign(window, { [disableKey]: true });
      script.onload = null;
      script.remove();
    }
  };
}
