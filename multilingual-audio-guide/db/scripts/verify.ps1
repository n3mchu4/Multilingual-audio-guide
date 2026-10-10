param([string]$PgBin = 'C:\Program Files\PostgreSQL\17\bin', [int]$Port = 5432)
$DbRoot = Split-Path -Parent $PSScriptRoot
$env:PGCLIENTENCODING = 'UTF8'
& (Join-Path $PgBin 'psql.exe') -X -h 127.0.0.1 -p $Port -U guide_app -W -d saigon_audio_guide -v ON_ERROR_STOP=1 -f (Join-Path $DbRoot 'verify.sql')
if ($LASTEXITCODE -ne 0) { throw 'Verification failed.' }
