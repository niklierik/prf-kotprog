import { Request, Response, Router } from 'express';

const userRouter = Router();

async function modifyUser(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

async function readUser(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

async function list(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

async function deleteUser(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

userRouter.patch('/:id', modifyUser);
userRouter.get('/:id', readUser);
userRouter.get('/', list);
userRouter.delete('/:id', deleteUser);

export { userRouter };
