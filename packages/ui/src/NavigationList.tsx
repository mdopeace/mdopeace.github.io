"use client";
import { useId, type ComponentPropsWithRef } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { Text } from "./Typography";
import { Link } from "./Link";
import { cx } from "./tokens";
import styles from "./ui.module.css";
export type NavigationItem = {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
};
export type NavigationListProps = Omit<
  ComponentPropsWithRef<"nav">,
  "children" | "onSelect"
> & {
  label: string;
  groups: readonly { label: string; items: readonly NavigationItem[] }[];
  activeId?: string;
  onSelect?: (id: string) => void;
};
export function NavigationList({
  label,
  groups,
  activeId,
  onSelect,
  className,
  ...props
}: NavigationListProps) {
  const id = useId();
  return (
    <nav
      {...props}
      aria-label={label}
      className={cx(styles.navigationList, className)}
    >
      <Text variant="eyebrow">{label}</Text>
      <div className={styles.navigationGroups}>
        {groups.map((group, index) => (
          <div key={group.label} className={styles.navigationGroup}>
            <Text id={`${id}-${index}`} size="caption" font="mono" tone="muted">
              {group.label}
            </Text>
            <ul aria-labelledby={`${id}-${index}`}>
              {group.items.map((item) => (
                <li key={item.id}>
                  {item.href && !item.disabled ? (
                    <Link
                      href={item.href}
                      className={styles.navigationItem}
                      aria-current={activeId === item.id ? "page" : undefined}
                      onClick={() => onSelect?.(item.id)}
                    >
                      {item.label}
                      <FaArrowRight aria-hidden="true" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={item.disabled}
                      className={styles.navigationItem}
                      aria-current={activeId === item.id ? "true" : undefined}
                      onClick={() => onSelect?.(item.id)}
                    >
                      <span>{item.label}</span>
                      <FaArrowRight aria-hidden="true" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
