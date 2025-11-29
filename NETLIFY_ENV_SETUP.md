# Netlify 환경 변수 설정 가이드

Netlify 배포 시 필요한 환경 변수를 설정하는 방법입니다.

## 🚀 빠른 설정 방법

### 1. Netlify 대시보드에서 설정

1. **Netlify 대시보드 접속**
   - https://app.netlify.com 에서 로그인
   - 배포된 사이트 선택

2. **환경 변수 추가**
   - Site settings → Environment variables → Add a variable
   - 아래 변수들을 하나씩 추가:

### 2. 필수 환경 변수

#### 데이터베이스 (필수)
```
DATABASE_URL=mysql://username:password@host:port/database?sslaccept=strict
```

**중요**: Netlify는 SQLite를 지원하지 않습니다. 외부 데이터베이스가 필요합니다.

**데이터베이스 옵션:**
- **PlanetScale** (MySQL) - 권장: https://planetscale.com
- **Supabase** (PostgreSQL): https://supabase.com
- **Railway** (MySQL/PostgreSQL): https://railway.app

#### NextAuth (필수)
```
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your-secret-key-here
```

**시크릿 생성 방법:**
```bash
openssl rand -base64 32
```

#### JWT (필수)
```
JWT_SECRET=your-jwt-secret-here
```

**시크릿 생성 방법:**
```bash
openssl rand -base64 32
```

### 3. 선택적 환경 변수

#### Google OAuth (선택)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### AI 기능 (선택)
```
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-anthropic-api-key
```

또는

```
AI_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key
```

#### 이메일 알림 (선택)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 📝 단계별 설정

### Step 1: 데이터베이스 생성

#### PlanetScale 사용 시:

1. [PlanetScale](https://planetscale.com)에서 계정 생성
2. 새 데이터베이스 생성
3. 연결 문자열 복사:
   ```
   mysql://username:password@host:port/database?sslaccept=strict
   ```
4. Prisma 스키마 provider 변경:
   - `prisma/schema.prisma`에서 `provider = "sqlite"`를 `provider = "mysql"`로 변경
5. 마이그레이션 실행:
   ```bash
   npx prisma db push
   ```

### Step 2: Netlify 환경 변수 설정

1. Netlify 대시보드 → Site settings → Environment variables
2. "Add a variable" 클릭
3. 각 변수 추가:
   - Variable: `DATABASE_URL`
   - Value: `mysql://username:password@host:port/database?sslaccept=strict`
   - Scope: All scopes (또는 Production)
4. 나머지 변수들도 동일하게 추가

### Step 3: 재배포

환경 변수 추가 후:
1. "Deploy settings" → "Trigger deploy" → "Clear cache and deploy site"
2. 또는 GitHub에 새로운 커밋 푸시

## 🔍 환경 변수 확인

배포 후 환경 변수가 제대로 설정되었는지 확인:

1. Netlify Functions 로그 확인
2. 사이트 접속하여 로그인 테스트
3. 데이터베이스 연결 테스트

## ⚠️ 주의사항

1. **DATABASE_URL은 절대 공개하지 마세요**
   - GitHub에 커밋하지 않기
   - `.env` 파일은 `.gitignore`에 포함되어 있어야 함

2. **NEXTAUTH_URL은 실제 배포 URL과 일치해야 함**
   - 예: `https://your-site-name.netlify.app`

3. **프로덕션과 개발 환경 분리**
   - Production과 Deploy preview에 다른 값 설정 가능

## 🐛 문제 해결

### "Environment variable not found: DATABASE_URL"

- Netlify 대시보드에서 환경 변수가 설정되었는지 확인
- 변수 이름에 오타가 없는지 확인
- 재배포 후에도 문제가 지속되면 캐시 클리어

### 데이터베이스 연결 실패

- `DATABASE_URL` 형식 확인
- SSL 설정 확인 (PlanetScale은 `?sslaccept=strict` 필요)
- 데이터베이스가 외부 접근을 허용하는지 확인

### 인증 오류

- `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인
- `NEXTAUTH_SECRET`이 설정되어 있는지 확인

## 📚 참고 자료

- [Netlify 환경 변수 문서](https://docs.netlify.com/environment-variables/overview/)
- [PlanetScale 문서](https://docs.planetscale.com/)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)

