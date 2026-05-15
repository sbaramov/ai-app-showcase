# Angular Material Theming Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate deep-research-frontend-ng from custom CSS colors to Angular Material's Deep Purple Amber dark theme for a professional, consistent UI.

**Architecture:** Convert theme.css and styles.css to SCSS, configure Angular Material v21 theming system with proper density and typography, remove hardcoded colors from components in favor of Material's CSS custom properties.

**Tech Stack:** Angular 21, Angular Material, SCSS, Deep Purple Amber theme (dark mode)

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/theme.scss` | Create (from theme.css) | Angular Material theme configuration with deeppurple-amber |
| `src/styles.scss` | Create (from styles.css) | Global styles using Material tokens |
| `src/styles.css` | Delete | Replaced by SCSS version |
| `src/theme.css` | Delete | Replaced by SCSS version |
| `angular.json` | Modify | Update style references to SCSS |
| `src/app/app.css` | Modify | Remove hardcoded colors, use Material surface |
| `src/app/components/search-box/search-box.component.css` | Modify | Remove background override |
| `src/app/components/report-display/report-display.component.css` | Modify | Remove mat-card override |
| `src/app/components/progress-indicator/progress-indicator.component.css` | Modify | Remove hardcoded background |

---

## Tasks

### Task 1: Create theme.scss with Deep Purple Amber Dark Theme

**Files:**
- Create: `src/theme.scss`
- Delete: `src/theme.css` (after creating theme.scss)

**Context:** Current theme.css uses SCSS syntax in a CSS file which won't work. Angular Material v21 uses the modern `define-theme` API.

- [ ] **Step 1: Create theme.scss with Material theming**

```scss
@use '@angular/material' as mat;

// Define Deep Purple Amber theme
$theme: mat.define-theme((
  color: (
    theme-type: dark,
    primary: mat.$deep-purple-palette,
    tertiary: mat.$amber-palette,
  ),
  density: (
    scale: -2, // Compact for research tool
  ),
  typography: (
    brand-family: 'Inter',
    plain-family: 'Inter',
  ),
));

// Apply theme to all Material components
:root {
  @include mat.all-component-themes($theme);
  @include mat.system-level-colors($theme);
  @include mat.system-level-typography($theme);
}

// Apply typography to body
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

// Ensure proper background inheritance
html {
  color-scheme: dark;
}
```

- [ ] **Step 2: Delete old theme.css**

```bash
cd /home/sbaramov/Development/personal/ai-app-showcase/deep-research-frontend-ng
rm src/theme.css
```

- [ ] **Step 3: Verify file created correctly**

Check that `src/theme.scss` exists and contains the code above.

- [ ] **Step 4: Commit**

```bash
git add src/theme.scss
git rm src/theme.css
git commit -m "feat(theming): add Angular Material theme.scss with Deep Purple Amber dark theme

- Create proper SCSS theme using Angular Material v21 API
- Configure Deep Purple primary, Amber tertiary
- Set compact density for research tool UI
- Use Inter font family matching existing design

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 2: Convert styles.css to SCSS with Material Tokens

**Files:**
- Create: `src/styles.scss`
- Delete: `src/styles.css` (after creating styles.scss)

**Context:** Current styles.css imports a prebuilt theme and sets hardcoded dark colors. We need to import our custom theme instead.

- [ ] **Step 1: Create styles.scss**

```scss
// Import our custom theme first
@import 'theme';

// Import font
@import '@fontsource/inter';

// Reset and base styles
html, body {
  height: 100%;
  margin: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
}

// App container uses Material surface
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--mat-sys-surface);
}
```

- [ ] **Step 2: Delete old styles.css**

```bash
cd /home/sbaramov/Development/personal/ai-app-showcase/deep-research-frontend-ng
rm src/styles.css
```

- [ ] **Step 3: Commit**

