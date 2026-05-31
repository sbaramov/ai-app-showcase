import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService, ThemeMode } from './theme.service';

declare var global: any;

describe('ThemeService', () => {
  let service: ThemeService;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    mockLocalStorage = {};

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockLocalStorage[key] = val;
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {};
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      length: 0,
      key: vi.fn(() => null),
    };

    // Mock matchMedia for system preference detection
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        {
          provide: PLATFORM_ID,
          useValue: 'browser',
        },
      ],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with system settings if no localstorage preferences exist', () => {
    expect(service.themeMode()).toBe('system');
  });

  it('should restore saved theme preferences from localstorage', () => {
    mockLocalStorage['deep-research-theme'] = 'dark';
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        {
          provide: PLATFORM_ID,
          useValue: 'browser',
        },
      ],
    });
    const newService = TestBed.inject(ThemeService);
    expect(newService.themeMode()).toBe('dark');
  });

  it('should write selected preferences to localstorage on switch', () => {
    service.setTheme('light');
    expect(service.themeMode()).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'deep-research-theme',
      'light'
    );
  });
});
