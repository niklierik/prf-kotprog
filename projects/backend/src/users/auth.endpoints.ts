import { Router, Request, Response, json } from 'express';
import {
  AuthLoginResponse,
  AuthRegisterResponse,
  TokenPayload,
  authLoginRequestSchema,
  authRegisterRequestSchema,
} from '@kotprog/common';
import { findAvatar, User } from './user.entity.js';
import { compare, hash } from 'bcrypt';
import { HttpError } from '../errors/http-error.js';
import { config } from '../config/config.js';
import type { StringValue } from 'ms';
import { createAuthMiddleware } from './auth.middleware.js';

import jwt from 'jsonwebtoken';
import { PermissionLevel } from './permission-level.js';
import { PermissionError } from '../errors/permission-error.js';
const { sign } = jwt;

async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = await authRegisterRequestSchema.validate(
    req.body ?? {},
  );

  const passwordHashed = await hash(password, config.auth.salt);

  const user = new User({
    _id: email,
    password: passwordHashed,
  });
  await user.save();

  const response: AuthRegisterResponse = {
    email: user._id,
  };

  res.status(201);
  res.send(response);
}

async function login(req: Request, res: Response): Promise<void> {
  console.log(req.body);

  const { email, password } = await authLoginRequestSchema.validate(req.body);

  const user = await User.findById(email);
  if (!user) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  const passwordValid = await compare(password, user.password);

  if (!passwordValid) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  const payload: TokenPayload = {
    email,
    name: user.name || '',
    avatar: findAvatar(user),
  };

  const jwt = sign(payload, config.auth.secret, {
    expiresIn: config.auth.tokenExpiresIn as StringValue,
  });
  const response: AuthLoginResponse = { jwt };

  res.status(201);
  res.send(response);
}

async function checkLogin(req: Request, res: Response): Promise<void> {
  const perm = Number(req.params['permission']) || 0;

  const user = req.user!;

  if (user.permissionLevel < perm) {
    throw new PermissionError();
  }

  res.status(200);
  res.send({});
}

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);

const checkLoginRouter = Router();
checkLoginRouter.use(createAuthMiddleware(PermissionLevel.USER));
checkLoginRouter.get('/', checkLogin);
checkLoginRouter.get('/:permission', checkLogin);

authRouter.use('/checklogin', checkLoginRouter);

export { authRouter };
