import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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

  report: ResearchReport | null = null;
  formattedReport = '';

  ngOnInit(): void {
    this._researchService.connectReport();
    this._researchService.report$.subscribe({
      next: (report) => {
        if (report) {
          this.report = report;
          this.formattedReport = this._reportService.formatReport(report);
        }
      },
      error: (error) => {
        console.error('Report subscription error:', error);
      }
    });
  }

  ngOnDestroy(): void {
    // Subscription cleanup handled by service
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
}