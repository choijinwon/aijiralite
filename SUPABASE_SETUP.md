# Supabase 데이터베이스 설정 가이드

Supabase를 사용하여 Jira Lite 애플리케이션의 데이터베이스를 설정하는 방법입니다.

## 🚀 빠른 시작

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 계정 생성
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `jira-lite` (또는 원하는 이름)
   - Database Password: 강력한 비밀번호 설정 (저장해두세요!)
   - Region: 가장 가까운 지역 선택
4. 프로젝트 생성 완료 대기 (약 2분)

### 2. 연결 문자열 가져오기

1. Project Settings → Database
2. Connection string 섹션에서:
   - **Connection pooling** (Transaction mode) 복사 → `DATABASE_URL`
   - **Direct connection** 복사 → `DIRECT_URL`

예시:
```env
# Connection pooling (일반 사용)
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (마이그레이션용)
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
```

### 3. 로컬 개발 환경 설정

1. `.env.local` 파일 생성 (또는 기존 파일 수정):
```env
# Supabase Database
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# AI (선택)
AI_PROVIDER="claude"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

2. 데이터베이스 마이그레이션 실행:
```bash
npx prisma db push
```

3. (선택) 샘플 데이터 시드:
```bash
npm run db:seed
```

### 4. Netlify 환경 변수 설정

1. Netlify 대시보드 → Site settings → Environment variables
2. 다음 변수들 추가:

#### 필수 변수:
```
DATABASE_URL=postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.nmhprrhoqovbbhiwfbkk:[YOUR-PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
```

#### 선택적 변수:
```
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-anthropic-api-key
```

3. 재배포:
   - "Deploy settings" → "Trigger deploy" → "Clear cache and deploy site"

## 🔧 Prisma 설정

Prisma 스키마는 이미 PostgreSQL로 설정되어 있습니다:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 📝 중요 사항

### Connection Pooling vs Direct Connection

- **DATABASE_URL** (Connection Pooling): 
  - 일반 애플리케이션 사용
  - PgBouncer를 통한 연결 풀링
  - 포트: 6543
  - `?pgbouncer=true` 파라미터 포함

- **DIRECT_URL** (Direct Connection):
  - Prisma 마이그레이션 전용
  - 직접 데이터베이스 연결
  - 포트: 5432
  - 마이그레이션 시에만 사용

### 보안

1. **비밀번호 보호**:
   - `.env` 파일은 절대 GitHub에 커밋하지 마세요
   - `.gitignore`에 `.env*` 포함 확인

2. **환경 변수**:
   - Netlify에서 환경 변수 설정 시 실제 비밀번호로 `[YOUR-PASSWORD]` 교체
   - Production과 Development 환경 분리 권장

3. **데이터베이스 접근 제어**:
   - Supabase Dashboard → Settings → Database → Connection Pooling 설정 확인
   - IP 제한 설정 가능

## 🐛 문제 해결

### 연결 오류

1. **비밀번호 확인**:
   - Supabase Dashboard → Settings → Database → Database password 확인
   - 연결 문자열의 `[YOUR-PASSWORD]`를 실제 비밀번호로 교체

2. **포트 확인**:
   - Connection pooling: 6543
   - Direct connection: 5432

3. **SSL 설정**:
   - Supabase는 기본적으로 SSL을 사용합니다
   - 연결 문자열에 `?sslmode=require` 추가 가능

### 마이그레이션 오류

1. **DIRECT_URL 사용 확인**:
   - Prisma 마이그레이션은 `DIRECT_URL을 사용합니다
   - `DIRECT_URL`이 올바르게 설정되었는지 확인

2. **권한 확인**:
   - Supabase에서 데이터베이스 사용자 권한 확인
   - Schema 생성 권한이 있는지 확인

### Prisma 오류

```bash
# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 스키마 재적용
npx prisma db push --force-reset  # 주의: 모든 데이터 삭제됨
```

## 📚 참고 자료

- [Supabase 문서](https://supabase.com/docs)
- [Prisma PostgreSQL 가이드](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

## ✅ 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] DATABASE_URL 연결 문자열 복사
- [ ] DIRECT_URL 연결 문자열 복사
- [ ] `.env.local` 파일에 환경 변수 설정
- [ ] `npx prisma db push` 실행 성공
- [ ] Netlify 환경 변수 설정
- [ ] Netlify 재배포 성공
- [ ] 사이트 접속 및 로그인 테스트

