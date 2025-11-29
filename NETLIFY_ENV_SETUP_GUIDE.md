# 🚨 Netlify 환경 변수 설정 - 단계별 가이드

## ⚠️ 현재 오류
```
DATABASE_URL: ❌ 없음
DIRECT_URL: ❌ 없음
```

이 오류를 해결하려면 **Netlify 대시보드에서 환경 변수를 설정**해야 합니다.

---

## 📋 필수 단계 (5분 소요)

### 1단계: Netlify 대시보드 접속

1. 브라우저에서 https://app.netlify.com 접속
2. 로그인 (GitHub 계정으로 로그인 가능)
3. 배포 중인 사이트를 클릭하여 선택

### 2단계: Site settings 열기

1. 사이트 대시보드에서 **"Site settings"** 버튼 클릭
   - 또는 상단 메뉴에서 **"Site configuration"** > **"Environment variables"** 클릭

### 3단계: Environment variables 페이지로 이동

1. 왼쪽 사이드바에서 **"Environment variables"** 클릭
2. 또는 **"Build & deploy"** > **"Environment"** > **"Environment variables"** 클릭

### 4단계: 환경 변수 추가

**"Add a variable"** 또는 **"Add environment variable"** 버튼을 클릭하고 다음 변수들을 하나씩 추가하세요:

#### 변수 1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- **주의**: 비밀번호에 특수문자(`!`)가 포함되어 있습니다
- **참고**: 로컬 `.env` 파일의 `DATABASE_URL` 값을 사용하세요

#### 변수 2: DIRECT_URL
```
Key: DIRECT_URL
Value: postgresql://postgres.nmhprrhoqovbbhiwfbkk:wlsdnjs12!A@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```
- **참고**: 로컬 `.env` 파일의 `DIRECT_URL` 값을 사용하세요
- **중요**: `DATABASE_URL`과 다른 포트(5432)를 사용합니다

#### 변수 3: NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: [32자 이상의 랜덤 문자열]
```

**생성 방법:**
- 온라인 생성기: https://generate-secret.vercel.app/32
- 또는 터미널: `openssl rand -base64 32`

#### 변수 4: NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://your-site-name.netlify.app
```
- **주의**: `your-site-name`을 실제 Netlify 사이트 이름으로 변경하세요
- 예: `https://aijiralite.netlify.app`

#### 변수 5: JWT_SECRET
```
Key: JWT_SECRET
Value: [32자 이상의 랜덤 문자열]
```
- **참고**: `NEXTAUTH_SECRET`과 동일하게 생성하거나 다른 값 사용 가능

### 5단계: 저장

1. 모든 변수를 추가한 후
2. **"Save"** 또는 **"Update variables"** 버튼 클릭
3. 변경사항이 저장되었는지 확인

### 6단계: 재배포

1. 상단 메뉴에서 **"Deploys"** 탭 클릭
2. **"Trigger deploy"** 드롭다운 클릭
3. **"Deploy site"** 선택
4. 빌드가 시작되는지 확인

---

## ✅ 확인 체크리스트

배포 전 다음을 확인하세요:

- [ ] `DATABASE_URL` 추가됨
- [ ] `DIRECT_URL` 추가됨
- [ ] `NEXTAUTH_SECRET` 추가됨 (32자 이상)
- [ ] `NEXTAUTH_URL` 추가됨 (실제 배포 URL)
- [ ] `JWT_SECRET` 추가됨 (32자 이상)

---

## 🔍 환경 변수 확인 방법

1. **Site settings** > **Environment variables** 페이지로 이동
2. 설정된 모든 변수 목록 확인
3. 각 변수의 Key와 Value가 올바른지 확인

**주의사항:**
- Value는 마스킹되어 표시될 수 있습니다 (보안상 이유)
- 변수를 클릭하면 전체 값을 볼 수 있습니다

---

## 🐛 문제 해결

### "DATABASE_URL이 설정되지 않았습니다" 오류가 계속 발생
1. **환경 변수가 실제로 저장되었는지 확인**
   - Site settings > Environment variables 페이지에서 변수 목록 확인
2. **변수 이름 확인**
   - 대소문자 구분: `DATABASE_URL` (대문자)
   - 공백 없음
3. **재배포 확인**
   - 환경 변수 추가 후 반드시 재배포해야 합니다
   - Deploys 탭 > Trigger deploy > Deploy site

### 빌드는 성공했지만 런타임 오류 발생
1. **Netlify Functions 로그 확인**
   - Deploys 탭 > 최신 배포 클릭 > Functions 로그 확인
2. **환경 변수 값 확인**
   - 데이터베이스 연결 문자열이 올바른지 확인
   - 비밀번호에 특수문자가 올바르게 이스케이프되었는지 확인

---

## 📝 로컬 .env 파일 참고

로컬 `.env` 또는 `.env.local` 파일에 있는 값들을 Netlify에도 동일하게 설정하세요:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-site.netlify.app"
JWT_SECRET="..."
```

---

## 🔗 추가 리소스

- [Netlify 환경 변수 공식 문서](https://docs.netlify.com/environment-variables/overview/)
- [Prisma 환경 변수 문서](https://www.prisma.io/docs/concepts/components/prisma-schema/working-with-environment-variables)

---

## 💡 팁

- 환경 변수는 **대소문자를 구분**합니다
- 환경 변수 추가 후 **반드시 재배포**해야 적용됩니다
- 환경 변수는 **빌드 시점과 런타임 모두**에서 사용 가능합니다
- 민감한 정보(비밀번호, API 키)는 환경 변수로만 관리하세요

