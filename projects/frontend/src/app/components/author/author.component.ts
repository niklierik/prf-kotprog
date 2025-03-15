import { Component, Input } from '@angular/core';
import { UserInfo } from './user-info.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-author',
  imports: [RouterModule],
  templateUrl: './author.component.html',
  styleUrl: './author.component.scss',
})
export class AuthorComponent {
  @Input({ required: true })
  public author!: UserInfo;

  public constructor(private readonly router: Router) {}

  public onClick(): void {
    this.router.navigate(['/list'], {
      queryParams: {
        author: this.author.id,
      },
    });
  }
}
