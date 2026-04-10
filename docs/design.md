# Design System Document: The Kinetic Edge

## 1. Overview & Creative North Star

**Creative North Star: "The High-Performance Engine"**

This design system is built to mirror the intensity, precision, and raw energy of an elite football academy. We are moving away from the static, "admin-panel" feel of traditional SaaS. Instead, we treat the dashboard as a high-performance heads-up display (HUD).

The aesthetic breaks the traditional "corporate grid" through **Kinetic Layering**. By using intentional asymmetry—such as oversized display typography overlapping container edges and high-contrast color pops—we create a sense of forward motion. We prioritize "Glanceable Data": using the vibrant Lime and Cyan palette to highlight growth and kinetic energy, ensuring the athlete's progress is felt, not just read.

---

## 2. Colors & Surface Architecture

The palette is rooted in a deep, "Abyssal Black" to provide maximum contrast for our neon accents.

- **Background:** `#0e0e0e` (Surface / Surface-Dim)
- **Primary Accent:** `#bcf521` (Lime Green) – Used for success, growth, and active states.
- **Secondary Accent:** `#00f4fe` (Cyan) – Used for supplemental metrics and interactive depth.
- **Surface Container Tiers:**
- **Lowest:** `#000000` (In-set areas, deep backgrounds)
- **Low:** `#131313` (Main dashboard background)
- **High:** `#201f1f` (Standard card surfaces)
- **Highest:** `#262626` (Hover states and elevated overlays)

### The "No-Line" Rule

Traditional 1px borders are strictly prohibited for sectioning. We define space through **Tonal Shifts**. To separate a sidebar from a main feed, use a shift from `surface-container-low` to `surface`. Boundaries should feel organic, not structural.

### The "Glass & Gradient" Rule

To inject "soul" into the UI, primary CTAs must use a linear gradient: `primary` (#bcf521) to `secondary` (#00f4fe) at a 135-degree angle. Floating headers or navigation bars should utilize **Glassmorphism**: `surface-container-high` at 70% opacity with a `20px` backdrop-blur to maintain depth while scrolling.

---

## 3. Typography: Editorial Authority

We use a dual-font strategy to balance aggressive branding with functional readability.

- **Display & Headlines (Lexend):** This is our "Editorial" voice. Use `display-lg` (3.5rem) for hero metrics (e.g., Win %) and `headline-md` (1.75rem) for section titles. These should feel bold and unapologetic.
- **Body & Labels (Inter):** Our "Functional" voice. `body-md` (0.875rem) handles the heavy lifting for data descriptions.
- **The Power Scale:** Use `label-sm` (0.6875rem) in uppercase with 0.05em letter spacing for "Meta-data" (e.g., "LAST SESSION" or "PLAYER SCOUTING") to create a professional, technical feel.

---

## 4. Elevation & Depth: Tonal Layering

We do not use shadows to represent "Shadows"; we use light to represent "Proximity."

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-highest` card (#262626) should sit on a `surface-container-low` (#131313) canvas. This creates a natural "lift" without the clutter of drop shadows.
- **Ambient Shadows:** If an element must float (like a modal or dropdown), use a highly diffused shadow: `0px 24px 48px rgba(0, 0, 0, 0.5)`. Never use harsh, dark shadows; they kill the "deep black" aesthetic.
- **The "Ghost Border" Fallback:** For interactive elements like input fields, use the `outline-variant` token (#494847) at **15% opacity**. This creates a suggestion of a container that feels high-end and subtle.

---

## 5. Components

### Cards & Data Modules

- **Style:** Corner radius is fixed at `xl` (1.5rem / 24px) for main containers to feel modern.
- **Constraint:** No divider lines. Separate content using the `spacing-6` (2rem) scale.
- **Signature Element:** Each card should feature a subtle 2px "Top Glow" (a gradient stroke on the top edge only) using the `primary` token to lead the eye.

### Buttons

- **Primary:** High-impact gradient (Lime to Cyan). Text color is `on-primary` (#425900). No border.
- **Secondary:** `surface-container-highest` background with a `primary` text color.
- **Tertiary:** Ghost style. No background, `on-surface-variant` text, shifting to `primary` on hover.

### Inputs & Fields

- **Background:** `surface-container-low`.
- **Focus State:** The "Ghost Border" becomes 100% opaque `primary` (#bcf521).
- **Typography:** Use `body-md`.

### Performance Chips

- **Action Chips:** Use `secondary-container` (#00696e) with `secondary` text.
- **Status Chips:** Use `primary-container` (#afe700) for "Active" and `error-container` (#b92902) for "Alerts."

### Unique Component: The "Pulse Monitor"

A custom sparkline component used in player profiles. It uses a `secondary` to `primary` gradient stroke and a subtle `surface-tint` glow underneath the line to visualize momentum.

---

## 6. Do's and Don'ts

### Do:

- **Do** use asymmetrical layouts (e.g., a large metric on the left, three small data points stacked on the right).
- **Do** leverage the `spacing-16` and `spacing-20` values to give hero elements "room to breathe."
- **Do** use the `primary` (#bcf521) color sparingly for "Success" and "Action"—too much kills its impact.

### Don't:

- **Don't** use 1px solid white or grey borders. They look "Bootstrap" and cheap.
- **Don't** use standard tables. If data must be tabular, remove all vertical/horizontal lines and use alternating `surface-container` background shifts.
- **Don't** use pure white (#ffffff) for long-form body text; use `on-surface-variant` (#adaaaa) to reduce eye strain on the dark background.
