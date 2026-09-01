$ErrorActionPreference = 'Stop'

# Kompatibler Einstiegspunkt fuer aeltere Notizen/Kommandos. Die aktive
# Pipeline exportiert die Aseprite-Referenz und baut daraus alle vier Atlanten.
Push-Location (Join-Path $PSScriptRoot '..')
try {
    & pnpm assets:platforms
    if ($LASTEXITCODE -ne 0) { throw "Platform asset build failed ($LASTEXITCODE)" }
}
finally {
    Pop-Location
}
