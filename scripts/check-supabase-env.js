// Check Supabase environment variables
const fs = require('fs');
const path = require('path');

console.log('\n=== Supabase 환경 변수 확인 ===\n');

const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env.local 파일이 존재합니다.\n');
} else {
  console.log('❌ .env.local 파일이 없습니다.\n');
  console.log('📝 .env.local 파일을 생성하고 다음을 추가하세요:\n');
  console.log('NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"\n');
  process.exit(1);
}

// Check for Supabase variables
const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!hasSupabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  console.log('   → .env.local 파일에 추가하세요:\n');
  console.log('   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"\n');
}

if (!hasSupabaseKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  console.log('   → .env.local 파일에 추가하세요:\n');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"\n');
}

if (hasSupabaseUrl && hasSupabaseKey) {
  console.log('✅ Supabase 환경 변수가 설정되어 있습니다.\n');
  console.log('📝 Supabase Dashboard에서 정보를 가져오는 방법:');
  console.log('   1. https://app.supabase.com 접속');
  console.log('   2. 프로젝트 선택');
  console.log('   3. Project Settings → API');
  console.log('   4. Project URL → NEXT_PUBLIC_SUPABASE_URL');
  console.log('   5. anon public 키 → NEXT_PUBLIC_SUPABASE_ANON_KEY\n');
  console.log('⚠️  환경 변수 변경 후 서버를 재시작하세요 (Ctrl+C 후 npm run dev)\n');
} else {
  console.log('\n📚 자세한 내용은 QUICK_SUPABASE_SETUP.md 파일을 참고하세요.\n');
}

