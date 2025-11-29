// Verify Google OAuth environment variables
require('dotenv').config({ path: '.env.local' });

console.log('\n=== Google OAuth 환경 변수 확인 ===\n');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

let allGood = true;

if (!clientId || clientId === '') {
  console.log('❌ GOOGLE_CLIENT_ID: 설정되지 않음');
  console.log('   → .env.local 파일에 추가하세요:');
  console.log('   → GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"\n');
  allGood = false;
} else {
  console.log(`✅ GOOGLE_CLIENT_ID: ${clientId.substring(0, 30)}...`);
}

if (!clientSecret || clientSecret === '') {
  console.log('❌ GOOGLE_CLIENT_SECRET: 설정되지 않음');
  console.log('   → .env.local 파일에 추가하세요:');
  console.log('   → GOOGLE_CLIENT_SECRET="your-client-secret"\n');
  allGood = false;
} else {
  console.log(`✅ GOOGLE_CLIENT_SECRET: 설정됨 (${clientSecret.length}자)`);
}

if (!nextAuthUrl || nextAuthUrl === '') {
  console.log('❌ NEXTAUTH_URL: 설정되지 않음');
  console.log('   → .env.local 파일에 추가하세요:');
  console.log('   → NEXTAUTH_URL="http://localhost:3000"\n');
  allGood = false;
} else {
  console.log(`✅ NEXTAUTH_URL: ${nextAuthUrl}`);
}

if (!nextAuthSecret || nextAuthSecret === '' || nextAuthSecret === 'your-secret-key-here') {
  console.log('❌ NEXTAUTH_SECRET: 설정되지 않거나 기본값입니다');
  console.log('   → .env.local 파일에 추가하세요:');
  console.log('   → NEXTAUTH_SECRET="your-secret-key-here"\n');
  allGood = false;
} else {
  console.log(`✅ NEXTAUTH_SECRET: 설정됨`);
}

if (!allGood) {
  console.log('\n⚠️  Google OAuth를 사용하려면 위의 환경 변수들을 설정해야 합니다.');
  console.log('\n📝 설정 방법:');
  console.log('1. .env.local 파일을 열거나 생성');
  console.log('2. 위의 환경 변수들을 추가');
  console.log('3. 서버 재시작 (Ctrl+C 후 npm run dev)');
  console.log('\n📚 자세한 내용은 QUICK_GOOGLE_SETUP.md 파일을 참고하세요.\n');
} else {
  console.log('\n✅ 모든 Google OAuth 환경 변수가 설정되었습니다!');
  console.log('서버를 재시작하면 Google 로그인이 작동합니다.\n');
}

