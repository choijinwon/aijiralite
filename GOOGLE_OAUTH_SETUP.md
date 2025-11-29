# Google OAuth 설정 가이드 (Supabase 연동)

Google OAuth를 Supabase 데이터베이스와 함께 사용하는 설정 방법입니다.

## 🚀 Google Cloud Console 설정

### 1. Google Cloud 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 또는 새 프로젝트 생성
3. 프로젝트 이름 입력 (예: "Jira Lite")

### 2. OAuth 2.0 클라이언트 ID 생성

1. **API 및 서비스** → **사용자 인증 정보** 메뉴로 이동
2. **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 클릭
3. 동의 화면 설정 (처음인 경우):
   - 사용자 유형: **외부** 선택
   - 앱 정보 입력:
     - 앱 이름: `Jira Lite`
     - 사용자 지원 이메일: 본인 이메일
     - 개발자 연락처 정보: 본인 이메일
   - 저장 후 계속

4. **OAuth 클라이언트 ID 생성**:
   - 애플리케이션 유형: **웹 애플리케이션**
   - 이름: `Jira Lite Web Client`
   - **승인된 리디렉션 URI** 추가:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-site-name.netlify.app/api/auth/callback/google
     ```
   - 만들기 클릭

5. **클라이언트 ID와 시크릿 복사**:
   - 클라이언트 ID: `xxxxx.apps.googleusercontent.com`
   - 클라이언트 보안 비밀번호: `xxxxx`

## 📝 환경 변수 설정

### 로컬 개발 환경 (`.env.local`)

```env
# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Netlify 환경 변수

1. Netlify 대시보드 → Site settings → Environment variables
2. 다음 변수 추가:

```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://your-site-name.netlify.app
NEXTAUTH_SECRET=your-secret-key-here
```

## ✅ 확인 사항

### 1. 승인된 리디렉션 URI 확인

Google Cloud Console에서 다음 URI들이 추가되어 있어야 합니다:

**로컬 개발:**
```
http://localhost:3000/api/auth/callback/google
```

**Netlify 배포:**
```
https://your-site-name.netlify.app/api/auth/callback/google
```

### 2. 환경 변수 확인

- `GOOGLE_CLIENT_ID`가 올바르게 설정되었는지 확인
- `GOOGLE_CLIENT_SECRET`이 올바르게 설정되었는지 확인
- `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인

### 3. 서버 재시작

환경 변수 변경 후 반드시 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
npm run dev
```

## 🔧 테스트

1. 로그인 페이지 접속: `http://localhost:3000/auth/signin`
2. "Google" 버튼 클릭
3. Google 계정 선택
4. 권한 승인
5. Supabase 데이터베이스에 사용자 자동 생성 확인

## 🐛 문제 해결

### "redirect_uri_mismatch" 오류

- Google Cloud Console에서 승인된 리디렉션 URI 확인
- `NEXTAUTH_URL`이 실제 URL과 일치하는지 확인
- 로컬: `http://localhost:3000`
- Netlify: `https://your-site-name.netlify.app`

### "Invalid client" 오류

- `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET` 확인
- 따옴표 없이 입력했는지 확인
- 공백이 없는지 확인

### 사용자가 생성되지 않음

- Supabase 데이터베이스 연결 확인
- Prisma 스키마 확인 (`User` 모델)
- 서버 로그에서 오류 확인

## 📚 참고 자료

- [NextAuth Google Provider 문서](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 설정](https://developers.google.com/identity/protocols/oauth2)
- [Supabase 문서](https://supabase.com/docs)

