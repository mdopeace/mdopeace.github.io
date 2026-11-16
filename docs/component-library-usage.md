# Using the component library

Import components from the local [`@mdopeace/ui` workspace package](../packages/ui/README.md). The [specification](component-library-plan.md) contains the complete prop tables, defaults, token scales and accessibility requirements. Exported prop types live beside each component. No package publishing is required to use the library in this app.

## Layout and surfaces

```tsx
import { Grid, Stack } from "@mdopeace/ui/Layout";
import { Surface } from "@mdopeace/ui/Surface";
import { Heading, Text } from "@mdopeace/ui/Typography";

<Grid columns={{ base: 1, md: 2 }} gap={6}>
  <Surface as="article" tone="info" elevation="lg">
    <Stack gap={3}>
      <Heading level={3}>A clear title</Heading>
      <Text size="sm" tone="muted">Supporting content.</Text>
    </Stack>
  </Surface>
</Grid>
```

Layout components own gaps. Surface owns padding, border and box shadow. Heading level sets semantics independently from visual size. Colored surfaces pair backgrounds with suitable foregrounds, including muted text. Do not add descendant CSS to change a primitive's visual recipe.

Semantic `as` choices retain their native attributes and ref types. Render explicit `li` children in `ul`/`ol`. Use responsive token objects for layout properties, not raw CSS measurements. `className` and `style` remain escape hatches for exceptional layout and artwork integration.

## Actions, navigation and icons

```tsx
import { FaCopy } from "react-icons/fa6";
import { Button } from "@mdopeace/ui/Button";
import { Link } from "@mdopeace/ui/Link";

<Button variant="secondary" size="sm" startIcon={<FaCopy />} onClick={copy}>
  Copy
</Button>
<Link href="https://example.com" target="_blank" externalIndicator>
  Read more
</Link>
<Button iconOnly aria-label="Copy address" startIcon={<FaCopy />} onClick={copy} />
```

Buttons default to `type="button"`. Use native `disabled`; `loading` also prevents activation and marks the control busy. Native event handlers, data attributes and refs are passed through. Link stays an anchor and adds safe rel tokens when opening a new tab. Its `primary`, `secondary` and `ghost` variants share Button appearance. Icons use `react-icons`, inherit color, and are sized by the component. Decorative slots are hidden from assistive technology.

## Clipboard behavior

```tsx
"use client";
import { useClipboard } from "@mdopeace/ui/hooks/useClipboard";
import { Button } from "@mdopeace/ui/Button";

function CopyAddress({ address }: { address: string }) {
  const { copy, status } = useClipboard();
  return <>
    <Button loading={status === "copying"} onClick={() => void copy(address)}>
      {status === "success" ? "Copied!" : "Copy address"}
    </Button>
    <span role="status" aria-live="polite">
      {status === "error" ? "Could not copy. Select the address and copy manually." : ""}
    </span>
  </>;
}
```

There is no copy-specific visual primitive. The hook preserves exact strings, ignores stale request results, clears timers on unmount and leaves failures available until retry/reset. Successful feedback resets after 1400ms by default. CommandBlock supplies this composition for commands; app-specific actions can provide their own feedback copy.

## Switch and Dialog

```tsx
<Switch
  aria-label="Dark mode"
  checked={dark}
  onCheckedChange={setDark}
/>
<Dialog
  open={open}
  onOpenChange={setOpen}
  title="Support options"
  description="Choose the option that suits you."
  closeLabel="Close support options"
>
  {content}
</Dialog>
```

Import Switch and Dialog directly from their matching UI files inside a client component. Use controlled `checked`/`open` with change callbacks, or uncontrolled `defaultChecked`/`defaultOpen`, never both. Switch uses a native checkbox with switch semantics, keyboard operation, form attributes and an input ref. Keep its accessible label stable when toggled. The app ThemeToggle supplies theme persistence; Switch itself knows nothing about themes.

Dialog uses the browser's native modal behavior and accepts a dialog ref. Put its trigger outside the Dialog, with `aria-haspopup="dialog"` and matching `aria-controls`/`id` where appropriate. Close button, Escape and genuine backdrop gestures request closure. Focus and previous scroll state are restored after exit. State changes remain immediate with reduced motion.

