# Netlify 배포 가이드

## 1. Netlify 계정 및 프로젝트 설정

### Netlify 대시보드에서:
1. [Netlify](https://www.netlify.com)에 로그인
2. "Add new site" > "Import an existing project" 선택
3. GitHub/GitLab/Bitbucket 저장소 연결
4. 빌드 설정:
   - Build command: `npm run netlify-build`
   - Publish directory: `.next`

## 2. 환경 변수 설정

Netlify 대시보드 > Site settings > Environment variables에서 다음 변수들을 설정하세요:

### 필수 환경 변수:

```env
# 데이터베이스
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# 인증
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-site.netlify.app"
JWT_SECRET="your-jwt-secret-here"

# Supabase (사용하는 경우)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Google OAuth (사용하는 경우)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# 이메일 설정 (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# 또는 Resend API
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# OpenAI (사용하는 경우)
OPENAI_API_KEY="your-openai-api-key"
```

## 3. Prisma 마이그레이션

**✅ 자동 마이그레이션**: `netlify-build` 스크립트에 `prisma migrate deploy`가 포함되어 있어 빌드 시 자동으로 마이그레이션이 실행됩니다.

빌드 명령어는 다음과 같습니다:
```bash
prisma generate && prisma migrate deploy && next build
```

### 수동 마이그레이션이 필요한 경우:
로컬에서 실행:
```bash
npx prisma migrate deploy
```

## 4. 빌드 설정 확인

`netlify.toml` 파일이 프로젝트 루트에 있는지 확인하세요.

## 5. 배포 후 확인 사항

1. **데이터베이스 연결 확인**
   - 환경 변수 `DATABASE_URL`이 올바르게 설정되었는지 확인
   - Prisma 마이그레이션이 실행되었는지 확인

2. **인증 확인**
   - `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인
   - Google OAuth 리다이렉트 URI 설정 확인

3. **이메일 발송 확인**
   - SMTP 또는 Resend 설정 확인
   - 테스트 이메일 발송

4. **API 라우트 확인**
   - `/api/teams`, `/api/projects` 등 API 엔드포인트 테스트

## 6. 문제 해결

### 빌드 실패 시:
- Netlify 빌드 로그 확인
- 환경 변수 누락 확인
- Prisma generate 실패 확인

### 런타임 에러 시:
- Netlify Functions 로그 확인
- 데이터베이스 연결 확인
- 환경 변수 값 확인

## 7. 자동 배포 설정

GitHub/GitLab 저장소와 연결하면:
- `main` 브랜치에 push 시 자동 배포
- Pull Request에 대한 미리보기 배포

## 참고 링크
- [Netlify Next.js 문서](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)

