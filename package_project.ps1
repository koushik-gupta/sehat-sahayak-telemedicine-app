$sourceDir = Get-Location
$distDir = Join-Path $sourceDir "telemedicine_dist"
$zipFile = "telemedicine_project_full.zip"

Write-Host "Packaging project..."

# 1. Create a fresh distribution folder
if (Test-Path $distDir) { Remove-Item -Recurse -Force $distDir }
New-Item -ItemType Directory -Force -Path $distDir | Out-Null

# 2. Copy Config Files
Copy-Item "docker-compose.yml" $distDir
Copy-Item "requirements.txt" $distDir
# Note: checking paths for artifacts. Assuming Friend_Guide.md is in the root or accessible. 
# If it was created in the brain folder, we might need to manually place it or the user needs to.
# For now, we'll try to copy if it exists in root, otherwise we'll skip it in the script logic 
# but the user has it in artifacts.

# 3. Copy Database
Copy-Item -Recurse "database" $distDir

# 4. Copy Backend (Clean)
$backendDest = Join-Path $distDir "backend"
New-Item -ItemType Directory -Force -Path $backendDest | Out-Null
Get-ChildItem "backend" -Exclude "venv", "__pycache__", ".env", ".git", ".idea", "pytest_cache" | ForEach-Object {
    Copy-Item -Recurse $_.FullName $backendDest
}

# 5. Copy Frontend (Clean)
$frontendDest = Join-Path $distDir "frontend"
New-Item -ItemType Directory -Force -Path $frontendDest | Out-Null
Get-ChildItem "frontend" -Exclude "node_modules", "dist", ".env", ".git", ".idea", "coverage" | ForEach-Object {
    Copy-Item -Recurse $_.FullName $frontendDest
}

# 6. Zip It
Write-Host "Zipping to $zipFile..."
Compress-Archive -Path "$distDir\*" -DestinationPath $zipFile -Force

# 7. Cleanup
Remove-Item -Recurse -Force $distDir

Write-Host "Done! Share $zipFile with your friend."
