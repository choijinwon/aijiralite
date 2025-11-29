# PowerShell script to clone all GitHub repositories
$username = "choijinwon"
$baseDir = ".\github-repos"

$repos = @(
    "promptedu",
    "vibe-coding-academy",
    "naver-blog-automation",
    "blog-hub",
    "shadcnui",
    "chapter-heard-01",
    "htmlCodeExample",
    "typescripblockchin",
    "graphql-ap",
    "vue-til-server",
    "vue-cli",
    "skinny-bones-jekyll",
    "todo-homeworks",
    "springboot-jpa",
    "learncoin",
    "altcryptomining",
    "ionic-site"
)

# Create base directory if it doesn't exist
if (-not (Test-Path $baseDir)) {
    New-Item -ItemType Directory -Path $baseDir | Out-Null
}

Write-Host "Cloning $($repos.Count) repositories to $baseDir..." -ForegroundColor Cyan
Write-Host ""

$index = 1
foreach ($repo in $repos) {
    $repoUrl = "https://github.com/$username/$repo.git"
    $repoPath = Join-Path $baseDir $repo
    
    if (Test-Path $repoPath) {
        Write-Host "[$index/$($repos.Count)] $repo already exists, skipping..." -ForegroundColor Yellow
    } else {
        Write-Host "[$index/$($repos.Count)] Cloning $repo..." -ForegroundColor Green
        try {
            git clone $repoUrl $repoPath
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Successfully cloned $repo" -ForegroundColor Green
            } else {
                Write-Host "✗ Failed to clone $repo" -ForegroundColor Red
            }
        } catch {
            Write-Host "✗ Error cloning $repo : $_" -ForegroundColor Red
        }
    }
    Write-Host ""
    $index++
}

Write-Host "Done!" -ForegroundColor Cyan

