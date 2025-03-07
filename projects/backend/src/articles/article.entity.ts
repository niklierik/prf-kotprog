import { model, Schema } from 'mongoose';

export const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: String, ref: 'User', required: true },
  },
  { timestamps: true },
);
export interface Comment {
  text: string;
  author: string;
}

const discriminatorKey = 'type';

export const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      default: '',
    },
    labels: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        default: [],
        ref: 'Label',
      },
    ],
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },
    author: {
      type: String,
      required: true,
      ref: 'User',
    },
    comments: [
      {
        type: commentSchema,
        required: true,
        default: [],
      },
    ],
  },
  { discriminatorKey, timestamps: true },
);

export const Article = model('Article', articleSchema);

export const openArticleSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      default: '',
    },
  },
  {
    discriminatorKey,
    timestamps: true,
  },
);
export const closedArticleSchema = new Schema(
  {
    openContent: {
      type: String,
      required: true,
      default: '',
    },
    closedContent: {
      type: String,
      required: true,
      default: '',
    },
  },
  {
    discriminatorKey,
    timestamps: true,
  },
);

export const OpenArticle = Article.discriminator('open', openArticleSchema);
export const ClosedArticle = Article.discriminator(
  'closed',
  closedArticleSchema,
);

export type OpenArticle = InstanceType<typeof OpenArticle> & { type: 'open' };
export type ClosedArticle = InstanceType<typeof ClosedArticle> & {
  type: 'closed';
};
export type Article = OpenArticle | ClosedArticle;
