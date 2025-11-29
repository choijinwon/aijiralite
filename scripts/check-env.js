// Check environment variables for Google OAuth
console.log('\n=== 환경 변수 확인 ===\n');

const requiredVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

let allSet = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    // 값이 있으면 마스킹해서 표시
    const masked = value.length > 20 
      ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
      : '***';
    console.log(`✅ ${varName}: ${masked}`);
  } else {
    console.log(`❌ ${varName}: 설정되지 않음`);
    allSet = false;
  }
});

if (!allSet) {
  console.log('\n⚠️  일부 환경 변수가 설정되지 않았습니다.');
  console.log('\n.env.local 파일을 생성하고 다음을 추가하세요:\n');
  console.log('GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"');
  console.log('GOOGLE_CLIENT_SECRET="your-google-client-secret"');
  console.log('NEXTAUTH_URL="http://localhost:3000"');
  console.log('NEXTAUTH_SECRET="your-secret-key-here"');
  console.log('\n환경 변수 설정 후 서버를 재시작하세요.\n');
} else {
  console.log('\n✅ 모든 필수 환경 변수가 설정되었습니다.\n');
}

