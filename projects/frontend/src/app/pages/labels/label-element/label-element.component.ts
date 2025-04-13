import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { Label } from '@kotprog/common';
import { EditLabelComponent } from '../edit-label/edit-label.component';

@Component({
  selector: 'app-label-element',
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    EditLabelComponent,
  ],
  templateUrl: './label-element.component.html',
  styleUrl: './label-element.component.scss',
})
export class LabelElementComponent {
  @Input({ required: true })
  public label!: Label;

  @Output()
  public submit: EventEmitter<Label> = new EventEmitter();

  @Output()
  public delete: EventEmitter<string> = new EventEmitter();
}
