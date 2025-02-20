import { Router, Request, Response } from 'express';
import {
  AuthLoginResponse,
  AuthRegisterResponse,
  authLoginRequestSchema,
  authRegisterRequestSchema,
} from '@kotprog/common';
import { makeEndpoint } from '../endpoint/endpoint.js';
import { User } from './user.entity.js';
import { compare, hash } from 'bcrypt';
import moment from 'moment';
import { HttpError } from '../endpoint/http-error.js';
import jwt from 'jsonwebtoken';
const { sign } = jwt;
import { config } from '../config/config.js';
import type { StringValue } from 'ms';

async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = await authRegisterRequestSchema.validate(
    req.body ?? {},
  );

  const passwordHashed = await hash(password, config.auth.salt);

  const user = new User({
    _id: email,
    password: passwordHashed,
    createdAt: moment().utc().toDate(),
  });
  await user.save();

  const response: AuthRegisterResponse = {
    email: user._id,
    password: user.password,
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

  const passwordValid = await compare(password, user.password);

  if (!passwordValid) {
    throw new HttpError(401, 'Invalid credentials.');
  }

  const jwt = sign({ email }, config.auth.secret, {
    expiresIn: config.auth.tokenExpiresIn as StringValue,
  });
  const response: AuthLoginResponse = { jwt };

  res.status(201);
  res.send(response);
}

const authRouter = Router();

authRouter.post('/register', makeEndpoint(register));
authRouter.post('/login', makeEndpoint(login));

export { authRouter };
