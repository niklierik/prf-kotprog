import {
  Component,
  computed,
  resource,
  Resource,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import { ListUserFilesResponse, ReadFileInfoResponse } from '@kotprog/common';
import { FilesService } from '../../services/files/files.service';
import { GalleryElementComponent } from './gallery-element/gallery-element.component';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FileUploadComponent } from '../../components/file-upload/file-upload.component';

@Component({
  selector: 'app-gallery',
  imports: [
    GalleryElementComponent,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    FileUploadComponent,
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent {
  public readonly filesResource: Resource<ListUserFilesResponse | undefined>;

  public readonly page: Signal<number>;
  public readonly size: Signal<number>;

  public readonly files: Signal<ReadFileInfoResponse[]>;
  public readonly count: Signal<number>;

  public readonly error: WritableSignal<unknown>;
  public readonly isLoading: WritableSignal<boolean>;

  public constructor(
    private readonly filesService: FilesService,
    private readonly router: Router,
    activatedRoute: ActivatedRoute,
  ) {
    this.error = signal(undefined);
    this.isLoading = signal(false);

    const query = toSignal(activatedRoute.queryParams, { initialValue: {} });

    this.page = computed(() => Number(query()['page'] || '0'));
    this.size = computed(() => Number(query()['pageSize'] || '5'));

    this.filesResource = resource({
      request: () => ({ page: this.page(), size: this.size() }),
      loader: async ({ request }) => {
        const { page, size } = request;

        const { files, count } = await filesService.listFileInfos({
          page,
          size,
        });

        return { files, count };
      },
    });

    this.files = computed(() => this.filesResource.value()?.files ?? []);
    this.count = computed(() => this.filesResource.value()?.count ?? 0);
  }

  public async uploadImage(file: File): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(undefined);

      await this.filesService.uploadFile(file);

      this.filesResource.reload();
    } catch (error) {
      this.error.set(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public async onPage(event: PageEvent): Promise<void> {
    await this.router.navigate([], {
      queryParams: {
        page: event.pageIndex,
        pageSize: event.pageSize,
      },
    });

    this.filesResource.reload();
  }
}
