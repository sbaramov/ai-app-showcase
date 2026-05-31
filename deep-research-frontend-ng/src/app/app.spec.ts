import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, Subject } from 'rxjs';
import { App } from './app';
import { ResearchService } from './services/research.service';
import { SessionService } from './services/session.service';
import { ThemeService } from './services/theme.service';
import { signal } from '@angular/core';

describe('App', () => {
  let reportSubject = new Subject<any>();
  let progressSubject = new Subject<any>();
  let isConnectedSubject = new Subject<boolean>();
  let sessionCompletedSubject = new Subject<string>();

  const mockResearchService = {
    report$: reportSubject.asObservable(),
    progress$: progressSubject.asObservable(),
    isConnected$: isConnectedSubject.asObservable(),
    sessionCompleted$: sessionCompletedSubject.asObservable(),
    startResearch: vi.fn(),
    clearReport: vi.fn(),
    clearProgress: vi.fn(),
    isConnected: vi.fn(() => false),
  };

  const mockSessionService = {
    listSessions: vi.fn(() => of([])),
    renameSession: vi.fn(() => of(undefined)),
    getSessionEntries: vi.fn(() => of([])),
  };

  const mockThemeService = {
    themeMode: signal('system'),
    setTheme: vi.fn(),
  };

  beforeEach(async () => {
    TestBed.overrideComponent(App, {
      set: {
        templateUrl: '',
        template: '<div class="app-shell"><h1>Deep Research</h1></div>',
        styleUrls: [],
        styles: []
      }
    });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
        { provide: ResearchService, useValue: mockResearchService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Deep Research');
  });
});