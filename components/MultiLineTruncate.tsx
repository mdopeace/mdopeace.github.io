"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

// The effect only runs in the browser anyway; this just avoids the SSR warning.
const useBrowserLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// CSS line-clamp keeps the full text in the HTML (searchable, screen-reader
// readable) and paints only `lines` rows. The button appears only when the
// text actually clips — re-measured on resize.
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
  const [expanded, setExpanded] = useState(false);
  const [clipped, setClipped] = useState(false);

  useBrowserLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Clamped, the box height is pinned; scrollHeight reports full content.
    const measure = () =>
      setClipped(!expanded && el.scrollHeight > el.clientHeight + 1);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text, lines, expanded]);

  return (
    <>
      <p
        ref={ref}
        className={className}
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: lines,
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>
      {(clipped || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 cursor-pointer rounded-[5px] border border-line px-[9px] py-[3px] text-[11px] text-muted hover:border-faint hover:text-text"
        >
          {expanded ? "show less" : "show more"}
        </button>
      )}
    </>
  );
}
