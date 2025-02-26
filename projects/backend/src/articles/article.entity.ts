import { model, Schema } from 'mongoose';

export const commentSchema = new Schema(
  {
    text: { type: String },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const articleSchema = new Schema(
  {
    title: { type: String, required: true, default: '' },
    content: { type: String, required: true, default: '' },
    labels: [{ type: Schema.Types.ObjectId, required: true, default: [] }],
    visible: { type: Boolean, required: true, default: false },
    author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    comments: [{ type: commentSchema, required: true, default: [] }],
  },
  {
    timestamps: true,
  },
);
export const Article = model('Article', articleSchema);
export type Article = InstanceType<typeof Article>;
