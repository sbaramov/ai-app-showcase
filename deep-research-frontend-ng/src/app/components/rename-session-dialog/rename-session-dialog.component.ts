import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChangeDetectionStrategy } from '@angular/core';

export interface RenameSessionDialogData {
  name: string;
}

@Component({
  selector: 'app-rename-session-dialog',
  imports: [
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './rename-session-dialog.component.html',
  styleUrl: './rename-session-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameSessionDialogComponent {
  readonly dialogRef = inject(MatDialogRef<RenameSessionDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as RenameSessionDialogData;

  newName = this.data.name;

  onCancel(): void {
    this.dialogRef.close(undefined);
  }

  onConfirm(): void {
    if (this.newName.trim()) {
      this.dialogRef.close(this.newName.trim());
    }
  }
}