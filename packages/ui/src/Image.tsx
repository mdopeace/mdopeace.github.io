"use client";

import { useEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import { cx } from "./tokens";
import styles from "./image.module.css";

type Dimensions =
  | { fill?: false; width: number; height: number }
  | { fill: true; width?: never; height?: never };
export type ImageProps = Omit<ComponentPropsWithRef<"img">, "alt" | "src" | "width" | "height"> & Dimensions & {
  src: string;
  alt: string;
  fit?: "contain" | "cover";
  radius?: "none" | "sm" | "md" | "full";
  placeholder?: "subtle" | "none";
  fallback?: ReactNode;
  errorLabel?: string;
  imageClassName?: string;
};

/** Native image loading with reserved space, cached-load detection and fallback.
 * className/style apply to the frame; the forwarded ref points to the img. */
export function Image(props: ImageProps) {
  // A new source gets a new lifecycle; late decodes cannot reveal an old image.
  return <ImageContent key={`${props.src}\u0000${props.srcSet ?? ""}`} {...props} />;
}

function ImageContent({ src, alt, width, height, fill = false, fit = "contain", radius = "none", placeholder = "subtle", fallback, errorLabel = "Image unavailable", loading = "lazy", decoding = "async", className, imageClassName, style, ref, onLoad, onError, ...props }: ImageProps) {
  const element = useRef<HTMLImageElement>(null);
  const mounted = useRef(false);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const reveal = async (image: HTMLImageElement) => {
    try { await image.decode?.(); } catch { /* Browsers may reject decode for an otherwise loaded image. */ }
    if (mounted.current) setStatus(image.naturalWidth > 0 ? "loaded" : "error");
  };
  useEffect(() => {
    mounted.current = true;
    const image = element.current;
    if (image?.complete) void reveal(image);
    return () => { mounted.current = false; };
  }, []);

  return (
    <span
      className={cx(styles.frame, className)}
      data-image-state={status}
      data-fill={fill || undefined}
      data-fit={fit}
      data-radius={radius}
      data-placeholder={placeholder}
      aria-busy={status === "loading" || undefined}
      aria-hidden={alt === "" || undefined}
      role={status === "error" && alt ? "img" : undefined}
      aria-label={status === "error" && alt ? alt : undefined}
      style={{ "--image-width": width ? `${width}px` : undefined, "--image-ratio": width && height ? width / height : undefined, ...style } as CSSProperties}
    >
      {/* This framework-independent package deliberately uses the native element. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...props}
        ref={node => {
          element.current = node;
          if (typeof ref === "function") return ref(node);
          if (ref) ref.current = node;
        }}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        aria-hidden={status === "error" ? true : props["aria-hidden"]}
        className={cx(styles.image, imageClassName)}
        onLoad={event => {
          void reveal(event.currentTarget);
          onLoad?.(event);
        }}
        onError={event => {
          setStatus("error");
          onError?.(event);
        }}
      />
      {status === "error" && <span className={styles.fallback} aria-hidden="true">{fallback ?? errorLabel}</span>}
    </span>
  );
}
