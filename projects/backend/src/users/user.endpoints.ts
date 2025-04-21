import { json, raw, Request, Response, Router } from 'express';
import { createAuthMiddleware } from './auth.middleware.js';
import {
  listUsersRequestSchema,
  ListUsersResponse,
  PermissionLevel,
  updatePermissionLevelRequestSchema,
} from '@kotprog/common';
import { NotFoundError } from '../errors/not-found-error.js';
import { ObjectId } from 'mongodb';
import { File } from '../files/file.entity.js';
import { User } from './user.entity.js';
import { readDefault } from '../files/file.endpoints.js';
import { PermissionError } from '../errors/permission-error.js';
import { HttpError } from '../errors/http-error.js';
const userRouter = Router();

async function readUser(req: Request, res: Response): Promise<void> {
  const id = req.params['id'];
  if (!id) {
    throw new NotFoundError(id, 'User');
  }

  res.status(200);
  res.send();
}

async function list(req: Request, res: Response): Promise<void> {
  const { minPermissionLevel, page, size } =
    await listUsersRequestSchema.validate(req.query);

  const skip = (page ?? 0) * (size ?? 0);
  const limit = size;

  let filter = {};

  if (minPermissionLevel != null) {
    filter = {
      permissionLevel: { $gte: minPermissionLevel },
    };
  }

  let baseQuery = User.find(filter);
  const count = await baseQuery.clone().countDocuments();

  const loggedInUser = req.user;

  if (limit != null) {
    baseQuery = baseQuery.skip(skip).limit(limit);
  }

  const users = await baseQuery.clone().lean();

  const response: ListUsersResponse = {
    users: users.map((user) => ({
      id: user._id,
      name: user.name || user._id,
      permissionLevel:
        loggedInUser && loggedInUser.permissionLevel >= PermissionLevel.ADMIN
          ? user.permissionLevel
          : undefined,
    })),
    count,
  };

  res.status(200);
  res.send(response);
}

async function deleteUser(req: Request, res: Response): Promise<void> {
  res.status(200);
  res.send();
}

async function updateAvatar(req: Request, res: Response): Promise<void> {
  const id: string | undefined = req.params['id'];

  const user = req.user!;

  const userBeingModified = await User.findById(id);

  if (!userBeingModified) {
    throw new NotFoundError(id, 'User');
  }

  if (
    user.permissionLevel < PermissionLevel.ADMIN &&
    user._id !== userBeingModified._id
  ) {
    throw new PermissionError();
  }

  const data = req.body;
  const size = Buffer.byteLength(data);

  const file = await File.create({
    name: 'Avatar',
    data,
    mimeType: req.headers['content-type'],
    owner: user,
    size,
  });

  const result = await User.updateOne(
    { _id: userBeingModified._id },
    {
      profilePicture: file._id,
    },
  ).lean();

  if (!result) {
    throw new NotFoundError(id, 'User');
  }

  res.status(201);
  res.send({
    id: file._id.toHexString(),
  });
}

async function getAvatar(req: Request, res: Response): Promise<void> {
  const id: string | undefined = req.params['id'];

  const user = await User.findById(id).select('profilePicture').lean();

  if (!user) {
    throw new NotFoundError(id, 'User');
  }

  if (!user?.profilePicture) {
    await readDefault(req, res);
    return;
  }

  const info = await File.findById(new ObjectId(user.profilePicture))
    .select('mimeType data')
    .lean()
    .then();

  if (!info) {
    await readDefault(req, res);
    return;
  }

  res.setHeader('Content-Type', info.mimeType);

  res.status(200);
  res.send(info.data.buffer);
}

async function deleteAvatar(req: Request, res: Response): Promise<void> {
  const id: string | undefined = req.params['id'];

  const user = req.user!;

  const userBeingModified = await User.findById(id);

  if (!userBeingModified) {
    throw new NotFoundError(id, 'User');
  }

  if (!userBeingModified.profilePicture) {
    res.status(200).send();
    return;
  }

  if (
    user.permissionLevel < PermissionLevel.ADMIN &&
    user._id !== userBeingModified._id
  ) {
    throw new PermissionError();
  }

  await File.deleteOne({
    _id: new ObjectId(userBeingModified.profilePicture),
  });

  const result = await User.updateOne(
    { _id: userBeingModified._id },
    {
      profilePicture: undefined,
    },
  ).lean();

  if (!result) {
    throw new NotFoundError(id, 'User');
  }

  res.status(200);
  res.send();
}

async function updatePermissionLevel(
  req: Request,
  res: Response,
): Promise<void> {
  const { permissionLevel } = await updatePermissionLevelRequestSchema.validate(
    req.body,
  );

  const { id } = req.params;
  if (!id) {
    throw new HttpError(400, 'UserId is a required parameter.');
  }

  const user = await User.findByIdAndUpdate(id, { permissionLevel });

  if (!user) {
    throw new NotFoundError(id, 'User');
  }

  res.status(200).send({});
}

function createAvatarModificationEndpoints(): Router {
  const router = Router();

  router.use(createAuthMiddleware(PermissionLevel.USER));
  router.use(raw({ type: 'image/*', limit: '1mb' }));

  router.post('/:id/avatar', updateAvatar);
  router.delete('/:id/avatar', deleteAvatar);

  return router;
}

function createUserListEndpoint(): Router {
  const router = Router();
  router.use(createAuthMiddleware(PermissionLevel.USER, true));

  router.get('/', list);

  return router;
}

function createAdminEndpoints(): Router {
  const router = Router();
  router.use(createAuthMiddleware(PermissionLevel.ADMIN));
  router.use(json());

  router.patch('/:id/permission-level', updatePermissionLevel);

  return router;
}

userRouter.get('/:id/avatar', getAvatar);

userRouter.get('/:id', readUser);
userRouter.delete('/:id', deleteUser);

userRouter.use(createAvatarModificationEndpoints());
userRouter.use(createUserListEndpoint());
userRouter.use(createAdminEndpoints());

export { userRouter };
