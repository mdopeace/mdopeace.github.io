"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

// Browser-only anyway; avoids the useLayoutEffect SSR warning.
const useBrowserLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Line-clamp keeps the full text in the HTML (searchable, screen-reader
// readable); max-height animates the open/close.
export default function MultiLineTruncate({
  text,
  lines = 3,
  className = "",
}: {
  text: string;
  lines?: number;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const contentId = useId();
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(true);
  const [clipped, setClipped] = useState(false);
  const [heights, setHeights] = useState<{
    clamp: number;
    full: number;
  } | null>(null);

  useBrowserLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Clamped: clientHeight is the clamp box, scrollHeight the full text.
    const measure = () => {
      setClipped(!expanded && el.scrollHeight > el.clientHeight + 1);
      // Unclamped, clientHeight is cut by max-height — it isn't the clamp box.
      if (clamped)
        setHeights({ clamp: el.clientHeight, full: el.scrollHeight });
      else setHeights((h) => h && { clamp: h.clamp, full: el.scrollHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text, lines, expanded, clamped]);

  const toggle = () => {
    if (expanded) {
      setExpanded(false);
      // No transitionend under reduced motion — clamp now.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        setClamped(true);
    } else {
      setExpanded(true);
      setClamped(false);
    }
  };

  return (
    <>
      <p
        id={contentId}
        ref={ref}
        className={`transition-[max-height] duration-300 ease-out motion-reduce:transition-none ${className}`}
        style={{
          maxHeight: expanded ? heights?.full : heights?.clamp,
          overflow: "hidden",
          ...(clamped
            ? {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: lines,
              }
            : null),
        }}
        onTransitionEnd={(e) => {
          // Clamp at the end of the shrink so the "…" lands in place.
          if (e.propertyName === "max-height" && !expanded) setClamped(true);
        }}
      >
        {text}
      </p>
      {/* !clamped = collapse in flight — otherwise the button blinks away. */}
      {(clipped || expanded || !clamped) && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggle}
          className="project-action mt-1 cursor-pointer border-line text-muted hover:border-faint hover:text-text"
        >
          {expanded ? "show less" : "show more"}
        </button>
      )}
    </>
  );
}
