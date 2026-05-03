import { Injectable } from '@angular/core';
import { ResearchReport } from './research.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  formatReport(report: ResearchReport): string {
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
