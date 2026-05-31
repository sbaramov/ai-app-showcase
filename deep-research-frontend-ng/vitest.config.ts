import { defineConfig } from 'vitest/config';

// Vite plugin that intercepts templateUrl / styleUrl fetch() calls made by
// Angular's JIT compiler. When TestBed.compileComponents() fires, the JIT
// compiler calls fetch(url) for each external template/style. jsdom has no
// HTTP server, so we intercept those calls and return the file contents read
// directly from disk via Vite's module transform.
function angularTemplatePlugin() {
  return {
    name: 'angular-template-inline',
    transform(code: string, id: string) {
      if (id.endsWith('.html') || (id.endsWith('.css') && id.includes('/app/'))) {
        return {
          code: `export default ${JSON.stringify(code)}`,
          map: null,
        };
      }
    },
  };
}

export default defineConfig({
  plugins: [angularTemplatePlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    include: ['src/**/*.spec.ts'],
    isolate: false,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
});
