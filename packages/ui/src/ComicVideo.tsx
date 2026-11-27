"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "./Button";
import styles from "./comic-panel.module.css";

export type ComicPanelVideo = {
  src: string;
  poster: string;
  /** Text alternative for the poster and the silent clip. Empty for decorative media. */
  alt: string;
  width: number;
  height: number;
  labels?: {
    playback?: string;
    playing?: string;
    paused?: string;
    still?: string;
    unavailable?: string;
  };
};

const motionQuery = "(prefers-reduced-motion: no-preference)";
function subscribe(onChange: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const motionAllowed = () => window.matchMedia(motionQuery).matches;
const serverMotionAllowed = () => false;

const defaultStatus = {
  playing: "Video playing.",
  paused: "Video paused.",
  still: "Showing the still image.",
  unavailable: "Video unavailable. Showing the still image.",
};

export function ComicVideo({ src, poster, alt, width, height, labels }: ComicPanelVideo) {
  const motion = useSyncExternalStore(subscribe, motionAllowed, serverMotionAllowed);
  const statusId = useId();
  const video = useRef<HTMLVideoElement>(null);
  const manuallyPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!motion || !element) return;
    // Keep the loaded frame for the fade and reuse the resource on resume.
    if (!element.hasAttribute("src")) element.src = src;
    if (!manuallyPaused.current && !element.error) {
      void element.play().catch(() => { /* Manual playback remains available if autoplay is blocked. */ });
    }
    return () => element.pause();
  }, [motion, src]);

  const running = motion && playing && !failed;
  const status = !motion ? "still" : failed ? "unavailable" : running ? "playing" : "paused";
  const messages = {
    playing: labels?.playing ?? defaultStatus.playing,
    paused: labels?.paused ?? defaultStatus.paused,
    still: labels?.still ?? defaultStatus.still,
    unavailable: labels?.unavailable ?? defaultStatus.unavailable,
  };

  return (
    <div>
      <div className={styles.videoFrame} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={!alt || undefined}>
        {/* The native poster image reserves the same space as the clip. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" width={width} height={height} className={styles.poster} />
        {/* A silent clip and its poster share the text alternative above. */}
        <video
          ref={video}
          muted
          loop
          playsInline
          aria-hidden="true"
          className={styles.video}
          data-playing={running || undefined}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEmptied={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      </div>
      <div className={styles.playback}>
        <Button
          className={styles.playbackButton}
          size="sm"
          variant="secondary"
          aria-pressed={running}
          aria-disabled={!motion || failed || undefined}
          aria-describedby={statusId}
          onClick={() => {
            const element = video.current;
            if (!motionAllowed() || !motion || failed || !element) return;
            manuallyPaused.current = !element.paused;
            if (manuallyPaused.current) element.pause();
            else void element.play().catch(() => { /* Keep the still image when playback cannot start. */ });
          }}
        >
          {labels?.playback ?? "Animate panel"}
        </Button>
        <div className={styles.status} id={statusId} role="status">
          {/* Every message stays in the grid so swaps crossfade without a layout shift. */}
          {Object.entries(messages).map(([state, message]) => (
            <span key={state} data-active={state === status ? "true" : "false"} aria-hidden={state !== status || undefined}>{message}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
