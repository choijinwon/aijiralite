#!/usr/bin/env node
/**
 * Netlify 빌드 전 환경 변수 설정 스크립트
 * DIRECT_URL이 없으면 DATABASE_URL을 사용하도록 설정
 * 
 * 이 스크립트는 .env 파일을 생성하여 Prisma가 읽을 수 있도록 합니다.
 */

const fs = require('fs');
const path = require('path');

// 환경 변수 확인
const databaseUrl = process.env.DATABASE_URL;
const directUrl = process.env.DIRECT_URL;

console.log('🔧 [ENV SETUP] 환경 변수 설정 중...');
console.log('   DATABASE_URL:', databaseUrl ? '✅ 설정됨' : '❌ 없음');
console.log('   DIRECT_URL:', directUrl ? '✅ 설정됨' : '❌ 없음');

// DIRECT_URL이 없고 DATABASE_URL이 있으면 DIRECT_URL을 DATABASE_URL로 설정
const finalDirectUrl = directUrl || databaseUrl;

// DATABASE_URL이 없어도 빌드는 계속 진행 (Prisma Client 생성은 스키마만 필요)
// 데이터베이스 작업은 run-build.js에서 선택적으로 처리됨
if (!finalDirectUrl) {
  console.warn('\n⚠️ [WARNING] DATABASE_URL이 설정되지 않았습니다.');
  console.warn('   Prisma Client 생성은 계속 진행되지만, 데이터베이스 작업은 건너뜁니다.');
  console.warn('   런타임에 데이터베이스 연결이 필요합니다.');
  console.warn('\n📋 [참고] 데이터베이스 작업을 활성화하려면 Netlify 대시보드에서 환경 변수를 설정하세요:');
  console.warn('   1. https://app.netlify.com 접속');
  console.warn('   2. 사이트 선택 > Site settings > Environment variables');
  console.warn('   3. 다음 환경 변수 추가:');
  console.warn('      - DATABASE_URL: postgresql://user:password@host:port/database?schema=public');
  console.warn('      - DIRECT_URL: DATABASE_URL과 동일한 값');
  console.warn('\n📖 자세한 가이드: QUICK_START_NETLIFY.md 파일 참고');
  console.warn('');
}

if (!directUrl && databaseUrl) {
  console.log('   ⚠️ DIRECT_URL이 없습니다. DATABASE_URL을 DIRECT_URL로 사용합니다.');
  // 환경 변수 설정 (현재 프로세스와 하위 프로세스에 전달)
  process.env.DIRECT_URL = databaseUrl;
  
  // .env 파일에도 추가 (Prisma가 읽을 수 있도록)
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // DIRECT_URL이 .env 파일에 없으면 추가
  if (!envContent.includes('DIRECT_URL=')) {
    envContent += `\nDIRECT_URL=${databaseUrl}\n`;
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('   ✅ .env 파일에 DIRECT_URL이 추가되었습니다.');
  }
  
  console.log('   ✅ DIRECT_URL이 DATABASE_URL로 설정되었습니다.');
} else if (directUrl && databaseUrl) {
  console.log('   ✅ 모든 환경 변수가 설정되었습니다.');
}

// 최종 확인
console.log('🔍 [ENV SETUP] 최종 환경 변수 확인:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅' : '⚠️ 없음');
console.log('   DIRECT_URL:', process.env.DIRECT_URL ? '✅' : '⚠️ 없음');

if (process.env.DIRECT_URL) {
  console.log('✅ [ENV SETUP] 환경 변수 설정 완료');
} else {
  console.log('⚠️ [ENV SETUP] 데이터베이스 환경 변수가 없습니다. 빌드는 계속 진행됩니다.');
}

