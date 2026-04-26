import { Component, signal } from '@angular/core';
import { SearchBoxComponent } from './components/search-box/search-box.component';
import { ProgressIndicatorComponent } from './components/progress-indicator/progress-indicator.component';
import { ReportDisplayComponent } from './components/report-display/report-display.component';

@Component({
  selector: 'app-root',
  imports: [
    SearchBoxComponent,
    ProgressIndicatorComponent,
    ReportDisplayComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Deep Research');
}