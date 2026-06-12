# SAFE STAGING DEPLOY
# This updates only the staging/test frontend: https-github
# It must NOT touch the production frontend: idiot

$Root = "C:\Users\HB LAPTOP STORE\Documents\Codex\2026-06-10\files-mentioned-by-the-user-pasted\work\studentHUB-plus"
Set-Location $Root

npm run build
npx wrangler deploy --name https-github --assets ./dist --compatibility-date 2026-05-26 --compatibility-flag nodejs_compat

Write-Host ""
Write-Host "Staging deployed:" -ForegroundColor Green
Write-Host "https://https-github.mahdialmuntadhar1.workers.dev/"
Write-Host ""
Write-Host "Production idiot was NOT touched." -ForegroundColor Yellow
