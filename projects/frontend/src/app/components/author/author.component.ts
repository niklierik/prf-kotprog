import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserInfo } from '@kotprog/common';

@Component({
  selector: 'app-author',
  imports: [RouterModule, CommonModule],
  templateUrl: './author.component.html',
  styleUrl: './author.component.scss',
})
export class AuthorComponent {
  @Input({ required: true })
  public author!: UserInfo;

  @Input()
  public clickable = true;

  public constructor(private readonly router: Router) {}

  public onClick(): void {
    if (!this.clickable) {
      return;
    }
    this.router.navigate(['/list'], {
      queryParams: {
        author: this.author.id,
      },
    });
  }
}
