import { Request, Response, Router } from 'express';

const healthRouter = Router();

async function health(req: Request, res: Response): Promise<void> {
  res.send('Alive');
}

healthRouter.get('/', health);

export { healthRouter };
