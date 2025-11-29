# Supabase Auth 빠른 설정 가이드

## ⚠️ 오류: "Missing Supabase environment variables"

이 오류는 Supabase 환경 변수가 설정되지 않아서 발생합니다.

## 🚀 빠른 해결 방법

### 1. Supabase Dashboard에서 정보 가져오기

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Project Settings** → **API** 메뉴로 이동
4. 다음 정보 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. `.env.local` 파일에 추가

프로젝트 루트의 `.env.local` 파일을 열고 다음을 추가:

```env
# Supabase Auth (필수)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

**예시:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Google OAuth 설정 (Supabase Dashboard)

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Google** 제공자 찾기
3. **Enable Google provider** 토글 활성화
4. Google Cloud Console에서 가져온 정보 입력:
   - **Client ID (for OAuth)**: Google Cloud Console의 클라이언트 ID
   - **Client Secret (for OAuth)**: Google Cloud Console의 클라이언트 시크릿
5. **Save** 클릭

### 4. Redirect URL 설정

Supabase Dashboard → **Authentication** → **URL Configuration**:

**Redirect URLs**에 추가:
```
http://localhost:3000/auth/callback
https://your-site-name.netlify.app/auth/callback
```

**Site URL** 설정:
- 로컬: `http://localhost:3000`
- 프로덕션: `https://your-site-name.netlify.app`

### 5. Google Cloud Console 설정

Google Cloud Console에서 **승인된 리디렉션 URI**에 추가:
```
https://your-project-id.supabase.co/auth/v1/callback
```

### 6. 서버 재시작

환경 변수 추가 후 **반드시** 서버를 재시작:

```bash
# 서버 중지 (Ctrl+C)
npm run dev
```

## ✅ 확인 방법

1. 환경 변수 확인:
   ```bash
   # PowerShell에서
   $env:NEXT_PUBLIC_SUPABASE_URL
   ```

2. 로그인 페이지 접속: `http://localhost:3000/auth/signin`
3. "Google" 버튼 클릭
4. Google 로그인 페이지로 이동하면 성공!

## 📝 전체 `.env.local` 예시

```env
# Supabase Database
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Supabase Auth (필수)
NEXT_PUBLIC_SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taHBycmhvcXZ2YmJoaXdmYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.example"

# NextAuth (기존 인증용, 선택)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# AI (선택)
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

## 🐛 문제 해결

### 여전히 오류가 발생하는 경우

1. **파일 위치 확인**: `.env.local`이 프로젝트 루트에 있는지 확인
2. **변수 이름 확인**: `NEXT_PUBLIC_` 접두사가 있는지 확인
3. **따옴표 확인**: 값에 큰따옴표가 있는지 확인
4. **서버 재시작**: 환경 변수 변경 후 반드시 서버 재시작
5. **캐시 삭제**: `.next` 폴더 삭제 후 재시작

```bash
# .next 폴더 삭제
Remove-Item -Recurse -Force .next

# 서버 재시작
npm run dev
```

## 📚 자세한 내용

- `SUPABASE_AUTH_SETUP.md` - 상세한 설정 가이드
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)

