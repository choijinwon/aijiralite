# 환경 변수 설정 가이드

## Supabase 연결 설정

`.env.local` 파일에 다음 내용을 추가하거나 수정하세요:

```env
# Supabase Database (Connection Pooling)
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Database (Direct Connection - 마이그레이션용)
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# AI (선택)
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

## 중요 사항

1. **`[YOUR-PASSWORD]`를 실제 Supabase 비밀번호로 교체하세요**
   - Supabase Dashboard → Settings → Database → Database password 확인

2. **파일 위치 확인**
   - `.env.local` 파일은 프로젝트 루트 디렉토리에 있어야 합니다
   - `C:\Users\VIVESTUDIOS\Desktop\aijiralite\.env.local`

3. **서버 재시작**
   - 환경 변수 변경 후 개발 서버를 재시작하세요:
   ```bash
   # 서버 중지 (Ctrl+C)
   npm run dev
   ```

## 연결 테스트

환경 변수 설정 후 다음 명령어로 데이터베이스 연결을 테스트하세요:

```bash
npx prisma db push
```

성공하면 데이터베이스 스키마가 Supabase에 적용됩니다.

