# Markdown Rendering & Follow-Up Questions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Properly render markdown report content and display follow-up questions as clickable chips that trigger new searches

**Architecture:** Create a markdown renderer component that renders `ngx-markdown` output with proper formatting, and extend the report display component to show follow-up questions as Action Chips. The report component will handle chip click events to trigger new searches.

**Tech Stack:** Angular 21+, `ngx-markdown`, Angular Material

---

## File Structure

### Files to Create:
- `src/app/components/markdown-renderer/markdown-renderer.component.ts` - Main markdown rendering component
- `src/app/components/markdown-renderer/markdown-renderer.component.html` - Template
- `src/app/components/markdown-renderer/markdown-renderer.component.css` - Styles

### Files to Modify:
- `src/app/services/report.service.ts` - Update to merge summary with report, return unified content
- `src/app/components/report-display/report-display.component.ts` - Add follow-up questions handling, markdown rendering
- `src/app/components/report-display/report-display.component.html` - UI changes for chips
- `src/app/components/report-display/report-display.component.css` - Chip and follow-up section styles

---

### Task 1: Install `ngx-markdown` dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add `ngx-markdown` to dependencies**

Edit `package.json` and add `ngx-markdown` to dependencies:
```json
{
  "name": "deep-research-frontend-ng",
  "version": "0.0.0",
  "dependencies": {
    "@angular/animations": "^21.2.10",
    "@angular/cdk": "^21.2.8",
    "@angular/common": "^21.2.0",
    "@angular/compiler": "^21.2.0",
    "@angular/core": "^21.2.0",
    "@angular/forms": "^21.2.0",
    "@angular/material": "^21.2.8",
    "@angular/platform-browser": "^21.2.0",
    "@angular/router": "^21.2.0",
    "@fontsource/inter": "^5.2.8",
    "@stomp/stompjs": "^7.3.0",
    "hammerjs": "^2.0.8",
    "ngx-markdown": "^21.1.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0"
  }
}
```

- [ ] **Step 2: Install dependency with pnpm**

Run: `pnpm install`
Expected: `ngx-markdown` package installed in `node_modules`

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add ngx-markdown dependency"
```

---

### Task 2: Create `MarkdownRendererComponent`

**Files:**
- Create: `src/app/components/markdown-renderer/markdown-renderer.component.ts`
- Create: `src/app/components/markdown-renderer/markdown-renderer.component.html`
- Create: `src/app/components/markdown-renderer/markdown-renderer.component.css`

- [ ] **Step 1: Create component TypeScript file**

Create `src/app/components/markdown-renderer/markdown-renderer.component.ts`:
```typescript
import { Component, Input } from '@angular/core';
import { NgxMarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-renderer',
  imports: [
    NgxMarkdownModule
  ],
  templateUrl: './markdown-renderer.component.html',
  styleUrl: './markdown-renderer.component.css'
})
export class MarkdownRendererComponent {
  @Input() content: string = '';

  constructor() {}
}
```

- [ ] **Step 2: Create component HTML template**

Create `src/app/components/markdown-renderer/markdown-renderer.component.html`:
```html
<markdown [data]="content"></markdown>
```

- [ ] **Step 3: Create component CSS file**

Create `src/app/components/markdown-renderer/markdown-renderer.component.css`:
```css
.markdown-content {
  line-height: 1.6;
  max-width: 800px;
}

.markdown-content p {
  margin-bottom: 1rem;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.markdown-content h1 {
  font-size: 2rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.markdown-content h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.3rem;
}

.markdown-content h3 {
  font-size: 1.25rem;
}

.markdown-content ul,
.markdown-content ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content li {
  margin-bottom: 0.5rem;
}

.markdown-content code {
  background: #2d2d2d;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.markdown-content pre {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content pre code {
  background: transparent;
  padding: 0;
}

.markdown-content blockquote {
  border-left: 4px solid #444;
  padding-left: 1rem;
  margin-left: 0;
  color: #aaa;
}

.markdown-content a {
  color: #4da8da;
}

.markdown-content a:hover {
  text-decoration: underline;
}
```

Note: CSS file will be updated in Task 3 when integrating with styles. For now, create minimal version.

- [ ] **Step 4: Run build to verify TypeScript compiles**

Run: `ng build` (from deep-research-frontend-ng directory)
Expected: No TypeScript errors

- [ ] **Step 5: Commit**

```bash
git add src/app/components/markdown-renderer/markdown-renderer.component.ts \
        src/app/components/markdown-renderer/markdown-renderer.component.html \
        src/app/components/markdown-renderer/markdown-renderer.component.css
git commit -m "feat: add markdown renderer component"
```

---

### Task 3: Refactor `ReportService` to merge summary with report

**Files:**
- Modify: `src/app/services/report.service.ts`

- [ ] **Step 1: Update `formatReport` method**

Modify `src/app/services/report.service.ts`:
```typescript
import { Injectable } from '@angular/core';
import { ResearchReport } from './research.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  formatReport(report: ResearchReport): string {
    // Merge summary as intro paragraph at the top of the report
    let output = '';
    output += `${report.shortSummary}\n\n`;
    output += '---\n\n';
    output += '## Research Report\n\n';
    output += report.markdownReport;

    return output;
  }

  formatFollowUpQuestions(questions: string[] | undefined): string[] {
    return questions || [];
  }
}
```

- [ ] **Step 2: Run build to verify TypeScript compiles**

Run: `ng build`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/app/services/report.service.ts
git commit -m "refactor: update report service to merge summary with report"
```

