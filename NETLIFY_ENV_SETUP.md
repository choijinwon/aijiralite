# Netlify 환경 변수 설정 가이드

## ⚠️ 필수 환경 변수 (빌드 실패 방지)

Netlify 대시보드에서 다음 환경 변수들을 **반드시** 설정해야 합니다:

### 1. 데이터베이스 연결 (필수!)

```
DATABASE_URL=postgresql://user:password@host:port/database?schema=public
DIRECT_URL=postgresql://user:password@host:port/database?schema=public
```

**중요:**
- `DIRECT_URL`은 Prisma 마이그레이션 실행 시 필요합니다
- 일반적으로 `DATABASE_URL`과 동일한 값을 사용합니다
- 이 변수가 없으면 빌드가 실패합니다!

### 2. 인증 설정 (필수!)

```
NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars
NEXTAUTH_URL=https://your-site.netlify.app
JWT_SECRET=your-jwt-secret-key-here
```

**NEXTAUTH_SECRET 생성 방법:**
```bash
# Linux/Mac
openssl rand -base64 32

# 또는 온라인 생성기 사용
# https://generate-secret.vercel.app/32
```

### 3. Supabase (사용하는 경우)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Google OAuth (사용하는 경우)

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Google OAuth 설정:**
1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
2. 승인된 리다이렉트 URI에 `https://your-site.netlify.app/api/auth/callback/google` 추가

### 5. 이메일 설정 (선택)

**Gmail SMTP:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

**또는 Resend API:**
```
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 6. 기타 (선택)

```
OPENAI_API_KEY=your-openai-api-key
```

## 📝 Netlify에서 환경 변수 설정 방법

1. **Netlify 대시보드 접속**
   - https://app.netlify.com
   - 사이트 선택

2. **환경 변수 설정**
   - **Site settings** > **Environment variables** 클릭
   - **Add a variable** 클릭
   - Key와 Value 입력
   - **Save** 클릭

3. **환경 변수 확인**
   - 모든 필수 변수가 설정되었는지 확인
   - 특히 `DIRECT_URL`이 설정되었는지 확인!

## 🔍 환경 변수 확인 체크리스트

배포 전 다음을 확인하세요:

- [ ] `DATABASE_URL` 설정됨
- [ ] `DIRECT_URL` 설정됨 (DATABASE_URL과 동일한 값)
- [ ] `NEXTAUTH_SECRET` 설정됨 (32자 이상)
- [ ] `NEXTAUTH_URL` 설정됨 (실제 배포 URL)
- [ ] `JWT_SECRET` 설정됨
- [ ] Supabase 사용 시 관련 변수 설정됨
- [ ] Google OAuth 사용 시 관련 변수 설정됨

## ⚠️ 일반적인 오류

### "Environment variable not found: DIRECT_URL"
- **원인**: `DIRECT_URL` 환경 변수가 설정되지 않음
- **해결**: Netlify 대시보드에서 `DIRECT_URL` 추가 (일반적으로 `DATABASE_URL`과 동일한 값)

### "Prisma schema validation error"
- **원인**: 필수 환경 변수 누락
- **해결**: 위의 체크리스트 확인

### "Database connection failed"
- **원인**: `DATABASE_URL`이 잘못되었거나 데이터베이스가 접근 불가
- **해결**: 
  - `DATABASE_URL` 형식 확인
  - 데이터베이스가 Netlify에서 접근 가능한지 확인 (방화벽 설정)

## 🔗 참고 링크

- [Netlify 환경 변수 문서](https://docs.netlify.com/environment-variables/overview/)
- [Prisma 환경 변수 문서](https://www.prisma.io/docs/concepts/components/prisma-schema/working-with-environment-variables)

