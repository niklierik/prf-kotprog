import { Request, Response, Router, json, raw } from 'express';
import { authMiddleware } from '../users/auth.middleware.js';
import { File } from './file.entity.js';
import { ObjectId } from 'mongodb';
import { HttpError } from '../errors/http-error.js';
import {
  createFileQuerySchema,
  CreateFileResponse,
  listUserFilesRequestSchema,
  ListUserFilesResponse,
  ReadFileInfoResponse,
} from '@kotprog/common';

const fileRouter = Router();

async function createFile(req: Request, res: Response): Promise<void> {
  const { name } = await createFileQuerySchema.validate(req.query);

  const user = req.user?._id;
  if (!user) {
    throw new HttpError(401, 'Unauthenticated request.');
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
  if (!id) {
    throw new HttpError(404, 'Unknown endpoint.');
  }

  const info = await File.findById(new ObjectId(id))
    .select('mimeType data')
    .lean()
    .then();

  if (!info) {
    throw new HttpError(404, `File '${id}' cannot be found.`);
  }

  res.setHeader('Content-Type', info.mimeType);

  res.status(200);
  res.send(info.data);
}

async function listUserFiles(req: Request, res: Response): Promise<void> {
  const { page, size } = await listUserFilesRequestSchema.validate(req.query);

  const user = req.user?._id;
  if (!user) {
    throw new HttpError(401, 'Unauthenticated request.');
  }

  const files = await File.find({})
    .select('-data')
    .skip(page * size)
    .limit(size)
    .lean();

  const response: ListUserFilesResponse = {
    files: files.map((file) => ({
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
      id: file._id.toHexString(),
      mimeType: file.mimeType,
      owner: file.owner,
      size: file.size,
    })),
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200);
  res.send(response);
}

async function readFileInfo(req: Request, res: Response): Promise<void> {
  const id: string | undefined = req.params['id'];
  if (!id) {
    throw new HttpError(404, 'Unknown endpoint.');
  }

  const info = await File.findById(new ObjectId(id)).select('-data').lean();
  if (!info) {
    throw new HttpError(404, `File '${id}' cannot be found.`);
  }

  const response: ReadFileInfoResponse = {
    id,
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
    throw new HttpError(404, `File '${id}' does not exist.`);
  }

  if (!req.user) {
    throw new HttpError(401, 'Unauthenticated request.');
  }

  if (file.owner !== req.user._id || req.user.permissionLevel) {
    throw new HttpError(403, `File cannot be modified or deleted by user.`);
  }

  file.data = req.body;
  res.status(200);
  res.send();
}

async function deleteFile(req: Request, res: Response): Promise<void> {
  const id = req.params['id'];

  const file = await File.findById(new ObjectId(id));
  if (!file) {
    throw new HttpError(404, `File '${id}' does not exist.`);
  }

  if (file.owner !== req.user?._id) {
    throw new HttpError(403, `File cannot be modified or deleted by user.`);
  }

  await file.deleteOne();

  res.status(200);
  res.send();
}

const jsonRoutes = Router();
jsonRoutes.get('/', listUserFiles);
jsonRoutes.get('/:id', readFile);
jsonRoutes.get('/:id/info', readFileInfo);
jsonRoutes.delete('/:id', deleteFile);
jsonRoutes.use(json());

fileRouter.use(jsonRoutes);

const binaryRoutes = Router();

binaryRoutes.patch('/:id', changeFile);
binaryRoutes.post('/', createFile);

binaryRoutes.use(raw());

fileRouter.use(binaryRoutes);

fileRouter.use(authMiddleware);

export { fileRouter };
