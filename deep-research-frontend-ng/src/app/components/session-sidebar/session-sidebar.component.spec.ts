import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SessionSidebarComponent } from './session-sidebar.component';
import { SessionService } from '../../services/session.service';
import { ThemeService } from '../../services/theme.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { signal } from '@angular/core';

describe('SessionSidebarComponent', () => {
  let component: SessionSidebarComponent;
  let fixture: ComponentFixture<SessionSidebarComponent>;

  let mockSessionService: any;
  let mockThemeService: any;
  let mockDialog: any;

  beforeEach(async () => {
    mockSessionService = {
      listSessions: vi.fn(() => of([])),
      renameSession: vi.fn(() => of(undefined)),
    };

    mockThemeService = {
      themeMode: signal('system'),
      setTheme: vi.fn(),
    };

    mockDialog = {
      open: vi.fn(() => ({
        afterClosed: () => of(undefined),
      })),
    };

    TestBed.overrideComponent(SessionSidebarComponent, {
      set: {
        templateUrl: '',
        template: '<div class="sidebar-expanded"></div>',
        styleUrl: '',
        styleUrls: [],
        styles: []
      }
    });

    await TestBed.configureTestingModule({
      imports: [SessionSidebarComponent],
      providers: [
        provideAnimationsAsync(),
        { provide: SessionService, useValue: mockSessionService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create sidebar', () => {
    expect(component).toBeTruthy();
  });

  it('should call theme settings updating', () => {
    component.setThemeMode('dark');
    expect(mockThemeService.setTheme).toHaveBeenCalledWith('dark');
  });

  it('should return matching theme labels and icons', () => {
    mockThemeService.themeMode.set('light');
    expect(component.getThemeIcon()).toBe('light_mode');
    expect(component.getThemeLabel()).toBe('Light Theme');

    mockThemeService.themeMode.set('dark');
    expect(component.getThemeIcon()).toBe('dark_mode');
    expect(component.getThemeLabel()).toBe('Dark Theme');

    mockThemeService.themeMode.set('system');
    expect(component.getThemeIcon()).toBe('settings_suggest');
    expect(component.getThemeLabel()).toBe('System Theme');
  });

  describe('Date Grouping & Pinned Logic', () => {
    it('should group unpinned sessions by date correctly', () => {
      const nowMs = Date.now();
      const mockSessions: any[] = [
        { id: '1', name: 'Today Session', pinned: false, createdAt: new Date(nowMs).toISOString() },
        { id: '2', name: 'Yesterday Session', pinned: false, createdAt: new Date(nowMs - 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', name: 'Past Week Session', pinned: false, createdAt: new Date(nowMs - 4 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '4', name: 'Past Month Session', pinned: false, createdAt: new Date(nowMs - 15 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '5', name: 'Old Session', pinned: false, createdAt: new Date(nowMs - 60 * 24 * 60 * 60 * 1000).toISOString() }
      ];

      component.sessions.set(mockSessions);
      const grouped = component.groupedSessions();

      expect(grouped.length).toBe(5);
      expect(grouped[0].label).toBe('Today');
      expect(grouped[0].sessions[0].id).toBe('1');
      expect(grouped[1].label).toBe('Yesterday');
      expect(grouped[1].sessions[0].id).toBe('2');
      expect(grouped[2].label).toBe('Past Week');
      expect(grouped[2].sessions[0].id).toBe('3');
      expect(grouped[3].label).toBe('Past Month');
      expect(grouped[3].sessions[0].id).toBe('4');
      expect(grouped[4].label).toBe('Old');
      expect(grouped[4].sessions[0].id).toBe('5');
    });

    it('should put pinned sessions in a Pinned group at the top', () => {
      const nowMs = Date.now();
      const mockSessions: any[] = [
        { id: '1', name: 'Today Session', pinned: false, createdAt: new Date(nowMs).toISOString() },
        { id: '2', name: 'Pinned Session', pinned: true, createdAt: new Date(nowMs - 60 * 24 * 60 * 60 * 1000).toISOString() }
      ];

      component.sessions.set(mockSessions);
      const grouped = component.groupedSessions();

      expect(grouped.length).toBe(2);
      expect(grouped[0].label).toBe('Pinned');
      expect(grouped[0].sessions[0].id).toBe('2');
      expect(grouped[1].label).toBe('Today');
      expect(grouped[1].sessions[0].id).toBe('1');
    });

    it('should toggle group collapse state', () => {
      component.toggleGroup('Today');
      expect(component.activeCollapsedGroups()['Today']).toBe(true);

      component.toggleGroup('Today');
      expect(component.activeCollapsedGroups()['Today']).toBe(false);
    });
  });
});
