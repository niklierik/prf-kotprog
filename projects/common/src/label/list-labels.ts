export interface ListLabelsResponse {
  labels: ListLabelElement[];
}

export interface ListLabelElement {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
}
