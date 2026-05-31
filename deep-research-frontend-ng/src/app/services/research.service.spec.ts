import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable } from 'rxjs';
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

  // isConnected$ is intentionally exposed as a plain Observable (via
  // BehaviorSubject.asObservable()) to prevent consumers from calling .next()
  // directly. Assert the public contract: it is an Observable that emits a
  // boolean and starts with false.
  it('isConnected$ is an Observable with initial value false', () => {
    expect(service['isConnected$']).toBeInstanceOf(Observable);
    let value: boolean | undefined;
    service['isConnected$'].subscribe((v) => (value = v));
    expect(value).toBe(false);
  });
});
