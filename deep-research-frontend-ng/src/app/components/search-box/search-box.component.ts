import {Component, inject, signal, input, effect} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ResearchService } from '../../services/research.service';

@Component({
  selector: 'app-search-box',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css'
})
export class SearchBoxComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _researchService = inject(ResearchService);

  readonly sessionId = input<string | null>(null);

  searchForm = this._fb.nonNullable.group({
    topic: ['', [Validators.required, Validators.minLength(3)]]
  });

  readonly isSearching = toSignal(this._researchService.isSearching$, { initialValue: false });
  isFormSubmitted = signal(false);

  constructor() {
    effect(() => {
      if (this.isSearching()) {
        this.searchForm.controls.topic.disable();
      } else {
        this.searchForm.controls.topic.enable();
      }
    });
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      return;
    }

    this.isFormSubmitted.set(true);

    const topic = this.searchForm.controls.topic.value;
    if (topic) {
      this._researchService.startResearch(topic, this.sessionId() ?? undefined);
    }
  }

  onReset(): void {
    // TODO Call the server and reset/delete search
    this.searchForm.reset();
    this.isFormSubmitted.set(false);
  }
}
