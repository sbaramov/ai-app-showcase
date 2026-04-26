// Angular Test Setup Configuration
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Common test module setup
export function configureTestModule(config: {
  declarations?: any[];
  imports?: any[];
  providers?: any[];
}) {
  return TestBed.configureTestingModule({
    declarations: config.declarations || [],
    imports: [
      HttpClientTestingModule,
      RouterTestingModule,
      NoopAnimationsModule,
      ...(config.imports || [])
    ],
    providers: config.providers || []
  });
}

// Mock service factory
export function createMockService<T>(service: new (...args: any[]) => T, overrides: Partial<T> = {}): T {
  const mock = {} as T;
  const prototype = service.prototype;
  
  Object.getOwnPropertyNames(prototype).forEach(method => {
    if (typeof prototype[method] === 'function') {
      (mock as any)[method] = jasmine.createSpy(method);
    }
  });
  
  return { ...mock, ...overrides };
}
