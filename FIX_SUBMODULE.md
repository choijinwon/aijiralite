# Git 서브모듈 오류 해결 가이드

## 문제
Netlify 빌드 시 다음 오류 발생:
```
fatal: No url found for submodule path 'github-repos/altcryptomining' in .gitmodules
```

## 해결 방법

### 방법 1: Git에서 서브모듈 완전히 제거 (권장)

#### Windows (PowerShell):
```powershell
# 1. Git 인덱스에서 서브모듈 제거
git rm --cached -r github-repos/altcryptomining
git rm --cached -r github-repos

# 2. .gitmodules 파일 삭제 (있다면)
Remove-Item .gitmodules -ErrorAction SilentlyContinue

# 3. .git/modules 디렉토리 정리
Remove-Item -Recurse -Force .git/modules/github-repos -ErrorAction SilentlyContinue

# 4. 변경사항 커밋
git add .gitignore
git commit -m "Remove git submodules"
git push origin main
```

#### Linux/Mac (Bash):
```bash
# 1. Git 인덱스에서 서브모듈 제거
git rm --cached -r github-repos/altcryptomining
git rm --cached -r github-repos

# 2. .gitmodules 파일 삭제 (있다면)
rm -f .gitmodules

# 3. .git/modules 디렉토리 정리
rm -rf .git/modules/github-repos

# 4. 변경사항 커밋
git add .gitignore
git commit -m "Remove git submodules"
git push origin main
```

### 방법 2: Netlify 대시보드에서 서브모듈 비활성화

1. **Netlify 대시보드 접속**
   - https://app.netlify.com

2. **사이트 설정 열기**
   - 사이트 선택 > **Site settings**

3. **Build & deploy 설정**
   - **Build & deploy** > **Build settings** 클릭

4. **서브모듈 비활성화**
   - "Submodules" 섹션에서 **"Skip submodules"** 체크
   - 또는 "Deploy contexts"에서 서브모듈 체크아웃 비활성화

5. **저장 및 재배포**
   - 변경사항 저장
   - **Deploys** 탭 > **Trigger deploy** > **Deploy site**

### 방법 3: 스크립트 사용 (자동화)

#### PowerShell:
```powershell
.\scripts\fix-submodule.ps1
```

#### Bash:
```bash
chmod +x scripts/fix-submodule.sh
./scripts/fix-submodule.sh
```

## 확인 사항

1. ✅ `.gitmodules` 파일이 삭제되었는지 확인
2. ✅ `github-repos/` 디렉토리가 `.gitignore`에 추가되었는지 확인
3. ✅ Netlify 대시보드에서 서브모듈 비활성화 설정 확인
4. ✅ 변경사항이 GitHub에 푸시되었는지 확인

## 참고

- `github-repos/` 디렉토리는 빌드에 필요하지 않으므로 `.gitignore`에 추가되어 있습니다.
- 로컬에서는 `github-repos/` 디렉토리가 유지되지만, Git 추적 및 Netlify 빌드에서는 제외됩니다.
- Netlify 빌드 시 서브모듈 체크아웃을 건너뛰면 빌드 시간도 단축됩니다.

