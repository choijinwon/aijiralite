#!/usr/bin/env node
/**
 * Netlify 빌드 실행 스크립트
 * setup-env.js에서 설정한 환경 변수를 사용하여 빌드 실행
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 환경 변수 확인 및 설정
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

console.log('🚀 [BUILD] 빌드 시작...');
console.log('   DIRECT_URL:', process.env.DIRECT_URL ? '✅' : '❌');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅' : '❌');

// 마이그레이션 디렉토리 확인
const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
const hasMigrations = fs.existsSync(migrationsPath) && 
  fs.readdirSync(migrationsPath).length > 0;

console.log('   Migrations:', hasMigrations ? '✅ 발견됨' : '⚠️ 없음 (db push 사용)');

try {
  // 1. Prisma Client 생성
  console.log('\n📦 [BUILD] 실행 중: prisma generate');
  execSync('prisma generate', {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });

  // 2. 데이터베이스 스키마 적용 (선택적)
  // 빌드 시 데이터베이스에 연결할 수 없는 경우를 대비해 실패해도 계속 진행
  const skipDbOps = process.env.SKIP_DB_OPERATIONS === 'true';
  
  if (!skipDbOps) {
    if (hasMigrations) {
      console.log('\n📦 [BUILD] 실행 중: prisma migrate deploy');
      try {
        execSync('prisma migrate deploy', {
          stdio: 'inherit',
          env: process.env,
          shell: true
        });
      } catch (migrateError) {
        console.warn('⚠️ [BUILD] migrate deploy 실패, db push로 대체 시도...');
        try {
          console.log('\n📦 [BUILD] 실행 중: prisma db push');
          execSync('prisma db push --skip-generate --accept-data-loss', {
            stdio: 'inherit',
            env: process.env,
            shell: true
          });
        } catch (dbPushError) {
          console.warn('⚠️ [BUILD] 데이터베이스 작업 실패, 빌드는 계속 진행합니다.');
          console.warn('   (데이터베이스는 런타임에 연결됩니다)');
        }
      }
    } else {
      console.log('\n📦 [BUILD] 실행 중: prisma db push');
      try {
        execSync('prisma db push --skip-generate --accept-data-loss', {
          stdio: 'inherit',
          env: process.env,
          shell: true
        });
      } catch (dbPushError) {
        console.warn('⚠️ [BUILD] 데이터베이스 작업 실패, 빌드는 계속 진행합니다.');
        console.warn('   (데이터베이스는 런타임에 연결됩니다)');
      }
    }
  } else {
    console.log('\n⚠️ [BUILD] SKIP_DB_OPERATIONS=true, 데이터베이스 작업 건너뜀');
  }

  // 3. Next.js 빌드
  console.log('\n📦 [BUILD] 실행 중: next build');
  execSync('next build', {
    stdio: 'inherit',
    env: process.env,
    shell: true
  });

  console.log('\n✅ [BUILD] 빌드 완료!');
} catch (error) {
  console.error('\n❌ [BUILD] 빌드 실패:', error.message);
  process.exit(1);
}

