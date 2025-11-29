#!/bin/bash
# Git 서브모듈 제거 스크립트

echo "🔍 Git 서브모듈 상태 확인 중..."

# .gitmodules 파일 확인
if [ -f .gitmodules ]; then
    echo "📄 .gitmodules 파일 발견"
    cat .gitmodules
else
    echo "ℹ️ .gitmodules 파일 없음"
fi

# Git 인덱스에서 서브모듈 제거
echo "🗑️ Git 인덱스에서 서브모듈 제거 중..."
git rm --cached -r github-repos/altcryptomining 2>/dev/null || echo "이미 제거됨 또는 없음"
git rm --cached -r github-repos 2>/dev/null || echo "이미 제거됨 또는 없음"

# .gitmodules 파일 삭제 (있다면)
if [ -f .gitmodules ]; then
    echo "🗑️ .gitmodules 파일 삭제 중..."
    rm .gitmodules
fi

# .git/modules 디렉토리 확인
if [ -d .git/modules/github-repos ]; then
    echo "🗑️ .git/modules/github-repos 제거 중..."
    rm -rf .git/modules/github-repos
fi

echo "✅ 서브모듈 제거 완료"
echo "📝 다음 명령어로 커밋하세요:"
echo "   git add .gitignore .gitmodules"
echo "   git commit -m 'Remove git submodules'"
echo "   git push origin main"

