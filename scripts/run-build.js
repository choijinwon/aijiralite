#!/usr/bin/env node
/**
 * Netlify 빌드 실행 스크립트
 * setup-env.js에서 설정한 환경 변수를 사용하여 빌드 실행
 */

const { execSync } = require('child_process');

// 환경 변수 확인 및 설정
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// 환경 변수를 상속받아 빌드 명령어 실행
const commands = [
  'prisma generate',
  'prisma migrate deploy',
  'next build'
];

console.log('🚀 [BUILD] 빌드 시작...');
console.log('   DIRECT_URL:', process.env.DIRECT_URL ? '✅' : '❌');
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅' : '❌');

try {
  for (const cmd of commands) {
    console.log(`\n📦 [BUILD] 실행 중: ${cmd}`);
    execSync(cmd, {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });
  }
  console.log('\n✅ [BUILD] 빌드 완료!');
} catch (error) {
  console.error('\n❌ [BUILD] 빌드 실패:', error.message);
  process.exit(1);
}

