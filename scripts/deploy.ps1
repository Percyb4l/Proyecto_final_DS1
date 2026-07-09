# Despliegue RITMOFLOW: Supabase + Render + Vercel
# Uso: configurar variables abajo y ejecutar: .\scripts\deploy.ps1

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$VercelToken = $env:VERCEL_TOKEN,
    [string]$ApiUrl = $env:VITE_API_URL,
    [string]$FrontendUrl = $env:FRONTEND_URL
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "=== RITMOFLOW Deploy ===" -ForegroundColor Cyan

if (-not $DatabaseUrl) {
    Write-Host @"

Falta DATABASE_URL de Supabase.

Pasos en Supabase (https://supabase.com):
  1. New project > nombre: ritmoflow
  2. Project Settings > Database > Connection string
  3. Modo: Session pooler, puerto 5432
  4. Copia la URI y ejecuta:

  `$env:DATABASE_URL = 'postgresql://...'
  .\scripts\deploy.ps1

"@ -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1/3] Migraciones locales contra Supabase..." -ForegroundColor Green
Push-Location $Root
$env:DATABASE_URL = $DatabaseUrl
pip install -r requirements.txt -q
python manage.py migrate
python manage.py seed_data
Pop-Location

Write-Host "`n[2/3] Render (backend)..." -ForegroundColor Green
Write-Host @"
Conecta el repo en https://dashboard.render.com:
  - New > Blueprint > selecciona Proyecto_final_DS1
  - Al crear, pega DATABASE_URL cuando lo pida
  - CORS_ALLOWED_ORIGINS y FRONTEND_URL: pon la URL de Vercel despues del paso 3

Variables en Render:
  DATABASE_URL     = (tu URI de Supabase)
  ALLOWED_HOSTS    = ritmoflow-api.onrender.com
  CORS_ALLOWED_ORIGINS = https://TU-APP.vercel.app
  FRONTEND_URL     = https://TU-APP.vercel.app
"@

if (-not $ApiUrl) {
    $ApiUrl = "https://ritmoflow-api.onrender.com/api"
}

Write-Host "`n[3/3] Vercel (frontend)..." -ForegroundColor Green
Push-Location "$Root\frontend"
if ($VercelToken) {
    $env:VERCEL_TOKEN = $VercelToken
    npx vercel --prod --yes -e "VITE_API_URL=$ApiUrl"
} else {
    Write-Host @"
Sin VERCEL_TOKEN. Opciones:
  A) Dashboard: https://vercel.com/new
     - Root Directory: frontend
     - VITE_API_URL = $ApiUrl

  B) CLI con token:
     `$env:VERCEL_TOKEN = 'tu-token'
     `$env:VITE_API_URL = '$ApiUrl'
     npx vercel --prod --yes
"@
}
Pop-Location

Write-Host "`n=== Verificacion ===" -ForegroundColor Cyan
Write-Host "API:  $ApiUrl.Replace('/api','')/api/health/"
Write-Host "App:  abre la URL de Vercel y prueba login (admin@ritmoflow.com / admin123)"
