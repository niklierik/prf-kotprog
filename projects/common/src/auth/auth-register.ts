import { InferType, object, string } from 'yup';

export const authRegisterRequestSchema = object({
  email: string().email().required(),
  password: string().min(8).max(20).required(),
});

export type AuthRegisterRequest = InferType<typeof authRegisterRequestSchema>;

export interface AuthRegisterResponse {
  email: string;
}
