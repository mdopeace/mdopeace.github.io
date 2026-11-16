"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type MouseEvent } from "react";
import { Inline } from "./Layout";
import { Link } from "./Link";
import { cx, type Justify, type Responsive, type Space } from "./tokens";
import styles from "./navbar.module.css";

export type NavbarLinkItem = { id: string; label: string; href: string };
export type NavbarLinksProps = Omit<ComponentPropsWithRef<"div">, "children" | "onSelect"> & {
  items: readonly NavbarLinkItem[];
  activeId?: string;
  current?: "page" | "location";
  gap?: Responsive<Space>;
  justify?: Responsive<Justify>;
  onSelect?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
};

export function NavbarLinks({ items, activeId, current = "page", gap = { base: 3, md: 6 }, justify = { base: "between", md: "center" }, onSelect, className, style, ref, onPointerLeave, ...props }: NavbarLinksProps) {
  const container = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const candidate = hovered ?? focused ?? activeId;
  const highlighted = items.some(item => item.id === candidate) ? candidate : undefined;
  const setContainer = useCallback((element: HTMLDivElement | null) => {
    container.current = element;
    if (typeof ref === "function") {
      const cleanup = ref(element);
      return () => {
        container.current = null;
        if (typeof cleanup === "function") cleanup();
        else ref(null);
      };
    }
    if (ref) ref.current = element;
    return () => {
      container.current = null;
      if (ref) ref.current = null;
    };
  }, [ref]);

  useLayoutEffect(() => {
    const element = container.current;
    if (!element || !highlighted) return;
    const link = Array.from(element.querySelectorAll<HTMLAnchorElement>("a[data-navbar-id]")).find(link => link.dataset.navbarId === highlighted);
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
  }, [highlighted, items, gap, justify]);

  return (
    <Inline
      {...props}
      ref={setContainer}
      gap={gap}
      justify={justify}
      wrap={false}
      className={cx(styles.links, className)}
      style={{ "--highlight-left": `${indicator.left}px`, ...style } as CSSProperties}
      onPointerLeave={event => { onPointerLeave?.(event); setHovered(null); }}
    >
      {items.map(({ id, label, href }) => (
        <Link
          href={href}
          key={id}
          size="sm"
          variant="nav"
          className={styles.link}
          aria-current={activeId === id ? current : undefined}
          data-navbar-id={id}
          onClick={event => onSelect?.(id, event)}
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
        gap={gap}
        justify={justify}
        wrap={false}
        className={styles.colorTrack}
        data-ready={indicator.ready || undefined}
        data-visible={Boolean(highlighted) || undefined}
        style={{ clipPath: `inset(0 calc(100% - ${indicator.left + indicator.width}px) 0 ${indicator.left}px)` }}
      >
        {items.map(({ id, label, href }) => (
          <Link href={href} key={id} size="sm" variant="nav" className={styles.link} tabIndex={-1}>
            {label}
          </Link>
        ))}
      </Inline>
      <span className={styles.indicatorTrack} aria-hidden="true">
      <span
        aria-hidden="true"
        className={styles.indicator}
        data-ready={indicator.ready || undefined}
        data-visible={Boolean(highlighted) || undefined}
        style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
      />
      </span>
    </Inline>
  );
}
