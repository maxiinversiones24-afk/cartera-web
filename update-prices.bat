@echo off
REM === Actualiza precios desde Supabase Function ===

REM Cargar variables desde .env.local
for /f "usebackq tokens=1* delims==" %%a in (".env.local") do (
    if "%%a"=="SUPABASE_SERVICE_ROLE_KEY" set SERVICE_ROLE_KEY=%%b
    if "%%a"=="SUPABASE_FUNCTION_URL" set SUPABASE_FUNCTION_URL=%%b
)

echo 🚀 Iniciando actualización de precios...

curl -X POST "%SUPABASE_FUNCTION_URL%" ^
  -H "Authorization: Bearer %SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json"

echo 🎯 Actualización completada correctamente
pause
