import { Request, Response, Router } from 'express';
import { createAuthMiddleware } from '../users/auth.middleware.js';
import {
  createLabelRequestSchema,
  CreateLabelResponse,
  ListLabelsResponse,
} from '@kotprog/common';
import { Label } from './label.entity.js';
import { PermissionLevel } from '@kotprog/common';

async function createLabel(req: Request, res: Response): Promise<void> {
  const { name } = await createLabelRequestSchema.validate(req.body);

  const label = await Label.create({ name });

  const id = label._id.toHexString();

  const response: CreateLabelResponse = {
    id,
    name: label.name,
  };

  res.set({ Location: `/api/label/${id}` });

  res.status(201);
  res.send(response);
}

async function listLabels(req: Request, res: Response): Promise<void> {
  const labels = await Label.find().sort('name').lean().then();

  const response: ListLabelsResponse = {
    labels: labels.map((label) => ({
      id: label._id.toHexString(),
      name: label.name,
      backgroundColor: label.backgroundColor,
      textColor: label.textColor,
    })),
  };

  res.status(200);
  res.send(response);
}

async function updateLabel(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

async function deleteLabel(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

export function createOpenEndpoints(): Router {
  const router = Router();

  router.get('/', listLabels);

  return router;
}

export function createAdminEndpoints(): Router {
  const router = Router();
  router.use(createAuthMiddleware(PermissionLevel.ADMIN));

  router.post('/', createLabel);
  router.patch('/:id', updateLabel);
  router.delete('/:id', deleteLabel);

  return router;
}

const labelRouter = Router();

labelRouter.use(createOpenEndpoints());
labelRouter.use(createAdminEndpoints());

export { labelRouter };
