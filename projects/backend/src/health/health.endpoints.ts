import { Request, Response, Router } from 'express';
import { makeEndpoint } from '../endpoint/endpoint.js';

const healthRouter = Router();

async function health(req: Request, res: Response): Promise<void> {
  res.send('Alive');
}

healthRouter.get('/', makeEndpoint(health));

export { healthRouter };
