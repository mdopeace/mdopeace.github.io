"use client";

import { trackAnalytics } from "@/components/analytics/events";
import { createContext, useContext, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Badge } from "@mdopeace/ui/Badge";
import { Burst } from "@mdopeace/ui/Burst";
import { Button } from "@mdopeace/ui/Button";
import { Link } from "@mdopeace/ui/Link";
import { SpeechBubble } from "@mdopeace/ui/SpeechBubble";
import { Sticker } from "@mdopeace/ui/Sticker";
import { Surface } from "@mdopeace/ui/Surface";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { LuClapperboard, LuFlame, LuRocket, LuSettings, LuWifi, LuZap } from "react-icons/lu";
import styles from "./sticker-hunt.module.css";

const stickers = {
  spark: {
    label: "Zap!", sectionId: "top", story: "Zap! The first panel has power.",
    hintTo: "frame", hintText: "Look for the cut in How I think.",
    appearance: { rotation: "left", foundTone: "accent", pattern: "stripes", Icon: LuZap },
  },
  frame: {
    label: "Cut!", sectionId: "story", story: "Cut! The rough draft hits the floor.",
    hintTo: "shipped", hintText: "Find what shipped in Selected work.",
    appearance: { rotation: "right", foundTone: "default", pattern: "grid", Icon: LuClapperboard },
  },
  shipped: {
    label: "Ship it!", sectionId: "work", story: "Ship it! The build is out the door.",
    hintTo: "gear", hintText: "Listen for a click in Experience & toolkit.",
    appearance: { rotation: "left", foundTone: "emphasis", pattern: "none", Icon: LuRocket },
  },
  gear: {
    label: "Click!", sectionId: "experience", story: "Click! The right tool snaps into place.",
    hintTo: "simmer", hintText: "Check what’s popping in What’s cooking.",
    appearance: { rotation: "right", foundTone: "accent", pattern: "grid", Icon: LuSettings },
  },
  simmer: {
    label: "Pop!", sectionId: "now", story: "Pop! The side experiment has a pulse.",
    hintTo: "signal", hintText: "Follow the signal to Get in touch.",
    appearance: { rotation: "left", foundTone: "emphasis", pattern: "dots", Icon: LuFlame },
  },
  signal: {
    label: "Ping!", sectionId: "contact", story: "Ping! The maker picked up.",
    hintTo: "spark", hintText: "Back to the first panel for a spark.",
    appearance: { rotation: "right", foundTone: "default", pattern: "stripes", Icon: LuWifi },
  },
} as const;

type StickerId = keyof typeof stickers;
const visibleIds = Object.keys(stickers) as StickerId[];
const storageKey = "portfolio-stickers-found";
const finishId = "hunt-finale";
const logId = "hunt-log";
const completion = "Six stickers, one complete comic. Thanks for reading every panel!";
const empty: ReadonlySet<StickerId> = new Set();
const serverSnapshot = () => empty;

function nextClue(from: StickerId, found: ReadonlySet<StickerId>) {
  let source = from;
  for (let step = 0; step < visibleIds.length; step++) {
    const { hintTo, hintText } = stickers[source];
    if (!found.has(hintTo)) return { href: `#${stickers[hintTo].sectionId}`, text: hintText, source };
    source = hintTo;
  }
  return { href: `#${finishId}`, text: completion, source: "complete" } as const;
}

function readFound(): ReadonlySet<StickerId> {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    if (Array.isArray(stored)) {
      return new Set(stored.filter((id): id is StickerId => visibleIds.includes(id)));
    }
  } catch {
    // Unavailable storage or invalid data starts a fresh hunt.
  }
  return empty;
}

function createHunt() {
  let found: ReadonlySet<StickerId> | undefined;
  const listeners = new Set<() => void>();
  const getSnapshot = () => (found ??= readFound());
  const notify = () => listeners.forEach((listener) => listener());
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey && event.key !== null) return;
    found = readFound();
    notify();
  };

  return {
    getSnapshot,
    subscribe(listener: () => void) {
      if (listeners.size === 0) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener("storage", onStorage);
      };
    },
    collect(id: StickerId) {
      const current = getSnapshot();
      if (current.has(id)) return false;
      const persisted = readFound();

      // Merge with whatever other tabs already wrote before this save.
      found = new Set([...persisted, ...current, id]);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...found]));
      } catch {
        // Keep progress in memory for this page visit.
      }
      if (!persisted.has(id)) trackAnalytics("sticker_found");
      notify();
      return !persisted.has(id);
    },
  };
}

const HuntContext = createContext<{
  hunt: ReturnType<typeof createHunt>;
  found: ReadonlySet<StickerId>;
  active: StickerId | null;
  setActive: (id: StickerId | null) => void;
  announce: (id: StickerId) => void;
} | null>(null);

export function StickerHunt({ children }: { children: ReactNode }) {
  const [hunt] = useState(createHunt);
  const [active, setActive] = useState<StickerId | null>(null);
  const [latest, announce] = useState<StickerId | null>(null);
  const found = useSyncExternalStore(hunt.subscribe, hunt.getSnapshot, serverSnapshot);
  const announcement = latest && found.has(latest)
    ? `${stickers[latest].label} found. ${found.size} of ${visibleIds.length} found. ${nextClue(latest, found).text}`
    : "";

  return (
    <HuntContext.Provider value={{ hunt, found, active, setActive, announce }}>
      <div className="sr-only" role="status" aria-label="Sticker hunt update" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      {children}
    </HuntContext.Provider>
  );
}

function useHunt() {
  const context = useContext(HuntContext);
  if (!context) throw new Error("Sticker hunt controls require a StickerHunt provider.");
  return context;
}

