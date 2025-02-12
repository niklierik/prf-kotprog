import { Schema, model } from 'mongoose';

export const userSchema = new Schema({
  _id: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export const User = model('User', userSchema);