---

### Task 4: Update `ReportDisplayComponent` to handle follow-up questions

**Files:**
- Modify: `src/app/components/report-display/report-display.component.ts`
- Modify: `src/app/components/report-display/report-display.component.html`
- Modify: `src/app/components/report-display/report-display.component.css`
- Modify: `src/app/components/report-display/report-display.component.html` (add import)

- [ ] **Step 1: Update component TypeScript file**

Modify `src/app/components/report-display/report-display.component.ts`:
```typescript
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ReportService } from '../../services/report.service';
import { ResearchService, ResearchReport } from '../../services/research.service';
import { MarkdownRendererComponent } from '../markdown-renderer/markdown-renderer.component';

@Component({
  selector: 'app-report-display',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressBarModule,
    MarkdownRendererComponent
  ],
  templateUrl: './report-display.component.html',
  styleUrl: './report-display.component.css'
})
export class ReportDisplayComponent implements OnInit, OnDestroy {
  private readonly _reportService = inject(ReportService);
  private readonly _researchService = inject(ResearchService);

  report: ResearchReport | null = null;
  markdownContent: string = '';
  followUpQuestions: string[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    this._researchService.report$.subscribe({
      next: (report) => {
        if (report) {
          this.report = report;
          this.markdownContent = this._reportService.formatReport(report);
          this.followUpQuestions = this._reportService.formatFollowUpQuestions(report.followUpQuestions);
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Report subscription error:', error);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Subscription cleanup handled by service
  }

  copyToClipboard(): void {
    if (this.markdownContent) {
      navigator.clipboard.writeText(this.markdownContent);
    }
  }

  downloadMarkdown(): void {
    if (this.report && this.markdownContent) {
      const blob = new Blob([this.markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  onFollowUpQuestionSelected(question: string): void {
    this.isLoading = true;
    this._researchService.startResearch(question);
  }
}
```

- [ ] **Step 2: Update component HTML template**

Modify `src/app/components/report-display/report-display.component.html`:
```html
@if (report) {
  <div class="report-container">
    <mat-card>
      <mat-card-title>Research Report</mat-card-title>
      <mat-card-content>
        <app-markdown-renderer [content]="markdownContent"></app-markdown-renderer>
        
        @if (followUpQuestions.length > 0) {
          <div class="follow-up-section">
            <span class="follow-up-label">Follow up with:</span>
            <div class="follow-up-chips">
              <mat-chip
                *ngFor="let question of followUpQuestions"
                (click)="onFollowUpQuestionSelected(question)"
                [disabled]="isLoading"
                class="follow-up-chip">
                {{ question }}
              </mat-chip>
            </div>
          </div>
        }

        @if (isLoading) {
          <mat-progress-bar mode="indeterminate"></mat-progress-bar>
        }
      </mat-card-content>
      <mat-card-actions align="end">
        <button
          mat-button
          matTooltip="Copy report to clipboard"
          (click)="copyToClipboard()"
          [disabled]="isLoading">
          <mat-icon>content_copy</mat-icon>
          Copy
        </button>
        <button
          mat-button
          matTooltip="Download as Markdown"
          (click)="downloadMarkdown()"
          [disabled]="isLoading">
          <mat-icon>file_download</mat-icon>
          Download
        </button>
      </mat-card-actions>
    </mat-card>
  </div>
} @else {
  <div class="no-report">
    <mat-card>
      <mat-card-title>No report available</mat-card-title>
      <mat-card-content>
        Run a search to generate a report.
      </mat-card-content>
    </mat-card>
  </div>
}
```

- [ ] **Step 3: Update component CSS file**

Modify `src/app/components/report-display/report-display.component.css`:
```css
.report-container {
  margin: 1rem 0;
}

mat-card {
  background: #2d2d2d;
  color: #e0e0e0;
  border-radius: 8px;
}

mat-card-content {
  min-height: 200px;
}

.follow-up-section {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #444;
}

.follow-up-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #aaa;
}

.follow-up-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.follow-up-chip {
  background: #3d3d3d;
  color: #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.follow-up-chip:hover:not([disabled]) {
  background: #4d4d4d;
  transform: translateY(-1px);
}

.follow-up-chip:active:not([disabled]) {
  transform: translateY(0);
}

.follow-up-chip[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
}

mat-progress-bar {
  margin-top: 1rem;
}

.no-report {
  margin: 1rem 0;
}
```

