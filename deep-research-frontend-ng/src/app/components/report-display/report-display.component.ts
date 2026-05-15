import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportService } from '../../services/report.service';
import { ResearchService } from '../../services/research.service';
import { MarkdownRendererComponent } from '../markdown-renderer/markdown-renderer.component';

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
export class ReportDisplayComponent {
  private readonly _reportService = inject(ReportService);
  private readonly _researchService = inject(ResearchService);

  readonly report = toSignal(this._researchService.report$, { initialValue: null });
  readonly markdownContent = computed(() => {
    const r = this.report();
    return r ? this._reportService.formatReport(r) : '';
  });
  readonly followUpQuestions = computed(() =>
    this._reportService.formatFollowUpQuestions(this.report()?.followUpQuestions)
  );
  readonly isLoading = signal(false);

  onFollowUpQuestionSelected(question: string): void {
    this.isLoading.set(true);
    this._researchService.startResearch(question);
  }

  copyToClipboard(): void {
    const content = this.markdownContent();
    if (content) {
      navigator.clipboard.writeText(content);
    }
  }

  downloadMarkdown(): void {
    const content = this.markdownContent();
    if (this.report() && content) {
      const blob = new Blob([content], { type: 'text/markdown' });
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
}