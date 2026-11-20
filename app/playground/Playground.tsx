"use client";

import { useRef, useState, type ReactNode, type Ref } from "react";
import { FaArrowLeft, FaHeart } from "react-icons/fa6";
import { PiMoonStarsBold, PiSunBold } from "react-icons/pi";
import { Container, Grid, Inline, Stack } from "@mdopeace/ui/Layout";
import { Surface } from "@mdopeace/ui/Surface";
import { Heading, Text } from "@mdopeace/ui/Typography";
import { Badge } from "@mdopeace/ui/Badge";
import { SpeechBubble } from "@mdopeace/ui/SpeechBubble";
import { Burst } from "@mdopeace/ui/Burst";
import { Sticker } from "@mdopeace/ui/Sticker";
import { ConsentNote } from "@mdopeace/ui/ConsentNote";
import { Tile } from "@mdopeace/ui/Tile";
import { Button } from "@mdopeace/ui/Button";
import { Link } from "@mdopeace/ui/Link";
import { Dialog } from "@mdopeace/ui/Dialog";
import { Divider } from "@mdopeace/ui/Divider";
import { Switch } from "@mdopeace/ui/Switch";
import { CommandBlock } from "@mdopeace/ui/CommandBlock";
import { ExpandableText } from "@mdopeace/ui/ExpandableText";

import { LinkGroup } from "@mdopeace/ui/LinkGroup";
import { Field } from "@mdopeace/ui/Field";
import { TextInput } from "@mdopeace/ui/TextInput";
import { Select } from "@mdopeace/ui/Select";
import { Checkbox } from "@mdopeace/ui/Checkbox";
import { NavigationList } from "@mdopeace/ui/NavigationList";
import { CodeExample } from "@mdopeace/ui/CodeExample";
import { Image } from "@mdopeace/ui/Image";
import { Navbar } from "@mdopeace/ui/Navbar";
import { NavbarLinks } from "@mdopeace/ui/NavbarLinks";
import ThemeToggle from "@/components/ThemeToggle";
import { withBasePath } from "@/lib/withBasePath";
import { SectionNavigation } from "@/components/portfolio/SectionNavigation";

import type { Size, Tone, Variant, Elevation } from "@mdopeace/ui/tokens";
import styles from "./playground.module.css";
import { elementCode, jsxText, completeExample } from "./snippets";

