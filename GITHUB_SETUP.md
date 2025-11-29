# GitHub 저장소 설정 가이드

## 1. GitHub에서 새 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 우측 상단의 "+" 버튼 클릭 → "New repository" 선택
3. 저장소 정보 입력:
   - Repository name: `aijiralite` (또는 원하는 이름)
   - Description: "AI-powered issue tracking system similar to Jira"
   - Visibility: Public 또는 Private 선택
   - **중요**: "Initialize this repository with a README" 체크하지 않기
4. "Create repository" 클릭

## 2. 로컬 저장소를 GitHub에 연결

GitHub에서 생성한 저장소의 URL을 복사한 후 아래 명령어 실행:

```bash
# 저장소 URL 예시 (본인의 저장소 URL로 변경)
git remote add origin https://github.com/choijinwon/aijiralite.git

# 또는 SSH 사용 시
git remote add origin git@github.com:choijinwon/aijiralite.git
```

## 3. GitHub에 푸시

```bash
# main 브랜치로 푸시
git push -u origin main
```

## 4. 인증

GitHub에 푸시할 때 인증이 필요할 수 있습니다:

### Personal Access Token 사용 (권장)
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 선택: `repo` (전체 저장소 권한)
4. 토큰 생성 후 복사
5. 푸시 시 비밀번호 대신 토큰 사용

### GitHub CLI 사용
```bash
# GitHub CLI 설치 후
gh auth login
git push -u origin main
```

## 완료!

이제 코드가 GitHub에 업로드되었습니다. 브라우저에서 저장소를 확인할 수 있습니다.

