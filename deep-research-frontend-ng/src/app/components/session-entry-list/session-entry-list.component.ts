import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ResearchEntry } from '../../services/session.service';

@Component({
  selector: 'app-session-entry-list',
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './session-entry-list.component.html',
  styleUrl: './session-entry-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionEntryListComponent {
  readonly entries = input<ResearchEntry[]>([]);
  readonly selectedEntryId = input<string | null>(null);

  readonly entrySelected = output<ResearchEntry>();

  onSelectEntry(entry: ResearchEntry): void {
    this.entrySelected.emit(entry);
  }
}