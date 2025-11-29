# Netlify NEXTAUTH_SECRET 설정 가이드

## ⚠️ 오류: "NEXTAUTH_SECRET is not configured"

이 오류는 Netlify 환경 변수에 `NEXTAUTH_SECRET`이 설정되지 않아서 발생합니다.

## 🚀 빠른 해결 방법

### 1. NEXTAUTH_SECRET 생성

로컬에서 시크릿 생성:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

또는 온라인 생성기: https://generate-secret.vercel.app/32

### 2. Netlify 환경 변수 추가

1. **Netlify 대시보드 접속**
   - https://app.netlify.com
   - 사이트 선택: `aijiralite`

2. **환경 변수 추가**
   - **Site settings** → **Environment variables** → **Add a variable**

3. **다음 변수 추가:**

```
Variable: NEXTAUTH_SECRET
Value: (생성한 시크릿 키)
Scope: All scopes
```

```
Variable: NEXTAUTH_URL
Value: https://aijiralite.netlify.app
Scope: All scopes
```

**중요:**
- `NEXTAUTH_URL`은 정확히 배포된 URL과 일치해야 합니다
- `https://aijiralite.netlify.app` (슬래시 없이)
- 실제 Netlify 사이트 URL을 확인하세요

### 3. 재배포

환경 변수 추가 후 **반드시** 재배포:

1. **Deploys** 탭 → **Trigger deploy** → **Clear cache and deploy site**
2. 또는 GitHub에 새로운 커밋 푸시

### 4. 확인

재배포 후:
1. 사이트 접속: `https://aijiralite.netlify.app`
2. 브라우저 콘솔 확인 (F12)
3. `/api/auth/session` 오류가 사라졌는지 확인

## 📋 전체 Netlify 환경 변수 체크리스트

### 필수 변수 (반드시 설정):

```
# NextAuth (필수)
NEXTAUTH_URL=https://aijiralite.netlify.app
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# JWT
JWT_SECRET=your-jwt-secret-here

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://nmhprrhoqovbbhiwfbkk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9iBczdrsJxsHp0IncOkV6A_PmY4oESp
SUPABASE_SERVICE_ROLE_KEY=sb_secret_lfz75NufCyqLDeHMvFHs2Q_bZY1ONOU
```

### 선택적 변수:

```
# AI
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-key

# Google OAuth (NextAuth용, 선택)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## 🔍 확인 방법

### 1. Netlify 대시보드에서 확인

1. **Site settings** → **Environment variables**
2. 모든 변수가 올바르게 설정되었는지 확인
3. 변수 이름에 오타가 없는지 확인

### 2. 배포 로그 확인

1. **Deploys** 탭 → 최신 배포 → **Deploy log**
2. 환경 변수 관련 오류 확인
3. 빌드 성공 여부 확인

### 3. 브라우저 콘솔 확인

1. 사이트 접속: `https://aijiralite.netlify.app`
2. 개발자 도구 열기 (F12)
3. Console 탭에서 오류 확인
4. Network 탭에서 `/api/auth/session` 요청 확인

## 🐛 문제 해결

### 여전히 500 오류가 발생하는 경우

1. **환경 변수 이름 확인**
   - `NEXTAUTH_SECRET` (대문자)
   - `NEXTAUTH_URL` (대문자)
   - 언더스코어(`_`) 사용, 하이픈(`-`) 아님

2. **값 확인**
   - 따옴표 없이 입력
   - 공백 없이 입력
   - 전체 URL이 한 줄

3. **재배포 확인**
   - 환경 변수 추가 후 반드시 재배포
   - "Clear cache and deploy site" 옵션 사용

4. **사이트 URL 확인**
   - Netlify 대시보드에서 실제 사이트 URL 확인
   - `NEXTAUTH_URL`이 실제 URL과 일치하는지 확인

## 📝 단계별 가이드

### Step 1: 시크릿 생성

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

출력 예시:
```
uSObuYcWtXC9b4OPAPmLNygboWjdQWgDwnH4I0QSnoE=
```

### Step 2: Netlify에 추가

1. Netlify 대시보드 → Site settings → Environment variables
2. Add a variable 클릭
3. Variable: `NEXTAUTH_SECRET`
4. Value: (생성한 시크릿)
5. Scope: All scopes
6. Add variable 클릭

### Step 3: NEXTAUTH_URL 추가

1. Add a variable 클릭
2. Variable: `NEXTAUTH_URL`
3. Value: `https://aijiralite.netlify.app` (실제 URL로 교체)
4. Scope: All scopes
5. Add variable 클릭

### Step 4: 재배포

1. Deploys 탭
2. Trigger deploy → Clear cache and deploy site
3. 배포 완료 대기

### Step 5: 확인

1. 사이트 접속
2. 브라우저 콘솔 확인
3. 오류가 사라졌는지 확인

## ✅ 성공 확인

다음이 모두 작동하면 성공:

1. ✅ `/api/auth/session` 오류 없음
2. ✅ 페이지가 정상적으로 로드됨
3. ✅ 로그인 페이지 접속 가능
4. ✅ NextAuth 세션이 정상 작동

## 📚 참고 자료

- `NETLIFY_NEXTAUTH_FIX.md` - 상세한 NextAuth 오류 해결 가이드
- `NETLIFY_ENV_CHECKLIST.md` - 전체 환경 변수 체크리스트

