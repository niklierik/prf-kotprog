import { Router, Request, Response, json } from 'express';
import {
  AuthLoginResponse,
  AuthRegisterResponse,
  TokenPayload,
  authLoginRequestSchema,
  authRegisterRequestSchema,
} from '@kotprog/common';
import { User } from './user.entity.js';
import bcrypt from 'bcryptjs';
import { HttpError } from '../errors/http-error.js';
import { config } from '../config/config.js';
import type { StringValue } from 'ms';
import { createAuthMiddleware } from './auth.middleware.js';

import jwt from 'jsonwebtoken';
import { PermissionLevel } from '@kotprog/common';
import { PermissionError } from '../errors/permission-error.js';
const { sign } = jwt;

async function register(req: Request, res: Response): Promise<void> {
  const { email, nickname, password } =
    await authRegisterRequestSchema.validate(req.body ?? {});

  const passwordHashed = await bcrypt.hash(password, config.auth.salt);

  const user = await User.create({
    _id: email,
    name: nickname,
    password: passwordHashed,
    permissionLevel: PermissionLevel.USER,
  });

  const response: AuthRegisterResponse = {
    email: user._id,
  };

  res.status(201);
  res.send(response);
}

async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = await authLoginRequestSchema.validate(req.body);

  const user = await User.findById(email);
  if (!user) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  const payload: TokenPayload = {
    email,
    name: user.name || '',
    permissionLevel: user.permissionLevel,
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
