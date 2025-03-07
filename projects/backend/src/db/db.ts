import { config } from '../config/config.js';
import mongoose from 'mongoose';

export async function connectToDb(url?: string): Promise<void> {
  try {
    url ??= config.db.url;
    if (!url) {
      throw new Error('No MongoDB connection string was provided.');
    }
    await mongoose.connect(url);

    console.log('Connected to Database.');
  } catch (e) {
    console.error('Failed to connect to database', e);
    throw e;
  }
}