## Content compositions

- Section: `title`, optional `description`, `size` and children. PortfolioSection adds numbered headings and hash tracking for this app.
- ExpandableText: string children, `lines`, required `expandLabel`/`collapseLabel`, optional controlled `open`/`onOpenChange` or `defaultOpen`. It measures overflow and animates the viewport without changing the copied/searchable text.
- CommandBlock: `code` string, optional `copyLabel`, `successMessage`, `errorMessage`; native div props.
- LinkGroup: explicit `items` with `href`, `label`, optional `startIcon`, `variant`, `size`, `target` and other Link props. `direction` and `gap` control arrangement; no icon is guessed from a label.
- Badge: inline status/tag appearance. Wrap it in a list item yourself when used in a list.
- Divider: decorative by default; use `decorative={false}` for separator semantics.

## Local validation

Open `/playground/` for the public interactive component library. It is included in the static export for GitHub Pages; `/components-preview` remains a development-only compatibility route.

Run `npm run test:ui`, `npm run lint`, `npm run build`, then `npm test`. The last command checks the exported page and external destinations and needs network access. Unit tests cover clipboard errors/concurrency/cleanup, native control attributes and refs, Switch behavior, dialog dismissal/focus/scroll restoration and theme persistence. Browser review must additionally cover responsive layouts, contrast, motion, keyboard operation and real overflow measurement; automated checks do not establish full WCAG conformance.

## Preserve the portfolio character

Shared recipes preserve the live portfolio’s tight display headings, uppercase chapter titles, small mono labels, warm paper, hard offset shadows and tinted panels. Use Heading sizes `card`, `label`, `feature`, `statement` and `dialog` for their corresponding visual hierarchy, independently of heading level. Text variants `eyebrow`, `callout` and `quote` own their type and accent rules. The `lg` text size increases from 16px to 18px at the small breakpoint.

Use `Surface variant="soft" tone="info"` for a blue tint, or a soft accent/subtle surface for yellow. Solid colored surfaces retain their paired foregrounds. `interactive` adds hover compression without making the card itself clickable. Badge `decoration="index"` and `decoration="stamp"` own their rotations; `stretch` fills the available line. Button/Link `emphasis` and Link `nav` reuse the shared action and navigation recipes.

The contact illustration retains asymmetric artwork padding through Surface’s native style escape hatch. Its dots and illustration placement remain business artwork; ordinary cards use the component padding scale.

## Browser checks and side-by-side comparison

Run `npm run build` and then `npm run test:e2e` to test the exported app in Chromium at desktop and mobile sizes in both themes. The tests cover tight hero typography, overflow, hash navigation, expandable descriptions, exact clipboard payloads, support dialog dismissal/focus, and theme persistence.

With the app running at port 3001, run `npm run compare:visual`. Override `LOCAL_URL` to compare a production preview instead. It captures every section of the live site and local app at matched desktop/mobile sizes in both themes, then writes a side-by-side HTML report and computed metrics under `test-results/visual-comparison/`. The theme switch and visible dark shadows are deliberate retained changes.

## Depth rules

Use the same hard shadow geometry in both themes: equal horizontal and vertical offsets with zero blur or spread. Size and color do not change depth.

| Category | Resting offset |
| --- | --- |
| Buttons and button-styled links, all sizes | 3px (`md`) |
| Cards, panels, hero, navigation bar, dialogs | 5px (`lg`) |
| Sections, layout containers, nested image frames, code blocks, badges | None |
| Ghost buttons and plain links | None in all states |

Raised controls move 1px down/right with a 2px shadow on hover; on press they move 3px down/right with no shadow. Interactive panels move 2px down/right with a 3px shadow on hover. Project panels stay stationary with a 5px shadow because the panels themselves are not actionable. Only their links and buttons provide interaction feedback. Keyboard focus adds an outline while preserving the current depth. Reduced motion disables movement. Game Boy artwork retains its own shading.

Surface keeps its explicit elevation escape hatch, but app compositions follow the category rules above; do not pick different resting shadows to compensate for a panel’s size or color.

