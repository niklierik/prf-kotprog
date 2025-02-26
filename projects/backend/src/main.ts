import './express/request.js';

import express, { Router } from 'express';
import { config } from './config/config.js';
import { authRouter } from './users/auth.endpoints.js';
import { connectToDb } from './db/db.js';
import { healthRouter } from './health/health.endpoints.js';
import { errorHandlerMiddleware } from './errors/error-handler.middleware.js';
import { labelRouter } from './labels/label.endpoints.js';
import { articleRouter } from './articles/article.endpoints.js';

await connectToDb();

const app = express();
app.use(express.json());

const apiRouter = Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/health', healthRouter);
apiRouter.use('/article', articleRouter);
apiRouter.use('/label', labelRouter);

app.use('/api', apiRouter);

app.use(errorHandlerMiddleware);

app.listen(config.app.port, (error) => {
  if (error) {
    console.error('Express App Error:', error);
    return;
  }

  console.log('Express App initialized.');
});
