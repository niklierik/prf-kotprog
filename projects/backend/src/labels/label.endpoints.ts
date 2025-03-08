import { Request, Response, Router } from 'express';
import { createAuthMiddleware } from '../users/auth.middleware.js';
import {
  createLabelRequestSchema,
  CreateLabelResponse,
  ListLabelsResponse,
} from '@kotprog/common';
import { Label } from './label.entity.js';
import { PermissionLevel } from '../users/permission-level.js';

const labelRouter = Router();
const guestEndpoints = Router();
const adminEndpoints = Router();

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

adminEndpoints.post('/', createLabel);
guestEndpoints.get('/', listLabels);
adminEndpoints.patch('/:id', updateLabel);
adminEndpoints.delete('/:id', deleteLabel);

adminEndpoints.use(createAuthMiddleware(PermissionLevel.ADMIN));
labelRouter.use(guestEndpoints);
labelRouter.use(adminEndpoints);

export { labelRouter };
