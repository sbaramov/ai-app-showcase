import { Injectable } from '@angular/core';
import { ResearchReport } from './research.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
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
}