# Netlify 배포 가이드

이 가이드는 Jira Lite 애플리케이션을 Netlify에 배포하는 방법을 설명합니다.

## 📋 사전 준비사항

1. **GitHub 저장소**: 코드가 GitHub에 푸시되어 있어야 합니다
2. **데이터베이스**: Netlify는 서버리스 플랫폼이므로 외부 데이터베이스가 필요합니다
   - **권장**: PlanetScale (MySQL), Supabase (PostgreSQL), 또는 Railway (MySQL/PostgreSQL)
3. **도메인** (선택사항): 커스텀 도메인 사용 가능

## 🗄️ 1. 데이터베이스 설정

Netlify는 파일 시스템을 저장할 수 없으므로 **SQLite는 사용할 수 없습니다**. 외부 데이터베이스가 필요합니다.

### 옵션 1: PlanetScale (MySQL) - 권장

1. [PlanetScale](https://planetscale.com)에서 계정 생성
2. 새 데이터베이스 생성
3. 연결 문자열 복사 (예: `mysql://username:password@host:port/database`)
4. **중요**: Prisma 스키마를 MySQL에 맞게 확인

### 옵션 2: Supabase (PostgreSQL)

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. Database → Connection string 복사
3. Prisma 스키마를 PostgreSQL에 맞게 수정 필요

### 옵션 3: Railway (MySQL/PostgreSQL)

1. [Railway](https://railway.app)에서 프로젝트 생성
2. MySQL 또는 PostgreSQL 서비스 추가
3. 연결 문자열 복사

## 🚀 2. Netlify 배포

### 방법 1: GitHub 연동 (권장)

1. **Netlify 계정 생성**
   - [Netlify](https://www.netlify.com)에 로그인
   - GitHub 계정으로 연동

2. **새 사이트 생성**
   - "Add new site" → "Import an existing project" 클릭
   - GitHub 저장소 선택: `choijinwon/aijiralite`
   - "Import" 클릭

3. **빌드 설정**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - (자동으로 `netlify.toml` 설정이 적용됩니다)

4. **환경 변수 설정**
   - Site settings → Environment variables
   - 다음 변수들을 추가:

```env
# Database (PlanetScale 예시)
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict

# NextAuth
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Provider
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-anthropic-api-key
# 또는
OPENAI_API_KEY=your-openai-api-key

# Email (선택사항)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# JWT
JWT_SECRET=your-jwt-secret
```

5. **배포 시작**
   - "Deploy site" 클릭
   - 빌드가 완료될 때까지 대기 (약 3-5분)

### 방법 2: Netlify CLI 사용

1. **Netlify CLI 설치**
```bash
npm install -g netlify-cli
```

2. **로그인**
```bash
netlify login
```

3. **배포**
```bash
# 초기 배포
netlify deploy

# 프로덕션 배포
netlify deploy --prod
```

## ⚙️ 3. 환경 변수 상세 설정

### 필수 환경 변수

```env
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

### 선택적 환경 변수

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI (하나만 선택)
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-anthropic-key
# 또는
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🔧 4. Prisma 설정 확인

Netlify 배포 시 Prisma가 제대로 작동하도록 확인:

1. **Prisma 스키마 확인**
   - `prisma/schema.prisma`에서 데이터베이스 provider 확인
   - MySQL 사용 시: `provider = "mysql"`
   - PostgreSQL 사용 시: `provider = "postgresql"`

2. **빌드 시 Prisma 생성**
   - `package.json`의 `build` 스크립트에 `prisma generate` 포함 확인
   - 현재: `"build": "prisma generate && prisma db push && next build"`

## 📝 5. Google OAuth 리디렉션 URI 설정

Netlify 배포 후 Google OAuth를 사용하는 경우:

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. OAuth 2.0 클라이언트 ID 설정
3. 승인된 리디렉션 URI 추가:
   ```
   https://your-site-name.netlify.app/api/auth/callback/google
   ```

## 🐛 6. 문제 해결

### 빌드 실패

1. **Prisma 오류**
   - 데이터베이스 연결 문자열 확인
   - SSL 설정 확인 (PlanetScale은 `?sslaccept=strict` 필요)

2. **환경 변수 오류**
   - Netlify 대시보드에서 모든 필수 환경 변수 설정 확인
   - 변수 이름에 오타가 없는지 확인

3. **빌드 타임아웃**
   - Netlify 무료 플랜은 빌드 시간 제한이 있습니다
   - `netlify.toml`에서 빌드 설정 최적화

### 런타임 오류

1. **데이터베이스 연결 실패**
   - `DATABASE_URL` 확인
   - 데이터베이스가 외부 접근을 허용하는지 확인

2. **인증 오류**
   - `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인
   - `NEXTAUTH_SECRET`이 설정되어 있는지 확인

## 🔄 7. 자동 배포 설정

GitHub에 푸시할 때마다 자동으로 배포되도록 설정:

1. Netlify 대시보드 → Site settings → Build & deploy
2. "Continuous Deployment" 확인
3. GitHub 저장소와 연동되어 있으면 자동으로 활성화됨

## 📊 8. 배포 확인

배포 완료 후:

1. Netlify 대시보드에서 배포 상태 확인
2. 배포된 URL로 접속
3. 로그인/회원가입 테스트
4. 기능 테스트

## 🔐 9. 보안 설정

1. **환경 변수 보호**
   - 민감한 정보는 환경 변수로만 관리
   - 코드에 API 키나 비밀번호를 하드코딩하지 않기

2. **HTTPS**
   - Netlify는 자동으로 HTTPS 제공
   - 커스텀 도메인도 HTTPS 자동 적용

## 📚 추가 리소스

- [Netlify 문서](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [PlanetScale 문서](https://docs.planetscale.com/)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)

---

**참고**: Netlify 무료 플랜은 빌드 시간과 함수 실행 시간에 제한이 있습니다. 프로덕션 환경에서는 유료 플랜을 고려하세요.

