import { Request, Response, Router } from 'express';
import { createAuthMiddleware } from './auth.middleware.js';
import { PermissionLevel } from './permission-level.js';

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

async function updateAvatar(req: Request, res: Response): Promise<void> {
  res.status(201);
  res.send();
}

async function getAvatar(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

async function deleteAvatar(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

userRouter.patch('/:id', modifyUser);
userRouter.get('/:id', readUser);
userRouter.get('/', list);
userRouter.delete('/:id', deleteUser);

userRouter.post('/:id/avatar', updateAvatar);
userRouter.get('/:id/avatar', getAvatar);
userRouter.delete('/:id/avatar', deleteAvatar);

userRouter.use(createAuthMiddleware(PermissionLevel.USER));

export { userRouter };
