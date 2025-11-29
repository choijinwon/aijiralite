# Netlify NextAuth 500 오류 해결 가이드

## ⚠️ 오류: `/api/auth/session` 500 (Internal Server Error)

이 오류는 Netlify 환경에서 NextAuth 설정이 올바르지 않을 때 발생합니다.

## 🚀 해결 방법

### 1. Netlify 환경 변수 확인

Netlify 대시보드 → **Site settings** → **Environment variables**에서 다음이 설정되어 있는지 확인:

#### 필수 환경 변수:

```
NEXTAUTH_URL=https://aijiralite.netlify.app
NEXTAUTH_SECRET=your-secret-key-here
```

**중요:**
- `NEXTAUTH_URL`은 **정확히** 배포된 URL과 일치해야 합니다
- `https://aijiralite.netlify.app` (슬래시 없이)
- 또는 실제 Netlify 사이트 URL

#### NEXTAUTH_SECRET 생성:

로컬에서 생성:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

또는 온라인 생성기: https://generate-secret.vercel.app/32

### 2. 환경 변수 추가 방법

1. Netlify 대시보드 접속
2. 사이트 선택 (`aijiralite`)
3. **Site settings** → **Environment variables**
4. **Add a variable** 클릭
5. 다음 변수 추가:

```
Variable: NEXTAUTH_URL
Value: https://aijiralite.netlify.app
Scope: All scopes (또는 Production)
```

```
Variable: NEXTAUTH_SECRET
Value: (생성한 시크릿 키)
Scope: All scopes
```

### 3. 재배포

환경 변수 추가 후:

1. **방법 1: 수동 재배포**
   - **Deploys** 탭 → **Trigger deploy** → **Clear cache and deploy site**

2. **방법 2: Git 푸시**
   - GitHub에 새로운 커밋 푸시하면 자동 재배포

### 4. 확인

재배포 후:
1. 사이트 접속: `https://aijiralite.netlify.app`
2. 브라우저 콘솔 확인
3. `/api/auth/session` 오류가 사라졌는지 확인

## 📋 전체 Netlify 환경 변수 체크리스트

### 필수 변수:

```
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=https://aijiralite.netlify.app
NEXTAUTH_SECRET=your-secret-key-here

# JWT
JWT_SECRET=your-jwt-secret-here

# Supabase Auth (Google OAuth용)
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

## 🐛 문제 해결

### 여전히 500 오류가 발생하는 경우

1. **환경 변수 이름 확인**
   - 대소문자 정확히 일치: `NEXTAUTH_URL` (대문자)
   - 언더스코어 확인: `NEXTAUTH_SECRET` (하이픈 아님)

2. **값 확인**
   - 따옴표 없이 입력 (Netlify는 자동 처리)
   - 공백 없이 입력
   - 전체 URL이 한 줄에 있어야 함

3. **재배포 확인**
   - 환경 변수 추가 후 반드시 재배포
   - "Clear cache and deploy site" 옵션 사용

4. **로그 확인**
   - Netlify 대시보드 → **Deploys** → 최신 배포 → **Deploy log**
   - 오류 메시지 확인

### 데이터베이스 연결 오류

NextAuth가 데이터베이스에 접근할 수 없는 경우:

1. `DATABASE_URL` 확인
2. Supabase 연결 풀링 설정 확인
3. IP 제한 확인 (Supabase Dashboard)

## 📚 참고 자료

- [NextAuth Netlify 배포 가이드](https://next-auth.js.org/deployment)
- [Netlify 환경 변수 문서](https://docs.netlify.com/environment-variables/overview/)

