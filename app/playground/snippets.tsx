export { HighlightedCode } from "@mdopeace/ui/HighlightedCode";

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
  Image: "@mdopeace/ui/Image",
  Navbar: "@mdopeace/ui/Navbar",
  NavbarLinks: "@mdopeace/ui/NavbarLinks",
  Field: "@mdopeace/ui/Field",
  TextInput: "@mdopeace/ui/TextInput",
  Select: "@mdopeace/ui/Select",
  Checkbox: "@mdopeace/ui/Checkbox",
  NavigationList: "@mdopeace/ui/NavigationList",
  CodeExample: "@mdopeace/ui/CodeExample",
  Button: "@mdopeace/ui/Button",
  Link: "@mdopeace/ui/Link",
  Switch: "@mdopeace/ui/Switch",
  Surface: "@mdopeace/ui/Surface",
  Badge: "@mdopeace/ui/Badge",
  SpeechBubble: "@mdopeace/ui/SpeechBubble",
  Burst: "@mdopeace/ui/Burst",
  ComicPanel: "@mdopeace/ui/ComicPanel",
  ComicStrip: "@mdopeace/ui/ComicStrip",
  ConsentNote: "@mdopeace/ui/ConsentNote",
  Tile: "@mdopeace/ui/Tile",
  Heading: "@mdopeace/ui/Typography",
  Text: "@mdopeace/ui/Typography",
  Grid: "@mdopeace/ui/Layout",
  Inline: "@mdopeace/ui/Layout",
  Stack: "@mdopeace/ui/Layout",
  Divider: "@mdopeace/ui/Divider",
  Dialog: "@mdopeace/ui/Dialog",
  ExpandableText: "@mdopeace/ui/ExpandableText",
  CommandBlock: "@mdopeace/ui/CommandBlock",
  LinkGroup: "@mdopeace/ui/LinkGroup",
  FaHeart: "react-icons/fa6",
  PiMoonStarsBold: "react-icons/pi",
  PiSunBold: "react-icons/pi",
};

/** Supply imports and state so copied examples have no undeclared placeholders. */
export function completeExample(jsx: string, setup = "", client = false) {
  const groups = new Map<string, string[]>();
  const hooks = ["useState", "useRef"].filter((hook) =>
    setup.includes(`${hook}(`) || setup.includes(`${hook}<`),
  );
  if (hooks.length) groups.set("react", hooks);
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
