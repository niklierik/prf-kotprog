import { UserInfo } from '../auth/user-info.js';

export interface FindArticleResponse {
  id: string;
  title: string;
  author: UserInfo;
  type: 'open' | 'closed';
  visible: boolean;
  labels: LabelInfo[];
}

export interface LabelInfo {
  id: string;
  name: string;
  color: string;
}
