import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { ReportDisplayComponent } from './components/report-display/report-display.component';
import { SessionSidebarComponent } from './components/session-sidebar/session-sidebar.component';
import { SessionEntryListComponent } from './components/session-entry-list/session-entry-list.component';
import { SessionService, ResearchEntry } from './services/session.service';
import { ResearchService, ResearchReport } from './services/research.service';
import { ThemeService } from './services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    SearchBoxComponent,
    ReportDisplayComponent,
    SessionSidebarComponent,
    SessionEntryListComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly _sessionService = inject(SessionService);
  private readonly _researchService = inject(ResearchService);
  // Eagerly inject ThemeService so it initialises and applies the saved/system
  // theme as soon as the root component is constructed — before any child
  // component renders.
  private readonly _themeService = inject(ThemeService);

  protected readonly title = signal('Deep Research');

  readonly selectedSessionId = signal<string | null>(null);
  readonly sessionEntries = signal<ResearchEntry[]>([]);
  readonly selectedEntry = signal<ResearchEntry | null>(null);
  readonly isLoadingEntries = signal(false);

  readonly isSearching = toSignal(this._researchService.isSearching$, { initialValue: false });

  readonly appState = computed(() => {
    if (this.isSearching()) {
      return 'searching';
    }
    if (this.sessionEntries().length > 0) {
      return 'results';
    }
    return 'new-search';
  });

  /** Historical report from a selected entry, parsed from reportJson */
  readonly historicalReport = signal<ResearchReport | null>(null);

  private readonly _subscriptions = new Subscription();

  constructor() {
    // When a live research completes, transition to the completed session and load its entries
    this._subscriptions.add(
      this._researchService.sessionCompleted$.subscribe((sessionId) => {
        this.selectedSessionId.set(sessionId);
        this._loadSessionEntries(sessionId);
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  onSessionSelected(sessionId: string): void {
    this.selectedSessionId.set(sessionId);
    this.historicalReport.set(null);
    this._loadSessionEntries(sessionId);
  }

  onNewSession(): void {
    this.selectedSessionId.set(null);
    this.sessionEntries.set([]);
    this.selectedEntry.set(null);
    this.historicalReport.set(null);
    this._researchService.clearReport();
    this._researchService.clearProgress();
  }

  onEntrySelected(entry: ResearchEntry): void {
    this.selectedEntry.set(entry);
    try {
      const report: ResearchReport = JSON.parse(entry.reportJson);
      this.historicalReport.set(report);

      // Smoothly scroll to the corresponding entry in the main view
      setTimeout(() => {
        const element = document.getElementById('entry-' + entry.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
    } catch (e) {
      console.error('Failed to parse report JSON for entry', entry.id, e);
      this.historicalReport.set(null);
    }
  }

  private _loadSessionEntries(sessionId: string): void {
    this.isLoadingEntries.set(true);
    this.selectedEntry.set(null);
    this.historicalReport.set(null);

    this._sessionService.getSessionEntries(sessionId).subscribe({
      next: (entries) => {
        this.sessionEntries.set(entries);
        this.isLoadingEntries.set(false);

        // Auto-select the first entry if available
        if (entries.length > 0) {
          this.onEntrySelected(entries[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load session entries', err);
        this.sessionEntries.set([]);
        this.isLoadingEntries.set(false);
      },
    });
  }
}