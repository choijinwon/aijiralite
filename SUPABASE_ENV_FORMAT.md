# Supabase 환경 변수 형식 가이드

## 올바른 변수 이름

Next.js에서 Supabase를 사용할 때는 **반드시** `NEXT_PUBLIC_` 접두사가 필요합니다:

```env
# ✅ 올바른 형식
NEXT_PUBLIC_SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_9iBczdrsJxsHp0IncOkV6A_PmY4oESp"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_lfz75NufCyqLDeHMvFHs2Q_bZY1ONOU"
```

## ❌ 잘못된 형식

```env
# ❌ 잘못된 형식 (NEXT_PUBLIC_ 접두사 없음)
SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
SUPABASE_KEY="sb_publishable_9iBczdrsJxsHp0IncOkV6A_PmY4oESp"
```

## 이유

- `NEXT_PUBLIC_` 접두사가 있는 변수만 브라우저에서 접근 가능합니다
- Supabase 클라이언트는 브라우저에서 실행되므로 `NEXT_PUBLIC_` 접두사가 필요합니다
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 사이드에서만 사용되므로 접두사가 없습니다

## 현재 설정된 값

```env
NEXT_PUBLIC_SUPABASE_URL="https://nmhprrhoqovbbhiwfbkk.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_9iBczdrsJxsHp0IncOkV6A_PmY4oESp"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_lfz75NufCyqLDeHMvFHs2Q_bZY1ONOU"
```

## 확인 방법

```bash
node scripts/check-supabase-env.js
```

## 서버 재시작

환경 변수 변경 후 **반드시** 서버를 재시작하세요:

```bash
# 서버 중지 (Ctrl+C)
npm run dev
```

