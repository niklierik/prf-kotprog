import { Injectable, resource, Resource } from '@angular/core';
import {
  CreateLabelRequest,
  Label,
  ListLabelsResponse,
  UpdateLabelRequest,
} from '@kotprog/common';
import { FetchService } from '../fetch.service';

@Injectable({ providedIn: 'root' })
export class LabelService {
  public constructor(private readonly fetchService: FetchService) {}

  public async createLabel({
    name,
    backgroundColor,
    textColor,
  }: CreateLabelRequest): Promise<void> {
    await this.fetchService.fetch(
      `/api/label`,
      {
        method: 'POST',
        body: JSON.stringify({ name, backgroundColor, textColor }),
      },
      () => {},
    );
  }

  public async updateLabel(
    id: string,
    { name, backgroundColor, textColor }: UpdateLabelRequest,
  ): Promise<void> {
    await this.fetchService.fetch(
      `/api/label/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ name, backgroundColor, textColor }),
      },
      () => {},
    );
  }

  public async listLabels(): Promise<ListLabelsResponse> {
    const labels = await this.fetchService.fetch<ListLabelsResponse>(
      '/api/label',
      {
        method: 'GET',
      },
    );
    return labels;
  }

  public listLabelsResource(): Resource<Label[] | undefined> {
    return resource({
      loader: async () => {
        const response = await this.listLabels();
        return response?.labels ?? [];
      },
    });
  }

  public async deleteLabel(id: string): Promise<void> {
    if (!id) {
      return;
    }

    await this.fetchService.fetch(
      `/api/label/${id}`,
      { method: 'DELETE' },
      () => {},
    );
  }
}
