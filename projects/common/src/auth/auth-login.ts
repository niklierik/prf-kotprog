import { InferType, object, string } from 'yup';

export const authLoginRequestSchema = object({
  email: string().required().email(),
  password: string().required(),
});

export type AuthLoginRequest = InferType<typeof authLoginRequestSchema>;

export interface AuthLoginResponse {
  jwt: string;
}