const catalog = [
  {
    id: "speech-bubble",
    name: "SpeechBubble",
    group: "Comic",
    description: "A caption with a directional tail.",
    rationale: "The tail shares the panel's ink and fill. Long words wrap inside the panel.",
    tip: "Try each tail in the narrow preview.",
  },
  {
    id: "burst",
    name: "Burst",
    group: "Comic",
    description: "A starburst for short captions and feedback.",
    rationale: "The outline and shadow follow the shape, and feedback can be announced without moving focus.",
    tip: "Hide and show the message to replay its entrance.",
  },
  {
    id: "sticker",
    name: "Sticker",
    group: "Comic",
    description: "Collectible artwork with optional button behavior.",
    rationale: "A solid edge distinguishes the found sticker from the dashed outline.",
    tip: "Turn on interaction and press Space or Enter to mark the sticker found.",
  },
  {
    id: "consent-note",
    name: "ConsentNote",
    group: "Composition",
    description: "An inline notice with two actions.",
    rationale: "The notice stays in the page's reading order and leaves other controls reachable.",
    tip: "Choose either action, then reopen the notice to try again.",
  },
  {
    id: "navbar",
    name: "Navbar",
    group: "Navigation",
    description: "A shared frame for finding your way.",
    rationale: "Navbar owns the surface, padding and responsive placement of the brand, links and actions. The consuming page decides where it sits and which destination is current.",
    tip: "Resize the page. Links move onto their own row on small screens, while the brand and actions stay together.",
  },
  {
    id: "navbar-links",
    name: "NavbarLinks",
    group: "Navigation",
    description: "One moving highlight, clear destinations.",
    rationale: "The text highlight and underline travel together. Active state is supplied by the consumer, so the same component supports page navigation, section tracking or local demos.",
    tip: "Hover or focus a destination to preview it. Move away to return to the current destination. Reduced motion keeps feedback immediate.",
  },
  {
    id: "image",
    name: "Image",
    group: "Media",
    description: "Space reserved. Loading considered.",
    rationale: "Explicit dimensions reserve the frame before loading. A subtle placeholder gives way to the decoded image, and failed images retain their space with a fallback. Project screenshots and logos compose this same foundation.",
    tip: "Compare contain and cover, try rounded corners, or switch to an unavailable source to see the fallback. Decorative images use an empty alt attribute.",
  },
  {
    id: "button",
    name: "Button",
    group: "Actions",
    description: "One action, a clear response.",
    rationale:
      "Every solid button uses the same 3px depth, whatever its size. Ghost actions stay flat. Hover compresses depth; pressing completes the movement.",
    tip: "Tab to the button, then activate it with Enter or Space. Disabled and loading states prevent activation.",
  },
  {
    id: "link",
    name: "Link",
    group: "Actions",
    description: "Navigation with a familiar visual language.",
    rationale:
      "Links retain native anchor behavior. A navigation action can wear the button recipe without losing its semantics.",
    tip: "Use a link for a destination and a button for an action. External indicators are decorative; the label names the destination.",
  },
  {
    id: "switch",
    name: "Switch",
    group: "Actions",
    description: "A small control for a persistent choice.",
    rationale:
      "Button and Switch share 32, 40 and 48px size tokens. The thumb moves and its icon fades, while the accessible checked state updates immediately.",
    tip: "Focus the switch and press Space. Its name stays constant; checked communicates the changing state.",
  },
  {
    id: "surface",
    name: "Surface",
    group: "Foundations",
    description: "Give content a place to live.",
    rationale:
      "Paired foreground and background tokens keep each surface readable in both themes. App panels use 5px depth; nested content stays flat.",
    tip: "A visual panel is not automatically interactive. Keep static cards still and reserve action feedback for actionable content.",
  },
  {
    id: "typography",
    name: "Typography",
    group: "Foundations",
    description: "A hierarchy that travels with the content.",
    rationale:
      "Heading semantics and visual size are separate. Body text carries the story; mono labels carry compact metadata.",
    tip: "Choose heading levels from the document structure, then choose their visual size. Small text is for supporting information.",
  },
  {
    id: "tile",
    name: "Tile",
    group: "Foundations",
    description: "A framed face for marks and indicators.",
    rationale: "A square frame and optional inset edge give text, icons and indicator lights a shared physical finish. Color and content belong to the consumer; Tile adds no interaction or game state.",
    tip: "Try the GB mark and the three indicator colors. Indicator colors stay fixed across themes. Wrap a tile in a link or button when it needs interaction.",
  },
  {
    id: "badge",
    name: "Badge",
    group: "Foundations",
    description: "Small labels with a little personality.",
    rationale:
      "A single primitive covers outlined metadata, solid labels, square marks and tilted stamps. It stays flat because it is not a button.",
    tip: "Color supports the text; it never replaces it. Decorative chapter numbers can be hidden from assistive technology.",
  },
  {
    id: "layout",
    name: "Layout & Divider",
    group: "Composition",
    description: "Spacing is part of the system.",
    rationale:
      "Stack, Inline and Grid own arrangement. A shared spacing scale makes compositions consistent without putting margins on every child.",
    tip: "This demo changes columns and gaps without changing its child cards. Responsive layouts can choose different values at each breakpoint.",
  },
  {
    id: "dialog",
    name: "Dialog",
    group: "Composition",
    description: "A focused space for a short task.",
    rationale:
      "Native dialog behavior handles modality. Opening and closing animate while focus and scroll locking remain coordinated.",
    tip: "Open it, move through its controls with Tab, and close with Escape. Focus returns to the trigger.",
  },
  {
    id: "content",
    name: "Content & feedback",
    group: "Composition",
    description: "Useful details, revealed at the right time.",
    rationale:
      "ExpandableText owns disclosure, CommandBlock composes copying from Button and useClipboard, and LinkGroup arranges destinations. Behavior composes from small building blocks.",
    tip: "Try the disclosure and copy action. Copy feedback reserves its width so the button does not jump when its label changes.",
  },
  {
    id: "field",
    name: "Field",
    group: "Forms",
    description: "Labels and feedback that belong together.",
    rationale:
      "Field connects its label, help text and error to a control with stable IDs. It provides the relationship; the child provides the input.",
    tip: "Focus the input: its name, description and validation state come from the field.",
  },
  {
    id: "input",
    name: "TextInput",
    group: "Forms",
    description: "Text entry with shared dimensions.",
    rationale:
      "Native input behavior, 32/40/48px sizes and square focus outlines. Use it inside Field for consistent naming and feedback.",
    tip: "Try typing, then compare disabled and read-only states. Read-only fields remain focusable.",
  },
  {
    id: "select",
    name: "Select",
    group: "Forms",
    description: "A familiar choice in a consistent frame.",
    rationale:
      "A native select preserves platform keyboard behavior while using shared heights, borders and colors.",
    tip: "Use the arrow keys to choose an option, or type its first letter.",
  },
  {
    id: "checkbox",
    name: "Checkbox",
    group: "Forms",
    description: "A visible label, a clear choice.",
    rationale:
      "The native checkbox keeps checked, required and disabled semantics. Its label increases the clickable area and optional details explain the choice.",
    tip: "Tab to the checkbox and press Space. Clicking its label also toggles it.",
  },
  {
    id: "navigation",
    name: "NavigationList",
    group: "Composition",
    description: "Find a destination, see where you are.",
    rationale:
      "Grouped navigation supports native links for destinations and buttons for local selections. Active state is exposed with aria-current.",
    tip: "Move between entries with Tab and activate with Enter. Disabled entries are skipped.",
  },
  {
    id: "code",
    name: "CodeExample",
    group: "Composition",
    description: "Readable code you can take with you.",
    rationale:
      "Syntax highlighting uses escaped React text, never generated HTML. Copying preserves the exact source, including newlines.",
    tip: "The code region can be focused and scrolled. Copy feedback is announced without moving focus.",
  },
] as const;
type ComponentId = (typeof catalog)[number]["id"];
const tails = ["bottom-start", "bottom-end", "top-start", "top-end"] as const;
const rotations = ["none", "left", "right"] as const;
const comicTones = ["default", "accent", "emphasis"] as const;
const stickerPatterns = ["none", "stripes", "dots", "grid"] as const;
const sizes = ["sm", "md", "lg"] as const;
const tones = ["default", "subtle", "accent", "info", "emphasis"] as const;
const variants = ["primary", "secondary", "ghost", "emphasis"] as const;
const navigationItems = [
  { id: "intro", label: "Intro", href: "#intro" },
  { id: "build", label: "Build", href: "#build" },
  { id: "ship", label: "Ship", href: "#ship" },
];
const exampleImage = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#f5cb56"/><rect x="80" y="60" width="480" height="280" fill="#fffaf0" stroke="#25231f" stroke-width="8"/><text x="320" y="225" text-anchor="middle" font-family="monospace" font-size="72" font-weight="bold" fill="#a13c24">UI</text></svg>')}`;

