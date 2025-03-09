import { Injectable, resource, Resource } from '@angular/core';
import { Label, ListLabelsResponse } from '@kotprog/common';
import { FetchService } from '../fetch.service';

@Injectable({ providedIn: 'root' })
export class LabelService {
  public constructor(private readonly fetchService: FetchService) {}

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
}
