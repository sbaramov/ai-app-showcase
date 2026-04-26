import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ResearchService, ProgressOutputChannelEvent } from '../../services/research.service';

@Component({
  selector: 'app-progress-indicator',
  imports: [CommonModule, MatButtonModule, MatProgressBarModule, MatListModule, MatIconModule],
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.css'
})
export class ProgressIndicatorComponent implements OnInit, OnDestroy {
  private readonly _researchService = inject(ResearchService);

  progressMessages: ProgressOutputChannelEvent[] = [];
  progressValue = 0;

  ngOnInit(): void {
    this._researchService.connectProgress();
    this._researchService.progress$.subscribe({
      next: (messages) => {
        if (messages.length > 0) {
          const latest = messages[messages.length - 1];
          this.progressMessages = [latest, ...this.progressMessages].slice(0, 20);
          this.progressValue = Math.min(this.progressValue + 5, 100);
        }
      },
      error: (error) => {
        console.error('Progress subscription error:', error);
      }
    });
  }

  ngOnDestroy(): void {
    // Subscription cleanup handled by service
  }

  clearProgress(): void {
    this.progressMessages = [];
    this.progressValue = 0;
  }
}