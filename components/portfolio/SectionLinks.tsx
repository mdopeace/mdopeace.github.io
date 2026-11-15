"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Inline } from "@mdopeace/ui/Layout";
import { Link } from "@mdopeace/ui/Link";
import styles from "./section-links.module.css";

const links = [
  { id: "story", label: "Story" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "now", label: "Now" },
  { id: "contact", label: "Contact" },
] as const;
type SectionId = (typeof links)[number]["id"];

export default function SectionLinks() {
  const container = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<SectionId | null>(null);
  const [hovered, setHovered] = useState<SectionId | null>(null);
  const [focused, setFocused] = useState<SectionId | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const highlighted = hovered ?? focused ?? active;

  useEffect(() => {
    const header = container.current?.closest("nav");
    const sections = links.map(link => ({
      id: link.id,
      element: document.getElementById(link.id),
    }));
    let frame = 0;
    const update = () => {
      frame = 0;
      const headerLine = (header?.getBoundingClientRect().bottom ?? 0) + 24;
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      let current: SectionId | null = null;
      for (const section of sections) {
        if (section.element) {
          // Native anchors combine the page's scroll padding and section margin.
          // Use that landing line too, so clicking a link selects its destination.
          const scrollMargin = parseFloat(getComputedStyle(section.element).scrollMarginTop) || 0;
          const readingLine = Math.max(headerLine, scrollPadding + scrollMargin) + 2;
          if (section.element.getBoundingClientRect().top <= readingLine) current = section.id;
        }
      }
      // The final section can be too short to reach the reading line.
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2)
        current = "contact";
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    if (header) observer.observe(header);
    for (const section of sections) if (section.element) observer.observe(section.element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useLayoutEffect(() => {
    const element = container.current;
    if (!element || !highlighted) return;
    const link = element.querySelector<HTMLAnchorElement>(`a[href="#${highlighted}"]`);
    if (!link) return;
    const measure = () => {
      const parent = element.getBoundingClientRect();
      const rect = link.getBoundingClientRect();
      setIndicator(previous => {
        const left = rect.left - parent.left;
        return previous.left === left && previous.width === rect.width && previous.ready
          ? previous
          : { left, width: rect.width, ready: true };
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(link);
    return () => observer.disconnect();
  }, [highlighted]);

  return (
    <Inline
      ref={container}
      gap={{ base: 3, md: 6 }}
      justify={{ base: "between", md: "center" }}
      wrap={false}
      className={`navigation-links ${styles.links}`}
      style={{ "--highlight-left": `${indicator.left}px` } as CSSProperties}
      onPointerLeave={() => setHovered(null)}
    >
      {links.map(({ id, label }) => (
        <Link
          href={`#${id}`}
          key={id}
          size="sm"
          variant="nav"
          className={styles.link}
          aria-current={active === id ? "location" : undefined}
          data-highlighted={highlighted === id || undefined}
          onPointerEnter={event => {
            if (event.pointerType === "mouse") setHovered(id);
          }}
          onFocus={event => {
            if (event.currentTarget.matches(":focus-visible")) setFocused(id);
          }}
          onBlur={() => setFocused(null)}
        >
          {label}
        </Link>
      ))}
      {/* Clip a non-interactive copy of the labels to the same moving band as
          the underline, so the red text travels with it instead of fading. */}
      <Inline
        aria-hidden="true"
        gap={{ base: 3, md: 6 }}
        justify={{ base: "between", md: "center" }}
        wrap={false}
        className={styles.colorTrack}
        data-ready={indicator.ready || undefined}
        data-visible={Boolean(highlighted) || undefined}
        style={{ clipPath: `inset(0 calc(100% - ${indicator.left + indicator.width}px) 0 ${indicator.left}px)` }}
      >
        {links.map(({ id, label }) => (
          <Link href={`#${id}`} key={id} size="sm" variant="nav" className={styles.link} tabIndex={-1}>
            {label}
          </Link>
        ))}
      </Inline>
      <span
        aria-hidden="true"
        className={styles.indicator}
        data-ready={indicator.ready || undefined}
        data-visible={Boolean(highlighted) || undefined}
        style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
      />
    </Inline>
  );
}
