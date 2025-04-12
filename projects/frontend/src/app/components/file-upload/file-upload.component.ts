import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-file-upload',
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss',
})
export class FileUploadComponent {
  @Input()
  public accept: string | undefined;

  @Input()
  public disabled: boolean = false;

  @Output()
  public upload: EventEmitter<File> = new EventEmitter();

  public readonly selectedFile: WritableSignal<File | undefined>;

  public constructor() {
    this.selectedFile = signal(undefined);
  }

  public onFileChange({ target }: Event): void {
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (!target.files?.length) {
      return;
    }

    const file = target.files[0];

    this.selectedFile.set(file);
  }

  public uploadFile(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }

    this.upload.emit(file);
  }
}
