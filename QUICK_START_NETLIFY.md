# 🚀 Netlify 빠른 배포 가이드

## ⚠️ 필수: 환경 변수 설정 (5분)

Netlify 빌드가 실패하는 이유는 **환경 변수가 설정되지 않았기 때문**입니다.

### 1단계: Netlify 대시보드 접속

1. https://app.netlify.com 접속
2. 배포 중인 사이트 선택

### 2단계: 환경 변수 설정

1. **Site settings** 클릭
2. **Environment variables** 클릭 (왼쪽 메뉴)
3. **Add a variable** 버튼 클릭

### 3단계: 필수 환경 변수 추가

다음 변수들을 **반드시** 추가하세요:

#### 1. DATABASE_URL (필수!)
```
Key: DATABASE_URL
Value: postgresql://user:password@host:port/database?schema=public
```

**예시:**
```
postgresql://postgres:password123@db.example.com:5432/mydb?schema=public
```

#### 2. DIRECT_URL (필수!)
```
Key: DIRECT_URL
Value: DATABASE_URL과 동일한 값
```

**참고:** `DIRECT_URL`은 일반적으로 `DATABASE_URL`과 동일한 값을 사용합니다.

#### 3. NEXTAUTH_SECRET (필수!)
```
Key: NEXTAUTH_SECRET
Value: 32자 이상의 랜덤 문자열
```

**생성 방법:**
- 온라인: https://generate-secret.vercel.app/32
- 또는 터미널: `openssl rand -base64 32`

#### 4. NEXTAUTH_URL (필수!)
```
Key: NEXTAUTH_URL
Value: https://your-site-name.netlify.app
```

**참고:** `your-site-name`을 실제 Netlify 사이트 이름으로 변경하세요.

#### 5. JWT_SECRET (필수!)
```
Key: JWT_SECRET
Value: 32자 이상의 랜덤 문자열
```

**생성 방법:** `NEXTAUTH_SECRET`과 동일하게 생성

### 4단계: 저장 및 재배포

1. 모든 환경 변수 추가 후 **Save** 클릭
2. **Deploys** 탭으로 이동
3. **Trigger deploy** > **Deploy site** 클릭

## ✅ 환경 변수 체크리스트

배포 전 다음을 확인하세요:

- [ ] `DATABASE_URL` 설정됨
- [ ] `DIRECT_URL` 설정됨 (DATABASE_URL과 동일)
- [ ] `NEXTAUTH_SECRET` 설정됨 (32자 이상)
- [ ] `NEXTAUTH_URL` 설정됨 (실제 배포 URL)
- [ ] `JWT_SECRET` 설정됨 (32자 이상)

## 🔍 환경 변수 확인 방법

Netlify 대시보드에서:
1. **Site settings** > **Environment variables**
2. 설정된 모든 변수 목록 확인
3. 각 변수의 값이 올바른지 확인

## 📝 선택적 환경 변수

다음은 선택 사항입니다 (기능에 따라 필요):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 사용 시
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase 사용 시
- `GOOGLE_CLIENT_ID` - Google 로그인 사용 시
- `GOOGLE_CLIENT_SECRET` - Google 로그인 사용 시
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` - 이메일 발송 사용 시
- `RESEND_API_KEY` - Resend 이메일 사용 시

## 🐛 문제 해결

### "DATABASE_URL이 설정되지 않았습니다" 오류
- **원인**: Netlify 대시보드에 `DATABASE_URL`이 설정되지 않음
- **해결**: 위의 3단계를 따라 `DATABASE_URL` 추가

### "DIRECT_URL이 설정되지 않았습니다" 오류
- **원인**: `DIRECT_URL`이 설정되지 않음
- **해결**: `DIRECT_URL`을 `DATABASE_URL`과 동일한 값으로 추가

### 빌드는 성공했지만 런타임 오류 발생
- **원인**: 일부 환경 변수가 누락되었거나 잘못된 값
- **해결**: 
  1. Netlify Functions 로그 확인
  2. 환경 변수 값 재확인
  3. 데이터베이스 연결 확인

## 📚 더 자세한 정보

- `NETLIFY_ENV_SETUP.md` - 환경 변수 상세 가이드
- `DEPLOY_NETLIFY.md` - 전체 배포 가이드

