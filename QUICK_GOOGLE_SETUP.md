# Google OAuth 빠른 설정 가이드

## ⚠️ 오류: `client_id is required`

이 오류는 Google OAuth 클라이언트 ID가 설정되지 않아서 발생합니다.

## 🚀 빠른 해결 방법

### 1. `.env.local` 파일 생성/확인

프로젝트 루트에 `.env.local` 파일이 있는지 확인하고, 없으면 생성하세요.

### 2. Google Cloud Console에서 OAuth 클라이언트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. **API 및 서비스** → **사용자 인증 정보**
3. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID**
4. **애플리케이션 유형**: 웹 애플리케이션
5. **승인된 리디렉션 URI** 추가:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. **만들기** 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사

### 3. `.env.local` 파일에 추가

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. NEXTAUTH_SECRET 생성 (없는 경우)

PowerShell에서 실행:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

또는 온라인 생성기 사용: https://generate-secret.vercel.app/32

### 5. 서버 재시작

환경 변수 변경 후 **반드시** 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
npm run dev
```

## ✅ 확인 방법

서버 재시작 후 로그인 페이지에서 "Google" 버튼을 클릭했을 때 Google 로그인 페이지로 이동하면 성공입니다.

## 🐛 여전히 오류가 발생하는 경우

1. **환경 변수 이름 확인**: 대소문자 정확히 일치하는지 확인
2. **따옴표 확인**: `.env.local`에서 값에 따옴표가 있는지 확인
3. **서버 재시작**: 환경 변수 변경 후 반드시 서버 재시작
4. **파일 위치**: `.env.local`이 프로젝트 루트에 있는지 확인
5. **공백 확인**: 환경 변수 값에 불필요한 공백이 없는지 확인

## 📝 예시 `.env.local` 파일

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:password@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:password@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Google OAuth
GOOGLE_CLIENT_ID="123456789-abcdefghijklmnop.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwxyz"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-32-character-secret-key-here"

# JWT
JWT_SECRET="your-jwt-secret-key-here"

# AI (선택)
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
```

