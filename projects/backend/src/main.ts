import express, { Router } from 'express';
import { config } from './config/config.js';
import { authRouter } from './users/auth.endpoints.js';
import { connectToDb } from './db/db.js';
import { healthRouter } from './health/health.endpoints.js';

await connectToDb();

const app = express();
app.use(express.json());

const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/health', healthRouter);

app.use('/api', apiRouter);

app.listen(config.app.port, (error) => {
  if (error) {
    console.error('Express App Error:', error);
    return;
  }

  console.log('Express App initialized.');
});
