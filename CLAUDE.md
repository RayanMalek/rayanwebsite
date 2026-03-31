# CLAUDE.md — Frontend Website Rules

## Iteration Loop
Run this every session, in order:

1. **Invoke the `frontend-design` skill** before writing any frontend code.
2. Check `brand_assets/` for logos, colors, and style guides. Use them; do not invent brand values.
3. Write or update the main entry file ( the appropriate file for the stack in use — e.g. `App.jsx` for React)
4. Start the server in the background if not already running: `node serve.mjs`
5. Take a screenshot: `node screenshot.mjs http://localhost:3000`
6. Read the saved PNG from `./temporary screenshots/` using the Read tool.
7. Compare against the reference image (if provided) or evaluate design quality. Be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px". Check: spacing, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing.
8. Fix all mismatches. Repeat from step 5. Do a minimum of 2 full screenshot rounds.

**Viewport note:** `screenshot.mjs` is hardcoded to 1440x900 desktop. Verify mobile responsiveness via responsive Tailwind classes — the screenshot viewport cannot be changed.

---

## Commands

| Task | Command |
|------|---------|
| Start server (background) | `node serve.mjs` |
| Take screenshot | `node screenshot.mjs http://localhost:3000` |
| Screenshot with label | `node screenshot.mjs http://localhost:3000 label` |
| Fix Playwright if broken | `npm install && npx playwright install chromium` |

Screenshots save to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).

---

## Reference Images

- **If provided:** match layout, spacing, typography, and color exactly. Swap in placeholder content (`https://placehold.co/WIDTHxHEIGHT`). Do not improve or add to the design.
- **If not provided:** design from scratch using the Design System rules below.

---

## Output Defaults

- Single `index.html`, all styles inline
- Tailwind via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

---

## Design System

- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Derive all variants from a custom brand color.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Shadows:** No flat `shadow-md`. Use layered, color-tinted shadows at low opacity.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter.
- **Animations:** Only animate `transform` and `opacity`. Spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states.
- **Images:** Gradient overlay (`bg-gradient-to-t from-black/60`) plus color treatment layer with `mix-blend-multiply`.
- **Spacing:** Consistent spacing tokens — not random Tailwind steps.
- **Depth:** Three-layer system: base → elevated → floating.

---

## Hard Rules

- Never screenshot a `file:///` URL — always use localhost
- Never use `transition-all`
- Never use default Tailwind blue/indigo as primary color
- Never add sections, features, or content not in the reference
- Never stop after one screenshot pass — minimum 2 rounds
