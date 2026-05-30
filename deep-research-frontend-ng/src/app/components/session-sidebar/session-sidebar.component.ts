import { Component, OnInit, inject, signal, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ChangeDetectionStrategy } from '@angular/core';
import { SessionService, ResearchSessionSummary } from '../../services/session.service';
import { RenameSessionDialogComponent } from '../rename-session-dialog/rename-session-dialog.component';
import { ThemeService, ThemeMode } from '../../services/theme.service';

@Component({
  selector: 'app-session-sidebar',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
  ],
  templateUrl: './session-sidebar.component.html',
  styleUrl: './session-sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionSidebarComponent implements OnInit {
  private readonly _sessionService = inject(SessionService);
  private readonly _themeService = inject(ThemeService);
  private readonly _dialog = inject(MatDialog);

  readonly selectedSessionId = input<string | null>(null);

  readonly sessionSelected = output<string>();
  readonly newSessionRequested = output<void>();

  readonly sessions = signal<ResearchSessionSummary[]>([]);
  readonly isLoading = signal(false);
  readonly isCollapsed = signal(this._loadCollapseState());

  // Exposed theme states directly from state service
  readonly activeThemeMode = computed(() => this._themeService.themeMode());

  ngOnInit(): void {
    this._loadSessions();
  }

  toggleCollapse(): void {
    this.isCollapsed.update((v) => {
      const next = !v;
      localStorage.setItem('sidebar-collapsed', JSON.stringify(next));
      return next;
    });
  }

  onSessionClick(id: string): void {
    this.sessionSelected.emit(id);
  }

  onNewSession(): void {
    this.newSessionRequested.emit();
  }

  onRename(session: ResearchSessionSummary): void {
    const dialogRef = this._dialog.open(RenameSessionDialogComponent, {
      width: '400px',
      data: { name: session.name },
    });

    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result && result.trim()) {
        this._sessionService.renameSession(session.id, result.trim()).subscribe({
          next: () => this._loadSessions(),
          error: (err) => console.error('Failed to rename session', err),
        });
      }
    });
  }

  onRefresh(): void {
    this._loadSessions();
  }

  setThemeMode(mode: ThemeMode): void {
    this._themeService.setTheme(mode);
  }

  getThemeIcon(): string {
    const mode = this.activeThemeMode();
    if (mode === 'light') return 'light_mode';
    if (mode === 'dark') return 'dark_mode';
    return 'settings_suggest';
  }

  getThemeLabel(): string {
    const mode = this.activeThemeMode();
    if (mode === 'light') return 'Light Theme';
    if (mode === 'dark') return 'Dark Theme';
    return 'System Theme';
  }

  private _loadSessions(): void {
    this.isLoading.set(true);
    this._sessionService.listSessions().subscribe({
      next: (data) => {
        this.sessions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load sessions', err);
        this.isLoading.set(false);
      },
    });
  }

  private _loadCollapseState(): boolean {
    try {
      return JSON.parse(localStorage.getItem('sidebar-collapsed') ?? 'false');
    } catch {
      return false;
    }
  }
}
