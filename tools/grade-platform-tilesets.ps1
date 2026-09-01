# Hellt die erzeugten Plattform-Tilesets auf.
#
# Das Master-Konzept liefert ein nahezu texturloses Fast-Schwarz (~#2b2822).
# Vor dem hellen, gemalten Hintergrund liest sich das als ausgeschnittene
# Silhouette statt als Boden. Dieses Skript hebt die Schatten an, waermt die
# Erde und legt eine feine Koernung darueber, damit die Flaeche nicht tot wirkt.
#
# Das Gras bleibt weitgehend unangetastet - es passt bereits.
#
# Wiederholt ausfuehrbar: die ungefaerbte Fassung wird beim ersten Lauf unter
# tiles/raw/ gesichert und ist danach immer die Quelle. Nach einem erneuten
# generate-platform-tilesets.ps1 muss raw/ geloescht werden.
param(
  [string]$WorldRoot = 'assets/world',
  # Gamma < 1 hebt die dunklen Bereiche an. Kleiner = heller.
  [double]$DirtGamma = 0.58,
  [double]$GrassGamma = 1.00,
  # Warmton fuer die Erde (Faktoren auf R/G/B)
  [double]$WarmR = 1.10,
  [double]$WarmG = 1.01,
  [double]$WarmB = 0.88,
  # Staerke der Koernung in Farbstufen
  [double]$Grain = 5,
  # Aufhellung direkt unter der Grasnarbe. Standardmaessig aus: auf der sehr
  # ebenen Erdflaeche erzeugt der Abfall sichtbare Streifen statt Tiefe.
  [double]$TopLight = 0
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Get-Location

# Die Hoehle darf dunkel bleiben, sonst verliert sie ihren Charakter.
$strength = @{
  'meadow-mountains' = 1.00
  'meadow-forest'    = 1.00
  'jungle'           = 0.92
  'red-brown-cave'   = 0.62
}

function Clamp255([double]$v) {
  if ($v -lt 0) { return 0 }
  if ($v -gt 255) { return 255 }
  return [int][Math]::Round($v)
}

$worlds = Get-ChildItem -Path (Join-Path $root $WorldRoot) -Directory
foreach ($world in $worlds) {
  $atlasPath = Join-Path $world.FullName 'tiles/platform-tileset.png'
  if (-not (Test-Path $atlasPath)) { continue }

  $rawDir = Join-Path $world.FullName 'tiles/raw'
  $rawPath = Join-Path $rawDir 'platform-tileset.png'
  if (-not (Test-Path $rawPath)) {
    if (-not (Test-Path $rawDir)) { New-Item -ItemType Directory -Path $rawDir | Out-Null }
    Copy-Item $atlasPath $rawPath
  }

  $k = 1.0
  if ($strength.ContainsKey($world.Name)) { $k = $strength[$world.Name] }

  $src = [System.Drawing.Bitmap]::FromFile($rawPath)
  $dst = New-Object System.Drawing.Bitmap -ArgumentList $src.Width, $src.Height
  $tileH = [int]($src.Height / 2)

  for ($y = 0; $y -lt $src.Height; $y++) {
    # Nur die Oberflaechenzeile bekommt Licht von oben. Wuerde der Abfall in
    # jeder Atlas-Zeile neu beginnen, entstuende an der Naht zwischen
    # Oberflaeche und Fuellung ein heller Querstreifen.
    $isSurfaceRow = $y -lt $tileH
    for ($x = 0; $x -lt $src.Width; $x++) {
      $c = $src.GetPixel($x, $y)
      if ($c.A -eq 0) { $dst.SetPixel($x, $y, $c); continue }

      $r = [double]$c.R; $g = [double]$c.G; $b = [double]$c.B
      # Gras erkennen: deutlich gruenlastig. Das bekommt eine mildere Kurve.
      # Erde ist rotlastig (R > G), Gras gruenlastig. Die Schwelle ist bewusst
      # niedrig, damit auch dunkle Grashalme nicht als Erde eingewaermt werden.
      $isGrass = ($g -ge $r) -and ($g -gt $b + 4)
      $gamma = if ($isGrass) { $GrassGamma } else { $DirtGamma }
      $gamma = 1 + ($gamma - 1) * $k

      $r = 255 * [Math]::Pow($r / 255, $gamma)
      $g = 255 * [Math]::Pow($g / 255, $gamma)
      $b = 255 * [Math]::Pow($b / 255, $gamma)

      if (-not $isGrass) {
        $r *= (1 + ($WarmR - 1) * $k)
        $g *= (1 + ($WarmG - 1) * $k)
        $b *= (1 + ($WarmB - 1) * $k)

        # Lichtabfall von oben, beginnt unterhalb der Grasnarbe
        if ($isSurfaceRow) {
          $t = [Math]::Max(0, [Math]::Min(1, ($y - 10) / 38))
          $lift = $TopLight * $k * (1 - $t) * (1 - $t)
          $r += $lift; $g += $lift * 0.9; $b += $lift * 0.7
        }

        # Deterministische Koernung. Der Hash mischt die Bits, sonst entsteht
        # ein regelmaessiges Webmuster statt Rauschen.
        [int64]$hs = ([int64]$x * 73856093) -bxor ([int64]$y * 19349663)
        # Vor der Multiplikation maskieren, sonst laeuft Int64 ueber.
        $hs = ($hs -bxor ($hs -shr 13)) -band 0xFFFFF
        $hs = ($hs * 1274126177) -band 0x7FFFFFFF
        $n = (($hs % 1000) / 1000.0 - 0.5) * 2 * $Grain * $k
        $r += $n; $g += $n; $b += $n * 0.8
      }

      $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($c.A, (Clamp255 $r), (Clamp255 $g), (Clamp255 $b)))
    }
  }

  $src.Dispose()
  $dst.Save($atlasPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $dst.Dispose()
  Write-Output ("{0,-18} aufgehellt (Staerke {1})" -f $world.Name, $k)
}
