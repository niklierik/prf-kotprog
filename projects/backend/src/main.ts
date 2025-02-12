import express, { Router } from 'express';
import { config } from './config/config.js';
import { authRouter } from './users/auth.js';
import { connectToDb } from './db/db.js';

await connectToDb();

const app = express();
app.use(express.json());

const apiRouter = Router();
apiRouter.use('/auth', authRouter);

app.use('/api', apiRouter);

app.listen(config.app.port, (error) => {
  if (error) {
    console.error('Express App Error:', error);
    return;
  }

  console.log('Express App initialized.');
});
