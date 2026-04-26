import { Component, inject } from '@angular/core';
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

  searchForm = this._fb.nonNullable.group({
    topic: ['', [Validators.required, Validators.minLength(3)]]
  });

  isSearching = false;
  isFormSubmitted = false;

  onSubmit(): void {
    if (this.searchForm.invalid) {
      return;
    }

    this.isSearching = true;
    this.isFormSubmitted = true;

    const topic = this.searchForm.controls.topic.value;
    if (topic) {
      this._researchService.startResearch(topic);
    }
  }

  onReset(): void {
    this.searchForm.reset();
    this.isSearching = false;
    this.isFormSubmitted = false;
  }
}