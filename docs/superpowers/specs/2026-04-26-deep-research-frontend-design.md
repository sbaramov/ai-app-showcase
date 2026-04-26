# Deep Research Frontend - Design Spec

**Date:** 2026-04-26  
**Project:** deep-research-frontend-ng  
**Backend:** deep-research-embabel-backend (WebSocket/STOMP)

---

## Architecture Overview

A Angular Material-based frontend for the deep research WebSocket API. Uses a service-oriented architecture with clear separation of concerns.

---

## Component Structure

```
app/
├── services/
│   ├── research.service.ts      # WebSocket/STOMP communication
│   └── report.service.ts        # Report formatting/display logic
├── components/
│   ├── search/
│   │   ├── search-box.component.ts/html/css
│   │   └── search-box.component.spec.ts
│   ├── progress/
│   │   ├── progress-indicator.component.ts/html/css
│   │   └── progress-indicator.component.spec.ts
│   ├── report/
│   │   ├── report-display.component.ts/html/css
│   │   └── report-display.component.spec.ts
│   └── app.component.ts/html/css   # Main container
├── app.config.ts                  # Service providers
├── app.routes.ts                  # Routing (if needed later)
└── main.ts
```

---

## Services

### ResearchService
- **Purpose:** WebSocket/STOMP communication with backend
- **Responsibilities:**
  - Connect to `/ws-research` endpoint
  - Send `ResearchRequestMessage` to `/app/research`
  - Subscribe to `/topic/research/result` for final report
  - Subscribe to `/topic/research/progress` for progress updates
  - Handle connection errors and lifecycle
- **Inputs:** `ResearchRequestMessage` (researchTopic string)
- **Outputs:** `BehaviorSubject<ResearchReport>`, `Observable<ProgressOutputChannelEvent>`

### ReportService
- **Purpose:** Format and render research reports
- **Responsibilities:**
  - Parse markdown from `ResearchReport.markdownReport`
  - Extract and format `shortSummary`
  - Format `followUpQuestions` as linkable items
  - Utility methods for rendering enhancements
- **No external dependencies** - pure logic/service

---

## Components

### SearchBoxComponent
- **Input:** `researchTopic: string` (user input)
- **Outputs:**
  - `searchSubmit: EventEmitter<string>` - emit on user submission
- ** Angular Material:**
  - `mat-form-field` with input
  - `mat-icon` search button
  - `mat-spinner` while searching
  - Keyboard support (Enter to submit)

### ProgressIndicatorComponent
- **Input:** `progress$: Observable<ProgressOutputChannelEvent>` | async
- **Outputs:** None (display only)
- ** Angular Material:**
  - `mat-progress-bar` or `mat-progressSpinner` based on state
  - `mat-chip` or `mat-list` for textual progress messages
  - Show "Searching..." state with dynamic updates

### ReportDisplayComponent
- **Input:** `report: ResearchReport | null`
- **Outputs:** None (display only)
- ** Angular Material:**
  - `mat-card` container
  - `mat-card-title` for short summary
  - `mat-card-content` with markdown rendering (simple innerHTML or marked library)
  - Hide/expand sections based on report availability

### AppComponent (Main)
- **Purpose:** Container and coordination
- **Template:** Full-width layout with header + search box +_progress + report
- ** Angular Material:**
  - `mat-toolbar` for header
  - Responsive flex layout
  - Dark theme application

---

## Data Flow

```
User types topic → SearchBoxComponent.emit(topic)
                         ↓
AppComponent receives topic → ResearchService.submit(topic)
                         ↓
ResearchService → WebSocket → Backend
                         ↓
Backend processes → Progress updates → /topic/research/progress
                         ↓
ProgressIndicatorComponent displays updates (async pipe)
                         ↓
Backend completes → Final report → /topic/research/result
                         ↓
ResearchService updates subject → ReportDisplayComponent displays (async pipe)
```

---

## Styling & Theming

- **Theme:** Dark mode professional
- ** Angular Material setup:**
  - `@angular/material` installed
  - Custom dark theme with professional color palette
  - High contrast for long-form reading
- **Global styles:**
  - Dark background (#121212 or similar)
  - Light text (#ffffff)
  - Accent colors for interactive elements
  - Proper typography for markdown content

---

## Technical Decisions

### Why Modular Services?
- Testability: Each service can be unit tested independently
- Reusability: Services can be injected into multiple components
- Maintainability: Clear boundaries, easy to modify one concern
- Future-proof: Easy to add new features (e.g., history, favorites)

### Minimal Report Display
- Focus on markdown report (main content)
- Short summary available on-demand (expandable section)
- Follow-up questions as footer/list (optional interaction)
- Clean, distraction-free interface

### Full-Width Layout
- Search at top (sticky or top BAR)
- Report expands to fill available space
- Progress indicator in status BAR or snackbar
- Maximizes content visibility on larger screens

---

## Implementation Steps

1. Install Angular Material and set up dark theme
2. Create ResearchService with WebSocket connection
3. Create ReportService for formatting utilities
4. Create SearchBoxComponent
5. Create ProgressIndicatorComponent
6. Create ReportDisplayComponent
7. Wire up AppComponent for layout and data flow
8. Add routing if needed later (optional)
9. Testing: Unit tests for services, component tests for UI
10. Polish: Animations, error states, loading states

---

## Future Enhancements (Out of Scope)

- Report history/cache
- Export functionality (PDF, markdown file)
- Follow-up question interaction
- Multi-turn conversation state
- Search history autocomplete
