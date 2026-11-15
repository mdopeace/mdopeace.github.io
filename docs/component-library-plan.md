# Component library specification

Status: initial library and app migration implemented. This document records the public contracts, design decisions and validation requirements. Preserve all original light and dark palette values and the comic character, use paired foregrounds on colored surfaces, and normalize repeated measurements intentionally rather than preserving every incidental value.

## 1. Architecture and ownership

Build in this direction:

**Design tokens → generic primitives → generic compositions → business components → page sections.**

- Tokens define the permitted visual values and theme mappings.
- Primitives own reusable appearance, semantics, and interaction contracts.
- Generic compositions combine primitives around a reusable content or interaction pattern.
- Business components supply portfolio-specific data, copy, and arrangement.
- Sections assemble business components and generic layout components.

Dependencies flow downward. The library must not import project data, portfolio sections, email addresses, provider names, or theme persistence code. A component can initially have one consumer when its responsibility is clearly generic, such as Dialog. Do not add unrelated controls speculatively.

### Styling ownership

| Concern | Owner |
| --- | --- |
| Theme colors, spacing scale, typography, borders, shadows, motion | Tokens |
| Width constraints and page gutters | Container |
| Space between siblings and responsive arrangement | Stack, Inline, Grid |
| Panel background, border, padding, radius, elevation | Surface |
| Button height, internal spacing, icon sizing, focus and hover | Button / button-styled Link |
| Text metrics and semantic color | Heading, Text |
| Content and which supported variants to choose | Business component |
| Illustration placement and game-specific geometry | Business component, using tokens where appropriate |

Primitives have no external margin by default. Prefer layout gaps over individual child margins. A business component must not redefine a primitive's padding, shadow, or font size through descendant selectors. Add a justified shared variant when a repeated requirement is missing.

## 2. Token contract

Token values are implemented once as CSS custom properties. Typed props reference token keys, never arbitrary numbers or CSS strings. Use rem for spacing and typography; use px for deliberate border/shadow geometry. Values below show pixel equivalents at a 16px root size.

### Spacing and responsive values

`Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 12 | 16 | 20`

| Key | Pixel equivalent |
| --- | --- |
| 0 / 1 / 2 / 3 | 0 / 4 / 8 / 12 |
| 4 / 5 / 6 / 7 | 16 / 20 / 24 / 28 |
| 8 / 10 / 12 | 32 / 40 / 48 |
| 16 / 20 | 64 / 80 |

The scale is a vocabulary, not a reason to use large spacing everywhere. Default to 8–12px between tightly related controls, 16px between related content, 24px panel padding on larger screens (16px on narrow screens), and 24–32px between panels. Reserve 48–80px for section boundaries. Keep related text closer together than unrelated groups. Start from these recipes and review the whole page at narrow, medium and wide widths so cards, controls and headings remain balanced. Do not apply large padding to both a panel and every nested wrapper.

Breakpoints: `base` (all widths), `sm` (40rem), `md` (48rem), `lg` (64rem). These are library layout breakpoints; specialized artwork can retain documented content-driven breakpoints.

Responsive props accept a scalar or `{ base: T; sm?: T; md?: T; lg?: T }`. Values inherit upward until overridden. Restrict responsive support to layout props and Surface padding in the first version. Generate complete CSS rules from token maps; do not construct runtime Tailwind class names.

### Color roles

| Role | Mapping policy |
| --- | --- |
| `canvas`, `surface`, `text`, `border` | Preserve the original light and dark values; semantic roles can share a color while keeping their API responsibilities separate |
| `muted`, `subtle` | Readable secondary text against each specific surface; not arbitrary opacity applied to inherited text |
| `accent`, `onAccent` | Paired yellow background and dark foreground in both themes |
| `info`, `onInfo` | Paired blue background and dark foreground in both themes |
| `emphasis`, `onEmphasis` | Light rust with light foreground; dark-mode soft coral with dark foreground |
| `success` | Theme-specific text/icon color; status also has a textual or icon cue |
| `shadow` | Matches the border color in both themes for visible offset depth |
| `focus` | Theme- and surface-aware focus treatment verified on every control tone |

