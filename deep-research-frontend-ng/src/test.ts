import 'zone.js';
import 'zone.js/testing';
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { ɵresolveComponentResources as resolveComponentResources } from '@angular/core';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Stub window.matchMedia globally — jsdom does not implement it.
// ThemeService uses it to detect the OS dark/light preference.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Provide a fetch shim that reads component template/style files from disk.
// Angular JIT compiler calls fetch() for each templateUrl / styleUrl when
// compileComponents() is invoked. jsdom has no HTTP server so we intercept
// and serve the files directly from the source tree.
function resourceFetcher(url: string): Promise<string> {
  try {
    const pathname = url.replace(/^https?:\/\/[^/]+/, '');
    const candidates = [
      resolve(__dirname, '..', pathname.replace(/^\//, '')),
      resolve(__dirname, pathname.replace(/^\//, '')),
    ];
    for (const candidate of candidates) {
      try {
        return Promise.resolve(readFileSync(candidate, 'utf-8'));
      } catch {
        // try next candidate
      }
    }
    return Promise.resolve('');
  } catch {
    return Promise.resolve('');
  }
}

// Resolve all component resources (templateUrl / styleUrl) before any suite
// runs so that JIT compilation succeeds for external-template components.
beforeAll(async () => {
  await resolveComponentResources(resourceFetcher);
});

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
