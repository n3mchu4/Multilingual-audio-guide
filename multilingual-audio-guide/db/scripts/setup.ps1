param(
    [string]$PgBin = 'C:\Program Files\PostgreSQL\17\bin',
    [string]$DbHost = '127.0.0.1',
    [int]$Port = 5432
)

$ErrorActionPreference = 'Stop'

$DbRoot = Split-Path -Parent $PSScriptRoot
$Psql = Join-Path $PgBin 'psql.exe'

if (-not (Test-Path -LiteralPath $Psql)) {
    throw 'psql.exe not found. Check the PostgreSQL installation folder.'
}

$env:PGCLIENTENCODING = 'UTF8'

Push-Location -LiteralPath $DbRoot

try {
    & $Psql -X `
        -h $DbHost `
        -p $Port `
        -U postgres `
        -W `
        -d postgres `
        -v ON_ERROR_STOP=1 `
        -f 'create-db.sql' `
        -f 'schema.sql' `
        -f 'workflows.sql' `
        -f 'seed.sql' `
        -f 'permissions.sql' `
        -f 'verify.sql'

    if ($LASTEXITCODE -ne 0) {
        throw 'Setup failed. Check the SQL error above.'
    }

    Write-Host 'Database setup completed successfully.'
}
finally {
    Pop-Location
}