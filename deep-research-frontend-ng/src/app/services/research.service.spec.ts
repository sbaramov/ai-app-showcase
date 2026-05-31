import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { ResearchService, ResearchReport, ProgressOutputChannelEvent } from './research.service';

describe('ResearchService', () => {
  let service: ResearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResearchService],
    });
    service = TestBed.inject(ResearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial report as null', () => {
    let reportValue: ResearchReport | null = null;
    service['report$'].subscribe((v) => {
      reportValue = v;
    });
    expect(reportValue).toBeNull();
  });

  it('should have initial progress as empty array', () => {
    let progressValue: ProgressOutputChannelEvent[] | null = null;
    service['progress$'].subscribe((v) => {
      progressValue = v;
    });
    expect(progressValue).toEqual([]);
  });

  it('should have isConnected$ as BehaviorSubject', () => {
    expect(service['isConnected$']).toBeDefined();
    expect(service['isConnected$'] instanceof BehaviorSubject).toBe(true);
  });
});
