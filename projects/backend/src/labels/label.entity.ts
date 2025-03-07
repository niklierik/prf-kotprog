import { model, Schema } from 'mongoose';

export const labelSchema = new Schema({
  name: { type: String, required: true },
  color: { type: String, required: true },
});
export const Label = model('Label', labelSchema);
export type Label = InstanceType<typeof Label>;
