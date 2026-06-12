param(
  [ValidateSet('https-github', 'idiot')]
  [string]$Target = 'https-github'
)

$ErrorActionPreference = 'Stop'

$ExpectedRoot = 'C:\Users\HB LAPTOP STORE\Documents\Codex\2026-06-10\files-mentioned-by-the-user-pasted\work\studentHUB-plus-correct'
$ExpectedBranch = 'recovered-correct-frontend-2026-06-12'

$CurrentRoot = (Get-Location).Path
if ($CurrentRoot -ne $ExpectedRoot) {
  throw "Refusing to deploy from '$CurrentRoot'. Run this script from '$ExpectedRoot'."
}

$Branch = (git branch --show-current).Trim()
if ($Branch -ne $ExpectedBranch) {
  throw "Refusing to deploy branch '$Branch'. Expected '$ExpectedBranch'."
}

$ShortCommit = (git rev-parse --short HEAD).Trim()
$LatestMessage = (git log -1 --pretty=%s).Trim()

Write-Host "Current folder: $CurrentRoot"
Write-Host "Branch: $Branch"
Write-Host "Short commit: $ShortCommit"
Write-Host "Latest commit message: $LatestMessage"
Write-Host "Target worker: $Target"

npm run build
npx tsc --noEmit

$DeployArgs = @('wrangler', 'deploy', '--name', $Target, '--assets', './dist')
if ($Target -eq 'idiot') {
  $DeployArgs += @('--compatibility-date', '2026-05-26', '--compatibility-flag', 'nodejs_compat')
}

$DeployOutput = & npx @DeployArgs 2>&1
$DeployOutput | ForEach-Object { Write-Host $_ }

$WorkerUrls = @{
  'https-github' = 'https://https-github.mahdialmuntadhar1.workers.dev'
  'idiot' = 'https://idiot.mahdialmuntadhar1.workers.dev'
}

Write-Host "Final Worker URL: $($WorkerUrls[$Target])"

$VersionLine = $DeployOutput | Where-Object { $_ -match 'Version ID|Current Version ID|Uploaded .* version|Worker Version ID' } | Select-Object -Last 1
if ($VersionLine) {
  Write-Host "Version info: $VersionLine"
} else {
  Write-Host "Version ID: not found in wrangler output"
}
