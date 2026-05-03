import { TestBed } from '@angular/core/testing';
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

  it('can instantiate service', () => {
    expect(service).toBeTruthy();
  });

  it('formats report with merged summary', () => {
    const report: ResearchReport = {
      shortSummary: 'This is a summary.',
      markdownReport: '# Detailed Report\nThis is the report content.',
      followUpQuestions: ['Question 1', 'Question 2']
    };

    const formatted = service.formatReport(report);
    expect(formatted).toContain('This is a summary.');
    expect(formatted).toContain('# Detailed Report');
    expect(formatted).toContain('---');
    expect(formatted).not.toContain('### Short Summary');
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
