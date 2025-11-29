# Supabase 환경 변수 설정 (간단 가이드)

## ⚠️ 현재 상태

Supabase 환경 변수가 설정되지 않아 Google OAuth 로그인이 작동하지 않습니다.

## 🚀 빠른 설정 (3단계)

### 1단계: Supabase Dashboard에서 정보 가져오기

1. **Supabase Dashboard 접속**
   - https://app.supabase.com
   - 로그인 후 프로젝트 선택

2. **API 정보 찾기**
   - 왼쪽 메뉴: **Project Settings** (⚙️ 아이콘)
   - **API** 탭 클릭
   - 다음 정보 복사:
     - **Project URL** (예: `https://nmhprrhoqovbbhiwfbkk.supabase.co`)
     - **anon public** 키 (긴 JWT 토큰)

### 2단계: `.env.local` 파일에 추가

프로젝트 루트의 `.env.local` 파일을 열고 **맨 아래에** 다음을 추가:

```env
# Supabase Auth (Google OAuth용)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**중요:**
- `your-project-id`를 실제 프로젝트 ID로 교체
- `eyJhbGci...` 부분을 실제 anon 키로 교체
- 큰따옴표(`"`)로 감싸기

**예시:**
```env
NEXT_PUBLIC_SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5taHBycmhvcXZ2YmJoaXdmYmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMDAwMH0.example"
```

### 3단계: 서버 재시작

**반드시** 서버를 재시작해야 환경 변수가 적용됩니다:

```bash
# 1. 서버 중지 (Ctrl+C)
# 2. 서버 재시작
npm run dev
```

## ✅ 확인 방법

서버 재시작 후:

1. 브라우저 콘솔에서 경고가 사라졌는지 확인
2. 로그인 페이지 접속: `http://localhost:3000/auth/signin`
3. "Google" 버튼 클릭 시 오류가 없어야 함

## 📝 전체 `.env.local` 예시

현재 파일에 다음을 추가하세요:

```env
# 기존 내용 (Supabase Database)
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# Supabase Auth (추가 필요!)
NEXT_PUBLIC_SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# NextAuth (기존)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# AI (기존)
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

## 🐛 문제 해결

### 여전히 경고가 나타나는 경우

1. **파일 위치 확인**
   - `.env.local`이 프로젝트 루트에 있는지 확인
   - `C:\Users\VIVESTUDIOS\Desktop\aijiralite\.env.local`

2. **변수 이름 확인**
   - `NEXT_PUBLIC_` 접두사가 정확한지 확인
   - 대소문자 정확히 일치

3. **따옴표 확인**
   - 값이 큰따옴표로 감싸져 있는지 확인

4. **서버 재시작**
   - 환경 변수 변경 후 **반드시** 서버 재시작

5. **캐시 삭제**
   ```bash
   # .next 폴더 삭제
   Remove-Item -Recurse -Force .next
   
   # 서버 재시작
   npm run dev
   ```

## 📚 다음 단계

환경 변수 설정 후:

1. **Supabase Dashboard에서 Google OAuth 설정**
   - Authentication → Providers → Google
   - Enable Google provider
   - Google Cloud Console의 Client ID와 Secret 입력

2. **자세한 가이드**
   - `SUPABASE_AUTH_SETUP.md` 참고

## 💡 팁

- Supabase Project URL은 프로젝트 ID를 포함합니다
- anon 키는 공개되어도 안전하지만, service_role 키는 절대 공개하지 마세요
- 환경 변수 변경 후 항상 서버 재시작이 필요합니다

