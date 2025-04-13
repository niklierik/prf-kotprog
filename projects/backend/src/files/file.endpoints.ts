import { Request, Response, Router, json, raw } from 'express';
import { File } from './file.entity.js';
import { ObjectId } from 'mongodb';
import {
  createFileQuerySchema,
  CreateFileResponse,
  listUserFilesRequestSchema,
  ListUserFilesResponse,
  ReadFileInfoResponse,
} from '@kotprog/common';
import { UnauthenticatedError } from '../errors/unauthenticated-error.js';
import { PermissionError } from '../errors/permission-error.js';
import { createAuthMiddleware } from '../users/auth.middleware.js';
import { PermissionLevel } from '@kotprog/common';
import { NotFoundError } from '../errors/not-found-error.js';
import fs from 'fs/promises';

const fileRouter = Router();

async function createFile(req: Request, res: Response): Promise<void> {
  const { name } = await createFileQuerySchema.validate(req.query);

  const user = req.user?._id;
  if (!user) {
    throw new UnauthenticatedError();
  }

  const data = req.body;
  const size = Buffer.byteLength(data);

  const file = await File.create({
    name,
    data,
    mimeType: req.headers['content-type'],
    owner: user,
    size,
  });

  const id = file._id.toHexString();

  const response: CreateFileResponse = {
    id,
    size,
  };

  res.setHeader('Location', `/api/file/${id}`);

  res.status(201);
  res.send(response);
}

async function readFile(req: Request, res: Response): Promise<void> {
  const id: string | undefined = req.params['id'];

  const info = await File.findById(new ObjectId(id))
    .select('mimeType data')
    .lean()
    .then();

  if (!info) {
    throw new NotFoundError(id, 'File');
  }

  res.setHeader('Content-Type', info.mimeType);

  res.status(200);
  res.send(info.data.buffer);
}

export async function readDefault(req: Request, res: Response): Promise<void> {
  const contentType = 'image/jpg';

  const file = await fs.readFile('./assets/default-profile-photo.jpg');

  res.setHeader('Content-Type', contentType);

  res.status(200);
  res.send(file);
}

async function listUserFiles(req: Request, res: Response): Promise<void> {
  const { page, size } = await listUserFilesRequestSchema.validate(req.query);

  const user = req.user!._id;

  const baseQuery = File.find({
    owner: user,
  }).select('-data');

  const filesResponse = await baseQuery
    .clone()
    .skip(page * size)
    .limit(size)
    .lean();

  const count = await baseQuery.countDocuments();

  const files = filesResponse.map((file) => ({
    name: file.name,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
    id: file._id.toHexString(),
    mimeType: file.mimeType,
    owner: file.owner,
    size: file.size,
  }));

  const response: ListUserFilesResponse = {
    files,
    count,
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  res.send(response);
}

async function readFileInfo(req: Request, res: Response): Promise<void> {
  const id: string | undefined = req.params['id'];

  const info = await File.findById(new ObjectId(id)).select('-data').lean();
  if (!info) {
    throw new NotFoundError(id, 'File');
  }

  const response: ReadFileInfoResponse = {
    id,
    name: info.name,
    createdAt: info.createdAt.toUTCString(),
    updatedAt: info.updatedAt.toUTCString(),
    mimeType: info.mimeType,
    owner: info.owner,
    size: info.size,
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  res.send(response);
}

async function changeFile(req: Request, res: Response): Promise<void> {
  const id = req.params['id'];

  const file = await File.findById(new ObjectId(id));

  if (!file) {
    throw new NotFoundError(id, 'File');
  }

  const user = req.user!;

  if (file.owner !== user._id || user.permissionLevel) {
    throw new PermissionError();
  }

  file.data = req.body;
  res.status(200);
  res.send();
}

async function deleteFile(req: Request, res: Response): Promise<void> {
  const id = req.params['id'];

  const file = await File.findById(new ObjectId(id));

  if (!file) {
    throw new NotFoundError(id, 'File');
  }

  if (file.owner !== req.user?._id) {
    throw new PermissionError();
  }

  await file.deleteOne();

  res.status(200);
  res.send();
}

export function createJsonRoutes(): Router {
  const router = Router();

  router.use(json());
  router.use(createAuthMiddleware(PermissionLevel.WRITER));

  router.get('/', listUserFiles);
  router.get('/:id/info', readFileInfo);
  router.delete('/:id', deleteFile);

  return router;
}

export function createOpenBinaryRoutes(): Router {
  const router = Router();

  router.use(raw());
  router.get('/default', readDefault);
  router.get('/:id', readFile);

  return router;
}

export function createWriterBinaryRoutes(): Router {
  const router = Router();
  router.use(createAuthMiddleware(PermissionLevel.WRITER));
  router.use(raw({ type: 'image/*', limit: '8mb' }));

  router.patch('/:id', changeFile);
  router.post('/', createFile);

  return router;
}

fileRouter.use(createOpenBinaryRoutes());
fileRouter.use(createWriterBinaryRoutes());
fileRouter.use(createJsonRoutes());

export { fileRouter };
