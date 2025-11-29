# Netlify 배포 체크리스트

## ✅ 배포 전 확인사항

### 1. 데이터베이스 설정
- [ ] 외부 데이터베이스 생성 (PlanetScale, Supabase, Railway 등)
- [ ] `DATABASE_URL` 환경 변수 준비
- [ ] Prisma 스키마 provider를 `mysql` 또는 `postgresql`로 변경
- [ ] 데이터베이스 마이그레이션 실행 (`prisma db push` 또는 `prisma migrate deploy`)

### 2. 환경 변수 준비
- [ ] `DATABASE_URL` - 데이터베이스 연결 문자열
- [ ] `NEXTAUTH_URL` - Netlify 배포 URL (예: `https://your-site.netlify.app`)
- [ ] `NEXTAUTH_SECRET` - NextAuth 시크릿 키
- [ ] `JWT_SECRET` - JWT 토큰 시크릿
- [ ] `GOOGLE_CLIENT_ID` (선택) - Google OAuth 클라이언트 ID
- [ ] `GOOGLE_CLIENT_SECRET` (선택) - Google OAuth 클라이언트 시크릿
- [ ] `AI_PROVIDER` - "openai" 또는 "claude"
- [ ] `OPENAI_API_KEY` 또는 `ANTHROPIC_API_KEY` - AI API 키
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (선택) - 이메일 설정

### 3. 코드 확인
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 하드코딩된 API 키나 비밀번호가 없는지 확인
- [ ] `netlify.toml` 파일이 올바르게 설정되어 있는지 확인
- [ ] `package.json`의 빌드 스크립트 확인

### 4. Google OAuth 설정 (사용하는 경우)
- [ ] Google Cloud Console에서 OAuth 클라이언트 생성
- [ ] 승인된 리디렉션 URI에 Netlify URL 추가:
  ```
  https://your-site.netlify.app/api/auth/callback/google
  ```

## 🚀 배포 단계

### 1. GitHub에 푸시
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push
```

### 2. Netlify에서 사이트 생성
1. [Netlify](https://www.netlify.com) 로그인
2. "Add new site" → "Import an existing project"
3. GitHub 저장소 선택: `choijinwon/aijiralite`
4. 빌드 설정 확인:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. 환경 변수 설정
Netlify 대시보드 → Site settings → Environment variables에서 모든 환경 변수 추가

### 4. 배포 시작
- "Deploy site" 클릭
- 빌드 로그 확인
- 배포 완료 대기

### 5. 배포 후 확인
- [ ] 사이트 접속 확인
- [ ] 로그인/회원가입 테스트
- [ ] 데이터베이스 연결 확인
- [ ] AI 기능 테스트
- [ ] 이메일 알림 테스트 (설정한 경우)

## 🔧 문제 해결

### 빌드 실패
- 빌드 로그 확인
- 환경 변수 누락 확인
- Prisma 스키마 provider 확인

### 런타임 오류
- Netlify Functions 로그 확인
- 데이터베이스 연결 확인
- 환경 변수 값 확인

## 📝 참고사항

- Netlify 무료 플랜: 빌드 시간 300분/월, 함수 실행 시간 125시간/월
- 프로덕션 환경에서는 유료 플랜 고려
- 데이터베이스는 별도로 관리 필요 (Netlify에 포함되지 않음)

