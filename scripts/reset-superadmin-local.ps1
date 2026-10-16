$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".env.local"
$resetScript = Join-Path $PSScriptRoot "reset-superadmin.js"

if (-not (Test-Path -LiteralPath $envFile)) {
  throw "Could not find .env.local in the project root."
}

$adminEmail = Read-Host "Superadmin email [shohagdidar3@gmail.com]"
if ([string]::IsNullOrWhiteSpace($adminEmail)) {
  $adminEmail = "shohagdidar3@gmail.com"
}

$securePassword = Read-Host "Enter a new unique password (8+ characters)" -AsSecureString
if ($securePassword.Length -lt 8) {
  Remove-Variable securePassword -ErrorAction SilentlyContinue
  throw "Password must be at least 8 characters. No account was changed."
}

$passwordPointer = [IntPtr]::Zero
$previousAdminEmail = $env:ADMIN_EMAIL
$previousAdminPassword = $env:ADMIN_PASSWORD
$previousMongoUri = $env:MONGODB_URI

try {
  $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  $env:ADMIN_EMAIL = $adminEmail
  $env:ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  Remove-Item Env:MONGODB_URI -ErrorAction SilentlyContinue

  Push-Location $repoRoot
  try {
    & node "--env-file=$envFile" $resetScript
    if ($LASTEXITCODE -ne 0) {
      throw "Superadmin reset failed. Use the error above; do not try logging in until reset succeeds."
    }
  } finally {
    Pop-Location
  }
} finally {
  if ($passwordPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  }
  if ($null -eq $previousAdminEmail) {
    Remove-Item Env:ADMIN_EMAIL -ErrorAction SilentlyContinue
  } else {
    $env:ADMIN_EMAIL = $previousAdminEmail
  }
  if ($null -eq $previousAdminPassword) {
    Remove-Item Env:ADMIN_PASSWORD -ErrorAction SilentlyContinue
  } else {
    $env:ADMIN_PASSWORD = $previousAdminPassword
  }
  if ($null -eq $previousMongoUri) {
    Remove-Item Env:MONGODB_URI -ErrorAction SilentlyContinue
  } else {
    $env:MONGODB_URI = $previousMongoUri
  }
  Remove-Variable securePassword -ErrorAction SilentlyContinue
  Remove-Variable passwordPointer -ErrorAction SilentlyContinue
}
