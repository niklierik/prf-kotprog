import { UserInfo } from '../auth/user-info.js';
import { Label } from '../label/label.model.js';

export interface ArticleInfo {
  id: string;
  title: string;
  author: UserInfo;
  type: 'open' | 'closed';
  visible: boolean;
  labels: Label[];
  mainImage: string | undefined;
  createdAt: string;
  updatedAt: string;
}
