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
});
