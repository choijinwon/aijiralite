#!/usr/bin/env node
/**
 * Netlify 빌드 전 환경 변수 설정 스크립트
 * DIRECT_URL이 없으면 DATABASE_URL을 사용하도록 설정
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
if (!directUrl && databaseUrl) {
  console.log('   ⚠️ DIRECT_URL이 없습니다. DATABASE_URL을 DIRECT_URL로 사용합니다.');
  process.env.DIRECT_URL = databaseUrl;
  console.log('   ✅ DIRECT_URL이 DATABASE_URL로 설정되었습니다.');
} else if (!directUrl && !databaseUrl) {
  console.error('   ❌ DATABASE_URL과 DIRECT_URL이 모두 설정되지 않았습니다!');
  console.error('   Netlify 대시보드에서 DATABASE_URL 환경 변수를 설정하세요.');
  process.exit(1);
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

