// Angular Component Template
// Use this as a starting point for new components

import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-{component-name}',
  standalone: true,
  imports: [],
  template: `
    <div class="{component-name}-container">
      <!-- Component content -->
    </div>
  `,
  styles: [`
    .{component-name}-container {
      /* Styles */
    }
  `]
})
export class {ComponentName}Component implements OnInit, OnDestroy {
  // Inputs
  @Input() data!: unknown;

  // Outputs
  @Output() action = new EventEmitter<void>();

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Methods
  onAction(): void {
    this.action.emit();
  }
}
