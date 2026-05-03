import { Component, Input } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-renderer',
  imports: [
    MarkdownModule
  ],
  templateUrl: './markdown-renderer.component.html',
  styleUrl: './markdown-renderer.component.css'
})
export class MarkdownRendererComponent {
  @Input() content: string = '';

  constructor() {}
}