function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label}>
      {(field) => (
        <Select
          {...field}
          value={value}
          onChange={(event) => onChange(event.target.value as T)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}
function Toggle({
  label,
  checked,
  onChange,
  ref,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  ref?: Ref<HTMLInputElement>;
}) {
  return (
    <Checkbox
      ref={ref}
      label={label}
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}
function Snippet({ code }: { code: string }) {
  return (
    <CodeExample
      code={code}
      codeLabel="Usage example"
      maxHeight="min(28rem, 60dvh)"
      border="none"
      description="Complete example using the shared UI package."
      className={styles.snippet}
    />
  );
}

function Playground({ kind }: { kind: ComponentId }) {
  const [width, setWidth] = useState<"narrow" | "wide">("wide");
  const [tail, setTail] = useState<(typeof tails)[number]>("bottom-start");
  const [rotation, setRotation] = useState<(typeof rotations)[number]>("left");
  const [burstTone, setBurstTone] = useState<(typeof comicTones)[number]>("accent");
  const [speechTone, setSpeechTone] = useState<(typeof comicTones)[number]>("default");
  const [animated, setAnimated] = useState(true);
  const [feedback, setFeedback] = useState(false);
  const [showBurst, setShowBurst] = useState(true);
  const [found, setFound] = useState(false);
  const [foundTone, setFoundTone] = useState<(typeof comicTones)[number]>("accent");
  const [pattern, setPattern] = useState<(typeof stickerPatterns)[number]>("none");
  const [stickerIcon, setStickerIcon] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [noteOpen, setNoteOpen] = useState(true);
  const [decision, setDecision] = useState("");
  const noticeToggleRef = useRef<HTMLInputElement>(null);
  const [tilePreset, setTilePreset] = useState<"brand" | "off" | "playing" | "paused">("brand");
  const [tileInset, setTileInset] = useState(true);
  const [size, setSize] = useState<Size>("md");
  const [badgeControlSize, setBadgeControlSize] = useState<Size | "none">("none");
  const [variant, setVariant] = useState<Variant>("primary");
  const [linkVariant, setLinkVariant] = useState<Variant | "text" | "nav">(
    "text",
  );
  const [tone, setTone] = useState<Tone>("default");
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState(true);
  const [iconOnly, setIconOnly] = useState(false);
  const [label, setLabel] = useState("Make something");
  const [clicks, setClicks] = useState(0);
  const [checked, setChecked] = useState(false);
  const [elevation, setElevation] = useState<Elevation>("lg");
  const [solid, setSolid] = useState(true);
  const [square, setSquare] = useState(false);
  const [tilt, setTilt] = useState<"none" | "left" | "right">("none");
  const [font, setFont] = useState<"body" | "mono">("body");
  const [textSize, setTextSize] = useState<"caption" | "sm" | "md" | "lg">(
    "md",
  );
  const [columns, setColumns] = useState<"1" | "2" | "3">("2");
  const [gap, setGap] = useState<"2" | "4" | "6">("4");
  const [dashed, setDashed] = useState(false);
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<"2" | "3" | "5">("3");
  const [value, setValue] = useState("");
  const [required, setRequired] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [help, setHelp] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [sampleActive, setSampleActive] = useState("overview");
  const [language, setLanguage] = useState<"tsx" | "text">("tsx");
  const [navigationActive, setNavigationActive] = useState("intro");
  const [imageFit, setImageFit] = useState<"contain" | "cover">("contain");
  const [imageRadius, setImageRadius] = useState<"none" | "sm" | "md" | "full">("none");
  let controls: ReactNode;
  let preview: ReactNode;
  let code = "";
  const hasWidthPreview = kind === "consent-note" || catalog.some(
    (item) => item.id === kind && item.group === "Comic",
  );
  const sizeProp = `size="${size}"`;
  const sizeControl = (
    <Choice label="Size" value={size} options={sizes} onChange={setSize} />
  );
  const variantControl = (
    <Choice
      label="Variant"
      value={variant}
      options={variants}
      onChange={setVariant}
    />
  );
  const toneControl = (
    <Choice label="Tone" value={tone} options={tones} onChange={setTone} />
  );
  if (kind === "navbar" || kind === "navbar-links") {
    controls = (
      <Choice label="Current destination" value={navigationActive} options={["intro", "build", "ship"]} onChange={setNavigationActive} />
    );
    const demoLinks = <NavbarLinks items={navigationItems} activeId={navigationActive} onSelect={(id, event) => { event.preventDefault(); setNavigationActive(id); }} />;
    preview = kind === "navbar" ? (
      <Navbar label="Example navbar" brand={<Badge variant="solid" tone="emphasis">UI</Badge>} actions={<Switch aria-label="Example mode" size="sm" checked={checked} onCheckedChange={setChecked} />} className={styles.fill}>
        {demoLinks}
      </Navbar>
    ) : <div className={styles.fill}>{demoLinks}</div>;
    code = elementCode("NavbarLinks", ["items={items}", "activeId={activeId}", "onSelect={(id, event) => { event.preventDefault(); setActiveId(id); }}"]);
    if (kind === "navbar") code = elementCode("Navbar", [
      'label="Example navbar"',
      'brand={<Badge variant="solid" tone="emphasis">UI</Badge>}',
      'actions={<Switch aria-label="Example mode" size="sm" checked={checked} onCheckedChange={setChecked} />}',
    ], code);
  } else if (kind === "image") {
    controls = <>
      <Choice label="Fit" value={imageFit} options={["contain", "cover"]} onChange={setImageFit} />
      <Choice label="Radius" value={imageRadius} options={["none", "sm", "md", "full"]} onChange={setImageRadius} />
      <Toggle label="Unavailable source" checked={invalid} onChange={setInvalid} />
    </>;
    const src = invalid ? "data:image/png;base64,invalid" : exampleImage;
    preview = <Image src={src} alt="A framed UI mark on a yellow background" width={320} height={240} fit={imageFit} radius={imageRadius} loading="eager" />;
    code = elementCode("Image", ["src={src}", 'alt="A framed UI mark on a yellow background"', "width={320}", "height={240}", `fit="${imageFit}"`, `radius="${imageRadius}"`]);
  } else if (kind === "button") {
    controls = (
      <>
        {variantControl}
        {sizeControl}
        <Field label="Label">
          {(field) => (
            <TextInput
              {...field}
              maxLength={40}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          )}
        </Field>
        <Toggle label="Leading icon" checked={icon} onChange={setIcon} />
        <Toggle label="Icon only" checked={iconOnly} onChange={setIconOnly} />
        <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
        <Toggle label="Loading" checked={loading} onChange={setLoading} />
      </>
    );
    preview = (
      <Stack align="center" gap={6}>
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          loading={loading}
          {...(iconOnly
            ? {
                iconOnly: true as const,
                "aria-label": label || "Make something",
              }
            : { iconOnly: false as const })}
          startIcon={icon || iconOnly ? <FaHeart /> : undefined}
          onClick={() => setClicks((value) => value + 1)}
        >
          {iconOnly ? undefined : label || "Make something"}
        </Button>
        <Text size="caption" font="mono" role="status">
          {clicks
            ? `Activated ${clicks} ${clicks === 1 ? "time" : "times"}`
            : "Try hover, press, and keyboard focus"}
        </Text>
      </Stack>
    );
    code = elementCode(
      "Button",
      [
        `variant="${variant}"`,
        `size="${size}"`,
        disabled && "disabled",
        loading && "loading",
        (icon || iconOnly) && "startIcon={<FaHeart />}",
        iconOnly && "iconOnly",
        iconOnly && `aria-label={${JSON.stringify(label || "Make something")}}`,
        "onClick={handleClick}",
      ],
      iconOnly ? undefined : jsxText(label || "Make something"),
    );
  } else if (kind === "link") {
    controls = (
      <>
        <Choice
          label="Variant"
          value={linkVariant}
          options={["text", "nav", ...variants]}
          onChange={setLinkVariant}
        />
        {sizeControl}
        <Toggle label="External indicator" checked={icon} onChange={setIcon} />
      </>
    );
    preview = (
      <Link
        variant={linkVariant}
        size={size}
        href="https://github.com/mdopeace/mdopeace.github.io"
        target="_blank"
        externalIndicator={icon}
      >
        Explore the source
      </Link>
    );
    code = elementCode(
      "Link",
      [
        'href="https://github.com/mdopeace/mdopeace.github.io"',
        `variant="${linkVariant}"`,
        `size="${size}"`,
        'target="_blank"',
        icon && "externalIndicator",
      ],
      "Explore the source",
    );
  } else if (kind === "switch") {
    controls = (
      <>
        {sizeControl}
        <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
        <Toggle label="State icons" checked={icon} onChange={setIcon} />
      </>
    );
    preview = (
      <Stack align="center">
        <Switch
          aria-label="Example setting"
          size={size}
          checked={checked}
          onCheckedChange={setChecked}
          disabled={disabled}
          checkedIcon={icon ? <PiMoonStarsBold /> : undefined}
          uncheckedIcon={icon ? <PiSunBold /> : undefined}
        />
        <Text size="caption" font="mono" role="status">
          Setting is {checked ? "on" : "off"}
        </Text>
      </Stack>
    );
    code = elementCode("Switch", [
      'aria-label="Example setting"',
      `size="${size}"`,
      "checked={checked}",
      "onCheckedChange={setChecked}",
      disabled && "disabled",
      icon && "checkedIcon={<PiMoonStarsBold />}",
      icon && "uncheckedIcon={<PiSunBold />}",
    ]);
  } else if (kind === "surface") {
    controls = (
      <>
        {toneControl}
        <Choice
          label="Elevation"
          value={elevation}
          options={["none", "sm", "md", "lg", "xl"] as const}
          onChange={setElevation}
        />
      </>
    );
    preview = (
      <Surface
        tone={tone}
        elevation={elevation}
        padding={6}
        className={styles.sample}
      >
        <Stack gap={3}>
          <Badge>Small beginnings</Badge>
          <Heading level={3} size="card">
            A place for an idea.
          </Heading>
          <Text size="sm">
            A surface carries its background, border, depth and readable
            foreground together.
          </Text>
          <Text tone="muted" size="caption">
            Supporting text belongs to this surface too.
          </Text>
        </Stack>
      </Surface>
    );
    code = elementCode(
      "Surface",
      [`tone="${tone}"`, `elevation="${elevation}"`, "padding={6}"],
      elementCode(
        "Stack",
        ["gap={3}"],
        [
          "<Badge>Small beginnings</Badge>",
          '<Heading level={3} size="card">A place for an idea.</Heading>',
          '<Text size="sm">A surface carries its background, border, depth and readable foreground together.</Text>',
          '<Text tone="muted" size="caption">Supporting text belongs to this surface too.</Text>',
        ].join("\n"),
      ),
    );
  } else if (kind === "speech-bubble") {
    const caption = "Every good story starts with a little curiosity.";
    controls = (
      <>
        <Choice label="Tail" value={tail} options={tails} onChange={setTail} />
        <Choice label="Tone" value={speechTone} options={comicTones} onChange={setSpeechTone} />
        {sizeControl}
      </>
    );
    preview = <SpeechBubble tail={tail} tone={speechTone} size={size}>{caption}</SpeechBubble>;
    code = elementCode("SpeechBubble", [`tail="${tail}"`, `tone="${speechTone}"`, sizeProp], caption);
  } else if (kind === "burst") {
    const message = "POW! Copied!";
    controls = (
      <>
        <Choice label="Tone" value={burstTone} options={comicTones} onChange={setBurstTone} />
        {sizeControl}
        <Toggle label="Animate entry" checked={animated} onChange={setAnimated} />
        <Toggle label="Announce feedback" checked={feedback} onChange={setFeedback} />
        <Toggle label="Show burst" checked={showBurst} onChange={setShowBurst} />
      </>
    );
    preview = <Burst tone={burstTone} size={size} animated={animated} status={feedback}>{showBurst ? message : null}</Burst>;
    const burstProps = [`tone="${burstTone}"`, sizeProp, animated && "animated", feedback && "status"];
    code = feedback
      ? [
          "<>",
          `<Button onClick={() => setMessage(${JSON.stringify(message)})}>Show feedback</Button>`,
          elementCode("Burst", burstProps, "{message}"),
          "</>",
        ].join("\n")
      : elementCode("Burst", burstProps, showBurst ? message : undefined);
  } else if (kind === "sticker") {
    const appearance = { size, rotation, found, foundTone, pattern, icon: stickerIcon ? <FaHeart /> : undefined };
    controls = (
      <>
        <Choice label="Rotation" value={rotation} options={rotations} onChange={setRotation} />
        {sizeControl}
        <Toggle label="Found" checked={found} onChange={setFound} />
        <Choice label="Found tone" value={foundTone} options={comicTones} onChange={setFoundTone} />
        <Choice label="Found pattern" value={pattern} options={stickerPatterns} onChange={setPattern} />
        <Toggle label="Found icon" checked={stickerIcon} onChange={setStickerIcon} />
        <Toggle label="Interactive" checked={interactive} onChange={setInteractive} />
      </>
    );
    preview = interactive
      ? <Sticker {...appearance} onClick={() => setFound(true)}>Star</Sticker>
      : <Sticker {...appearance}>Star</Sticker>;
    code = elementCode("Sticker", [
      sizeProp, `rotation="${rotation}"`,
      interactive ? "found={found}" : found && "found",
      `foundTone="${foundTone}"`, `pattern="${pattern}"`, stickerIcon && "icon={<FaHeart />}",
      interactive && "onClick={() => setFound(true)}",
    ], "Star");
  } else if (kind === "consent-note") {
    const notice = "Would you like to enable reminders?";
    const choose = (label: string) => {
      setDecision(label);
      setNoteOpen(false);
      noticeToggleRef.current?.focus();
    };
    controls = (
      <Toggle ref={noticeToggleRef} label="Open notice" checked={noteOpen} onChange={(next) => {
        setNoteOpen(next);
        setDecision("");
      }} />
    );
    preview = (
      <Stack gap={4}>
        <ConsentNote open={noteOpen} onAccept={() => choose("Accepted")} onDecline={() => choose("Declined")}>{notice}</ConsentNote>
        <Text role="status">{decision}</Text>
      </Stack>
    );
    code = [
      "<>",
      elementCode("ConsentNote", [
        "open={open}", "onAccept={closeNotice}", "onDecline={closeNotice}",
      ], notice),
      '<Button ref={reopenRef} onClick={() => setOpen(true)}>Open notice</Button>',
      "</>",
    ].join("\n");
  } else if (kind === "tile") {
    const faceColor = { brand: "var(--ui-emphasis)", off: "#7d8178", playing: "#9bdc74", paused: "#f0ae55" }[tilePreset];
    const textColor = "var(--ui-on-emphasis)";
    const frameColor = "#292d29";
    controls = (
      <>
        <Choice label="Appearance" value={tilePreset} options={["brand", "off", "playing", "paused"] as const} onChange={setTilePreset} />
        <Choice label="Size" value={size} options={["sm", "md", "lg"] as const} onChange={setSize} />
        <Toggle label="Inset depth" checked={tileInset} onChange={setTileInset} />
      </>
    );
    preview = <Tile size={size} faceColor={faceColor} textColor={textColor} frameColor={frameColor} inset={tileInset} role="img" aria-label={tilePreset === "brand" ? "Game Boy mark" : `${tilePreset} indicator`}>{tilePreset === "brand" ? "GB" : null}</Tile>;
    code = elementCode("Tile", [
      `size="${size}"`, `faceColor="${faceColor}"`, `textColor="${textColor}"`,
      `frameColor="${frameColor}"`, `inset={${tileInset}}`, 'role="img"',
      `aria-label="${tilePreset === "brand" ? "Game Boy mark" : `${tilePreset} indicator`}"`,
    ], tilePreset === "brand" ? "GB" : "");
  } else if (kind === "badge") {
    controls = (
      <>
        <Choice
          label="Tone"
          value={tone === "info" || tone === "subtle" ? "default" : tone}
          options={comicTones}
          onChange={setTone}
        />
        <Choice
          label="Size"
          value={size === "lg" ? "md" : size}
          options={["sm", "md"] as const}
          onChange={setSize}
        />
        <Choice
          label="Tilt"
          value={tilt}
          options={["none", "left", "right"] as const}
          onChange={setTilt}
        />
        <Toggle label="Solid fill" checked={solid} onChange={setSolid} />
        <Toggle label="Square shape" checked={square} onChange={setSquare} />
        <Choice label="Control size" value={badgeControlSize} options={["none", ...sizes]} onChange={setBadgeControlSize} />
      </>
    );
    const badgeTone = tone === "info" || tone === "subtle" ? "default" : tone;
    const badgeSize = size === "lg" ? "md" : size;
    const badge = (
      <Badge
        className={styles.badgePreview}
        tone={badgeTone}
        variant={solid ? "solid" : "outline"}
        size={badgeSize}
        controlSize={badgeControlSize === "none" ? undefined : badgeControlSize}
        shape={square ? "square" : "label"}
        tilt={tilt === "none" ? undefined : tilt}
      >
        {square ? "GB" : "Work in progress"}
      </Badge>
    );
    code = elementCode(
      "Badge",
      [
        `variant="${solid ? "solid" : "outline"}"`,
        `tone="${badgeTone}"`,
        `size="${badgeSize}"`,
        badgeControlSize !== "none" && `controlSize="${badgeControlSize}"`,
        `shape="${square ? "square" : "label"}"`,
        tilt !== "none" && `tilt="${tilt}"`,
      ],
      square ? "GB" : "Work in progress",
    );
    preview = badge;
    if (badgeControlSize !== "none") {
      preview = (
        <Inline justify="center">
          {badge}
          <Link href="#library-main" variant="secondary" size={badgeControlSize}>Link</Link>
          <Switch aria-label="Example switch" size={badgeControlSize} />
        </Inline>
      );
      code = elementCode("Inline", ['justify="center"'], [
        code,
        elementCode("Link", ['href="#library-main"', 'variant="secondary"', `size="${badgeControlSize}"`], "Link"),
        elementCode("Switch", ['aria-label="Example switch"', `size="${badgeControlSize}"`]),
      ].join("\n"));
    }
  } else if (kind === "typography") {
    controls = (
      <>
        <Choice
          label="Text size"
          value={textSize}
          options={["caption", "sm", "md", "lg"] as const}
          onChange={setTextSize}
        />
        <Choice
          label="Font"
          value={font}
          options={["body", "mono"] as const}
          onChange={setFont}
        />
      </>
    );
    preview = (
      <Stack gap={4} className={styles.sample}>
        <Text variant="eyebrow">An idea worth making</Text>
        <Heading level={3} size="feature">
          Make the useful thing.
        </Heading>
        <Text size={textSize} font={font}>
          Notice the little friction. Build a small solution. Keep refining it
          until it feels right.
        </Text>
        <Text size="caption" tone="muted">
          Semantic headings. Shared scales. Readable details.
        </Text>
      </Stack>
    );
    code =
      elementCode(
        "Heading",
        ["level={3}", 'size="feature"'],
        "Make the useful thing.",
      ) +
      "\n\n" +
      elementCode(
        "Text",
        [`size="${textSize}"`, `font="${font}"`],
        "Notice the little friction. Build a small solution.",
      );
  } else if (kind === "layout") {
    controls = (
      <>
        <Choice
          label="Columns"
          value={columns}
          options={["1", "2", "3"] as const}
          onChange={setColumns}
        />
        <Choice
          label="Gap token"
          value={gap}
          options={["2", "4", "6"] as const}
          onChange={setGap}
        />
        <Toggle label="Dashed divider" checked={dashed} onChange={setDashed} />
      </>
    );
    preview = (
      <Stack gap={5} className={styles.fill}>
        <Grid
          columns={Number(columns) as 1 | 2 | 3}
          gap={Number(gap) as 2 | 4 | 6}
        >
          {["Notice", "Make", "Refine"].map((word, index) => (
            <Surface
              key={word}
              tone={index === 1 ? "info" : "subtle"}
              padding={3}
              elevation="none"
            >
              <Text size="caption" font="mono">
                0{index + 1}
              </Text>
              <Text size="sm" weight="bold">
                {word}
              </Text>
            </Surface>
          ))}
        </Grid>
        <Divider variant={dashed ? "dashed" : "solid"} />
      </Stack>
    );
    code = elementCode(
      "Stack",
      ["gap={5}"],
      elementCode(
        "Grid",
        [`columns={${columns}}`, `gap={${gap}}`],
        ["Notice", "Make", "Refine"]
          .map((word, index) =>
            elementCode(
              "Surface",
              [
                `tone="${index === 1 ? "info" : "subtle"}"`,
                "padding={3}",
                'elevation="none"',
              ],
              `<Text size="caption" font="mono">0${index + 1}</Text>\n<Text size="sm" weight="bold">${word}</Text>`,
            ),
          )
          .join("\n"),
      ) +
        "\n" +
        elementCode("Divider", [`variant="${dashed ? "dashed" : "solid"}"`]),
    );
  } else if (kind === "dialog") {
    controls = sizeControl;
    preview = (
      <>
        <Button onClick={() => setOpen(true)}>Open example dialog</Button>
        <Dialog
          title="Room for one idea."
          description="A short task, without losing your place."
          closeLabel="Close example dialog"
          open={open}
          onOpenChange={setOpen}
          size={size}
        >
          <Stack gap={5}>
            <Text>
              Try Tab, Shift+Tab and Escape. Closing returns focus to the button
              that opened this dialog.
            </Text>
            <Button onClick={() => setOpen(false)}>Got it</Button>
          </Stack>
        </Dialog>
      </>
    );
    code = elementCode(
      "Dialog",
      [
        "open={open}",
        "onOpenChange={setOpen}",
        `size="${size}"`,
        'title="Room for one idea."',
        'description="A short task, without losing your place."',
        'closeLabel="Close example dialog"',
      ],
      elementCode(
        "Stack",
        ["gap={5}"],
        "<Text>Try Tab, Shift+Tab and Escape. Closing returns focus to the button that opened this dialog.</Text>\n<Button onClick={() => setOpen(false)}>Got it</Button>",
      ),
    );
  } else if (kind === "field" || kind === "input") {
    controls = (
      <>
        {kind === "input" && sizeControl}
        <Toggle label="Help text" checked={help} onChange={setHelp} />
        <Toggle label="Error state" checked={invalid} onChange={setInvalid} />
        <Toggle label="Required" checked={required} onChange={setRequired} />
        <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
        <Toggle label="Read only" checked={readOnly} onChange={setReadOnly} />
      </>
    );
    preview = (
      <div className={styles.sample}>
        <Field
          label="Your name"
          description={help ? "How should we address you?" : undefined}
          error={invalid ? "Please enter your name." : undefined}
          required={required}
        >
          {(field) => (
            <TextInput
              {...field}
              size={size}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Ada Lovelace"
              disabled={disabled}
              readOnly={readOnly}
            />
          )}
        </Field>
      </div>
    );
    code = elementCode(
      "Field",
      [
        'label="Your name"',
        help && 'description="How should we address you?"',
        invalid && 'error="Please enter your name."',
        required && "required",
      ],
      "{field => (\n" +
        elementCode("TextInput", [
          "{...field}",
          `size="${size}"`,
          "value={value}",
          "onChange={event => setValue(event.target.value)}",
          'placeholder="Ada Lovelace"',
          disabled && "disabled",
          readOnly && "readOnly",
        ])
          .split("\n")
          .map((line) => "  " + line)
          .join("\n") +
        "\n)}",
    );
  } else if (kind === "select") {
    controls = (
      <>
        {sizeControl}
        <Toggle label="Help text" checked={help} onChange={setHelp} />
        <Toggle label="Error state" checked={invalid} onChange={setInvalid} />
        <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
      </>
    );
    preview = (
      <div className={styles.sample}>
        <Field
          label="Favorite material"
          description={help ? "Choose a starting point." : undefined}
          error={invalid ? "Please choose a material." : undefined}
        >
          {(field) => (
            <Select
              {...field}
              size={size}
              disabled={disabled}
              value={value || "paper"}
              onChange={(event) => setValue(event.target.value)}
            >
              <option value="paper">Paper</option>
              <option value="pixels">Pixels</option>
              <option value="both">A little of both</option>
            </Select>
          )}
        </Field>
      </div>
    );
    code = elementCode(
      "Field",
      [
        'label="Favorite material"',
        help && 'description="Choose a starting point."',
        invalid && 'error="Please choose a material."',
      ],
      "{field => (\n" +
        elementCode(
          "Select",
          [
            "{...field}",
            `size="${size}"`,
            "value={value}",
            "onChange={event => setValue(event.target.value)}",
            disabled && "disabled",
          ],
          '<option value="paper">Paper</option>\n<option value="pixels">Pixels</option>\n<option value="both">A little of both</option>',
        )
          .split("\n")
          .map((line) => "  " + line)
          .join("\n") +
        "\n)}",
    );
  } else if (kind === "checkbox") {
    controls = (
      <>
        <Toggle label="Help text" checked={help} onChange={setHelp} />
        <Toggle label="Error state" checked={invalid} onChange={setInvalid} />
        <Toggle label="Required" checked={required} onChange={setRequired} />
        <Toggle label="Disabled" checked={disabled} onChange={setDisabled} />
      </>
    );
    preview = (
      <div className={styles.sample}>
        <Checkbox
          label="Send me build notes"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          description={
            help ? "Occasional notes about things being made." : undefined
          }
          error={invalid ? "Please confirm your choice." : undefined}
          required={required}
          disabled={disabled}
        />
      </div>
    );
    code = elementCode("Checkbox", [
      'label="Send me build notes"',
      "checked={checked}",
      "onChange={event => setChecked(event.target.checked)}",
      help && 'description="Occasional notes about things being made."',
      invalid && 'error="Please confirm your choice."',
      required && "required",
      disabled && "disabled",
    ]);
  } else if (kind === "navigation") {
    controls = (
      <Toggle
        label="Disable last item"
        checked={disabled}
        onChange={setDisabled}
      />
    );
    preview = (
      <div className={styles.sample}>
        <NavigationList
          label="Example navigation"
          activeId={sampleActive}
          onSelect={setSampleActive}
          groups={[
            {
              label: "Getting started",
              items: [
                { id: "overview", label: "Overview" },
                { id: "principles", label: "Principles" },
              ],
            },
            {
              label: "Build",
              items: [{ id: "components", label: "Components", disabled }],
            },
          ]}
        />
      </div>
    );
    code = elementCode("NavigationList", [
      'label="Example navigation"',
      "groups={groups}",
      "activeId={activeId}",
      "onSelect={setActiveId}",
    ]);
  } else if (kind === "code") {
    controls = (
      <Choice
        label="Language"
        value={language}
        options={["tsx", "text"] as const}
        onChange={setLanguage}
      />
    );
    preview = (
      <CodeExample
        className={styles.fill}
        code={'<Button variant="primary">Make something</Button>'}
        codeLabel="Sample code"
        language={language}
      />
    );
    code = elementCode("CodeExample", [
      "code={example}",
      `language="${language}"`,
    ]);
  } else {
    controls = (
      <Choice
        label="Collapsed lines"
        value={lines}
        options={["2", "3", "5"] as const}
        onChange={setLines}
      />
    );
    preview = (
      <Stack gap={6} className={styles.fill}>
        <ExpandableText
          lines={Number(lines)}
          expandLabel="Read more"
          collapseLabel="Read less"
        >
          {"Good components make decisions once, then carry those decisions into every composition. A button owns its size, focus, depth and feedback. A card arranges content. A business component adds meaning. That separation makes the app easier to refine without creating a different visual language in every section. ".repeat(
            3,
          )}
        </ExpandableText>
        <CommandBlock code={"npm install\nnpm run dev"} />
        <LinkGroup
          items={[
            {
              label: "Source code",
              href: "https://github.com/mdopeace/mdopeace.github.io",
              externalIndicator: true,
            },
          ]}
        />
      </Stack>
    );
    code =
      elementCode(
        "ExpandableText",
        [
          `lines={${lines}}`,
          'expandLabel="Read more"',
          'collapseLabel="Read less"',
        ],
        "{description}",
      ) +
      "\n\n" +
      elementCode("CommandBlock", [
        `code={${JSON.stringify("npm install\nnpm run dev")}}`,
      ]) +
      "\n\n" +
      elementCode("LinkGroup", ["items={links}"]);
  }
  let setup = "";
  if (kind === "navbar" || kind === "navbar-links") {
    setup = `const [activeId, setActiveId] = useState(${JSON.stringify(navigationActive)});\n${kind === "navbar" ? `const [checked, setChecked] = useState(${checked});\n` : ""}\nconst items = ${JSON.stringify(navigationItems, null, 2)};`;
  }
  if (kind === "image") setup = `const src = ${JSON.stringify(invalid ? "data:image/png;base64,invalid" : exampleImage)};`;
  if (kind === "button")
    setup = 'function handleClick() {\n  console.info("Button activated");\n}';
  if (kind === "switch")
    setup = `const [checked, setChecked] = useState(${checked});`;
  if (kind === "dialog") {
    setup = "const [open, setOpen] = useState(false);";
    code = elementCode(
      "Stack",
      ["gap={5}"],
      "<Button onClick={() => setOpen(true)}>Open example dialog</Button>\n" +
        code,
    );
  }
  if (kind === "typography") code = elementCode("Stack", ["gap={4}"], code);
  if (kind === "content") {
    setup =
      'const description = [\n  "Good components make decisions once, then carry those decisions",\n  "into every composition. A button owns its size, focus, depth and",\n  "feedback. A card arranges content. A business component adds meaning.",\n  "That separation makes the app easier to refine without creating",\n  "a different visual language in every section.",\n].join(" ").repeat(3);\n\nconst links = [{\n  label: "Source code",\n  href: "https://github.com/mdopeace/mdopeace.github.io",\n  externalIndicator: true,\n}];';
    code = elementCode("Stack", ["gap={6}"], code);
  }
  if (kind === "field" || kind === "input")
    setup = 'const [value, setValue] = useState("");';
  if (kind === "select") setup = 'const [value, setValue] = useState("paper");';
  if (kind === "checkbox")
    setup = `const [checked, setChecked] = useState(${checked});`;
  if (kind === "navigation")
    setup = `const [activeId, setActiveId] = useState("overview");\n\nconst groups = [\n  { label: "Getting started", items: [\n    { id: "overview", label: "Overview" },\n    { id: "principles", label: "Principles" },\n  ] },\n  { label: "Build", items: [\n    { id: "components", label: "Components", disabled: ${disabled} },\n  ] },\n];`;
  if (kind === "code")
    setup = `const example = ${JSON.stringify('<Button variant="primary">Make something</Button>')};`;
  if (kind === "sticker" && interactive)
    setup = `const [found, setFound] = useState(${found});`;
  if (kind === "consent-note")
    setup = [
      `const [open, setOpen] = useState(${noteOpen});`,
      "const reopenRef = useRef<HTMLButtonElement>(null);",
      "",
      "function closeNotice() {",
      "  setOpen(false);",
      "  reopenRef.current?.focus();",
      "}",
    ].join("\n");
  if (kind === "burst" && feedback)
    setup = "const [message, setMessage] = useState(null as string | null);";
  code = completeExample(
    code,
    setup,
    [
      "button",
      "switch",
      "dialog",
      "field",
      "input",
      "select",
      "checkbox",
      "navigation",
      "navbar",
      "navbar-links",
    ].includes(kind) || (kind === "badge" && badgeControlSize !== "none") || kind === "consent-note" || (kind === "sticker" && interactive) || (kind === "burst" && feedback),
  );
  return (
    <div className={styles.workbench}>
      <div className={styles.demoColumn}>
        <div className={styles.stageHeader}>
          <Text size="caption" font="mono">
            Live preview
          </Text>
          <Badge>Interactive</Badge>
        </div>
        <div className={styles.stage}>
          {hasWidthPreview ? <div className={styles.widthPreview} data-width={width} role="group" aria-label="Live preview">{preview}</div> : preview}
        </div>
      </div>
      <aside className={styles.properties} aria-label="Playground properties">
        <Inline justify="between">
          <Heading level={3} size="label">
            Properties
          </Heading>
          <Text size="caption" font="mono">
            Live
          </Text>
        </Inline>
        <Stack gap={4}>
          {hasWidthPreview && <Choice label="Preview width" value={width} options={["narrow", "wide"] as const} onChange={setWidth} />}
          {controls}
        </Stack>
        <Text size="caption" tone="muted">
          Changes affect this example only. Switch components to start fresh.
        </Text>
      </aside>
      <Snippet code={code} />
    </div>
  );
}

export default function ComponentPreview() {
  const [active, setActive] = useState<ComponentId>("button");
  const [revision, setRevision] = useState(0);
  const selected = catalog.find((item) => item.id === active)!;
  return (
    <Container className={styles.page}>
      <SectionNavigation />
      <a className="skip-link" href="#library-main">
        Skip to playground
      </a>
      <header className={styles.header}>
        <Inline justify="between">
          <Link href={withBasePath("/")} size="sm" startIcon={<FaArrowLeft />}>
            Back to portfolio
          </Link>
          <Inline gap={3}>
            <Text size="caption" font="mono">
              Light / dark
            </Text>
            <ThemeToggle />
          </Inline>
        </Inline>
        <Stack gap={4}>
          <Badge variant="solid" tone="accent">
            Behind the interface · 01
          </Badge>
          <Heading level={1} size="section">
            Small parts. A shared language.
          </Heading>
          <Text tone="muted" className={styles.intro}>
            The building blocks behind my portfolio. Turn the knobs, try the
            states, and see how the decisions fit together.
          </Text>
        </Stack>
        <Inline gap={2}>
          <Badge>3px controls</Badge>
          <Badge>5px panels</Badge>
          <Badge>Square edges</Badge>
          <Badge>Keyboard ready</Badge>
        </Inline>
        <Stack gap={3} className={styles.intro}>
          <Heading level={2} size="label">Design decisions</Heading>
          <Text size="sm" tone="muted">
            Warm paper, square edges and hard shadows give this site its character.
            Shared 32, 40 and 48px controls, spacing tokens and consistent depth
            keep the parts working together. The components below power this page
            and the portfolio itself.
          </Text>
          <Text size="sm" tone="muted">
            Try both themes, use your keyboard, and change the properties. Native
            controls, visible focus and reduced-motion support are part of the
            building blocks, alongside their appearance. Each example includes
            working React code and the thinking behind it.
          </Text>
        </Stack>
      </header>
      <div className={styles.workspace}>
        <NavigationList
          label="Component library"
          className={styles.sidebar}
          activeId={active}
          onSelect={(id) => setActive(id as ComponentId)}
          groups={["Actions", "Foundations", "Forms", "Media", "Navigation", "Composition", "Comic"].map(
            (group) => ({
              label: group,
              items: catalog
                .filter((item) => item.group === group)
                .map((item) => ({ id: item.id, label: item.name })),
            }),
          )}
        />
        <main id="library-main" tabIndex={-1} className={styles.main}>
          <Stack gap={6}>
            <div className={styles.componentHeading}>
              <div>
                <Text variant="eyebrow" tone="muted">
                  {selected.group}
                </Text>
                <Heading level={2} size="feature">
                  {selected.name}
                </Heading>
                <Text tone="muted">{selected.description}</Text>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRevision((value) => value + 1)}
              >
                Reset example
              </Button>
            </div>
            <Playground key={`${active}-${revision}`} kind={active} />
            <Grid columns={{ base: 1, md: 2 }} gap={5}>
              <div className={styles.note}>
                <Text variant="eyebrow">Why this works</Text>
                <Text size="sm" tone="muted">
                  {selected.rationale}
                </Text>
              </div>
              <div className={styles.note}>
                <Text variant="eyebrow">Try it with a keyboard</Text>
                <Text size="sm" tone="muted">
                  {selected.tip}
                </Text>
              </div>
            </Grid>
          </Stack>
        </main>
      </div>
      <footer className={styles.footer}>
        <Inline justify="between">
          <Text size="caption" font="mono" tone="muted">
            Built from the same components as the portfolio.
          </Text>
          <Link
            href="https://github.com/mdopeace/mdopeace.github.io"
            size="sm"
            externalIndicator
          >
            View source
          </Link>
        </Inline>
      </footer>
    </Container>
  );
}