Surface tones: `default`, `subtle`, `accent`, `info`, `emphasis`. Each tone defines background and foreground together, including muted foreground where needed. On yellow, blue and dark-mode coral surfaces, text and icons use the paired dark foreground, including headings, links, metadata and badges. Never inherit the page's light text onto those backgrounds. Soft accent and info backgrounds are named theme recipes, not percentages supplied at call sites.

The original dark palette is retained, with shadows changed to match borders following visual review of the showcase:

| Token | Approved original value |
| --- | --- |
| `canvas` | `#1b1b1b` |
| `surface` | `#2b2a26` |
| `text`, `border` | `#f6f0df` |
| `muted` | Original 90% ink mixture with transparency |
| `accent` / `onAccent` | `#f5cb56` / `#201f1b` |
| `info` / `onInfo` | `#79b9c5` / `#201f1b` |
| `emphasis` / `onEmphasis` | `#f08b6b` / `#1b1b1b` |
| `success` | `#a8d5a2` |
| `shadow` | `var(--ui-border)` → `#f6f0df` |

Preserve the original light palette as well, including its 72% muted ink mixture. Subtle surfaces use the existing 25% accent/surface mixture. The proposed softer dark palette was rejected; do not reintroduce it during component work. Verify contrast on the preserved colors and actual rendered backgrounds; foreground pairing and component semantics remain part of the library contract.

The app will expose only light and dark via a theme Switch. Remove the Auto option during app migration. With no saved preference, resolve the operating-system preference once before first paint, then persist explicit switch choices; do not continuously follow system changes. Treat a legacy `system` preference as unset. ThemeToggle owns this app policy, persistence, and browser theme-color synchronization; the generic Switch only knows checked/unchecked state. The underlying library provides light/dark theme mappings without a third visual mode.

### Typography

| Token | Initial size / line height | Use |
| --- | --- | --- |
| `xs` | 11px / 1.55 | Compact device labels |
| `caption` | 12px / 1.5 | Labels and metadata |
| `sm` | 14px / 1.7 | Supporting text |
| `md` | 16px / 1.7 | Body text |
| `body` | 15px / 1.7 | Panel prose |
| `lg` | 16px → 18px at sm / 1.75 | Introductions |
| `title` | 24px / 1.333333 | Role headings |
| `section` | clamp(1.8rem, 4vw, 2.7rem) / 1 | Section headings |
| `display` | clamp(3rem, 8vw, 6.5rem) / 0.86 | Hero heading |

Families: `body`, `mono`. Weights: `regular` (400), `medium` (500), `bold` (700), `black` (900). Tracking: `normal`, `tight`, `wide`; exact values belong to typography recipes. Heading level is independent of visual size. Shared eyebrow, badge and action recipes retain the original compact uppercase labels. Additional Heading recipes: card 20px/1.55 at weight 600; label 16px/1.55 uppercase; feature 24–30px/1.2; statement 32–57.6px/0.98; dialog 32–52px/0.95.

Use 14–16px for reading content; reserve 12px for short metadata. Display typography is for the hero only, not ordinary cards. Check heading wrapping, text zoom and panel proportions together rather than shrinking body text to fit a fixed card.

### Sizing, borders, elevation, and motion

| Category | Contract |
| --- | --- |
| Container max widths | `sm`: 40rem; `md`: 52rem; `lg`: 70rem (current page width) |
| Control size | Button/Link: `sm` 30px, `md` 44px, `lg` 48px minimum. Switch: 32/40/48px |
| Icon size | Button/Link: `sm` 13px, `md` 14.4px, `lg` 14px; Switch uses 16/20/24px |
| Border width | `none`: 0; `thin`: 1px; `standard`: 2px; `strong`: 3px |
| Radius | `none`: 0; `sm`: 4px; `md`: 8px; `full`: pill |
| Elevation / box shadow | `none`: `none`; `sm`: `2px 2px 0 var(--shadow-color)`; `md`: `3px 3px 0 var(--shadow-color)`; `lg`: `5px 5px 0 var(--shadow-color)`; `xl`: `8px 8px 0 var(--shadow-color)` |
| Layer order | `base`: 0; `raised`: 10; `sticky`: 20; `overlay`: 40; `announcement`: 50 |
| Duration | `fast`: 120ms; `normal`: 180ms; `slow`: 300ms |

