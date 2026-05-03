# Design: Markdown & Follow-Up Questions Rendering

**Date:** 2026-05-03  
**Module:** `deep-research-frontend-ng`  
**Issue:** Properly render `ResearchReport` response from backend

---

## Background

The `deep-research-embabel-backend` service returns a `ResearchReport` with three fields:

- `shortSummary`: 2-3 sentence summary
- `markdownReport`: Full report in markdown format
- `followUpQuestions`: Optional list of suggested follow-up research topics

The current frontend displays markdown as plain text and completely ignores follow-up questions.

---

## Requirements

### User-Facing Functionality

1. **Proper Markdown Rendering**
   - Summary and full report should render with markdown formatting (headings, lists, code blocks, etc.)
   - Summary should appear as an introductory paragraph at the top of the report content
   - Fallback to plain text if markdown rendering fails

2. **Follow-Up Questions**
   - Display follow-up questions as clickable chips/buttons at the bottom of the report
   - Each chip should be clearly styled and distinguishable from other UI elements
   - Clicking a chip triggers a new search with that question automatically

3. **Visual Feedback**
   - Loading state shown during search
   - Highlight clicked chips or show loading indicator
   - Hide follow-up section when `followUpQuestions` is null or empty

### Technical Constraints

- Use Angular framework (v21+)
- Use `ngx-markdown` library for markdown rendering integration
- Follow existing Angular patterns in the `deep-research-frontend-ng` project
- Preserve existing error handling patterns (if any)

---

## Architecture

### Component Structure

```plaintext
deep-research-frontend-ng/src/app/
├── report/
│   ├── report.component.ts          # Main container component
│   ├── report.component.html        # Template with summary + report + follow-ups
│   └── report.component.scss      # Styles for chips and markdown rendering
├── shared/
│   └── loading/
│       └── loading-indicator.component.ts  # Reusable loading UI
```

### Data Flow

1. User triggers search → `SearchService.search(query)` called
2. Backend returns `ResearchReport` JSON
3. `ReportComponent` receives data and renders:
   - Summary as initial paragraph (merged into report content)
   - Full markdown report via `ngx-markdown` component/directive
   - Follow-up questions rendered as chips if present
4. User clicks follow-up chip → triggers new search with that question

---

## Component Details

### `ReportComponent`

**Inputs:**
- `report: ResearchReport` - the report data from backend

**Template Structure:**
```html
<div class="report-container">
  <!-- Report content with markdown rendering -->
  <markdown [data]="reportContent">
    <!-- summary integrated at top of markdown content -->
  </markdown>

  <!-- Follow-up questions chips -->
  <div *ngIf="report.followUpQuestions && report.followUpQuestions.length > 0" 
       class="follow-up-section">
    <span class="follow-up-label">Follow up with:</span>
    <mat-chip *ngFor="let question of followUpQuestions" 
              (click)="onQuestionSelected(question)">
      {{ question }}
    </mat-chip>
  </div>

  <!-- Loading indicator (shown during search) -->
  <app-loading-indicator *ngIf="isLoading"></app-loading-indicator>
</div>
```

**Key Methods:**
- `onQuestionSelected(question: string)`: Called when user clicks a follow-up question, triggers new search

### Markdown Rendering

- Use `ngx-markdown` component or directive
- Integrate with Angular's `HttpClient` for markdown content
- Render summary + full report as single markdown block (summary prepended to report)

---

## Testing Strategy

### Unit Tests
- Verify markdown rendering with various markdown elements (headings, lists, code blocks)
- Test empty follow-up questions case (section should be hidden)
- Test single follow-up question rendering
- Test click handler triggers search with correct question

### Integration Tests
- End-to-end flow: search → receive report → verify markdown renders → verify follow-up chips display → click chip → verify new search triggered

### Visual Tests
- Markdown renders with proper formatting in browser
- Chips are visually distinct and clickable
- Loading state appears during search

---

## Success Criteria

1. Markdown content renders with all formatting (headings, lists, code blocks, emphasis)
2. Follow-up questions display as a section of clickable chips at the bottom
3. Clicking a follow-up question triggers a new search automatically
4. When no follow-up questions exist, the section is not displayed
5. Rendering failsafe: plain text fallback if markdown fails

---

## Implementation Notes

- Follow existing patterns in `deep-research-frontend-ng` for search flow
- Use Angular Material components (`mat-chip`) for consistency
- Consider adding animation/transitions for smooth UX when chips appear
- Ensure responsive design: chips should wrap on narrow screens
