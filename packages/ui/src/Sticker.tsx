import { useId, type ComponentPropsWithRef, type MouseEventHandler, type ReactNode } from "react";
import { cx, type AccessibleName, type Size } from "./tokens";
import styles from "./sticker.module.css";

type StickerAppearance = {
  found?: boolean;
  foundTone?: "default" | "accent" | "emphasis";
  pattern?: "none" | "stripes" | "dots" | "grid";
  icon?: ReactNode;
  rotation?: "none" | "left" | "right";
  size?: Size;
};
type DecorativeSticker = Omit<ComponentPropsWithRef<"span">, "onClick" | "tabIndex" | "contentEditable" | "role"> & {
  onClick?: never;
};
type InteractiveSticker = Omit<ComponentPropsWithRef<"button">, "onClick" | "children"> & {
  onClick: MouseEventHandler<HTMLButtonElement>;
} & ({ children: string | number } | (AccessibleName & { children?: ReactNode }));

export type StickerProps = StickerAppearance & (DecorativeSticker | InteractiveSticker);

export function Sticker({
  found = false, foundTone = "accent", pattern = "none", icon,
  rotation = "none", size = "md", className, children, ...props
}: StickerProps) {
  const stateId = useId();
  const appearance = {
    className: cx(styles.sticker, className),
    "data-found": found,
    "data-found-tone": foundTone,
    "data-pattern": pattern,
    "data-rotation": rotation,
    "data-size": size,
  };
  const content = found && (pattern !== "none" || icon != null) ? (
    <span className={styles.content}>
      {icon != null && <span className={styles.icon} aria-hidden="true" inert>{icon}</span>}
      {children}
    </span>
  ) : children;
  if (props.onClick) {
    const { type = "button", "aria-describedby": describedBy, ...buttonProps } = props;
    return (
      <button
        {...buttonProps}
        {...appearance}
        type={type}
        aria-describedby={describedBy ? `${describedBy} ${stateId}` : stateId}
      >
        {content}
        <span id={stateId} hidden>{found ? "Found" : "Not found"}</span>
      </button>
    );
  }
  return <span {...props} {...appearance} aria-hidden="true" inert>{content}</span>;
}
