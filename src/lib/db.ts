import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

export interface DatabaseUser {
  id: string;
  username: string;
  passwordHash: string;
}