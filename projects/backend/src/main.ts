import './express/request.js';

import express, { json, Router } from 'express';
import { config } from './config/config.js';
import { authRouter } from './users/auth.endpoints.js';
import { connectToDb } from './db/db.js';
import { healthRouter } from './health/health.endpoints.js';
import { errorHandlerMiddleware } from './errors/error-handler.middleware.js';
import { labelRouter } from './labels/label.endpoints.js';
import { articleRouter } from './articles/article.endpoints.js';
import { fileRouter } from './files/file.endpoints.js';
import { seedSuperAdmin } from './users/user.entity.js';
import { seedDb, shouldSeedDb } from './seed-db.js';

await connectToDb();

const app = express();

await seedSuperAdmin();

const seedNeeded = await shouldSeedDb();
if (seedNeeded) {
  seedDb().catch((e) => console.error('Failed to seed DB.', e));
}

// we don't want to use json() parser in every route, so we register the /api/file endpoint separately
app.use('/api/file', fileRouter);
app.use('/api/article', articleRouter);

const apiRouter = Router();

apiRouter.use(json());

apiRouter.use('/auth', authRouter);
apiRouter.use('/health', healthRouter);
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
