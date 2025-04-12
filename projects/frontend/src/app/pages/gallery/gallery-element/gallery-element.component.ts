import {
  Component,
  Input,
  Resource,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ReadFileInfoResponse } from '@kotprog/common';
import { FilesService } from '../../../services/files/files.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-gallery-element',
  imports: [MatButtonModule, MatSnackBarModule],
  templateUrl: './gallery-element.component.html',
  styleUrl: './gallery-element.component.scss',
})
export class GalleryElementComponent {
  @Input()
  public image!: ReadFileInfoResponse;

  @Input()
  public filesResource?: Resource<unknown>;

  public isLoading: WritableSignal<boolean>;

  public error: WritableSignal<unknown>;

  public constructor(
    private readonly filesService: FilesService,
    private readonly snackbar: MatSnackBar,
  ) {
    this.isLoading = signal(false);
    this.error = signal(undefined);
  }

  public async onCopyLink(): Promise<void> {
    const id = this.image.id;
    const url = `${window.location.origin}/api/file/${id}`;

    await navigator.clipboard.writeText(url);

    this.snackbar.open('Link copied.', 'Ok', { duration: 500 });
  }

  public async onDelete(): Promise<void> {
    try {
      this.error.set(undefined);
      this.isLoading.set(true);

      await this.filesService.delete(this.image.id);
      this.filesResource?.reload();
    } catch (error) {
      this.error.set(error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
