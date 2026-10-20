# Md Mostafijur Rahman

Personal portfolio, built with Next.js and exported statically to GitHub Pages.

```sh
npm run dev    # local dev server
npm run build  # static export to out/
npm test       # checks the built page (run build first)
```

## Checking the card expand/collapse

The test suite reads static HTML, so the animation needs a manual browser check
after touching `components/MultiLineTruncate.tsx`:

1. Expand a card — height eases open, button reads "show less".
2. Collapse — it eases shut, the "…" returns, both cards end up equal height.
3. Expand, then narrow the window (~900px) — expanded text must not be cut off.
4. Repeat with reduced motion on (or `prefers-reduced-motion` emulated) —
   text snaps instead of animating, "…" appears immediately on collapse.
5. `npm run lint` — only the 2 known `no-img-element` warnings.
