# Netlify 환경 변수 체크리스트

## ⚠️ NextAuth 500 오류 해결

`/api/auth/session` 500 오류를 해결하려면 다음 환경 변수가 **반드시** 설정되어 있어야 합니다.

## ✅ 필수 환경 변수

### 1. NextAuth 설정

```
NEXTAUTH_URL=https://aijiralite.netlify.app
NEXTAUTH_SECRET=your-secret-key-here
```

**중요:**
- `NEXTAUTH_URL`은 정확히 배포된 URL과 일치해야 합니다
- `https://aijiralite.netlify.app` (슬래시 없이)
- `NEXTAUTH_SECRET`은 32자 이상의 랜덤 문자열

### 2. 데이터베이스

```
DATABASE_URL=postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

### 3. JWT

```
JWT_SECRET=your-jwt-secret-here
```

### 4. Supabase Auth (Google OAuth용)

```
NEXT_PUBLIC_SUPABASE_URL=https://nmhprrhoqovbbhiwfbkk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9iBczdrsJxsHp0IncOkV6A_PmY4oESp
SUPABASE_SERVICE_ROLE_KEY=sb_secret_lfz75NufCyqLDeHMvFHs2Q_bZY1ONOU
```

## 📝 설정 방법

1. **Netlify 대시보드 접속**
   - https://app.netlify.com
   - 사이트 선택: `aijiralite`

2. **환경 변수 추가**
   - **Site settings** → **Environment variables** → **Add a variable**
   - 위의 변수들을 하나씩 추가

3. **재배포**
   - **Deploys** 탭 → **Trigger deploy** → **Clear cache and deploy site**

## 🔍 확인 방법

재배포 후:

1. 사이트 접속: `https://aijiralite.netlify.app`
2. 브라우저 콘솔 확인 (F12)
3. `/api/auth/session` 오류가 사라졌는지 확인

## 🐛 문제 해결

### 여전히 500 오류가 발생하는 경우

1. **환경 변수 이름 확인**
   - `NEXTAUTH_URL` (대문자)
   - `NEXTAUTH_SECRET` (대문자)
   - 언더스코어(`_`) 사용, 하이픈(`-`) 아님

2. **값 확인**
   - 따옴표 없이 입력
   - 공백 없이 입력
   - 전체 URL이 한 줄

3. **재배포 확인**
   - 환경 변수 추가 후 반드시 재배포
   - "Clear cache and deploy site" 옵션 사용

4. **로그 확인**
   - **Deploys** → 최신 배포 → **Deploy log**
   - 오류 메시지 확인

## 📚 참고

- `NETLIFY_NEXTAUTH_FIX.md` - 상세한 해결 가이드
- `NETLIFY_ENV_SETUP.md` - 전체 환경 변수 설정 가이드

