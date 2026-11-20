"use client";
import { useId, type ComponentPropsWithRef } from "react";
import { cx } from "./tokens";
import styles from "./ui.module.css";
export type CheckboxProps = Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size"
> & {
  label: string;
  description?: string;
  error?: string;
};
export function Checkbox({
  label,
  description,
  error,
  id,
  className,
  required,
  "aria-describedby": describedBy,
  ...props
}: CheckboxProps) {
  const generated = useId();
  const controlId = id ?? generated;
  const descriptions =
    [
      describedBy,
      description && `${controlId}-help`,
      error && `${controlId}-error`,
    ]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className={cx(styles.checkbox, className)}>
      <label htmlFor={controlId}>
        <input
          {...props}
          id={controlId}
          type="checkbox"
          required={required}
          aria-describedby={descriptions}
          aria-invalid={error ? true : props["aria-invalid"]}
        />
        <span>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </span>
      </label>
      {description && (
        <p id={`${controlId}-help`} className={styles.fieldHelp}>
          {description}
        </p>
      )}
      {error && (
        <p
          id={`${controlId}-error`}
          className={styles.fieldError}
          role="status"
        >
          {error}
        </p>
      )}
    </div>
  );
}
