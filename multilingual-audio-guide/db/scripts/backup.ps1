param([string]$PgBin = 'C:\Program Files\PostgreSQL\17\bin', [int]$Port = 5432)
$DbRoot = Split-Path -Parent $PSScriptRoot
$Target = Join-Path (Join-Path $DbRoot 'backups') ('guide_' + (Get-Date -Format 'yyyyMMdd_HHmmss') + '.dump')
& (Join-Path $PgBin 'pg_dump.exe') -h 127.0.0.1 -p $Port -U guide_app -W -d saigon_audio_guide -Fc -f $Target
if ($LASTEXITCODE -ne 0) { throw 'Backup failed.' }
Write-Host ('Saved: ' + $Target)
