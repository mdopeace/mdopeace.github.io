"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { Badge } from "@mdopeace/ui/Badge";
import { Sticker } from "@mdopeace/ui/Sticker";
import { LuClapperboard, LuFlame, LuRocket, LuSettings, LuWifi, LuZap } from "react-icons/lu";

const stickers = {
  spark: { label: "Zap!", rotation: "left", foundTone: "accent", pattern: "stripes", Icon: LuZap },
  frame: { label: "Cut!", rotation: "right", foundTone: "default", pattern: "grid", Icon: LuClapperboard },
  shipped: { label: "Ship it!", rotation: "left", foundTone: "emphasis", pattern: "none", Icon: LuRocket },
  gear: { label: "Click!", rotation: "right", foundTone: "accent", pattern: "grid", Icon: LuSettings },
  simmer: { label: "Pop!", rotation: "left", foundTone: "emphasis", pattern: "dots", Icon: LuFlame },
  signal: { label: "Ping!", rotation: "right", foundTone: "default", pattern: "stripes", Icon: LuWifi },
} as const;

type StickerId = keyof typeof stickers;
const visibleIds = Object.keys(stickers) as StickerId[];
const storageKey = "portfolio-stickers-found";
const empty: ReadonlySet<StickerId> = new Set();
const serverSnapshot = () => empty;

function readFound(): ReadonlySet<StickerId> {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    if (Array.isArray(stored)) {
      return new Set(visibleIds.filter((id) => stored.includes(id)));
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

  return {
    getSnapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key !== storageKey && event.key !== null) return;
        found = readFound();
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    collect(id: StickerId) {
      const current = getSnapshot();
      if (current.has(id)) return;

      // Merge with whatever other tabs already wrote before this save.
      found = new Set([...readFound(), ...current, id]);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify([...found]));
      } catch {
        // Keep progress in memory for this page visit.
      }
      listeners.forEach((listener) => listener());
    },
  };
}

const HuntContext = createContext<ReturnType<typeof createHunt> | null>(null);

export function StickerHunt({ children }: { children: ReactNode }) {
  const [hunt] = useState(createHunt);
  return <HuntContext.Provider value={hunt}>{children}</HuntContext.Provider>;
}

function useHunt() {
  const hunt = useContext(HuntContext);
  if (!hunt) throw new Error("Sticker hunt controls require a StickerHunt provider.");
  const found = useSyncExternalStore(hunt.subscribe, hunt.getSnapshot, serverSnapshot);
  return { found, collect: hunt.collect };
}

export function StickerProgress() {
  const { found } = useHunt();
  return (
    <Badge controlSize="sm" role="status" aria-atomic="true" aria-label="Sticker hunt progress">
      {found.size} of {visibleIds.length} found
    </Badge>
  );
}

export function HuntSticker({ id }: { id: StickerId }) {
  const { found, collect } = useHunt();
  const { label, Icon, ...appearance } = stickers[id];
  const collected = found.has(id);
  return (
    <Sticker
      aria-label={`Sticker: ${label}`}
      aria-disabled={collected}
      found={collected}
      {...appearance}
      icon={<Icon />}
      size="sm"
      onClick={() => collect(id)}
    >
      {label}
    </Sticker>
  );
}