Ghost controls use the theme canvas background and text color consistently across containers, with a subtle foreground tint over the canvas on hover and keyboard focus. They stay stationary and shadowless; disabled controls retain their resting background. No underline or additional icon is required by this variant.

Chapter-index badges support `size="sm"` (30px square, 11.2px number) and `size="md"` (40px square, 14px number). Portfolio section headings use `md`; both sizes stay vertically centered and use the theme border color.

Button and Link support `iconTone="inherit"` (default), `emphasis`, `muted`, or `success`. The tone applies to both icon slots without changing the label color. Choose a tone with sufficient contrast on the control background. The support heart uses `emphasis`, the same theme token as the brand background.

Game Boy controls use the same interaction geometry as shared buttons: 3px resting shadow, 1px hover movement with a 2px shadow, and 3px pressed movement with no shadow. Device-specific shapes, fills, labels and dark shadow color remain local artwork. The D-pad uses individual button shadows rather than an additional group shadow. Focus preserves depth, disabled controls do not move, and reduced motion suppresses movement.

Badge supports `shape="square"` for unrotated square labels: `sm` is 30px and `md` is 40px.

Tile (`@mdopeace/ui/Tile`) is a decorative framed square with an optional inset face. Sizes `sm`, `md`, and `lg` are 30px, 40px, and 48px. Use `faceColor`, `textColor`, and `frameColor` for custom palettes and `inset={false}` for a flat face. Children accept text, icons, or images; omit children for a light indicator. Native span attributes and refs are forwarded; wrap Tile in a link or button when it needs interaction. The Game Boy GB mark and indicator use small Tiles, sharing geometry and inset depth while keeping their own colors. The navbar brand retains its existing design.

## Completed component migrations

Contact artwork labels use Badge: an accent label with `tilt="left"` for Signal Ready and a default solid label for the caption. Their local CSS only positions them. Badge tilt is optional (`left`/`right`) and independent of shape and decoration.

Game Boy controls use Button, including icon-only directional controls with native accessible names. Shared Button owns focus, disabled state, icon slots and shadow/press feedback. The device integration stylesheet retains its palette, compact physical dimensions, D-pad grid placement and screen-button shine; it does not duplicate interaction rules. Local shadow and border tokens preserve dark edges against the yellow device in both themes.

Game text uses Text with body/mono font tokens, an `xs` size (11px), optional `leading="tight"` for counters, and semantic `as="strong"` for emphasized values. The board cells, speaker slots, LED and illustration shapes remain artwork rather than generic UI components.

## Motion feedback

Theme changes crossfade complete page snapshots with the browser View Transition API; browsers without it retain the neutral-surface color transition. Initial theme selection and reduced-motion mode apply immediately. Shared controls animate depth, background, and disabled opacity; focus outlines remain immediate.

FeedbackLabel overlays two reserved states and fades between them without changing control width. Clipboard actions use it for labels and icons, and Switch uses it for state icons. Inactive states stay out of accessible names. Installation commands are keyboard-focusable so horizontal scrolling remains available on compact layouts.

Game Boy overlays fade visibility without delaying game input; hidden overlays are inert. The indicator has a dedicated artwork palette independent of app color tokens: smoke (`#7d8178`) when off, lime (`#9bdc74`) while playing, and amber (`#f0ae55`) while paused. All three states and the dark frame (`#292d29`) stay fixed across themes, without a glow. A single square lens has a subtle inset edge for physical depth. Lens colors transition using shared motion tokens, and reduced-motion preferences suppress the effects.