- [ ] **Step 4: Update app module imports**

Modify `src/app/app.ts` to import `MarkdownRendererComponent`:
```typescript
import { Component, signal } from '@angular/core';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { ProgressIndicatorComponent } from './components/progress-indicator/progress-indicator.component';
import { ReportDisplayComponent } from './components/report-display/report-display.component';
import { MarkdownRendererComponent } from './components/markdown-renderer/markdown-renderer.component';

@Component({
  selector: 'app-root',
  imports: [
    SearchBoxComponent,
    ProgressIndicatorComponent,
    ReportDisplayComponent,
    MarkdownRendererComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Deep Research');
}
```

- [ ] **Step 5: Run build to verify TypeScript compiles**

Run: `ng build`
Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/app/components/report-display/report-display.component.ts \
        src/app/components/report-display/report-display.component.html \
        src/app/components/report-display/report-display.component.css \
        src/app/app.ts
git commit -m "feat: add markdown rendering and follow-up questions"
```

---

### Task 5: Update existing tests

**Files:**
- Modify: `src/app/services/report.service.spec.ts`
- Modify: `src/app/components/report-display/report-display.component.spec.ts` (create if doesn't exist)

- [ ] **Step 1: Update `ReportService` tests**

Modify `src/app/services/report.service.spec.ts`:
```typescript
import { inject, TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';
import { ResearchReport } from './research.service';

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportService]
    });
    service = TestBed.inject(ReportService);
  });

  it('can instantiate service', inject([ReportService], (service: ReportService) => {
    expect(service).toBeTruthy();
  }));

  it('formats report with merged summary', () => {
    const report: ResearchReport = {
      shortSummary: 'This is a summary.',
      markdownReport: '# Detailed Report\nThis is the report content.',
      followUpQuestions: ['Question 1', 'Question 2']
    };

    const formatted = service.formatReport(report);
    expect(formatted).toContain('This is a summary.');
    expect(formatted).toContain('# Detailed Report');
    expect(formatted).not.toContain('### Short Summary');
    expect(formatted).not.toContain('---');
  });

  it('returns empty array for undefined follow-up questions', () => {
    const questions = service.formatFollowUpQuestions(undefined);
    expect(questions).toEqual([]);
  });

  it('returns questions array for valid input', () => {
    const questions = service.formatFollowUpQuestions(['Q1', 'Q2']);
    expect(questions).toEqual(['Q1', 'Q2']);
  });
});
```

- [ ] **Step 2: Create `ReportDisplayComponent` tests (if needed)**

Create `src/app/components/report-display/report-display.component.spec.ts` if not present, or update existing test file.

If file doesn't exist, create with minimal structure for now (can be enhanced later):
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportDisplayComponent } from './report-display.component';
import { ResearchReport } from '../../services/research.service';
import { ReportService } from '../../services/report.service';

describe('ReportDisplayComponent', () => {
  let component: ReportDisplayComponent;
  let fixture: ComponentFixture<ReportDisplayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReportDisplayComponent]
    });
    fixture = TestBed.createComponent(ReportDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('can create component', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `ng test --watch=false` (or `npm test -- --watch=false` if using npm)
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/app/services/report.service.spec.ts \
        src/app/components/report-display/report-display.component.spec.ts
git commit -m "test: add tests for markdown rendering and follow-up questions"
```

---

### Task 6: Verify functionality

**Files:**
- Manual verification: Run app in browser

- [ ] **Step 1: Build the application**

Run: `ng build`
Expected: Build succeeds without errors

- [ ] **Step 2: Run the application**

Run: `ng serve`
Expected: Application compiles and serves on http://localhost:4200

- [ ] **Step 3: Manual testing**

1. Open http://localhost:4200 in browser
2. Enter a search query and trigger search
3. Verify markdown renders with proper formatting (headings, lists, etc.)
4. Verify follow-up questions appear as chips at the bottom
5. Click a follow-up question and verify new search is triggered
6. Verify loading indicator appears during search
7. Test with report that has no follow-up questions (section should be hidden)

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "refactor: apply fixes and improvements from manual testing"
```

---

## Implementation Checklist

- [ ] Install `ngx-markdown` dependency (Task 1)
- [ ] Create `MarkdownRendererComponent` (Task 2)
- [ ] Refactor `ReportService` to merge summary with report (Task 3)
- [ ] Update `ReportDisplayComponent` with markdown rendering and follow-up chips (Task 4)
- [ ] Update tests (Task 5)
- [ ] Verify functionality (Task 6)

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-03-markdown-rendering-implementation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
