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

if (!finalDirectUrl) {
  console.error('   ❌ DATABASE_URL이 설정되지 않았습니다!');
  console.error('   Netlify 대시보드에서 DATABASE_URL 환경 변수를 설정하세요.');
  process.exit(1);
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
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅' : '❌');
console.log('   DIRECT_URL:', process.env.DIRECT_URL ? '✅' : '❌');

if (!process.env.DIRECT_URL) {
  console.error('   ❌ DIRECT_URL이 여전히 설정되지 않았습니다!');
  process.exit(1);
}

console.log('✅ [ENV SETUP] 환경 변수 설정 완료');

