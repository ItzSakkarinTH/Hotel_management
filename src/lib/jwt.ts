import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '@/types';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'yourmom';
const JWT_EXPIRES_IN = '7d'; 

export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  
  return jwt.sign(payload as object, JWT_SECRET, options);
};

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};