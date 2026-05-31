---
name: accessible-ux-design
description: Provides best practices and guidelines for building responsive, visually premium, and highly accessible user interfaces (such as hover-only elements, transitions, pointer events, and ARIA triggers).
license: MIT
metadata:
  author: Copyright 2026 Google LLC
  version: '1.0'
---

# Accessible UX Design Guidelines

This local repository skill outlines styling and layout best practices used to create visually premium, smooth, and highly accessible user interfaces.

## Hover-Only Interactive Elements

When creating actions (like context menus, copy buttons, or delete triggers) that are hidden by default and fade in only when hovered:

1. **Avoid click blocking (Pointer Events)**:
   * When an element is hidden (`opacity: 0`), set `pointer-events: none !important`. This ensures it does not intercept user clicks or accidentally trigger tooltips when invisible.
   * When visible, restore it using `pointer-events: auto !important`.

2. **Transition Effects**:
   * Always provide a subtle, premium fade-in/out transition (`transition: opacity 0.2s ease-in-out !important`).

3. **Active/Open State Stability**:
   * Hover states are fragile: when a user clicks a button to open a context menu, their mouse naturally moves onto the dropdown menu. This loses the `:hover` state on the parent element, causing the button to disappear immediately—resulting in a jarring user experience.
   * **Guideline**: Ensure the button stays visible when its associated menu is active (e.g. using Angular Material's `aria-expanded="true"` selector) or when keyboard focus is active (`:focus-within`).

### CSS Blueprint

```css
/* Accessible Hover-Only Button Template */
.container .action-btn {
  opacity: 0 !important;
  pointer-events: none !important;
  transition: opacity 0.2s ease-in-out !important;
}

/* Maintain visibility under hover, focus-within, and when its menu is active */
.container:hover .action-btn,
.container:focus-within .action-btn,
.container .action-btn[aria-expanded="true"] {
  opacity: 1 !important;
  pointer-events: auto !important;
}
```