`elevation` is the component prop that selects a CSS `box-shadow` recipe; there is no second shadow-depth prop. Layer order controls stacking independently. A native modal dialog uses the browser top layer. Components own hover/pressed elevation transitions; consumers do not set separate shadow strings. The comic theme defaults to square corners and standard borders. Focus uses a shared 3px outline with 2px offset, adapting its color or adding a contrasting halo on colored surfaces.

Shadows match the border color in both themes: dark ink in light mode and warm off-white in dark mode. This keeps the comic offset visible on dark backgrounds. Elevation changes the offset, not the color. Review depth on the actual canvas and nested surfaces; retain discernible borders and surface separation as well.

Controls grow when labels wrap, text is zoomed, or translations are longer. Icon-only controls use square dimensions from the control size. Default to medium controls; use small controls for compact secondary actions, and 48px controls where touch is the primary interaction. Target sizes and spacing must remain usable on touch screens.

### Motion for UI changes

Every visible state change gets an intentional transition recipe. This is not a requirement to animate invisible content or delay an action. Motion is owned by the affected component, not repeated in app event handlers.

| Change | Transition recipe |
| --- | --- |
| Button/link hover and press | `fast`: color, transform and box-shadow; subtle movement only |
| Expand/collapse | `slow`: measured height with optional opacity; content remains readable and focus stays valid |
| Theme change | `normal`: background, text, border and box-shadow colors across themed surfaces; no initial-load animation or global `transition: all` |
| Switch | `fast`: thumb translation and track color; checked semantics update immediately |
| Dialog show/hide | `normal`: backdrop/content opacity and a small translation; keep modality, focus and scroll locking correct through exit |
| Conditional status/show/hide | `fast`: opacity when suitable; no repeated screen-reader announcement from animation |

Use a shared ease-out curve for entering/moving and ease-in for exiting. Rapid toggles must interrupt or reverse safely; never leave stale heights, hidden focus targets or a locked page. Under `prefers-reduced-motion: reduce`, remove movement and size animation and apply state changes immediately. Contrast must remain sufficient during theme transitions; use a nonanimated change for foreground/background pairs whose intermediate colors fail. No continuously flashing or decorative looping transitions.

### Accessibility acceptance criteria

Target WCAG 2.2 Level AA for the resulting app and applicable library behavior. Component defaults help meet this target; app composition and content still require validation. Do not claim conformance from tokens or automated checks alone.

