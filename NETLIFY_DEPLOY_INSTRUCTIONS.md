# Netlify 배포 완료 가이드

## ✅ 서브모듈 제거 완료

모든 Git 서브모듈이 인덱스에서 제거되었습니다. 이제 다음 단계를 진행하세요.

## 📤 GitHub에 푸시

```powershell
git push origin main
```

## 🔧 Netlify 대시보드 설정 (중요!)

서브모듈 오류를 완전히 방지하려면 Netlify 대시보드에서도 설정해야 합니다:

### 1. Netlify 대시보드 접속
- https://app.netlify.com
- 사이트 선택

### 2. Build & Deploy 설정
- **Site settings** > **Build & deploy** > **Build settings** 클릭

### 3. 서브모듈 비활성화
- "Submodules" 섹션 찾기
- **"Skip submodules"** 체크박스 선택
- 또는 "Deploy contexts"에서 서브모듈 체크아웃 비활성화

### 4. 저장 및 재배포
- **Save** 버튼 클릭
- **Deploys** 탭으로 이동
- **Trigger deploy** > **Deploy site** 클릭

## ✅ 확인 사항

배포 후 다음을 확인하세요:

1. ✅ 빌드 로그에 서브모듈 오류가 없는지 확인
2. ✅ 빌드가 성공적으로 완료되는지 확인
3. ✅ 사이트가 정상적으로 작동하는지 확인

## 🐛 여전히 오류가 발생하는 경우

1. **Netlify 캐시 삭제**
   - Site settings > Build & deploy > Build settings
   - "Clear cache and deploy site" 클릭

2. **환경 변수 확인 (중요!)**
   - Site settings > Environment variables
   - **필수 환경 변수 확인:**
     - ✅ `DATABASE_URL` - PostgreSQL 연결 문자열
     - ✅ `DIRECT_URL` - PostgreSQL 직접 연결 문자열 (일반적으로 DATABASE_URL과 동일)
     - ✅ `NEXTAUTH_SECRET` - NextAuth 시크릿 키
     - ✅ `NEXTAUTH_URL` - 배포된 사이트 URL
     - ✅ `JWT_SECRET` - JWT 시크릿 키
   
   **DIRECT_URL이 없으면 Prisma 빌드가 실패합니다!**

3. **빌드 로그 확인**
   - Deploys 탭 > 최신 배포 클릭
   - 빌드 로그에서 정확한 오류 메시지 확인

## 📝 참고

- `github-repos/` 디렉토리는 로컬에 유지되지만 Git 추적에서 제외됩니다
- Netlify 빌드 시 `github-repos/` 디렉토리는 포함되지 않습니다
- 빌드에 `github-repos/` 디렉토리가 필요하지 않으므로 안전합니다

