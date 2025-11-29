# 브라우저 오류 해결 가이드

## "Could not establish connection. Receiving end does not exist."

이 오류는 **브라우저 확장 프로그램**과 관련된 경고입니다. 애플리케이션 기능에는 영향을 주지 않습니다.

### 원인

- 브라우저 확장 프로그램(예: React DevTools, Redux DevTools, 광고 차단기 등)이 페이지와 통신하려고 할 때 발생
- 개발 환경에서만 나타나는 경고
- 실제 애플리케이션 기능에는 문제 없음

### 해결 방법

#### 방법 1: 무시하기 (권장)
- 이 오류는 애플리케이션에 영향을 주지 않으므로 무시해도 됩니다
- 프로덕션 환경에서는 나타나지 않습니다

#### 방법 2: 브라우저 확장 프로그램 비활성화
1. Chrome/Edge: 확장 프로그램 관리 페이지 접속
2. 개발 중인 사이트에서만 확장 프로그램 비활성화
3. 또는 시크릿 모드에서 테스트

#### 방법 3: 콘솔 필터링
- 개발자 도구 콘솔에서 "Hide network messages" 옵션 활성화
- 또는 "Warnings" 필터 사용

### 확인 사항

애플리케이션이 정상 작동하는지 확인:

1. ✅ 페이지가 로드되는가?
2. ✅ 로그인 버튼이 작동하는가?
3. ✅ Google 로그인이 작동하는가?
4. ✅ 다른 기능들이 정상 작동하는가?

모든 기능이 정상 작동한다면 이 오류는 무시해도 됩니다.

### 실제 오류와의 구분

**무시해도 되는 오류:**
- `runtime.lastError: Could not establish connection`
- `Receiving end does not exist`
- 확장 프로그램 관련 오류

**주의해야 할 오류:**
- `Supabase is not configured`
- `Missing environment variables`
- `Network request failed`
- `Authentication failed`

### 추가 정보

이 오류는 Chrome/Edge의 확장 프로그램 API와 관련된 것으로, Next.js나 Supabase와는 무관합니다.

