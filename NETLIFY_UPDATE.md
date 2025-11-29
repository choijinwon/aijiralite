# Netlify 환경 변수 업데이트 가이드

## 🚀 빠른 업데이트 방법

### 1. Netlify 대시보드 접속

1. https://app.netlify.com 에서 로그인
2. 배포된 사이트 선택 (`aijiralite` 또는 해당 사이트)

### 2. 환경 변수 설정

**Site settings → Environment variables → Add a variable**

다음 변수들을 하나씩 추가하세요:

#### 필수 변수 (Supabase)

```
Variable: DATABASE_URL
Value: postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
Scope: All scopes (또는 Production)
```

```
Variable: DIRECT_URL
Value: postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
Scope: All scopes (또는 Production)
```

#### 필수 변수 (인증)

```
Variable: NEXTAUTH_URL
Value: https://your-site-name.netlify.app
Scope: All scopes
```
**중요**: `your-site-name`을 실제 Netlify 사이트 이름으로 교체하세요.

```
Variable: NEXTAUTH_SECRET
Value: your-secret-key-here
Scope: All scopes
```
**시크릿 생성**: `openssl rand -base64 32`

```
Variable: JWT_SECRET
Value: your-jwt-secret-here
Scope: All scopes
```
**시크릿 생성**: `openssl rand -base64 32`

#### 선택적 변수 (AI 기능)

```
Variable: AI_PROVIDER
Value: claude
Scope: All scopes
```

```
Variable: ANTHROPIC_API_KEY
Value: your-anthropic-api-key
Scope: All scopes
```

### 3. 재배포

환경 변수 추가 후:

1. **방법 1: 수동 재배포**
   - Deploys 탭 → "Trigger deploy" → "Clear cache and deploy site"

2. **방법 2: Git 푸시**
   - GitHub에 새로운 커밋 푸시하면 자동으로 재배포됩니다

## 📋 환경 변수 체크리스트

- [ ] `DATABASE_URL` - Supabase 연결 (Connection Pooling)
- [ ] `DIRECT_URL` - Supabase 연결 (Direct Connection)
- [ ] `NEXTAUTH_URL` - 실제 배포 URL
- [ ] `NEXTAUTH_SECRET` - NextAuth 시크릿 키
- [ ] `JWT_SECRET` - JWT 토큰 시크릿
- [ ] `AI_PROVIDER` (선택) - AI 제공자
- [ ] `ANTHROPIC_API_KEY` (선택) - Anthropic API 키

## 🔍 환경 변수 확인 방법

1. Netlify 대시보드 → Site settings → Environment variables
2. 모든 변수가 올바르게 설정되었는지 확인
3. 변수 이름에 오타가 없는지 확인
4. 값에 따옴표가 포함되지 않았는지 확인 (Netlify는 자동으로 처리)

## ⚠️ 주의사항

1. **비밀번호 보호**
   - 환경 변수는 절대 공개하지 마세요
   - GitHub에 커밋하지 마세요

2. **NEXTAUTH_URL**
   - 실제 배포 URL과 정확히 일치해야 합니다
   - 예: `https://aijiralite.netlify.app`

3. **특수문자 처리**
   - 비밀번호에 특수문자(`!`)가 포함되어 있지만, Netlify 환경 변수에서는 그대로 사용 가능합니다

## 🐛 문제 해결

### 환경 변수가 적용되지 않을 때

1. **재배포 확인**
   - 환경 변수 추가 후 반드시 재배포해야 합니다
   - "Clear cache and deploy site" 옵션 사용 권장

2. **변수 이름 확인**
   - 대소문자 구분: `DATABASE_URL` ≠ `database_url`
   - 언더스코어 확인: `DIRECT_URL` (하이픈 아님)

3. **값 확인**
   - 따옴표 없이 입력
   - 공백 없이 입력
   - 전체 연결 문자열이 한 줄에 있어야 함

### 빌드 오류

1. **로그 확인**
   - Deploys 탭 → 최신 배포 → "Deploy log" 확인
   - 오류 메시지 확인

2. **환경 변수 누락 확인**
   - "Environment variable not found" 오류가 있으면 해당 변수가 설정되었는지 확인

## 📚 참고 자료

- [Netlify 환경 변수 문서](https://docs.netlify.com/environment-variables/overview/)
- [Supabase 연결 가이드](./SUPABASE_SETUP.md)

