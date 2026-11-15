"use client";
import { useId, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "./tokens";
import styles from "./ui.module.css";

export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
};
export type FieldProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  controlId?: string;
  children: (props: FieldControlProps) => ReactNode;
};
export function Field({
  label,
  description,
  error,
  required,
  controlId,
  children,
  className,
  ...props
}: FieldProps) {
  const generated = useId();
  const id = controlId ?? generated;
  const describedBy =
    [description && `${id}-help`, error && `${id}-error`]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div {...props} className={cx(styles.field, className)}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required,
      })}
      {description && (
        <p id={`${id}-help`} className={styles.fieldHelp}>
          {description}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.fieldError} role="status">
          {error}
        </p>
      )}
    </div>
  );
}
