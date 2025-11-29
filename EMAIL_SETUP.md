# 이메일 알림 설정 가이드

## 환경 변수 설정

`.env` 또는 `.env.local` 파일에 다음 변수들을 추가하세요:

```env
# SMTP 설정
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail 설정 방법

1. **2단계 인증 활성화**
   - Google 계정 설정 > 보안 > 2단계 인증 활성화

2. **앱 비밀번호 생성**
   - Google 계정 설정 > 보안 > 2단계 인증 > 앱 비밀번호
   - "메일" 및 "기타(맞춤 이름)" 선택
   - 생성된 16자리 비밀번호를 `SMTP_PASS`에 설정

3. **환경 변수 설정**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-digit-app-password
   ```

## 다른 이메일 서비스 설정

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## 이메일 알림 타입

다음 이벤트 발생 시 이메일 알림이 전송됩니다:

1. **이슈 담당자 지정** - 담당자에게 이메일 전송
2. **댓글 작성** - 이슈 소유자 및 담당자에게 이메일 전송
3. **마감일 임박 (1일 전)** - 담당자에게 이메일 전송
4. **마감일 당일** - 담당자에게 이메일 전송
5. **팀 초대** - 초대 대상자에게 이메일 전송 (초대 링크 포함)
6. **멤버 역할 변경** - 해당 멤버에게 이메일 전송

## 이메일 미설정 시

SMTP 설정이 없어도 앱은 정상 작동하며, 데이터베이스 알림은 계속 생성됩니다. 이메일만 전송되지 않습니다.

## 테스트

이메일 전송이 제대로 작동하는지 테스트하려면:

1. 이슈를 생성하고 담당자를 지정
2. 댓글을 작성
3. 마감일이 있는 이슈 생성 후 마감일 알림 체크 API 호출

## 문제 해결

### 이메일이 전송되지 않는 경우

1. SMTP 설정이 올바른지 확인
2. Gmail의 경우 앱 비밀번호를 사용하는지 확인
3. 방화벽에서 SMTP 포트(587)가 차단되지 않았는지 확인
4. 서버 로그에서 에러 메시지 확인

