import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  Signal,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Label } from '@kotprog/common';
import { ColorPickerDirective } from 'ngx-color-picker';
import { LabelComponent } from '../../../components/label/label.component';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { LabelService } from '../../../services/labels/label.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-label',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ColorPickerDirective,
    LabelComponent,
  ],
  templateUrl: './edit-label.component.html',
  styleUrl: './edit-label.component.scss',
})
export class EditLabelComponent implements OnInit {
  @Input('label')
  public initLabel?: Label;

  @Input()
  public showDelete: boolean = false;

  @Output()
  public readonly submit: EventEmitter<Label> = new EventEmitter();

  @Output()
  public readonly delete: EventEmitter<string> = new EventEmitter();

  public readonly id = signal('');

  public readonly nameControl = new FormControl<string>('Label', [
    Validators.required,
  ]);

  public readonly name: Signal<string | null | undefined> = toSignal(
    this.nameControl.valueChanges,
    { initialValue: 'Label' },
  );
  public readonly backgroundColor = signal('#fff');
  public readonly textColor = signal('#000');

  public readonly internalLabel: Signal<Label> = computed(() => ({
    id: this.id(),
    backgroundColor: this.backgroundColor(),
    name: this.name() || '',
    textColor: this.textColor(),
  }));

  public constructor() {}

  public ngOnInit(): void {
    if (this.initLabel) {
      this.id.set(this.initLabel.id);

      this.nameControl.setValue(this.initLabel.name);

      this.textColor.set(this.initLabel.textColor);
      this.backgroundColor.set(this.initLabel.backgroundColor);
    }
  }

  public onSubmit(): void {
    const label = this.internalLabel();
    if (!label) {
      return;
    }

    this.submit.emit(label);
  }

  public onDelete(): void {
    const id = this.internalLabel()?.id;
    if (!id) {
      return;
    }

    this.delete.emit(id);
  }
}
