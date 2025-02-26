import { Request, Response, Router } from 'express';
import { authMiddleware } from '../users/auth.middleware.js';

const healthRouter = Router();

async function health(req: Request, res: Response): Promise<void> {
  res.send('Alive');
}

healthRouter.get('/', health);

healthRouter.use(authMiddleware);

export { healthRouter };
