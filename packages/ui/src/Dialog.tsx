"use client";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FaXmark } from "react-icons/fa6";
import { useControllable } from "./hooks/useControllable";
import { Button } from "./Button";
import { Stack } from "./Layout";
import { Heading, Text, type HeadingProps } from "./Typography";
import { cx, type Size } from "./tokens";
import styles from "./ui.module.css";

type State =
  | { open: boolean; defaultOpen?: never }
  | { open?: never; defaultOpen?: boolean };
export type DialogProps = Omit<
  ComponentPropsWithRef<"dialog">,
  "open" | "title" | "aria-labelledby" | "aria-describedby"
> &
  State & {
    title: string;
    titleSize?: HeadingProps["size"];
    description?: ReactNode;
    closeLabel: string;
    size?: Size;
    onOpenChange?: (open: boolean) => void;
  };
let locks = 0;
let previousOverflow = "";
let previousScrollbarGutter = "";
function lockScroll() {
  if (locks++ === 0) {
    previousOverflow = document.body.style.overflow;
    const root = document.documentElement;
    previousScrollbarGutter = root.style.scrollbarGutter;
    if (root.clientWidth < window.innerWidth) root.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
  }
  return () => {
    if (--locks === 0) {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
    }
  };
}
function wrapTab(event: KeyboardEvent<HTMLDialogElement>) {
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
    "a[href], area[href], input, select, textarea, button, iframe, summary, [contenteditable], [tabindex]",
  )).filter(element =>
    element.tabIndex >= 0 && !element.matches(":disabled") && !element.closest("[inert]") &&
    element.getClientRects().length > 0 && getComputedStyle(element).visibility === "visible",
  ).sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
  const first = controls[0];
  const last = controls[controls.length - 1];
  const current = document.activeElement;
  if (event.shiftKey ? current === first : current === last) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
  }
}

export function Dialog({
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  titleSize = "dialog",
  description,
  closeLabel,
  size = "sm",
  children,
  className,
  ref,
  onCancel,
  onClose,
  onClick,
  onPointerDown,
  onKeyDown,
  ...props
}: DialogProps) {
  const [isOpen, setOpen] = useControllable(open, defaultOpen, onOpenChange);
  const dialog = useRef<HTMLDialogElement>(null);
  const backdropDown = useRef(false);
  const restore = useRef<(() => void) | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const restorePage = useCallback(() => {
    const cleanup = restore.current;
    restore.current = null;
    cleanup?.();
  }, []);
  const finishClose = useCallback(() => {
    dialog.current?.close();
    restorePage();
  }, [restorePage]);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (isOpen) {
      delete element.dataset.closing;
      if (!element.open) {
        const trigger =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        element.showModal();
        const unlock = lockScroll();
        restore.current = () => {
          unlock();
          if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        };
      }
      return;
    }
    if (!element.open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishClose();
      return;
    }
    element.dataset.closing = "true";
    const timer = setTimeout(finishClose, 180);
    return () => clearTimeout(timer);
  }, [isOpen, finishClose]);
  useEffect(
    () => () => {
      finishClose();
    },
    [finishClose],
  );
  const requestClose = () => setOpen(false);
  return (
    <dialog
      {...props}
      ref={(element) => {
        dialog.current = element;
        if (typeof ref === "function") return ref(element);
        if (ref) ref.current = element;
      }}
      data-size={size}
      className={cx(styles.dialog, className)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Tab") wrapTab(event);
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          requestClose();
        }
      }}
      onCancel={(event) => {
        onCancel?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          requestClose();
        }
      }}
      onClose={(event) => {
        if (!event.currentTarget.open) {
          restorePage();
          if (isOpen) setOpen(false);
        }
        onClose?.(event);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        backdropDown.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        onClick?.(event);
        if (
          !event.defaultPrevented &&
          backdropDown.current &&
          event.target === event.currentTarget
        )
          requestClose();
        backdropDown.current = false;
      }}
    >
      <div className={styles.dialogInner}>
        <Stack gap={6}>
          <div className={styles.dialogHeader}>
            <Button
              className={styles.dialogClose}
              variant="ghost"
              iconOnly
              aria-label={closeLabel}
              onClick={requestClose}
              startIcon={<FaXmark />}
            />
            <Stack gap={3}>
              <Heading level={2} size={titleSize} id={titleId}>
                {title}
              </Heading>
              {description && (
                <Text id={descriptionId} tone="muted">
                  {description}
                </Text>
              )}
            </Stack>
          </div>
          {children}
        </Stack>
      </div>
    </dialog>
  );
}
