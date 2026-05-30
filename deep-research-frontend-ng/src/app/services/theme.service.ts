import { Injectable, inject, RendererFactory2, PLATFORM_ID, effect, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _rendererFactory = inject(RendererFactory2);
  private readonly _renderer = this._rendererFactory.createRenderer(null, null);

  private readonly _localStorageKey = 'deep-research-theme';
  private _mediaQuery: MediaQueryList | null = null;
  private _mediaListener: (() => void) | null = null;

  // Signal holding the active user selection
  readonly themeMode = signal<ThemeMode>('system');

  constructor() {
    if (isPlatformBrowser(this._platformId)) {
      // 1. Restore saved preference if any
      const saved = localStorage.getItem(this._localStorageKey) as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        this.themeMode.set(saved);
      }

      // 2. Instantiate media query listener
      this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Reactively apply the correct context-level classes whenever mode changes
      effect(() => {
        const mode = this.themeMode();
        this._updateDom(mode);
      });
    }
  }

  setTheme(mode: ThemeMode): void {
    if (isPlatformBrowser(this._platformId)) {
      localStorage.setItem(this._localStorageKey, mode);
    }
    this.themeMode.set(mode);
  }

  private _updateDom(mode: ThemeMode): void {
    if (!isPlatformBrowser(this._platformId)) return;

    // Remove any previous active listeners when resetting system updates
    this._cleanupMediaListener();

    let shouldBeDark = false;

    if (mode === 'dark') {
      shouldBeDark = true;
    } else if (mode === 'light') {
      shouldBeDark = false;
    } else {
      // 'system'
      shouldBeDark = this._mediaQuery ? this._mediaQuery.matches : false;
      this._setupMediaListener();
    }

    if (shouldBeDark) {
      this._renderer.addClass(document.body, 'dark-theme');
      this._renderer.setProperty(document.documentElement.style, 'color-scheme', 'dark');
    } else {
      this._renderer.removeClass(document.body, 'dark-theme');
      this._renderer.setProperty(document.documentElement.style, 'color-scheme', 'light');
    }
  }

  private _setupMediaListener(): void {
    if (!this._mediaQuery) return;

    this._mediaListener = () => {
      // Re-trigger DOM updates reactively when the system light/dark preference switches
      const isSystemDark = this._mediaQuery?.matches ?? false;
      if (isSystemDark) {
        this._renderer.addClass(document.body, 'dark-theme');
        this._renderer.setProperty(document.documentElement.style, 'color-scheme', 'dark');
      } else {
        this._renderer.removeClass(document.body, 'dark-theme');
        this._renderer.setProperty(document.documentElement.style, 'color-scheme', 'light');
      }
    };

    // Support both modern for-each event targets and older callback handlers
    if (this._mediaQuery.addEventListener) {
      this._mediaQuery.addEventListener('change', this._mediaListener);
    } else {
      (this._mediaQuery as any).addListener(this._mediaListener);
    }
  }

  private _cleanupMediaListener(): void {
    if (this._mediaQuery && this._mediaListener) {
      if (this._mediaQuery.removeEventListener) {
        this._mediaQuery.removeEventListener('change', this._mediaListener);
      } else {
        (this._mediaQuery as any).removeListener(this._mediaListener);
      }
      this._mediaListener = null;
    }
  }
}
