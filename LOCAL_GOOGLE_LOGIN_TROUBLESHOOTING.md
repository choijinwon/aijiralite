# 로컬 Google 로그인 문제 해결 가이드

## 🔍 문제 진단

로컬에서 Google 로그인이 작동하지 않는 경우 다음을 확인하세요.

## ✅ 체크리스트

### 1. Supabase 환경 변수 확인

`.env.local` 파일에 다음이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_9iBczdrsJxsHp0IncOkV6A_PmY4oESp"
```

**확인 방법:**
```bash
node scripts/check-supabase-env.js
```

### 2. Supabase Dashboard에서 Google OAuth 활성화

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. **Authentication** → **Providers** → **Google**
4. **Enable Google provider** 토글 활성화
5. Google Cloud Console에서 가져온 정보 입력:
   - **Client ID (for OAuth)**: Google Cloud Console의 클라이언트 ID
   - **Client Secret (for OAuth)**: Google Cloud Console의 클라이언트 시크릿
6. **Save** 클릭

### 3. Supabase Redirect URL 설정

Supabase Dashboard → **Authentication** → **URL Configuration**:

**Redirect URLs**에 추가:
```
http://localhost:3000/auth/callback
```

**Site URL** 설정:
```
http://localhost:3000
```

### 4. Google Cloud Console 설정

[Google Cloud Console](https://console.cloud.google.com)에서:

1. **API 및 서비스** → **사용자 인증 정보**
2. OAuth 클라이언트 ID 선택
3. **승인된 리디렉션 URI**에 추가:
   ```
   https://nmhprrhoqovbbhiwfbkk.supabase.co/auth/v1/callback
   ```
   ⚠️ **중요**: Supabase 콜백 URL입니다. 로컬 URL이 아닙니다!

### 5. 서버 재시작

환경 변수 변경 후 **반드시** 서버를 재시작:

```bash
# 서버 중지 (Ctrl+C)
npm run dev
```

## 🐛 일반적인 문제

### 문제 1: "Supabase is not configured" 오류

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. `.env.local` 파일 확인
2. `NEXT_PUBLIC_` 접두사 확인
3. 서버 재시작

### 문제 2: Google 로그인 버튼 클릭 시 아무 일도 일어나지 않음

**원인**: Supabase Dashboard에서 Google OAuth가 활성화되지 않음

**해결**:
1. Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider 활성화
3. Client ID와 Secret 입력
4. Save 클릭

### 문제 3: Google 로그인 후 콜백 페이지에서 멈춤

**원인**: Redirect URL이 올바르게 설정되지 않음

**해결**:
1. Supabase Dashboard → Authentication → URL Configuration
2. Redirect URLs에 `http://localhost:3000/auth/callback` 추가
3. Site URL을 `http://localhost:3000`으로 설정

### 문제 4: "redirect_uri_mismatch" 오류

**원인**: Google Cloud Console에 Supabase 콜백 URL이 없음

**해결**:
1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보
2. OAuth 클라이언트 ID 선택
3. 승인된 리디렉션 URI에 추가:
   ```
   https://nmhprrhoqovbbhiwfbkk.supabase.co/auth/v1/callback
   ```

### 문제 5: 콜백 후 세션이 생성되지 않음

**원인**: 콜백 핸들러가 URL hash를 제대로 처리하지 않음

**해결**: 코드가 이미 업데이트되었습니다. 서버 재시작 후 다시 시도하세요.

## 🔍 디버깅 방법

### 1. 브라우저 콘솔 확인

1. 개발자 도구 열기 (F12)
2. Console 탭 확인
3. 오류 메시지 확인

### 2. 네트워크 탭 확인

1. 개발자 도구 → Network 탭
2. Google 버튼 클릭
3. 요청 확인:
   - `/auth/v1/authorize` 요청이 있는지 확인
   - Google OAuth 페이지로 리디렉션되는지 확인

### 3. Supabase 로그 확인

1. Supabase Dashboard → Logs → Auth Logs
2. 최근 인증 시도 확인
3. 오류 메시지 확인

## 📝 단계별 테스트

1. **환경 변수 확인**
   ```bash
   node scripts/check-supabase-env.js
   ```

2. **로그인 페이지 접속**
   - `http://localhost:3000/auth/signin`

3. **Google 버튼 클릭**
   - 브라우저 콘솔에서 로그 확인
   - Google OAuth 페이지로 이동하는지 확인

4. **Google 계정 선택 및 승인**
   - 권한 승인 후 리디렉션 확인

5. **콜백 페이지 확인**
   - `/auth/callback`으로 리디렉션되는지 확인
   - 대시보드로 이동하는지 확인

## ✅ 성공 확인

다음이 모두 작동하면 성공:

1. ✅ Google 버튼 클릭 시 Google OAuth 페이지로 이동
2. ✅ Google 계정 선택 및 승인
3. ✅ `/auth/callback`으로 리디렉션
4. ✅ 대시보드로 자동 이동
5. ✅ 사용자 정보가 표시됨

## 📚 참고 자료

- `SUPABASE_AUTH_SETUP.md` - 상세한 설정 가이드
- `QUICK_SUPABASE_SETUP.md` - 빠른 설정 가이드

