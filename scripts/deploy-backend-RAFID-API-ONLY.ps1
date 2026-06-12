# SAFE BACKEND DEPLOY
# This deploys only rafid-api backend.
# It does NOT touch frontend.

$BackendDir = "C:\Users\HB LAPTOP STORE\Documents\Codex\2026-06-10\files-mentioned-by-the-user-pasted\work\studentHUB-plus\backend"
Set-Location $BackendDir

npx tsc --noEmit
npx wrangler deploy .\src\index.ts --name rafid-api --config .\wrangler.toml

Write-Host ""
Write-Host "Backend deployed:" -ForegroundColor Green
Write-Host "https://rafid-api.mahdialmuntadhar1.workers.dev"
