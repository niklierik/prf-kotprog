import { config } from '../config/config.js';
import mongoose from 'mongoose';

export async function connectToDb(): Promise<void> {
  try {
    await mongoose.connect(config.db.url);

    console.log('Connected to Database.');
  } catch (e) {
    console.error('Failed to connect to database', e);
    throw e;
  }
}
