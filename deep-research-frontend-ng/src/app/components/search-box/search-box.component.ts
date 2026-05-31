import {Component, inject, OnInit, signal, input} from '@angular/core';
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
export class SearchBoxComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _researchService = inject(ResearchService);

  readonly sessionId = input<string | null>(null);

  searchForm = this._fb.nonNullable.group({
    topic: ['', [Validators.required, Validators.minLength(3)]]
  });

  isSearching = signal(false);
  isFormSubmitted = signal(false);

  ngOnInit(): void {
    // handle search complete
    this._researchService.report$.subscribe((v) => {
      this.isSearching.set(false)
    })
  }

  onSubmit(): void {
    if (this.searchForm.invalid) {
      return;
    }

    this.isSearching.set(true);
    this.isFormSubmitted.set(true);

    const topic = this.searchForm.controls.topic.value;
    if (topic) {
      this._researchService.startResearch(topic, this.sessionId() ?? undefined);
    }
  }

  onReset(): void {
    // TODO Call the server and reset/delete search
    this.searchForm.reset();
    this.isSearching.set(false);
    this.isFormSubmitted.set(false);
  }
}
