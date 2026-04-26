import { TestBed } from '@angular/core/testing';
import { ReportService } from './report.service';
import { ResearchReport } from './research.service';

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
    const report: ResearchReport = {
      shortSummary: 'Test summary',
      markdownReport: '## Test\nContent here',
      followUpQuestions: ['Question 1', 'Question 2']
    };
    const formatted = service.formatReport(report);
    expect(formatted).toContain('Short Summary');
    expect(formatted).toContain('Test summary');
    expect(formatted).toContain('Research Report');
    expect(formatted).toContain('Follow-up Questions');
    expect(formatted).toContain('Question 1');
  });
});