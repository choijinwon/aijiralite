# 설정 가이드

## 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Database
DATABASE_URL="mysql://username:password@host:port/database"

# Authentication
NEXTAUTH_SECRET="your-secret-here"  # openssl rand -base64 32 로 생성 가능
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI
OPENAI_API_KEY="your-openai-api-key"

# Email (선택사항)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# JWT
JWT_SECRET="your-jwt-secret"  # openssl rand -base64 32 로 생성 가능
```

## 2. 데이터베이스 설정

### PlanetScale 사용 (권장)

1. [PlanetScale](https://planetscale.com)에서 계정 생성
2. 새 데이터베이스 생성
3. 연결 문자열을 `DATABASE_URL`에 설정

### 로컬 MySQL 사용

1. MySQL 설치 및 실행
2. 데이터베이스 생성:
```sql
CREATE DATABASE jira_lite;
```
3. `DATABASE_URL` 설정:
```
DATABASE_URL="mysql://root:password@localhost:3306/jira_lite"
```

## 3. 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 스키마 적용
npx prisma db push

# (선택사항) 샘플 데이터 시드
npm run db:seed
```

## 4. Google OAuth 설정 (선택사항)

1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI 추가: `http://localhost:3000/api/auth/callback/google`
4. 클라이언트 ID와 시크릿을 환경 변수에 설정

## 5. OpenAI API 키 설정

1. [OpenAI](https://platform.openai.com)에서 계정 생성
2. API 키 생성
3. 환경 변수에 설정

## 6. 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## 7. 배포 (Netlify)

1. GitHub에 코드 푸시
2. Netlify에서 새 사이트 생성
3. GitHub 저장소 연결
4. 환경 변수 설정 (Netlify 대시보드)
5. 배포!

## 문제 해결

### 데이터베이스 연결 오류
- `DATABASE_URL` 형식 확인
- 데이터베이스 서버 실행 확인
- 방화벽 설정 확인

### 인증 오류
- `NEXTAUTH_SECRET` 설정 확인
- `JWT_SECRET` 설정 확인
- 쿠키 설정 확인

### AI 기능 오류
- `OPENAI_API_KEY` 설정 확인
- API 키 유효성 확인
- Rate limit 확인

