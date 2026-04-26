# Deep Research Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Angular Material-based frontend for the deep research WebSocket API with modular services and dark mode professional theme

**Architecture:** Service-oriented design with ResearchService (WebSocket), ReportService (formatting), and three components (search, progress, report) coordinated by AppComponent

**Tech Stack:** Angular 21.2, Angular Material, TypeScript, STOMP over WebSockets

---

## File Structure

```
deep-research-frontend-ng/src/app/
├── services/
│   ├── research.service.ts         # WebSocket/STOMP client
│   ├── research.service.spec.ts    # Service tests
│   ├── report.service.ts           # Markdown formatting & display
│   └── report.service.spec.ts      # Service tests
├── components/
│   ├── search-box/
│   │   ├── search-box.component.ts
│   │   ├── search-box.component.html
│   │   ├── search-box.component.css
│   │   └── search-box.component.spec.ts
│   ├── progress-indicator/
│   │   ├── progress-indicator.component.ts
│   │   ├── progress-indicator.component.html
│   │   ├── progress-indicator.component.css
│   │   └── progress-indicator.component.spec.ts
│   └── report-display/
│       ├── report-display.component.ts
│       ├── report-display.component.html
│       ├── report-display.component.css
│       └── report-display.component.spec.ts
├── app.html                        # Updated main template
├── app.ts                          # Updated main component
└── app.routes.ts                   # Add routes if needed
```

---

### Task 1: Add Angular Material and Dependencies

**Files:**
- Modify: `deep-research-frontend-ng/package.json`
- Modify: `deep-research-frontend-ng/src/styles.css`

- [ ] **Step 1: Install Angular Material packages**

```bash
cd deep-research-frontend-ng
pnpm add @angular/material @angular/cdk @angular/animations @fontsource/inter
```

Expected: Package.json updated with material packages

- [ ] **Step 2: Add styles to `src/styles.css`**

```css
@import 'hammerjs/hammer';
@import '@angular/material/prebuilt-themes/indigo-pink.css';
@import '@fontsource/inter';

html, body {
  height: 100%;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #1a1a1a;
  color: #e0e0e0;
}

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
```

- [ ] **Step 3: Create theme file `src/theme.css`**

```css
@use '@angular/material' as mat;

:root {
  --app-primary: #3f51b5;
  --app-accent: #00bcd4;
  --app-warn: #f44336;
}

$app-color-palette: (
  50: #e8eaf6,
  100: #c5cae9,
  200: #9fa8da,
  300: #7986cb,
  400: #5c6bc0,
  500: #3f51b5,
  600: #3949ab,
  700: #303f9f,
  800: #283593,
  900: #1a237e,
  A100: #d5d8dc,
  A200: #ffffff,
  A400: #ffeb3b,
  A700: #fbc02d,
  contrast: (
    50: #000000,
    100: #000000,
    200: #000000,
    300: #000000,
    400: #000000,
    500: #ffffff,
    600: #ffffff,
    700: #ffffff,
    800: #ffffff,
    900: #ffffff,
    A100: #000000,
    A200: #000000,
    A400: #000000,
    A700: #000000,
  )
);

$app-primary-color: mat.m2-define-palette($app-color-palette, 500, 300, 700);
$app-accent-color: mat.m2-define-palette(mat.$m2-indigo-palette, 400, 200, 600);
$app-warn-color: mat.m2-define-palette(mat.$m2-red-palette, 500);

$app-theme: mat.m2-define-dark-theme((
  color: (
    primary: $app-primary-color,
    accent: $app-accent-color,
    warn: $app-warn-color,
  ),
  typography: mat.m2-define-typography-config(
    $font-family: mat.$inter-font-family
  ),
));

html {
  @include mat.m2-all-component-themes($app-theme);
  @include mat.m2-density-variant(mat.$m2-typography-500);
}

html {
  @include mat.m2-density(-1);
}
```

- [ ] **Step 4: Commit initial dependencies**

```bash
git add package.json src/styles.css src/theme.css
git commit -m "chore: add Angular Material and dependencies"
```

---

### Task 2: Create ResearchService

