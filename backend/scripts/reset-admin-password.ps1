param(
  [string]$Email = "mahdialmuntadhar1@gmail.com",
  [string]$ApiBase = "https://rafid-api.mahdialmuntadhar1.workers.dev"
)

$ErrorActionPreference = "Stop"

function ConvertTo-PlainText([securestring]$SecureValue) {
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  }
  finally {
    if ($bstr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
  }
}

function Get-BackendPasswordHash([string]$Password) {
  $bytes = [Text.Encoding]::UTF8.GetBytes($Password)
  $sha = [Security.Cryptography.SHA256]::Create()
  try {
    $hash = $sha.ComputeHash($bytes)
  }
  finally {
    $sha.Dispose()
  }

  return [Convert]::ToBase64String($hash).Replace("+", "-").Replace("/", "_").TrimEnd("=")
}

function Escape-SqlLiteral([string]$Value) {
  return $Value.Replace("'", "''")
}

$securePassword = Read-Host "Enter new app password for $Email" -AsSecureString
$confirmPassword = Read-Host "Confirm new app password for $Email" -AsSecureString

$password = ConvertTo-PlainText $securePassword
$confirm = ConvertTo-PlainText $confirmPassword

if ([string]::IsNullOrWhiteSpace($password)) {
  throw "Password cannot be empty."
}

if ($password -ne $confirm) {
  throw "Passwords do not match. No database changes were made."
}

$passwordHash = Get-BackendPasswordHash $password
$escapedEmail = Escape-SqlLiteral $Email
$escapedPasswordHash = Escape-SqlLiteral $passwordHash

$sql = @"
UPDATE profiles
SET password_hash = '$escapedPasswordHash',
    role = 'admin',
    updated_at = CURRENT_TIMESTAMP
WHERE lower(email) = lower('$escapedEmail');

SELECT id, email, role
FROM profiles
WHERE lower(email) = lower('$escapedEmail');
"@

$tempSqlFile = Join-Path ([IO.Path]::GetTempPath()) ("rafid-reset-admin-password-{0}.sql" -f ([guid]::NewGuid().ToString("N")))
$utf8NoBom = New-Object Text.UTF8Encoding $false
[IO.File]::WriteAllText($tempSqlFile, $sql, $utf8NoBom)

Write-Host "Updating remote D1 user password hash and preserving admin role..."

$wranglerExitCode = 1

try {
  & npx wrangler d1 execute rafid-db --remote --config .\wrangler.toml --file $tempSqlFile
  $wranglerExitCode = $LASTEXITCODE
}
finally {
  Remove-Item -LiteralPath $tempSqlFile -Force -ErrorAction SilentlyContinue
}

if ($wranglerExitCode -ne 0) {
  throw "Remote D1 password update failed with exit code $wranglerExitCode. Login tests were not run."
}

Write-Host "Testing POST /api/auth/login..."

$loginBody = @{
  email = $Email
  password = $password
} | ConvertTo-Json

$login = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/auth/login" -ContentType "application/json" -Body $loginBody

if (-not $login.token) {
  throw "Login did not return a JWT."
}

Write-Host "Login OK."
Write-Host "Role:" $login.user.role

if (($login.user.role -ne "admin") -and ($login.user.role -ne "moderator")) {
  throw "Login worked, but user role is not admin/moderator."
}

$headers = @{
  Authorization = "Bearer $($login.token)"
}

Write-Host "Testing GET /api/opportunity-automation/sources..."
$sources = Invoke-RestMethod -Method Get -Uri "$ApiBase/api/opportunity-automation/sources" -Headers $headers
Write-Host "Sources OK."

Write-Host "Testing GET /api/opportunity-automation/status..."
$status = Invoke-RestMethod -Method Get -Uri "$ApiBase/api/opportunity-automation/status" -Headers $headers
Write-Host "Status OK."

Write-Host "Password reset and admin API tests passed."

Remove-Variable password -ErrorAction SilentlyContinue
Remove-Variable confirm -ErrorAction SilentlyContinue
Remove-Variable passwordHash -ErrorAction SilentlyContinue
Remove-Variable login -ErrorAction SilentlyContinue
