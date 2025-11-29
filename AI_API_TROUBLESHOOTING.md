# OpenAI API 키 오류 해결 가이드

## 오류: "Incorrect API key provided"

이 오류는 OpenAI API 키가 유효하지 않거나 잘못 설정되었을 때 발생합니다.

## 해결 방법

### 1. API 키 확인
- `.env` 파일에서 `OPENAI_API_KEY` 값 확인
- API 키가 올바르게 설정되어 있는지 확인
- 공백이나 따옴표가 포함되어 있지 않은지 확인

### 2. 서버 재시작
환경 변수 변경 후 **반드시 서버를 재시작**해야 합니다:

```bash
# 서버 중지 (Ctrl+C)
# 그 다음 다시 시작
npm run dev
```

### 3. API 키 형식 확인
- 일반 OpenAI API 키는 `sk-`로 시작합니다
- 현재 설정된 키가 `sk-ant-api`로 시작하는 경우, 다른 서비스의 키일 수 있습니다
- 올바른 OpenAI API 키는 [OpenAI Platform](https://platform.openai.com/account/api-keys)에서 확인할 수 있습니다

### 4. API 키 유효성 확인
1. [OpenAI Platform](https://platform.openai.com/account/api-keys)에 로그인
2. API 키 목록 확인
3. 활성화된 키가 있는지 확인
4. 필요시 새 API 키 생성

### 5. .env 파일 형식
`.env` 파일의 올바른 형식:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**주의사항:**
- 따옴표 없이 작성
- 앞뒤 공백 없이 작성
- 줄바꿈 없이 한 줄로 작성

### 6. 환경 변수 로드 확인
서버 시작 시 콘솔에서 다음 메시지를 확인:
- `OPENAI_API_KEY is not set` → API 키가 설정되지 않음
- `Failed to initialize OpenAI client` → API 키 초기화 실패

## 테스트 방법

서버 재시작 후 이슈 상세 페이지에서:
1. "Generate Summary" 버튼 클릭
2. 오류 메시지 확인
3. 더 명확한 오류 메시지가 표시됩니다

## 추가 도움말

- OpenAI API 문서: https://platform.openai.com/docs
- API 키 관리: https://platform.openai.com/account/api-keys
- 지원: https://help.openai.com/

