import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportService } from '../../services/report.service';
import { ResearchService, ResearchReport } from '../../services/research.service';
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
export class ReportDisplayComponent implements OnInit, OnDestroy {
  private readonly _reportService = inject(ReportService);
  private readonly _researchService = inject(ResearchService);

  report: ResearchReport | null = null;
  markdownContent = '';
  followUpQuestions: string[] = [];
  isLoading = false;

  ngOnInit(): void {
    this._researchService.report$.subscribe({
      next: (report) => {
        if (report) {
          this.report = report;
          const summary = this._reportService.formatReport(report);
          this.markdownContent = summary;
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

  onFollowUpQuestionSelected(question: string): void {
    this.isLoading = true;
    this._researchService.startResearch(question);
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
}