**Files:**
- Create: `deep-research-frontend-ng/src/app/services/research.service.ts`
- Create: `deep-research-frontend-ng/src/app/services/research.service.spec.ts`

- [ ] **Step 1: Write the failing test `services/research.service.spec.ts`**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientTestingModule } from '@angular/common/http/testing';
import { StompService } from '@stomp/ng2-stompjs';
import { ResearchService } from './research.service';

describe('ResearchService', () => {
  let service: ResearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        StompService,
        { provide: ResearchService, useFactory: () => new ResearchService(new StompService()) }
      ]
    });
    service = TestBed.inject(ResearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=research.service.spec.ts --no-coverage
```

Expected: FAIL with "ResearchService not defined"

- [ ] **Step 3: Create `services/research.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { StompService } from '@stomp/ng2-stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResearchRequest {
  researchTopic: string;
}

export interface ProgressUpdate {
  message: string;
  timestamp: string;
}

export interface ResearchReport {
  shortSummary: string;
  markdownReport: string;
  followUpQuestions?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ResearchService {
  private readonly _stompConfig = {
    brokerURL: 'ws://localhost:8080/ws-research/websocket',
    headers: {
      login: '',
      passcode: ''
    },
    connectHeaders: {
      login: '',
      passcode: ''
    },
    disconnectHeaders: {},
    heartbeat: { out: 10000, in: 10000 },
    debug: false
  };

  private stompClient: any;
  private progressSubject = new BehaviorSubject<ProgressUpdate | null>(null);
  private reportSubject = new BehaviorSubject<ResearchReport | null>(null);

  constructor(private stompService: StompService) {
    this.stompService.configuration = this._stompConfig;
    this.stompService.activate();
  }

  startResearch(topic: string): void {
    const request: ResearchRequest = { researchTopic: topic };
    this.stompService.publish({
      destination: '/app/research',
      body: JSON.stringify(request)
    });
  }

  connectProgress(): Observable<ProgressUpdate> {
    this.stompService.subscribe('/topic/research/progress', (frame: any, message: any) => {
      const payload = JSON.parse(message.body);
      this.progressSubject.next({
        message: payload.message,
        timestamp: new Date().toISOString()
      });
    });
    return this.progressSubject.asObservable().pipe(
      map((update) => update!)
    );
  }

  connectReport(): Observable<ResearchReport> {
    this.stompService.subscribe('/topic/research/result', (frame: any, message: any) => {
      const payload = JSON.parse(message.body);
      this.reportSubject.next(payload);
    });
    return this.reportSubject.asObservable().pipe(
      map((report) => report!)
    );
  }

  clearReport(): void {
    this.reportSubject.next(null);
  }

  isConnected(): boolean {
    return this.stompService.connected;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=research.service.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit ResearchService**

```bash
git add src/app/services/research.service.ts src/app/services/research.service.spec.ts
git commit -m "feat: add ResearchService for WebSocket communication"
```

---

### Task 3: Create ReportService

**Files:**
- Create: `deep-research-frontend-ng/src/app/services/report.service.ts`
- Create: `deep-research-frontend-ng/src/app/services/report.service.spec.ts`

- [ ] **Step 1: Write the failing test `services/report.service.spec.ts`**

```typescript
import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format markdown report', () => {
    const report = {
      shortSummary: 'Test summary',
      markdownReport: '## Test\nContent here',
      followUpQuestions: ['Question 1', 'Question 2']
    };
    const formatted = service.formatReport(report);
    expect(formatted).toContain('shortSummary');
    expect(formatted).toContain('markdownReport');
    expect(formatted).toContain('followUpQuestions');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=report.service.spec.ts --no-coverage
```

Expected: FAIL with "ReportService not defined"

- [ ] **Step 3: Create `services/report.service.ts`**

```typescript
import { Injectable } from '@angular/core';
import { ResearchReport } from './research.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor() { }

  formatReport(report: ResearchReport): string {
    let output = '';
    output += '### Short Summary\n';
    output += `${report.shortSummary}\n\n`;
    output += '---\n\n';
    output += '### Research Report\n';
    output += report.markdownReport;
    
    if (report.followUpQuestions && report.followUpQuestions.length > 0) {
      output += '\n\n---\n\n';
      output += '### Follow-up Questions\n';
      report.followUpQuestions.forEach((question, index) => {
        output += `${index + 1}. ${question}\n`;
      });
    }
    
    return output;
  }

  getHtmlContent(report: ResearchReport): string {
    const formatted = this.formatReport(report);
    return formatted
      .replace(/### (.*?)\n/g, '<h3>$1</h3>')
      .replace(/## (.*?)\n/g, '<h2>$1</h2>')
      .replace(/# (.*?)\n/g, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
      .replace(/\n/g, '<br>');
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=report.service.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit ReportService**

```bash
git add src/app/services/report.service.ts src/app/services/report.service.spec.ts
git commit -m "feat: add ReportService for formatting research reports"
```

---

### Task 4: Create SearchBoxComponent

**Files:**
- Create: `deep-research-frontend-ng/src/app/components/search-box/search-box.component.ts`
- Create: `deep-research-frontend-ng/src/app/components/search-box/search-box.component.html`
- Create: `deep-research-frontend-ng/src/app/components/search-box/search-box.component.css`
- Create: `deep-research-frontend-ng/src/app/components/search-box/search-box.component.spec.ts`

- [ ] **Step 1: Write the failing test `components/search-box/search-box.component.spec.ts`**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBoxComponent } from './search-box.component';
import { ResearchService } from '../../services/research.service';
import { MaterialModule } from '../../material.module';

describe('SearchBoxComponent', () => {
  let component: SearchBoxComponent;
  let fixture: ComponentFixture<SearchBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SearchBoxComponent],
      providers: [
        {
          provide: ResearchService,
          useValue: {
            startResearch: jest.fn()
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=search-box.component.spec.ts --no-coverage
```

Expected: FAIL with "SearchBoxComponent not defined"

- [ ] **Step 3: Create component files**

Create `components/search-box/search-box.component.ts`:
```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResearchService } from '../../services/research.service';

@Component({
  selector: 'app-search-box',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css'
})
export class SearchBoxComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _researchService = inject(ResearchService);

  searchForm = this._fb.nonNullable.group({
    topic: ['', [Validators.required, Validators.minLength(3)]]
  });

  isSearching = false;
  isFormSubmitted = false;

  onSubmit(): void {
    if (this.searchForm.invalid) {
      return;
    }

    this.isSearching = true;
    this.isFormSubmitted = true;

    const topic = this.searchForm.controls.topic.value;
    if (topic) {
      this._researchService.startResearch(topic);
    }
  }

  onReset(): void {
    this.searchForm.reset();
    this.isSearching = false;
    this.isFormSubmitted = false;
  }
}
```

Create `components/search-box/search-box.component.html`:
```html
<div class="search-container">
  <mat-form-field appearance="fill" class="search-field">
    <mat-label>Enter research topic</mat-label>
    <input
      matInput
      type="text"
      [formControl]="searchForm.controls.topic"
      placeholder="What would you like to research?"
    />
    <mat-hint>Minimum 3 characters</mat-hint>
    <mat-error *ngIf="searchForm.controls.topic.hasError('required')">
      Topic is required
    </mat-error>
    <mat-error *ngIf="searchForm.controls.topic.hasError('minlength')">
      Topic must be at least 3 characters
    </mat-error>
  </mat-form-field>

  <div class="button-group">
    <button
      mat-raised-button
      color="primary"
      (click)="onSubmit()"
      [disabled]="searchForm.invalid || isSearching"
    >
      <mat-icon *ngIf="isSearching">search</mat-icon>
      <span *ngIf="isSearching">Researching...</span>
      <span *ngIf="!isSearching">Search</span>
    </button>

    <button
      mat-stroked-button
      (click)="onReset()"
      *ngIf="isFormSubmitted"
    >
      Reset
    </button>
  </div>
</div>
```

Create `components/search-box/search-box.component.css`:
```css
.search-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #2d2d2d;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.search-field {
  width: 100%;
  max-width: 600px;
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

- [ ] **Step 4: Run test to verify it passes**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=search-box.component.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit SearchBoxComponent**

```bash
git add src/app/components/search-box/
git commit -m "feat: add SearchBoxComponent for research topic input"
```

---

### Task 5: Create ProgressIndicatorComponent

**Files:**
- Create: `deep-research-frontend-ng/src/app/components/progress-indicator/progress-indicator.component.ts`
- Create: `deep-research-frontend-ng/src/app/components/progress-indicator/progress-indicator.component.html`
- Create: `deep-research-frontend-ng/src/app/components/progress-indicator/progress-indicator.component.css`
- Create: `deep-research-frontend-ng/src/app/components/progress-indicator/progress-indicator.component.spec.ts`

- [ ] **Step 1: Write the failing test `components/progress-indicator/progress-indicator.component.spec.ts`**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgressIndicatorComponent } from './progress-indicator.component';
import { ResearchService, ProgressUpdate } from '../../services/research.service';

describe('ProgressIndicatorComponent', () => {
  let component: ProgressIndicatorComponent;
  let fixture: ComponentFixture<ProgressIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressIndicatorComponent],
      providers: [
        {
          provide: ResearchService,
          useValue: {
            connectProgress: jest.fn(),
            isConnected: jest.fn().mockReturnValue(true)
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressIndicatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=progress-indicator.component.spec.ts --no-coverage
```

Expected: FAIL with "ProgressIndicatorComponent not defined"

- [ ] **Step 3: Create component files**

Create `components/progress-indicator/progress-indicator.component.ts`:
```typescript
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { Subscription } from 'rxjs';
import { ResearchService, ProgressUpdate } from '../../services/research.service';

@Component({
  selector: 'app-progress-indicator',
  imports: [CommonModule, MatButtonModule, MatProgressBarModule, MatListModule],
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.css'
})
export class ProgressIndicatorComponent implements OnInit, OnDestroy {
  private readonly _researchService = inject(ResearchService);

  private _progressSubscription?: Subscription;
  progressMessages: ProgressUpdate[] = [];
  progressValue = 0;

  ngOnInit(): void {
    this._progressSubscription = this._researchService.connectProgress().subscribe({
      next: (update) => {
        this.progressMessages.unshift(update);
        if (this.progressMessages.length > 20) {
          this.progressMessages.pop();
        }
        this.progressValue = Math.min(
          this.progressValue + 5,
          100
        );
      },
      error: (error) => {
        console.error('Progress subscription error:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this._progressSubscription?.unsubscribe();
  }

  isDownloading(): boolean {
    return this._researchService.isConnected();
  }

  clearProgress(): void {
    this.progressMessages = [];
    this.progressValue = 0;
  }
}
```

Create `components/progress-indicator/progress-indicator.component.html`:
```html
<div class="progress-container" *ngIf="progressMessages.length > 0">
  <div class="progress-header">
    <span>Progress</span>
    <button mat-icon-button (click)="clearProgress()" aria-label="Clear progress">
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <mat-progress-bar
    mode="determinate"
    [value]="progressValue"
    color="accent"
  ></mat-progress-bar>

  <mat-accordion>
    <mat-expansion-panel *ngFor="let message of progressMessages; first as isFirst; let i = index" [expanded]="isFirst">
      <mat-expansion-panel-header>
        <mat-panel-title>
          {{ message.message }}
        </mat-panel-title>
        <mat-panel-description>
          {{ message.timestamp | date : 'shortTime' }}
        </mat-panel-description>
      </mat-expansion-panel-header>

      <p>
        {{ message.message }}
      </p>
    </mat-expansion-panel>
  </mat-accordion>
</div>
```

Create `components/progress-indicator/progress-indicator.component.css`:
```css
.progress-container {
  background: #2d2d2d;
  border-radius: 8px;
  margin: 1rem 0;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-header span {
  font-weight: 600;
  color: #e0e0e0;
}

mat-expansion-panel {
  background: #3d3d3d;
  margin-top: 0.5rem;
}

mat-expansion-panel:last-child {
  margin-bottom: 0;
}

mat-panel-title {
  font-size: 0.9rem;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=progress-indicator.component.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Create MaterialModule for imports**

Create `src/app/material.module.ts`:
```typescript
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';

@NgModule({
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatExpansionModule,
    MatIconModule
  ]
})
export class MaterialModule { }
```

- [ ] **Step 6: Commit ProgressIndicatorComponent**

```bash
git add src/app/components/progress-indicator/ src/app/material.module.ts
git commit -m "feat: add ProgressIndicatorComponent for research progress display"
```

---

### Task 6: Create ReportDisplayComponent

**Files:**
- Create: `deep-research-frontend-ng/src/app/components/report-display/report-display.component.ts`
- Create: `deep-research-frontend-ng/src/app/components/report-display/report-display.component.html`
- Create: `deep-research-frontend-ng/src/app/components/report-display/report-display.component.css`
- Create: `deep-research-frontend-ng/src/app/components/report-display/report-display.component.spec.ts`

- [ ] **Step 1: Write the failing test `components/report-display/report-display.component.spec.ts`**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportDisplayComponent } from './report-display.component';
import { ReportService } from '../../services/report.service';
import { ResearchService, ResearchReport } from '../../services/research.service';

describe('ReportDisplayComponent', () => {
  let component: ReportDisplayComponent;
  let fixture: ComponentFixture<ReportDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDisplayComponent],
      providers: [
        {
          provide: ReportService,
          useValue: {
            formatReport: jest.fn(),
            getHtmlContent: jest.fn()
          }
        },
        {
          provide: ResearchService,
          useValue: {
            connectReport: jest.fn(),
            clearReport: jest.fn()
          }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=report-display.component.spec.ts --no-coverage
```

Expected: FAIL with "ReportDisplayComponent not defined"

- [ ] **Step 3: Create component files**

Create `components/report-display/report-display.component.ts`:
```typescript
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { ReportService } from '../../services/report.service';
import { ResearchService, ResearchReport } from '../../services/research.service';

@Component({
  selector: 'app-report-display',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './report-display.component.html',
  styleUrl: './report-display.component.css'
})
export class ReportDisplayComponent implements OnInit, OnDestroy {
  private readonly _reportService = inject(ReportService);
  private readonly _researchService = inject(ResearchService);

  private _reportSubscription?: Subscription;
  report: ResearchReport | null = null;
  formattedReport = '';

  ngOnInit(): void {
    this._reportSubscription = this._researchService.connectReport().subscribe({
      next: (report) => {
        this.report = report;
        this.formattedReport = this._reportService.formatReport(report);
      },
      error: (error) => {
        console.error('Report subscription error:', error);
      }
    });
  }

  ngOnDestroy(): void {
    this._reportSubscription?.unsubscribe();
  }

  copyToClipboard(): void {
    if (this.formattedReport) {
      navigator.clipboard.writeText(this.formattedReport);
    }
  }

  downloadMarkdown(): void {
    if (this.report && this.formattedReport) {
      const blob = new Blob([this.formattedReport], { type: 'text/markdown' });
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

  hasReport(): boolean {
    return this.report !== null;
  }
}
```

Create `components/report-display/report-display.component.html`:
```html
<div class="report-container" *ngIf="hasReport()">
  <mat-card>
    <mat-card-title>Research Report</mat-card-title>
    <mat-card-content>
      <pre class="report-content">{{ formattedReport }}</pre>
    </mat-card-content>
    <mat-card-actions align="end">
      <button
        mat-button
        mat-tooltip="Copy report to clipboard"
        (click)="copyToClipboard()"
      >
        <mat-icon>content_copy</mat-icon>
        Copy
      </button>
      <button
        mat-button
        mat-tooltip="Download as Markdown"
        (click)="downloadMarkdown()"
      >
        <mat-icon>file_download</mat-icon>
        Download
      </button>
    </mat-card-actions>
  </mat-card>
</div>

<div class="no-report" *ngIf="!hasReport()">
  <mat-card>
    <mat-card-title>No report available</mat-card-title>
    <mat-card-content>
      Run a search to generate a report.
    </mat-card-content>
  </mat-card>
</div>
```

Create `components/report-display/report-display.component.css`:
```css
.report-container {
  margin: 1rem 0;
}

mat-card {
  background: #2d2d2d;
  color: #e0e0e0;
  border-radius: 8px;
}

.report-content {
  background: #1a1a1a;
  color: #e0e0e0;
  padding: 1rem;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  max-height: 500px;
  overflow-y: auto;
}

no-report {
  margin: 1rem 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd deep-research-frontend-ng
pnpm test -- --testPathPattern=report-display.component.spec.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit ReportDisplayComponent**

```bash
git add src/app/components/report-display/
git commit -m "feat: add ReportDisplayComponent for research report display"
```

---

### Task 7: Update App Component

**Files:**
- Modify: `deep-research-frontend-ng/src/app/app.ts`
- Modify: `deep-research-frontend-ng/src/app/app.html`

- [ ] **Step 1: Update `app.ts`**

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { ProgressIndicatorComponent } from './components/progress-indicator/progress-indicator.component';
import { ReportDisplayComponent } from './components/report-display/report-display.component';
import { MaterialModule } from './material.module';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MaterialModule,
    ReactiveFormsModule,
    SearchBoxComponent,
    ProgressIndicatorComponent,
    ReportDisplayComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Deep Research');
}
```

- [ ] **Step 2: Update `app.html`**

```html
<div class="app-container">
  <header class="app-header">
    <h1>{{ title() }}</h1>
    <p>Deep research using <strong>Tavily Search API</strong> with Embabel Agent</p>
  </header>

  <main class="app-content">
    <app-search-box></app-search-box>
    <app-progress-indicator></app-progress-indicator>
    <app-report-display></app-report-display>
  </main>
</div>
```

- [ ] **Step 3: Update `app.css`**

```css
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  background: #1a1a1a;
  padding: 1rem 2rem;
  border-bottom: 1px solid #333;
  text-align: center;
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  color: #e0e0e0;
  font-size: 1.5rem;
}

.app-header p {
  margin: 0;
  color: #909090;
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

- [ ] **Step 4: Run tests to verify integration**

```bash
cd deep-research-frontend-ng
pnpm test -- --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit App updates**

```bash
git add src/app/app.ts src/app/app.html src/app/app.css
git commit -m "feat: integrate components into main app"
```

---

### Task 8: Configure STOMP WebSocket Connection

**Files:**
- Modify: `deep-research-frontend-ng/src/app/services/research.service.ts`

- [ ] **Step 1: Update WebSocket configuration**

```typescript
// In research.service.ts, update the constructor to use environment config

constructor(private stompService: StompService) {
  const config = this._stompConfig;
  config.brokerURL = this.getWebSocketUrl();
  this.stompService.configuration = config;
  this.stompService.activate();
}

private getWebSocketUrl(): string {
  const isProduction = window.location.protocol === 'https:';
  const host = window.location.host;
  const protocol = isProduction ? 'wss://' : 'ws://';
  return `${protocol}${host}/ws-research/websocket`;
}
```

- [ ] **Step 2: Commit WebSocket config**

```bash
git add src/app/services/research.service.ts
git commit -m "refactor: configure WebSocket connection dynamically"
```

---

### Task 9: Add Environment Configuration

**Files:**
- Create: `deep-research-frontend-ng/src/environments/environment.ts`
- Create: `deep-research-frontend-ng/src/environments/environment.prod.ts`

- [ ] **Step 1: Create environment files**

Create `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080/ws-research/websocket'
};
```

Create `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com',
  wsUrl: 'wss://your-api-domain.com/ws-research/websocket'
};
```

- [ ] **Step 2: Update ResearchService to use environment**

```typescript
import { environment } from '../environments/environment';

constructor(private stompService: StompService) {
  const config = this._stompConfig;
  config.brokerURL = environment.wsUrl;
  this.stompService.configuration = config;
  this.stompService.activate();
}
```

- [ ] **Step 3: Commit environment config**

```bash
git add src/environments/
git commit -m "chore: add environment configuration"
```

---

## Verification Checklist

Run these commands to verify completion:

```bash
# Build the project
cd deep-research-frontend-ng
pnpm build

# Run all tests
pnpm test

# Start dev server (backend must be running on :8080)
pnpm start
```

---

## Summary

Plan complete and saved to `docs/superpowers/plans/2026-04-26-deep-research-frontend-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
