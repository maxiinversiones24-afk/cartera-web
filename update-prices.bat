@echo off
REM === Actualiza precios desde Supabase Function ===

REM 🔒 Guardar la clave de servicio de Supabase (no la compartas)
set SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzY3pheWd6Z2VseHFzeXl0b3R2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjgyODQyNywiZXhwIjoyMDc4MTg4NDI3fQ.k6p7r9K1IE_vgTTzVH_1tkGG_m35iB_TUmqWQN2SVJA

REM 🌐 URL de tu función
set SUPABASE_FUNCTION_URL=https://psczaygzgelxqsyytotv.functions.supabase.co/update-prices

echo 🚀 Iniciando actualización de precios...

curl -X POST "%SUPABASE_FUNCTION_URL%" ^
  -H "Authorization: Bearer %SERVICE_ROLE_KEY%" ^
  -H "Content-Type: application/json"

echo 🎯 Actualización completada correctamente
pause
