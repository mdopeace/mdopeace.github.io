"use client";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithRef,
} from "react";
import { useControllable } from "./hooks/useControllable";
import { Button } from "./Button";
import { cx } from "./tokens";
import styles from "./ui.module.css";

type State =
  | { open: boolean; defaultOpen?: never }
  | { open?: never; defaultOpen?: boolean };
export type ExpandableTextProps = Omit<
  ComponentPropsWithRef<"div">,
  "children"
> &
  State & {
    children: string;
    lines?: number;
    expandLabel: string;
    collapseLabel: string;
    onOpenChange?: (open: boolean) => void;
  };
export function ExpandableText({
  children,
  lines = 3,
  expandLabel,
  collapseLabel,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  ...props
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useControllable(
    open,
    defaultOpen,
    onOpenChange,
  );
  const [metrics, setMetrics] = useState<{
    clamp: number;
    full: number;
  } | null>(null);
  const content = useRef<HTMLParagraphElement>(null);
  const id = useId();
  useEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => {
      const computed = getComputedStyle(element);
      const lineHeight =
        parseFloat(computed.lineHeight) ||
        (parseFloat(computed.fontSize) || 14) * 1.7;
      const full = element.scrollHeight;
      const clamp = Math.min(full, lineHeight * Math.max(1, lines));
      setMetrics((previous) =>
        previous?.full === full && previous.clamp === clamp
          ? previous
          : { clamp, full },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children, lines]);
  const clipped = metrics && metrics.full > metrics.clamp + 1;
  return (
    <div {...props} className={cx(styles.expand, className)}>
      <div
        className={styles.expandViewport}
        style={
          metrics
            ? { height: expanded ? metrics.full : metrics.clamp }
            : {
                maxHeight: `calc(${Math.max(1, lines)} * var(--ui-font-sm) * var(--ui-leading-body))`,
              }
        }
      >
        <p id={id} ref={content} className={styles.expandText}>
          {children}
        </p>
      </div>
      {(clipped || expanded) && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            aria-controls={id}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? collapseLabel : expandLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
