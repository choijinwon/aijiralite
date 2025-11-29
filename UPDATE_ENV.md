# .env.local 파일 업데이트 가이드

## Supabase 연결 정보

다음 내용을 `.env.local` 파일에 추가하거나 기존 내용을 교체하세요:

```env
# Supabase Database (Connection Pooling)
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Supabase Database (Direct Connection - 마이그레이션용)
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# AI (선택)
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

## 중요 사항

1. **비밀번호에 특수문자(`!`)가 포함되어 있습니다**
   - URL 인코딩이 필요할 수 있습니다: `!` → `%21`
   - 하지만 대부분의 경우 그대로 사용해도 됩니다

2. **대괄호 `[]`는 제거하세요**
   - `[wlsdnjs12!A]` → `wlsdnjs12!A`

3. **파일 저장 후 서버 재시작**
   ```bash
   # 서버 중지 (Ctrl+C)
   npm run dev
   ```

4. **데이터베이스 마이그레이션 실행**
   ```bash
   npx prisma db push
   ```

## 문제 해결

만약 연결 오류가 발생하면:

1. **비밀번호 URL 인코딩 시도:**
   ```env
   DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12%21A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12%21A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
   ```

2. **Supabase Dashboard에서 연결 문자열 확인:**
   - Project Settings → Database → Connection string
   - 비밀번호가 올바른지 확인

