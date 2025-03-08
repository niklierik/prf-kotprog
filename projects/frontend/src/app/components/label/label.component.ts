import { Component, Input } from '@angular/core';
import { Label } from '@kotprog/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-label',
  imports: [CommonModule],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss',
})
export class LabelComponent {
  @Input({ required: true })
  public label!: Label;

  public constructor(private readonly router: Router) {}

  public async onClick(): Promise<void> {
    await this.router.navigate(['']);
  }
}
