# 데이터베이스 연결 문제 해결 가이드

## 문제: "Environment variable not found: DATABASE_URL"

이 오류는 Prisma가 환경 변수를 찾지 못할 때 발생합니다.

## 해결 방법

### 1. 개발 서버 재시작 (가장 중요!)

환경 변수를 변경한 후 **반드시 개발 서버를 재시작**해야 합니다:

```bash
# 현재 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 2. .env 파일 확인

프로젝트 루트 디렉토리에 `.env` 파일이 있어야 합니다:

```
C:\Users\VIVESTUDIOS\Desktop\aijiralite\.env
```

파일 내용 확인:
```env
DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
```

### 3. 파일 인코딩 확인

`.env` 파일이 UTF-8 인코딩으로 저장되어 있는지 확인하세요.

### 4. Prisma 클라이언트 재생성

```bash
# 개발 서버 중지 후
npx prisma generate
```

### 5. 환경 변수 로드 확인

Next.js는 자동으로 `.env` 파일을 로드하지만, Prisma CLI는 명시적으로 로드해야 할 수 있습니다.

**확인 방법:**
```bash
# PowerShell에서
$env:DATABASE_URL
```

값이 출력되지 않으면 환경 변수가 로드되지 않은 것입니다.

## 단계별 해결 체크리스트

- [ ] `.env` 파일이 프로젝트 루트에 있는지 확인
- [ ] `DATABASE_URL`과 `DIRECT_URL`이 올바르게 설정되어 있는지 확인
- [ ] 따옴표가 올바르게 사용되었는지 확인 (큰따옴표 사용)
- [ ] 파일에 공백이나 특수문자 문제가 없는지 확인
- [ ] 개발 서버를 완전히 중지하고 재시작
- [ ] `npx prisma generate` 실행
- [ ] `npx prisma db push` 실행하여 연결 테스트

## 추가 확인 사항

### 파일 위치
```
aijiralite/
├── .env          ← 여기에 있어야 함
├── .env.local    ← 선택사항 (우선순위 높음)
├── package.json
└── prisma/
    └── schema.prisma
```

### 환경 변수 우선순위 (Next.js)
1. `.env.local` (최우선)
2. `.env.development` (개발 환경)
3. `.env` (기본)

### Prisma 환경 변수 로드
Prisma는 다음 순서로 환경 변수를 찾습니다:
1. 시스템 환경 변수
2. `.env` 파일
3. `.env.local` 파일

## 문제가 계속되면

1. **터미널 재시작**
   - PowerShell/CMD를 완전히 닫고 다시 열기

2. **프로젝트 재설정**
   ```bash
   # node_modules 삭제 후 재설치
   rm -r node_modules
   npm install
   npx prisma generate
   ```

3. **환경 변수 직접 설정 (임시)**
   ```powershell
   # PowerShell에서
   $env:DATABASE_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   $env:DIRECT_URL="postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
   npm run dev
   ```

## 성공 확인

다음 명령어로 연결을 테스트하세요:

```bash
npx prisma db push
```

성공 메시지:
```
The database is already in sync with the Prisma schema.
```

또는

```
Your database is now in sync with your Prisma schema.
```

