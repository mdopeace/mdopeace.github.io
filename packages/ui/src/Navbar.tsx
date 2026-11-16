import type { ComponentPropsWithRef, ReactNode } from "react";
import { Inline } from "./Layout";
import { Surface } from "./Surface";
import styles from "./navbar.module.css";

export type NavbarProps = ComponentPropsWithRef<"nav"> & {
  label: string;
  brand?: ReactNode;
  actions?: ReactNode;
};

/** Navigation framing; destinations and active state belong to the consumer. */
export function Navbar({ label, brand, actions, children, ...props }: NavbarProps) {
  return (
    <nav {...props} aria-label={label}>
      <Surface padding={3}>
        <Inline gap={4} wrap={false} className={styles.layout}>
          {brand}
          {children}
          {actions && <Inline gap={3} wrap={false}>{actions}</Inline>}
        </Inline>
      </Surface>
    </nav>
  );
}