```bash
git add src/styles.scss
git rm src/styles.css
git commit -m "feat(theming): convert styles.css to SCSS with Material tokens

- Import custom theme.scss instead of prebuilt theme
- Use Material CSS variables for surface and text colors
- Remove hardcoded #1a1a1a and #e0e0e0 values
- Keep Inter font family

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 3: Update angular.json for SCSS

**Files:**
- Modify: `angular.json`

**Context:** angular.json currently references `src/styles.css` and has `styleLanguage: "css"`. Must update to SCSS.

- [ ] **Step 1: Update angular.json styles configuration**

Locate the `styles` array and `styleLanguage` in angular.json and update:

```json
{
  "projects": {
    "deep-research-frontend-ng": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}
```

Also find and update `styleLanguage` from `"css"` to `"scss"`.

- [ ] **Step 2: Verify angular.json changes**

Run: `cat angular.json | grep -A2 -B2 "styles\|styleLanguage"`

Expected: Shows `styles.scss` and `"styleLanguage": "scss"`

- [ ] **Step 3: Commit**

```bash
git add angular.json
git commit -m "build: update angular.json for SCSS support

- Change styles from styles.css to styles.scss
- Update styleLanguage from css to scss
- Enable full Angular Material SCSS theming

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 4: Clean Up app.css Component Styles

**Files:**
- Modify: `src/app/app.css`

**Context:** app.css has hardcoded colors that override Material. Remove these to let Material theme control colors.

- [ ] **Step 1: Update app.css**

Replace entire file content with:

```css
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  padding: 1rem 2rem;
  text-align: center;
  border-bottom: 1px solid var(--mat-sys-outline-variant);
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.app-header p {
  margin: 0;
  opacity: 0.7;
  font-size: 0.9rem;
}

.app-content {
  flex: 1;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
```

- [ ] **Step 2: Verify changes**

Run: `cat src/app/app.css`

Expected: No hardcoded colors (#1a1a1a, #e0e0e0, #909090, #333)

- [ ] **Step 3: Commit**

```bash
git add src/app/app.css
git commit -m "style(app): remove hardcoded colors from app component

- Use Material CSS variable for header border
- Remove background and color overrides
- Let Material theme control text colors
- Keep layout and spacing styles

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 5: Clean Up Search Box Component

**Files:**
- Modify: `src/app/components/search-box/search-box.component.css`

**Context:** search-box has hardcoded background color that clashes with Material theme.

- [ ] **Step 1: Update search-box.component.css**

Replace entire file content with:

```css
.search-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.search-field {
  width: 100%;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

button {
  min-width: 120px;
}
```

- [ ] **Step 2: Verify changes**

Run: `cat src/app/components/search-box/search-box.component.css`

Expected: No `background: #2d2d2d` or `box-shadow` hardcoded styles

- [ ] **Step 3: Commit**

```bash
git add src/app/components/search-box/search-box.component.css
git commit -m "style(search-box): remove hardcoded background from search component

- Remove #2d2d2d background override
- Remove hardcoded box-shadow
- Inherit surface color from Material theme
- Component will use mat-card or parent background

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 6: Clean Up Report Display Component

**Files:**
- Modify: `src/app/components/report-display/report-display.component.css`

**Context:** report-display overrides mat-card with hardcoded colors.

- [ ] **Step 1: Update report-display.component.css**

Replace entire file content with:

```css
.report-container {
  margin: 1rem 0;
}

.follow-up-section {
  margin-top: 1rem;
}

.follow-up-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.follow-up-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

mat-progress-bar {
  position: sticky;
  top: 0;
  z-index: 10;
}

.no-report {
  margin: 1rem 0;
}
```

- [ ] **Step 2: Verify changes**

Run: `cat src/app/components/report-display/report-display.component.css`

Expected: No `mat-card { background: #2d2d2d }` or `color: #e0e0e0`

- [ ] **Step 3: Commit**

```bash
git add src/app/components/report-display/report-display.component.css
git commit -m "style(report-display): remove mat-card color overrides

- Remove hardcoded #2d2d2d background from mat-card
- Remove color override that breaks theme
- Let Angular Material handle card theming
- Keep layout and chip styles

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 7: Clean Up Progress Indicator Component

**Files:**
- Modify: `src/app/components/progress-indicator/progress-indicator.component.css`

**Context:** progress-indicator has hardcoded background and box-shadow.

- [ ] **Step 1: Update progress-indicator.component.css**

Replace entire file content with:

```css
.progress-container {
  border-radius: 8px;
  margin: 1rem 0;
  padding: 1rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-header span {
  font-weight: 600;
}

mat-list {
  max-height: 300px;
  overflow-y: auto;
}
```

- [ ] **Step 2: Verify changes**

Run: `cat src/app/components/progress-indicator/progress-indicator.component.css`

Expected: No `background: #2d2d2d` or `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3)`

- [ ] **Step 3: Commit**

```bash
git add src/app/components/progress-indicator/progress-indicator.component.css
git commit -m "style(progress-indicator): remove hardcoded container styles

- Remove #2d2d2d background override
- Remove hardcoded box-shadow
- Keep layout and typography styles
- Container inherits theme surface color

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

### Task 8: Build Verification

**Files:**
- All modified files

**Context:** Verify the migration works by building the application.

- [ ] **Step 1: Install dependencies**

```bash
cd /home/sbaramov/Development/personal/ai-app-showcase/deep-research-frontend-ng
pnpm install
```

- [ ] **Step 2: Run Angular build**

```bash
cd /home/sbaramov/Development/personal/ai-app-showcase/deep-research-frontend-ng
ng build 2>&1 | head -100
```

Expected: Build completes successfully with no SCSS/CSS errors.

- [ ] **Step 3: Verify no theme-related warnings**

Search build output for warnings:
```bash
cd /home/sbaramov/Development/personal/ai-app-showcase/deep-research-frontend-ng
ng build 2>&1 | grep -i "warn\|error\|theme\|style" || echo "No warnings found"
```

Expected: No theme-related warnings or errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore(theming): complete Material theme migration

- All components now use Angular Material tokens
- Deep Purple Amber dark theme applied globally
- Build verified with no errors

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Convert theme.css → theme.scss with proper Material API
- ✅ Convert styles.css → styles.scss with Material tokens
- ✅ Update angular.json for SCSS
- ✅ Remove hardcoded colors from app.css
- ✅ Remove hardcoded colors from search-box
- ✅ Remove hardcoded colors from report-display
- ✅ Remove hardcoded colors from progress-indicator
- ✅ Build verification

**Placeholder scan:**
- All steps include exact code
- All steps include verification commands
- All steps include commit commands

**Type consistency:**
- File paths consistent throughout
- Material API usage matches v21

---

## Summary

This plan migrates the deep-research-frontend-ng from custom CSS to Angular Material's Deep Purple Amber dark theme. Each task is bite-sized (2-5 minutes) and includes verification steps. The result will be a professional, consistent UI that follows Material Design principles.

**Estimated total time:** 20-30 minutes
**Risk level:** Low (no logic changes, only styling)
