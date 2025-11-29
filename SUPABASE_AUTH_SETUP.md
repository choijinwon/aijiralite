# Supabase Auth 설정 가이드

Supabase Auth를 사용하여 Google OAuth 로그인을 구현하는 방법입니다.

## 🚀 1단계: Supabase 프로젝트 설정

### 1. Supabase Dashboard에서 Google OAuth 설정

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Authentication** → **Providers** 메뉴로 이동
4. **Google** 제공자 찾기
5. **Enable Google provider** 토글 활성화
6. Google Cloud Console에서 가져온 정보 입력:
   - **Client ID (for OAuth)**: Google Cloud Console의 클라이언트 ID
   - **Client Secret (for OAuth)**: Google Cloud Console의 클라이언트 시크릿
7. **Save** 클릭

### 2. Redirect URL 설정

Supabase Dashboard → **Authentication** → **URL Configuration**에서:

**Redirect URLs**에 다음 추가:
```
http://localhost:3000/auth/callback
https://your-site-name.netlify.app/auth/callback
```

**Site URL** 설정:
- 로컬: `http://localhost:3000`
- 프로덕션: `https://your-site-name.netlify.app`

## 📝 2단계: 환경 변수 설정

### 로컬 개발 (`.env.local`)

```env
# Supabase Database
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Supabase Auth (필수)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# Supabase Service Role Key (서버 사이드용, 선택)
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

### Supabase URL과 키 찾기

1. Supabase Dashboard → **Project Settings** → **API**
2. **Project URL** 복사 → `NEXT_PUBLIC_SUPABASE_URL`
3. **anon public** 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. (선택) **service_role** 키 복사 → `SUPABASE_SERVICE_ROLE_KEY`

### Netlify 환경 변수

Netlify 대시보드 → **Site settings** → **Environment variables**에서:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🔧 3단계: Google Cloud Console 설정

### OAuth 리디렉션 URI 추가

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. **API 및 서비스** → **사용자 인증 정보**
3. OAuth 클라이언트 ID 선택
4. **승인된 리디렉션 URI**에 추가:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   (Supabase가 자동으로 처리하므로 이 URI만 필요)

## ✅ 4단계: 테스트

1. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. 로그인 페이지 접속: `http://localhost:3000/auth/signin`

3. "Google" 버튼 클릭

4. Google 계정 선택 및 권한 승인

5. 자동으로 `/auth/callback`으로 리디렉션되고 `/dashboard`로 이동

## 🔄 기존 NextAuth와의 차이점

### Supabase Auth 사용 시:

- ✅ Google OAuth 설정이 더 간단
- ✅ Supabase Dashboard에서 직접 관리
- ✅ 자동으로 사용자 데이터베이스에 저장
- ✅ 세션 관리가 자동화됨

### 주의사항:

- 기존 NextAuth 세션과 호환되지 않음
- 기존 사용자는 Supabase Auth로 재가입 필요
- 또는 마이그레이션 스크립트 작성 필요

## 🐛 문제 해결

### "Missing Supabase environment variables" 오류

- `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
- 서버 재시작 확인

### Google 로그인 후 리디렉션 오류

- Supabase Dashboard → Authentication → URL Configuration 확인
- Redirect URLs에 올바른 URL이 추가되었는지 확인

### "Invalid redirect URL" 오류

- Google Cloud Console에서 승인된 리디렉션 URI 확인
- Supabase 콜백 URL이 추가되었는지 확인

## 📚 참고 자료

- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Supabase Google OAuth 가이드](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Supabase JavaScript 클라이언트](https://supabase.com/docs/reference/javascript/introduction)

