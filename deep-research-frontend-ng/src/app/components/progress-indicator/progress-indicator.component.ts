import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ResearchService } from '../../services/research.service';

@Component({
  selector: 'app-progress-indicator',
  imports: [CommonModule, MatButtonModule, MatProgressBarModule, MatListModule, MatIconModule],
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.css'
})
export class ProgressIndicatorComponent {
  private readonly _researchService = inject(ResearchService);

  readonly progressMessages = toSignal(this._researchService.progress$, { initialValue: [] });
  readonly progressValue = computed(() => Math.min(this.progressMessages().length * 5, 100));

  clearProgress(): void {
    this._researchService.clearProgress();
  }
}