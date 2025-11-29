// lib/db.js
// Prisma는 서버 사이드에서만 사용 가능합니다
// 클라이언트 사이드에서 import하면 안 됩니다

import { PrismaClient } from '@prisma/client';

// 서버 사이드에서만 실행되도록 체크
if (typeof window !== 'undefined') {
  throw new Error(
    'Prisma Client cannot be used in the browser. ' +
    'This module should only be imported in API routes or server components.'
  );
}

// DATABASE_URL 환경 변수 체크
if (!process.env.DATABASE_URL) {
  const errorMessage = 
    'DATABASE_URL environment variable is not set.\n\n' +
    'Please set DATABASE_URL in your environment variables:\n' +
    '  - For local development: Add to .env.local file\n' +
    '  - For Netlify: Add in Site settings > Environment variables\n\n' +
    'Example: DATABASE_URL="postgresql://user:password@host:port/database?schema=public"';
  
  console.error('❌ [DB]', errorMessage);
  
  // 개발 환경에서는 에러를 throw하여 문제를 명확히 알림
  if (process.env.NODE_ENV === 'development') {
    throw new Error(errorMessage);
  }
}

const globalForPrisma = globalThis;

// Configure Prisma with connection pool settings
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  errorFormat: 'pretty',
};

// PrismaClient 인스턴스 생성 (환경 변수가 있을 때만)
let db;

if (!process.env.DATABASE_URL) {
  // DATABASE_URL이 없으면 더미 객체를 반환
  // 실제 사용 시 명확한 에러 메시지 제공
  const createDummyDb = () => {
    const errorMsg = 'DATABASE_URL environment variable is not set. Please configure it in Netlify environment variables.';
    return {
      user: {
        findUnique: () => Promise.reject(new Error(errorMsg)),
        findMany: () => Promise.reject(new Error(errorMsg)),
        create: () => Promise.reject(new Error(errorMsg)),
        update: () => Promise.reject(new Error(errorMsg)),
        delete: () => Promise.reject(new Error(errorMsg)),
      },
      team: {
        findUnique: () => Promise.reject(new Error(errorMsg)),
        findMany: () => Promise.reject(new Error(errorMsg)),
        create: () => Promise.reject(new Error(errorMsg)),
      },
      project: {
        findUnique: () => Promise.reject(new Error(errorMsg)),
        findMany: () => Promise.reject(new Error(errorMsg)),
        create: () => Promise.reject(new Error(errorMsg)),
      },
      issue: {
        findUnique: () => Promise.reject(new Error(errorMsg)),
        findMany: () => Promise.reject(new Error(errorMsg)),
        create: () => Promise.reject(new Error(errorMsg)),
      },
      $transaction: () => Promise.reject(new Error(errorMsg)),
    };
  };
  
  db = createDummyDb();
} else {
  try {
    db = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = db;
    }
  } catch (error) {
    console.error('❌ [DB] Failed to create PrismaClient:', error.message);
    throw error; // PrismaClient 생성 실패는 치명적이므로 throw
  }
}

export { db };

