import { ObjectId } from 'mongodb';
import { model, PipelineStage, Schema } from 'mongoose';
import { ScoredArticle } from './article.endpoints.js';

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
  createdAt: Date | string;
  updatedAt: Date | string;
}

const discriminatorKey = 'type';

export const articleSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
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
    mainImage: {
      type: String,
      required: false,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
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
export type Article = (
  | (OpenArticle & { type: 'open' })
  | (ClosedArticle & { type: 'closed' })
) &
  InstanceType<typeof Article>;

export async function getScoredArticleList({
  user,
  author,
  start,
  limit,
  labels,
  dateDiffModifier,
  viewsModifier,
  randomModifier,
}: {
  user?: string;
  author?: string;
  start?: number;
  limit?: number;
  labels?: string[];
  dateDiffModifier?: number;
  viewsModifier?: number;
  randomModifier?: number;
}): Promise<ScoredArticle[]> {
  start ??= 0;
  limit ??= 20;
  labels ??= [];
  dateDiffModifier ??= 100;
  viewsModifier ??= 100;
  randomModifier ??= 2;

  let pipeline: PipelineStage[] = [
    {
      $addFields: {
        score: {
          $add: [
            {
              $divide: [
                dateDiffModifier,
                {
                  $dateDiff: {
                    startDate: '$createdAt',
                    endDate: '$$NOW',
                    unit: 'hour',
                  },
                },
              ],
            },
            {
              $divide: ['$views', viewsModifier],
            },
            {
              $multiply: [{ $rand: {} }, randomModifier],
            },
          ],
        },
      },
    },
    {
      $sort: {
        score: -1,
      },
    },
    {
      $skip: start,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author_temp',
      },
    },
    {
      $addFields: {
        author: {
          $first: '$author_temp',
        },
      },
    },
    {
      $unset: 'author_temp',
    },
    {
      $lookup: {
        from: 'labels',
        localField: 'labels',
        foreignField: '_id',
        as: 'labels',
      },
    },
  ];
  if (user) {
    pipeline = [
      {
        $match: {
          $or: [
            {
              visible: true,
            },
            {
              author: user,
            },
          ],
        },
      },
      ...pipeline,
    ];
  }
  if (author) {
    pipeline = [
      {
        $match: {
          author: user,
        },
      },
      ...pipeline,
    ];
  }
  if (labels?.length) {
    pipeline = [
      {
        $addFields: {
          searchedLabels: {
            $setIntersection: [
              '$labels',
              labels.map((label) => new ObjectId(label)),
            ],
          },
        },
      },
      {
        $match: {
          searchedLabels: {
            $ne: {
              $size: 0,
            },
          },
        },
      },
      ...pipeline,
    ];
  }
  const articles = await Article.aggregate(pipeline);
  return articles;
}