The state meanings follow established indicator conventions: [Nintendo's Game Boy Advance manual](https://www.nintendo.com/eu/media/downloads/support_1/game_boy_advance_4/GBA_Manual_UK_DE_FR.pdf) uses green for normal power, and [Microsoft's progress states](https://learn.microsoft.com/en-us/dotnet/api/system.windows.shell.taskbaritemprogressstate) use green for normal progress and yellow for pause. The exact shades are device-specific design choices; game status text and overlays also communicate state.


## Playground building blocks

The public playground is built with the same components it documents. Its catalog navigation, property controls and code examples use shared components; the page frame, catalog data and property-panel compositions remain specific to the playground.

| Component | Contract |
| --- | --- |
| Field | Required `label`; optional `description`, `error`, `required`, `controlId`. Its render function supplies the control ID, help/error associations, invalid state and required attribute. |
| TextInput | Native input props, with `size="sm"`, `"md"` (default), or `"lg"` for 32/40/48px heights. |
| Select | Native select props and option children; the same size contract as TextInput. |
| Checkbox | Native checkbox props plus required `label`, optional `description` and `error`. Owns its label and help associations. |
| NavigationList | Required accessible `label` and grouped `items`; optional `activeId` and `onSelect`. Items with `href` remain native links; local selections use buttons. |
| CodeExample | Exact `code` string, optional `title`, `description`, `codeLabel`, `language` (`tsx` or `text`) and `border` (`standard` or `none`). Includes copy feedback and keyboard-scrollable source. |
| Navbar | Required `label`, optional `brand` and `actions` slots; shared surface, spacing and responsive layout. Sticky placement belongs to the app. |
| NavbarLinks | Required `items` (`id`, `label`, `href`); controlled `activeId`, optional `current`, `gap`, `justify` and `onSelect(id, event)`. Owns the sliding underline, text highlight and hover/focus previews. |
| Image | Required `src`, `alt`, and `width`/`height`, or `fill` in a sized parent. Supports `fit`, `radius`, a loading `placeholder`, `fallback`, and `errorLabel`. Frame classes/styles are separate from `imageClassName` and the native image ref/attributes. |

Import each component from its public subpath, such as `@mdopeace/ui/TextInput`. Field uses a render function so its accessible attributes reach the actual input rather than a wrapper:

```tsx
<Field label="Your name" description="How should we address you?" required>
  {(control) => <TextInput {...control} name="name" autoComplete="name" />}
</Field>
```

Use Checkbox directly, since it already owns its label. Native controlled and uncontrolled conventions apply to TextInput, Select and Checkbox; supply either a value/checked state with its change handler or a default value/checked state. Controls retain square borders and immediate focus outlines, with shared color and disabled-state transitions.

NavigationList uses grouped lists inside a labeled navigation landmark. Link items identify the current page; local buttons identify the current selection. Disabled items remain unavailable to activation.

NavbarLinks stays independent of routing and scrolling. The portfolio's SectionLinks
tracks the visible section and supplies `activeId` with `current="location"`;
other consumers can use page routes or controlled local state. Decorative highlight
labels never add keyboard stops or accessible links.

Image reserves its frame before loading, fades in decoded images, handles cached
loads, and resets when the source changes. Errors keep the same dimensions and
accessible name. `alt=""` keeps both image and fallback decorative. ProjectImage
and ProjectLogo are portfolio compositions: screenshot constraints, 32px logo
size, background and 8px logo radius live there. Contact artwork uses Image in
fill mode inside its existing artwork frames. These media recipes share loading
behavior without publishing portfolio assets as part of the UI package.

CodeExample highlights React/TSX examples with lightweight lexical coloring; it is not a general-purpose language parser or editor. Choose `language="text"` for plain source. Copy always uses the original code string, and markup is rendered as text. Keep the simpler CommandBlock for installation commands and other compact snippets.


## Distribution boundary

The generic source is in `packages/ui/src`, with compiled ESM, declarations and
CSS Modules in its ignored `dist` directory. React is a peer dependency. The
portfolio imports public package subpaths; generated snippets use those same
imports. Include `@mdopeace/ui/tokens.css` once in a consumer's global entry.
No Tailwind reset or portfolio CSS is needed for the components themselves.

`npm run test:package` packs and installs the actual archive into an isolated
React consumer, type-checks its imports, builds it with CSS Modules, and checks
keyboard controls, control heights, both themes and exact clipboard text.
Publication is separate from building or packing; see the package README and
license notice before sharing an archive.


The UI package is MIT-licensed with copyright attributed to Md Mostafijur Rahman.
The root repository license reserves rights in portfolio content and branding;
it explicitly excludes the MIT package from that reservation. Distribution must
include the package copyright and MIT license notice. The package's `private`
flag prevents accidental registry publishing; it is not a restriction on MIT reuse.
