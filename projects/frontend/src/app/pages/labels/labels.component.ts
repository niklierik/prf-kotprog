import { Component, Resource, signal, WritableSignal } from '@angular/core';
import { Label } from '@kotprog/common';
import { LabelService } from '../../services/labels/label.service';
import { LabelElementComponent } from './label-element/label-element.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EditLabelComponent } from './edit-label/edit-label.component';

@Component({
  selector: 'app-labels',
  imports: [LabelElementComponent, MatSnackBarModule, EditLabelComponent],
  templateUrl: './labels.component.html',
  styleUrl: './labels.component.scss',
})
export class LabelsComponent {
  public readonly labelsResource: Resource<Label[] | undefined>;

  public readonly isLoading: WritableSignal<boolean>;

  public constructor(
    private readonly snackbar: MatSnackBar,
    private readonly labelService: LabelService,
  ) {
    this.labelsResource = labelService.listLabelsResource();
    this.isLoading = signal(false);
  }

  public async create(label: Label): Promise<void> {
    try {
      if (!label.name || !label.backgroundColor || !label.textColor) {
        return;
      }

      this.snackbar.dismiss();
      this.isLoading.set(true);

      await this.labelService.createLabel(label);

      this.labelsResource.reload();
    } catch (error) {
      this.snackbar.open(String(error), 'Close');
    } finally {
      this.isLoading.set(false);
    }
  }

  public async edit(label: Label): Promise<void> {
    try {
      if (
        !label.id ||
        !label.name ||
        !label.backgroundColor ||
        !label.textColor
      ) {
        return;
      }

      this.snackbar.dismiss();
      this.isLoading.set(true);

      await this.labelService.updateLabel(label.id, label);

      this.labelsResource.reload();
    } catch (error) {
      this.snackbar.open(String(error), 'Close');
    } finally {
      this.isLoading.set(false);
    }
  }

  public async deleteLabel(id: string): Promise<void> {
    try {
      if (!id) {
        return;
      }

      await this.labelService.deleteLabel(id);

      this.labelsResource.reload();
    } catch (error) {
      this.snackbar.open(String(error), 'Close');
    }
  }
}
