import { Fragment, type ReactNode } from "react";
import styles from "./code-example.module.css";

/** Highlight the JSX subset used by our examples; React escapes every token. */
export function HighlightedCode({ code }: { code: string }) {
  const pattern =
    /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|<\/?[A-Za-z][\w.]*|\b(?:import|from|export|default|function|const|return)\b|\b[A-Za-z_$][\w$-]*(?=\s*=)|\b(?:true|false|null|\d+)\b|[{}<>/=]/g;
  const lines: ReactNode[][] = [[]];
  let tokenKey = 0;
  function append(text: string, kind?: string) {
    text.split("\n").forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push(kind ? (
        <span key={tokenKey++} data-syntax={kind}>{part}</span>
      ) : part);
    });
  }
  let cursor = 0;
  for (const match of code.matchAll(pattern)) {
    const index = match.index!;
    if (index > cursor) append(code.slice(cursor, index));
    const token = match[0];
    const kind = token.startsWith("/*")
      ? "comment"
      : /^["']/.test(token)
        ? "string"
        : token.startsWith("<") && token.length > 1
          ? "component"
          : /^(import|from|export|default|function|const|return)$/.test(token)
            ? "keyword"
            : /^(true|false|null|\d+)$/.test(token)
              ? "literal"
              : /^[A-Za-z_$]/.test(token)
                ? "attribute"
                : "punctuation";
    append(token, kind);
    cursor = index + token.length;
  }
  if (cursor < code.length) append(code.slice(cursor));
  const sourceLines = code.split("\n");
  return (
    <code className={styles.code}>
      {lines.map((parts, index) => {
        const indentation = sourceLines[index].match(/^[\t ]*/)?.[0] ?? "";
        const columns = [...indentation].reduce(
          (width, character) => character === "\t" ? width + 2 - width % 2 : width + 1,
          0,
        );
        return (
          <Fragment key={index}>
            {index > 0 && "\n"}
            <span className={styles.codeLine}>
              {columns >= 2 && (
                <span aria-hidden="true" className={styles.indentGuides}
                  style={{ width: `${Math.floor(columns / 2) * 2}ch` }} />
              )}
              {parts}
            </span>
          </Fragment>
        );
      })}
    </code>
  );
}