export function StickerProgress() {
  const { found } = useHunt();
  return (
    <Badge controlSize="sm" data-sticker-progress>
      <span key={found.size} className={styles.count}>{found.size} of {visibleIds.length} found</span>
    </Badge>
  );
}

export function HuntSticker({ id, children }: { id: StickerId; children?: ReactNode }) {
  const { found, hunt, active, setActive, announce } = useHunt();
  const { label, story, appearance: { Icon, ...appearance } } = stickers[id];
  const collected = found.has(id);
  const open = collected && active === id;
  const clue = nextClue(id, found);
  const stickerRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const feedbackId = useId();
  const align = id === "spark" ? "start" : children ? "center" : "end";

  function dismiss() {
    if (feedbackRef.current?.contains(document.activeElement)) {
      stickerRef.current?.focus({ preventScroll: true });
    }
    setActive(null);
  }

  return (
    <div
      className={styles.stickerGroup}
      data-align={align}
      onKeyDown={(event) => {
        if (!open || event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }}
    >
      {id !== "spark" && children}
      <Sticker
        ref={stickerRef}
        aria-label={`Sticker: ${label}`}
        aria-disabled={collected}
        aria-controls={feedbackId}
        found={collected}
        {...appearance}
        icon={<Icon />}
        size="sm"
        onClick={({ currentTarget }) => {
          if (!hunt.collect(id)) return;
          currentTarget.focus({ preventScroll: true });
          setActive(id);
          announce(id);
        }}
      >
        {label}
      </Sticker>
      <div ref={feedbackRef} id={feedbackId} className={styles.feedback} data-visible={open} inert={!open} aria-hidden={!open || undefined}>
        <SpeechBubble tone="default" tail={`top-${align}`} size="sm" className={styles.feedbackBubble}>
          <div className={styles.feedbackStory}>
            <Burst size="sm" className={styles.feedbackBurst} aria-hidden="true">Found!</Burst>
            <strong>{story}</strong>
          </div>
          {clue.source === "complete" && <Text size="sm">{clue.text}</Text>}
          <Link size="sm" href={clue.href}>
            {clue.source === "complete" ? "Read the final panel" : clue.text}
          </Link>
          <div className={styles.feedbackActions}>
            <Link size="sm" href={`#${logId}`}>Hunt log</Link>
            <Button size="sm" variant="secondary" onClick={dismiss}>Dismiss clue</Button>
          </div>
        </SpeechBubble>
      </div>
      {id === "spark" && (
        <Text size="caption" className={styles.teaser}>
          Six stickers are hiding in these panels. Find all six to unlock the final panel.{" "}
          <Link size="sm" href={`#${logId}`}>Hunt log</Link>
        </Text>
      )}
    </div>
  );
}

export function HuntLog() {
  const { found } = useHunt();
  const last = [...found].at(-1);
  const currentClue = last ? nextClue(last, found).source : "start";
  const complete = found.size === visibleIds.length;

  return (
    <Surface as="section" padding={{ base: 4, sm: 6 }} className={styles.log} aria-labelledby={logId}>
      <Heading level={2} size="feature" id={logId} tabIndex={-1} className={styles.target}>Sticker hunt log</Heading>
      <ol className={styles.slots} role="list" aria-label="Sticker collection">
        {visibleIds.map((id, index) => {
          const collected = found.has(id);
          return (
            <li key={id} className={styles.slot} data-collected={collected}>
              <span className={styles.layer} data-visible={!collected} inert={collected} aria-hidden={collected || undefined}>{index + 1}. Missing</span>
              <span className={styles.layer} data-visible={collected} inert={!collected} aria-hidden={!collected || undefined}>{index + 1}. {stickers[id].label}</span>
            </li>
          );
        })}
      </ol>
      <div className={styles.layers}>
        <div className={styles.layer} data-visible={currentClue === "start"} inert={currentClue !== "start"} aria-hidden={currentClue !== "start" || undefined}>
          <Link size="sm" href="#top">Start in the first panel.</Link>
        </div>
        {visibleIds.map((id) => {
          const { hintTo, hintText } = stickers[id];
          const visible = currentClue === id;
          return (
            <div key={id} className={styles.layer} data-visible={visible} inert={!visible} aria-hidden={!visible || undefined}>
              <Link size="sm" href={`#${stickers[hintTo].sectionId}`}>{hintText}</Link>
            </div>
          );
        })}
        <div className={styles.layer} data-visible={complete} inert={!complete} aria-hidden={!complete || undefined}>
          <Link size="sm" href={`#${finishId}`}>Read the final panel</Link>
        </div>
      </div>
      <div className={styles.layers}>
        <SpeechBubble
          variant="caption" size="sm" className={`${styles.layer} ${styles.locked}`}
          data-visible={!complete} inert={complete} aria-hidden={complete || undefined}
        >
          <strong>Final panel locked</strong>
          <Text size="sm">Collect all six stickers to open it.</Text>
        </SpeechBubble>
        <Surface
          as="article" tone="accent" padding={4} className={`${styles.layer} ${styles.finale}`}
          data-visible={complete} inert={!complete} aria-hidden={!complete || undefined} aria-labelledby={finishId}
        >
          <Heading level={3} size="card" id={finishId} tabIndex={-1} className={styles.target}>The final panel</Heading>
          <ul className={styles.cover} role="list" aria-label="Six-stamp cover">
            {visibleIds.map((id) => {
              const { label, appearance: { Icon, ...appearance } } = stickers[id];
              return (
                <li key={id}>
                  <Sticker found size="sm" {...appearance} icon={<Icon />}>{label}</Sticker>
                  <span className="sr-only">{label}</span>
                </li>
              );
            })}
          </ul>
          <Text size="sm">{completion}</Text>
        </Surface>
      </div>
    </Surface>
  );
}
