import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Label } from '@kotprog/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-label',
  imports: [CommonModule, MatIconModule],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss',
})
export class LabelComponent {
  @Input({ required: true })
  public label!: Label;

  @Input()
  public isLink = true;

  @Input()
  public useIcon: string | undefined;

  @Output()
  public clicked: EventEmitter<Label> = new EventEmitter();

  public constructor(private readonly router: Router) {}

  public onClick(): void {
    if (this.isLink) {
      this.router.navigate(['/list'], {
        queryParams: {
          labels: this.label.id,
        },
      });
    }

    this.clicked.emit(this.label);
  }
}
