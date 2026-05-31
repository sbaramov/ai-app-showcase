import { Component, computed, inject, input, signal, OnInit, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportService } from '../../services/report.service';
import { ResearchService, ResearchReport } from '../../services/research.service';
import { ResearchEntry } from '../../services/session.service';
import { MarkdownRendererComponent } from '../markdown-renderer/markdown-renderer.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-report-display',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MarkdownRendererComponent
  ],
  templateUrl: './report-display.component.html',
  styleUrl: './report-display.component.css'
})
export class ReportDisplayComponent implements OnInit, OnDestroy {
  private readonly _reportService = inject(ReportService);
  private readonly _researchService = inject(ResearchService);

  readonly selectedSessionId = input<string | null>(null);
  readonly entries = input<ResearchEntry[]>([]);

  readonly liveReport = toSignal(this._researchService.report$, { initialValue: null });
  readonly isLoading = signal(false);

  private readonly _subscriptions = new Subscription();

  /** Parsed research entries from the session */
  readonly parsedEntries = computed(() => {
    return this.entries().map((entry, index) => {
      try {
        const report: ResearchReport = JSON.parse(entry.reportJson);
        return {
          id: entry.id,
          query: entry.query,
          report: report,
          markdown: this._reportService.formatReport(report),
          followUpQuestions: this._reportService.formatFollowUpQuestions(report.followUpQuestions),
          createdAt: entry.createdAt
        };
      } catch (e) {
        console.error('Failed to parse report JSON for entry', entry.id, e);
        return null;
      }
    }).filter(Boolean) as Array<{
      id: string;
      query: string;
      report: ResearchReport;
      markdown: string;
      followUpQuestions: string[];
      createdAt: string;
    }>;
  });

  /** Sequence of reports to render: prefers history entries, falls back to live stream if empty */
  readonly reportsToRender = computed(() => {
    const list = this.parsedEntries();
    if (list.length > 0) {
      return list;
    }
    const live = this.liveReport();
    if (live) {
      return [{
        id: 'live',
        query: 'Current Deep Research',
        report: live,
        markdown: this._reportService.formatReport(live),
        followUpQuestions: this._reportService.formatFollowUpQuestions(live.followUpQuestions),
        createdAt: new Date().toISOString()
      }];
    }
    return [];
  });

  ngOnInit(): void {
    this._subscriptions.add(
      this._researchService.report$.subscribe(() => {
        this.isLoading.set(false);
      })
    );
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  /** Checks if a follow-up question has already been researched in the active session */
  getUsedEntry(question: string): ResearchEntry | null {
    const normalizedQ = question.trim().toLowerCase();
    return this.entries().find(entry => entry.query.trim().toLowerCase() === normalizedQ) || null;
  }

  onFollowUpQuestionSelected(question: string): void {
    const matched = this.getUsedEntry(question);
    if (matched) {
      // Smoothly scroll to the existing entry's report card in the thread
      const element = document.getElementById('entry-' + matched.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Trigger new deep research under the current session context
      this.isLoading.set(true);
      this._researchService.startResearch(question, this.selectedSessionId() ?? undefined);
    }
  }

  copyToClipboard(content: string): void {
    if (content) {
      navigator.clipboard.writeText(content);
    }
  }

  downloadMarkdown(query: string, content: string): void {
    if (content) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeQuery = query.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50);
      a.download = `research-report-${safeQuery}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}