- Text contrast: at least 4.5:1 for normal text, or 3:1 for qualifying large text (18pt regular or 14pt bold). Test actual composed backgrounds, including muted text and colored panels. See [W3C text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Essential control boundaries, meaningful icons, focus and state indicators: at least 3:1 against adjacent colors where required. Decorative shadows are not the accessibility boundary. See [W3C non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- Pointer targets: meet the 24×24 CSS pixel minimum or a documented applicable exception; prefer the library's 32/40/48px control sizes and generous touch targets. See [W3C target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum).
- Full keyboard operation, logical focus order, visible focus that is not hidden behind sticky content, and no keyboard trap outside an intentionally modal dialog.
- Correct accessible names, roles and states. Do not convey state only through color, animation or icons. Status messages use appropriate live regions without unnecessarily moving focus.
- Support 200% text resize and reflow at a 320 CSS pixel viewport without losing content or functionality; confine necessary horizontal scrolling to content such as code blocks or the game. Verify text-spacing overrides do not clip controls or labels.
- Validate reduced motion, zoom/reflow, keyboard use and screen-reader behavior manually alongside automated accessibility checks. Follow [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and the relevant [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) patterns.

## 3. Common component API rules

- Use the existing `react-icons` dependency for interface icons. Prefer the app's existing `react-icons/fa6` family for visual consistency, with named imports from that family. Do not introduce a second icon library, emoji substitutes or handwritten SVG for standard interface icons; custom illustrations and game artwork remain separate.
- Icon slots accept React nodes so consumers can pass `react-icons` elements without coupling generic components to particular glyphs. Components own slot dimensions through the shared icon-size tokens; icons inherit the surrounding foreground via `currentColor`. Hide decorative slot icons from assistive technology; icon-only actions require an accessible name on the control. A standalone meaningful icon needs an accessible text alternative.
- Extend the native props of the rendered element, including `id`, `title`, `aria-*`, `data-*`, events, `className`, `style`, and its correctly typed ref. Consume library props rather than leaking them onto the DOM.
- Use React 19 ref props. Do not introduce `forwardRef` wrappers for new components.
- Resolve native prop collisions explicitly with TypeScript `Omit`; do not silently change a native attribute's meaning.
- Use `children` for ordinary content, `startIcon` / `endIcon` for decorative icon slots, and `description` only when the component has a structured description region.
- Use `size` for discrete component size, `variant` for appearance, `tone` for semantic color, and `elevation` for shadow depth. Allowed values are component-specific subsets of shared token types.
- Do not expose every token category on every component. Button owns its padding and elevation through size and variant recipes; Surface exposes those choices directly.
- Use native `disabled`, `onClick`, `href`, and `target`. Use `open`, `defaultOpen`, `onOpenChange` for disclosure state; `value`, `defaultValue`, `onValueChange` for selection state.
- Boolean Switch state uses `checked`, `defaultChecked`, `onCheckedChange`; preserve native input `onChange` as well. Apply the accessibility criteria above to every component contract, including ref/focus behavior and motion.
- Controlled components use the supplied value as the source of truth; uncontrolled components initialize from the default prop. Do not allow both controlled and default props together. Call change callbacks for user requests, not initial render.
- Public types and named exports are documented. Restrict `as` to semantic layout tags; do not create a universal polymorphic component.
- `className` and `style` are escape hatches for exceptional integration, not the normal design API. Repeated visual overrides must become tokens or variants. Document exceptions during migration.
- No project names, specific URLs, label-to-icon guessing, or section-specific CSS selectors in library components.

## 4. Generic primitives

Defaults are part of the API. Layout alignment uses `start | center | end | stretch`; justification uses `start | center | end | between`. Button and Link share one appearance recipe.

| Component | Initial public contract and defaults |
| --- | --- |
| Container | `size="lg"`; responsive `paddingInline={{ base: 3, sm: 4 }}`; centers itself and caps content width, excluding gutters; native div props |
| Stack | Responsive `gap={4}`, `align="stretch"`, `justify="start"`; vertical flex; `as="div"` with restricted `div/section/article/nav/ul/ol` semantics |
| Inline | Responsive `gap={3}`, `align="center"`, `justify="start"`, `wrap=true`; horizontal flex; same restricted semantic tags |
| Grid | Responsive `columns={1}` (1–4 equal columns), `gap={4}`, `align="stretch"`; `as="div"` (`div/ul/ol`) with corresponding native props; specialized unequal layouts remain business CSS initially |
| Surface | `tone="default"`, responsive `padding={{ base: 4, sm: 6 }}`, `elevation="lg"`, `radius="none"`, `border="standard"`; `as="div"` or `article/section/li/header`; `variant="solid"` (`solid/soft`), `interactive=false`; optional hover compression respects reduced motion |
| Heading | Required `level={1..6}`; `size="title"` (`title/section/display/card/label/feature/statement/dialog`), `tone="default"` (`default/muted/emphasis`); native heading props |
| Text | `as="p"` (`p/span/strong`), `size="md"` (`xs/caption/sm/body/md/lg`), `weight="regular"`, `tone="default"` (`default/muted/subtle/emphasis/success`), `align="start"`, `font="body"`, `variant="body"` (`body/eyebrow/callout/quote`); native props for selected tag |
| Button | `variant="primary"` (`primary/secondary/ghost/emphasis`), `size="md"`, `iconOnly=false`, `loading=false`, `startIcon`, `endIcon`; native button props; default `type="button"` |
| Link | Required `href`; `variant="text"` (`text/nav/primary/secondary/ghost/emphasis`), `size="md"`, `startIcon`, `endIcon`, `externalIndicator=false`; native anchor props; button variants use Button recipes |
| Badge | `variant="outline"` (`outline/solid`), `tone="default"` (`default/accent/info/emphasis/success`), `size="sm"` (`sm/md`), `decoration="none"` (`none/index/stamp`), `stretch=false`; native span props; never inserts a list item |
| Divider | `orientation="horizontal"`, `variant="solid"` (`solid/dashed`), `decorative=true`; shared standard border; nondecorative separators expose orientation semantics |
| Dialog | Controlled/uncontrolled open contract; required `title`, optional `description`; `size="sm"` (`sm/md/lg`), required accessible `closeLabel`; native dialog props except owned lifecycle/label attributes; content via children |
| Switch | Boolean `checked` or `defaultChecked=false`, `onCheckedChange(checked)`, `size="md"` (`sm/md/lg`); native checkbox input props except owned `type/size`; required accessible label via `aria-label` or `aria-labelledby`; native disabled, form name/value and ref support; optional `checkedIcon` / `uncheckedIcon` React nodes |

Additional behavior contracts:

- Button: icon-only use requires `aria-label` or `aria-labelledby`. Loading prevents repeat activation, preserves the label/layout, sets `aria-busy`, and uses native disabled behavior. Decorative icons are hidden from accessibility APIs. There is no copy-specific Button variant.
- Link: preserve anchor behavior for hash links, mail links, and external URLs. Do not automatically open external URLs in a new tab. When `target="_blank"`, merge `noopener noreferrer` with caller-supplied rel tokens. Link has no fake disabled or loading state.
- Surface: does not make a whole card clickable or create nested interactive elements. An actionable card uses an explicit Link or Button.
- Dialog: render a native dialog with shared Surface styling. Associate title/description IDs, focus suitable content, support Escape and genuine backdrop clicks, restore trigger focus, and restore previous scroll state on close/unmount. A content click must never dismiss it. Notify `onOpenChange` for dismissal requests. Keep the trigger outside the primitive so business components choose its label and appearance.
- Semantic layout props must preserve correct ref and native attribute typing. List item markup remains explicit. Decorative badges and separators must not replace semantic headings or lists.
- Switch: native `input type="checkbox" role="switch"` with an associated visual track/thumb; native checked state exposes on/off. Tab focuses it and Space toggles it. Keep the accessible label stable (for example, "Dark mode") when checked changes; show state through thumb position and optional sun/moon icons as well as color. Disabled prevents activation. `onCheckedChange` reports the next boolean on user change; native `onChange` also receives its event once. Follow the [W3C Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/). It must remain usable with motion disabled or colors overridden.

## 5. Generic compositions and behavior

| Item | Built from | Public responsibility |
| --- | --- | --- |
| Section | Stack, Heading, optional Divider | `title`, optional `description`, `size="md"` (`sm/md/lg`), children and native section props; optional `heading` slot for a composed semantic heading; sizes map to vertical padding 12/16/20, with md increasing to 20 at sm; header/content gap 8 |
| CodeBlock | Surface, native pre/code, Button | `code: string`, optional `copyLabel` and localized copy feedback; preserve whitespace and exact copied bytes; horizontal overflow inside block |
| ExpandableText | Text, Button | `children: string`, `lines=3`, required `expandLabel` and `collapseLabel`, controlled/uncontrolled open contract; only offer expansion when clipped |
| LinkGroup | Inline or Stack, Link | `items` with `href`, `label`, optional explicit icon/target/rel; `direction="horizontal"`, responsive `gap={3}`; proper list markup |
| useClipboard | Browser behavior only | `copy(value): Promise<boolean>`, `status: idle/copying/success/error`, `error: Error \| null`, `reset()`; configurable feedback reset delay default 1400ms; cleanup timers and ignore stale request results |

Clipboard business actions use Button + useClipboard + a polite status region. Failures provide actionable text; never claim that pressing a keyboard shortcut will copy text unless selection is actually prepared. Feedback copy is supplied by the consumer. Persistent error text can remain until retry/reset.

Section has no portfolio chapter number or scroll/hash side effects. PortfolioSection composes it with Badge and Divider and owns chapter metadata and hash synchronization. Switch knows nothing about themes; ThemeToggle maps checked to dark and unchecked to light and supplies the stable accessible label. A SegmentedControl is deferred until a real multi-option consumer exists.

## 6. Business components and existing migration targets

| Current area | Composition after migration |
| --- | --- |
| [SiteHeader](../components/SiteHeader.tsx) | Container + Inline + Link + ThemeToggle |
| [Hero](../components/sections/Hero.tsx) | Surface + Grid + Stack + Heading + Text + Badge + Links; specialized hero artwork remains local |
| [Story](../components/sections/Story.tsx) | PortfolioSection + semantic list + Grid + StoryStep (Surface, Badge, Text) |
| [ProjectCard](../components/portfolio/ProjectCard.tsx) | Surface + business layout + Heading + Badge + Text + ExpandableText + CodeBlock + LinkGroup |
| [DayJob](../components/sections/DayJob.tsx) | PortfolioSection + Grid + ExperienceCard and ToolkitPanel built from Surface, Stack, Heading, Text, Divider |
| [Now](../components/sections/Now.tsx) | PortfolioSection + Grid + business progress/announcement panels |
| [Contact](../components/sections/Contact.tsx) | PortfolioSection + Grid + contact copy/actions, LinkGroup, and local artwork |
| [SupportDialog](../components/portfolio/SupportDialog.tsx) | Business trigger Button + Dialog + support provider Links assembled with Surface/Inline/Text |
| [ThemeToggle](../components/ThemeToggle.tsx) | Switch + app light/dark persistence and theme-color synchronization; remove Auto and continuous system tracking during migration |
| [TetrisGameboy](../components/hero/TetrisGameboy.tsx) | Game engine/input behavior remains local; adopt Button/Text where appropriate without forcing device geometry into generic layouts |

The former section wrapper is now [PortfolioSection](../components/portfolio/PortfolioSection.tsx). Project tags use [Badge](../packages/ui/src/Badge.tsx) with explicit list items; project/social links use [LinkGroup](../packages/ui/src/LinkGroup.tsx). The former copy buttons and truncation wrapper have been replaced by [useClipboard](../packages/ui/src/hooks/useClipboard.ts), [EmailAction](../components/portfolio/EmailAction.tsx), [CodeBlock](../packages/ui/src/CodeBlock.tsx) and [ExpandableText](../packages/ui/src/ExpandableText.tsx). The superseded files and unused visual recipes were removed.

Use framework image handling directly for now. Images have different intrinsic/layout requirements; create a generic media frame only when a shared frame behavior is established. Illustrations, stamps, halftones, and game sprites may retain local CSS.

## 7. Proposed organization and runtime boundaries

```text
packages/ui/src/          Generic primitives and generic compositions
components/portfolio/   Business components shared within this portfolio
components/sections/    Page sections
components/hero/        Game and hero-specific artwork
hooks/                  Reusable browser behavior, including useClipboard
styles/                 Tokens, theme mappings, component recipes
docs/                   Specification and component usage guidance
```

These locations now contain the implementation. Use direct imports so a client component does not inadvertently pull unrelated library modules into its dependency graph.

Keep static primitives usable in Server Components. Introduce client boundaries for Dialog, Switch, ExpandableText and clipboard consumers. Event callbacks and browser refs originate within a client boundary. Do not pass nonserializable functions across server-to-client boundaries. Keep the existing static export working.

## 8. Implementation sequence and completion gates

1. **Tokens and API foundation:** implement token types, CSS theme variables, responsive mapping and shared conventions. Preserve both original palettes and validate their foreground pairs, borders and depth in the showcase. Map old values to the new scale and document intentional visible changes.
2. **First primitives and showcase:** Container, Stack, Inline, Grid, Surface, Heading, Text, Button and Link. Create a local component showcase using those components, with light/dark examples, size/variant matrices and keyboard states. Keep the development showcase out of the production export.
3. **Remaining primitives:** Badge, Divider, Dialog and Switch, with accessibility, animation and state examples in the showcase.
4. **Reusable compositions:** Section, CodeBlock, ExpandableText, LinkGroup and useClipboard. Add them when their primitives exist; clipboard copying remains Button composition.
5. **Business migration:** migrate one section at a time, beginning with Story as a small vertical slice, then Projects, Experience, Now, Contact/support, Header/theme and Hero/game. Remove obsolete components and styles after their final consumer moves.
6. **App consistency pass:** inspect spacing, typography, elevation, responsive layouts, themes and interaction together. Resolve repeated overrides through the public API.

For each implemented building block:

- Document props, defaults, supported variants, native element semantics, examples and ownership of styling.
- Demonstrate narrow/medium/wide layouts, long content, both light/dark themes and relevant interactive states. Review spacing, control size and heading proportions together. At app theme migration, verify initial preference resolution, saved light/dark choices and migration from legacy Auto without a flash.
- Measure text and non-text contrast across tones and interactive states; manually review dark-mode comfort and depth on actual surfaces. Preserve both approved palettes.
- Verify the WCAG 2.2 AA criteria above, including keyboard access, visible/unobscured focus, accessible names, disabled/loading behavior, text resize, reflow and target sizes. Check transition interruption, exit behavior and reduced motion.
- Test meaningful stateful behavior such as clipboard failure/timer cleanup, dialog dismissal/focus restoration and controlled/uncontrolled Switch changes. Avoid tests that merely repeat class mappings.
- Run lint and build for implementation changes. After migrations affecting shipped markup, run the existing built-output tests and check the affected UI. Distinguish external-network failures from component regressions.

Planning is complete when token scales, initial APIs, ownership rules and implementation order are concrete enough to implement. Component work is complete when the app uses the primitives without repeated visual overrides and the relevant behavior checks pass. No board or issues are created as part of this specification.


## 9. Implementation notes

- The interactive component library is public at `/playground/` and included in the static export. `/components-preview` remains a development-only alias for earlier review links.
- Shared visual recipes live in the UI CSS Module; tokens live in `packages/ui/styles/tokens.css`. The Tailwind Turbopack loader applies only to `globals.css`, preserving native CSS Module class exports.
- Responsive layout props reset unused breakpoint variables locally so nested components cannot inherit an ancestor's responsive overrides accidentally.
- Dialog exit animation retains native modality and scroll locking until the visual exit completes. Reopening interrupts that exit. Native cancellation and an Escape-key handler both request controlled state changes.
- Game controls use shared Button with local device geometry as the documented specialized-artwork exception. Their directional icons use `react-icons/fa6`; the device uses a dark foreground on its yellow shell in both themes.
- Library behavior tests run with `npm run test:ui`; the existing static-export tests continue to run with `npm test` after a production build. See [usage examples](component-library-usage.md).

The agreed app depth policy is defined in [Depth rules](component-library-usage.md#depth-rules): 3px controls, 5px panels, flat nested content, consistent across sizes and themes. This supersedes the earlier per-composition shadow choices.

Game Boy controls now use shared Button with a device-specific geometry/palette stylesheet; device text uses Text. Contact artwork labels use Badge. See [completed migrations](component-library-usage.md#completed-component-migrations).
