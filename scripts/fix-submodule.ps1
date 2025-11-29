# Git 서브모듈 제거 스크립트 (PowerShell)

Write-Host "🔍 Git 서브모듈 상태 확인 중..." -ForegroundColor Cyan

# .gitmodules 파일 확인
if (Test-Path .gitmodules) {
    Write-Host "📄 .gitmodules 파일 발견" -ForegroundColor Yellow
    Get-Content .gitmodules
} else {
    Write-Host "ℹ️ .gitmodules 파일 없음" -ForegroundColor Green
}

# Git 인덱스에서 서브모듈 제거
Write-Host "🗑️ Git 인덱스에서 서브모듈 제거 중..." -ForegroundColor Cyan
try {
    git rm --cached -r github-repos/altcryptomining 2>&1 | Out-Null
    Write-Host "✅ github-repos/altcryptomining 제거됨" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ 이미 제거됨 또는 없음" -ForegroundColor Yellow
}

try {
    git rm --cached -r github-repos 2>&1 | Out-Null
    Write-Host "✅ github-repos 제거됨" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ 이미 제거됨 또는 없음" -ForegroundColor Yellow
}

# .gitmodules 파일 삭제 (있다면)
if (Test-Path .gitmodules) {
    Write-Host "🗑️ .gitmodules 파일 삭제 중..." -ForegroundColor Cyan
    Remove-Item .gitmodules -Force
    Write-Host "✅ .gitmodules 삭제됨" -ForegroundColor Green
}

# .git/modules 디렉토리 확인
if (Test-Path .git/modules/github-repos) {
    Write-Host "🗑️ .git/modules/github-repos 제거 중..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force .git/modules/github-repos
    Write-Host "✅ .git/modules/github-repos 삭제됨" -ForegroundColor Green
}

Write-Host "`n✅ 서브모듈 제거 완료" -ForegroundColor Green
Write-Host "📝 다음 명령어로 커밋하세요:" -ForegroundColor Yellow
Write-Host "   git add .gitignore" -ForegroundColor White
Write-Host "   git commit -m 'Remove git submodules'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White

