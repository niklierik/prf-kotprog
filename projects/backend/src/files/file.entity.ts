import { model, Schema } from 'mongoose';

export const fileSchema = new Schema(
  {
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    data: { type: Buffer, required: true },
    owner: { type: String, required: true, ref: 'User' },
    size: { type: Number, required: true },
  },
  { timestamps: true },
);

export const File = model('File', fileSchema);
export type File = InstanceType<typeof File>;
