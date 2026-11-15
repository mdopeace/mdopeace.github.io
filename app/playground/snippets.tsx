export { HighlightedCode } from "@/components/ui/HighlightedCode";

/** Keep short examples compact; expand longer examples one prop per line. */
export function elementCode(
  tag: string,
  props: (string | false)[],
  children?: string,
) {
  const visibleProps = props.filter(Boolean);
  const compactOpening = `<${tag}${visibleProps.length ? ` ${visibleProps.join(" ")}` : ""}`;
  const compact =
    children === undefined
      ? `${compactOpening} />`
      : `${compactOpening}>${children}</${tag}>`;
  const nestedContent =
    children !== undefined && /^\s*(<|\{\/\*)/.test(children);
  if (
    visibleProps.length <= 2 &&
    compact.length <= 90 &&
    !compact.includes("\n") &&
    !nestedContent
  ) {
    return compact;
  }
  const attributes = visibleProps.map((prop) => `  ${prop}`).join("\n");
  const compactTag = `${compactOpening}${children === undefined ? " />" : ">"}`;
  const opening =
    visibleProps.length <= 2 &&
    compactTag.length <= 90 &&
    !compactTag.includes("\n")
      ? compactTag
      : `<${tag}${attributes ? `\n${attributes}\n` : ""}${children === undefined ? "/>" : ">"}`;
  if (children === undefined) return opening;
  const content = children
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `${opening}\n${content}\n</${tag}>`;
}

/** Plain JSX text stays plain, with markup characters escaped safely. */
export function jsxText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/{/g, "&#123;")
    .replace(/}/g, "&#125;");
}

const imports: Record<string, string> = {
  Field: "@/components/ui/Field",
  TextInput: "@/components/ui/TextInput",
  Select: "@/components/ui/Select",
  Checkbox: "@/components/ui/Checkbox",
  NavigationList: "@/components/ui/NavigationList",
  CodeExample: "@/components/ui/CodeExample",
  Button: "@/components/ui/Button",
  Link: "@/components/ui/Link",
  Switch: "@/components/ui/Switch",
  Surface: "@/components/ui/Surface",
  Badge: "@/components/ui/Badge",
  Heading: "@/components/ui/Typography",
  Text: "@/components/ui/Typography",
  Grid: "@/components/ui/Layout",
  Stack: "@/components/ui/Layout",
  Divider: "@/components/ui/Divider",
  Dialog: "@/components/ui/Dialog",
  ExpandableText: "@/components/ui/ExpandableText",
  CodeBlock: "@/components/ui/CodeBlock",
  LinkGroup: "@/components/ui/LinkGroup",
  FaHeart: "react-icons/fa6",
  PiMoonStarsBold: "react-icons/pi",
  PiSunBold: "react-icons/pi",
};

/** Supply imports and state so copied examples have no undeclared placeholders. */
export function completeExample(jsx: string, setup = "", client = false) {
  const groups = new Map<string, string[]>();
  if (setup.includes("useState(")) groups.set("react", ["useState"]);
  for (const name of new Set(
    [...jsx.matchAll(/<([A-Z]\w*)\b/g)].map((match) => match[1]),
  )) {
    const path = imports[name];
    // A quoted label may itself contain text such as "<Draft>".
    if (!path) continue;
    groups.set(path, [...(groups.get(path) ?? []), name]);
  }
  const declarations = [...groups]
    .map(([path, names]) => `import { ${names.join(", ")} } from "${path}";`)
    .join("\n");
  const indent = (value: string, count: number) =>
    value
      .split("\n")
      .map((line) => `${" ".repeat(count)}${line}`)
      .join("\n");
  return `${client ? '"use client";\n\n' : ""}${declarations}\n\nexport default function Example() {\n${setup ? `${indent(setup, 2)}\n\n` : ""}  return (\n${indent(jsx, 4)}\n  );\n}`;
}
