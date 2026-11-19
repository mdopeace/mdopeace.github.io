import { useId, type ComponentPropsWithRef, type MouseEventHandler, type ReactNode } from "react";
import { cx, type AccessibleName, type Size } from "./tokens";
import styles from "./sticker.module.css";

type StickerAppearance = {
  found?: boolean;
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
  found = false, rotation = "none", size = "md", className, ...props
}: StickerProps) {
  const stateId = useId();
  const appearance = {
    className: cx(styles.sticker, className),
    "data-found": found,
    "data-rotation": rotation,
    "data-size": size,
  };
  if (props.onClick) {
    const { type = "button", children, "aria-describedby": describedBy, ...buttonProps } = props;
    return (
      <button
        {...buttonProps}
        {...appearance}
        type={type}
        aria-describedby={describedBy ? `${describedBy} ${stateId}` : stateId}
      >
        {children}
        <span id={stateId} hidden>{found ? "Found" : "Not found"}</span>
      </button>
    );
  }
  return <span {...props} {...appearance} aria-hidden="true" inert />;
}
