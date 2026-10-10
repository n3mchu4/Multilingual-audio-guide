param([string]$Username = 'admin')
$ErrorActionPreference = 'Stop'
$DbRoot = Split-Path -Parent $PSScriptRoot
$SecurePassword = Read-Host 'New application Admin password (at least 10 characters)' -AsSecureString
$Pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
try {
  $env:BOOTSTRAP_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($Pointer)
  & node (Join-Path $DbRoot 'node/create-admin.js') $Username
  if ($LASTEXITCODE -ne 0) { throw 'Admin creation failed.' }
} finally {
  Remove-Item Env:BOOTSTRAP_ADMIN_PASSWORD -ErrorAction SilentlyContinue
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($Pointer)
}
