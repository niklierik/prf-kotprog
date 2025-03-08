import { Component, Input } from '@angular/core';
import { Author } from './author.model';

@Component({
  selector: 'app-author',
  imports: [],
  templateUrl: './author.component.html',
  styleUrl: './author.component.scss',
})
export class AuthorComponent {
  @Input({ required: true })
  public author!: Author;
}
