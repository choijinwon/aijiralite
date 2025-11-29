// lib/db.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Configure Prisma with connection pool settings
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
};

export const db = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

