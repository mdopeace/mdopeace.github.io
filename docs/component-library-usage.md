# Using the component library

Import components directly from [components/ui](../components/ui/). The [specification](component-library-plan.md) contains the complete prop tables, defaults, token scales and accessibility requirements. Exported prop types live beside each component. No package publishing is required to use the library in this app.

## Layout and surfaces

```tsx
import { Grid, Stack } from "@/components/ui/Layout";
import { Surface } from "@/components/ui/Surface";
import { Heading, Text } from "@/components/ui/Typography";

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
import { Button } from "@/components/ui/Button";
import { Link } from "@/components/ui/Link";

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
import { useClipboard } from "@/hooks/useClipboard";
import { Button } from "@/components/ui/Button";

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

There is no copy-specific visual primitive. The hook preserves exact strings, ignores stale request results, clears timers on unmount and leaves failures available until retry/reset. Successful feedback resets after 1400ms by default. CodeBlock supplies this composition for commands; app-specific actions can provide their own feedback copy.

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
- CodeBlock: `code` string, optional `copyLabel`, `successMessage`, `errorMessage`; native div props.
- LinkGroup: explicit `items` with `href`, `label`, optional `startIcon`, `variant`, `size`, `target` and other Link props. `direction` and `gap` control arrangement; no icon is guessed from a label.
- Badge: inline status/tag appearance. Wrap it in a list item yourself when used in a list.
- Divider: decorative by default; use `decorative={false}` for separator semantics.

## Local validation

Run `npm run dev` and open `/components-preview` for the development-only showcase. The production build must not contain that route.

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

Badge supports `shape="square"` for unrotated square labels: `sm` is 30px and `md` is 40px. The Game Boy GB brand uses a solid emphasis square Badge in `sm`, including compact layouts; its device context retains the dark border on the yellow shell.

## Completed component migrations

Contact artwork labels use Badge: an accent label with `tilt="left"` for Signal Ready and a default solid label for the caption. Their local CSS only positions them. Badge tilt is optional (`left`/`right`) and independent of shape and decoration.

Game Boy controls use Button, including icon-only directional controls with native accessible names. Shared Button owns focus, disabled state, icon slots and shadow/press feedback. The device integration stylesheet retains its palette, compact physical dimensions, D-pad grid placement and screen-button shine; it does not duplicate interaction rules. Local shadow and border tokens preserve dark edges against the yellow device in both themes.

Game text uses Text with body/mono font tokens, an `xs` size (11px), optional `leading="tight"` for counters, and semantic `as="strong"` for emphasized values. The board cells, speaker slots, LED and illustration shapes remain artwork rather than generic UI components.
