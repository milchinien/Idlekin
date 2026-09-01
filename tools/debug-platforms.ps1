# Bildet drawPlatformRect() aus main.js 1:1 nach und rendert die echten
# Plattformen des Prototyps in eine PNG-Datei. Damit laesst sich anschauen,
# was der Kachel-Code tatsaechlich produziert.
param(
  [string]$AtlasPath = 'assets/world/meadow-mountains/tiles/platform-tileset.png',
  [string]$TargetPath = 'tools/_debug-platforms-neu.png',
  [int]$Zoom = 3,
  [int]$TileSize = 32,
  [int]$TileSource = 64
)

Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) $AtlasPath))

# name, breite, hoehe  - genau die Werte aus SOLIDS/ONEWAY
$cases = @(
  @{ n = 'Boden 320x40 (10 Kacheln glatt)'; w = 320; h = 40 },
  @{ n = 'Boden 240x40 (Rest 16 px)';       w = 240; h = 40 },
  @{ n = 'Boden 300x40 (Rest 12 px)';       w = 300; h = 40 },
  @{ n = 'Ueberhang 120x14';                w = 120; h = 14 },
  @{ n = 'Treppe 60x8';                     w = 60;  h = 8 },
  @{ n = 'Einweg 70x6';                     w = 70;  h = 6 },
  @{ n = 'Vorsprung 50x8';                  w = 50;  h = 8 },
  @{ n = 'Wand 16x60';                      w = 16;  h = 60 }
)

$pad = 16
$labelH = 18
$maxW = [int](($cases | ForEach-Object { $_.w } | Measure-Object -Maximum).Maximum)
$totalH = 0
foreach ($c in $cases) { $totalH += $c.h * $Zoom + $labelH + $pad }
$width = [int]($maxW * $Zoom + 2 * $pad)
$height = [int]($totalH + $pad)

$canvas = New-Object System.Drawing.Bitmap -ArgumentList $width, $height
$gfx = [System.Drawing.Graphics]::FromImage($canvas)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
# Magenta = nichts gezeichnet. So sieht man Luecken und transparente Raender sofort.
$gfx.Clear([System.Drawing.Color]::FromArgb(255, 190, 0, 190))

$font = New-Object System.Drawing.Font -ArgumentList 'Consolas', 10
$white = [System.Drawing.Brushes]::White
$boxPen = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(255, 255, 255, 0)), 1

function Draw-Platform($gfx, $src, $px, $py, $w, $h, $Zoom, $TileSize, $TileSource) {
  $srcPerWorld = $TileSource / $TileSize
$bodyInset = 8
$bodyStep = ($TileSource - $bodyInset) / $srcPerWorld

  $column = {
    param($offsetX, $drawWidth, $col)
    $sourceX = $col * $TileSource
    $sourceWidth = $drawWidth * $srcPerWorld

    $topHeight = [Math]::Min($TileSize, $h)
    $d = New-Object System.Drawing.Rectangle -ArgumentList `
      ($px + $offsetX * $Zoom), $py, ($drawWidth * $Zoom), ($topHeight * $Zoom)
    $gfx.DrawImage($src, $d, [single]$sourceX, [single]0, `
      [single]$sourceWidth, [single]($topHeight * $srcPerWorld), [System.Drawing.GraphicsUnit]::Pixel)

    for ($offsetY = $TileSize; $offsetY -lt $h; $offsetY += $TileSize) {
      $drawHeight = [Math]::Min($TileSize, $h - $offsetY)
      $d2 = New-Object System.Drawing.Rectangle -ArgumentList `
        ($px + $offsetX * $Zoom), ($py + $offsetY * $Zoom), ($drawWidth * $Zoom), ($drawHeight * $Zoom)
      $gfx.DrawImage($src, $d2, [single]$sourceX, [single]($TileSource + $bodyInset), `
        [single]$sourceWidth, [single]($drawHeight * $srcPerWorld), [System.Drawing.GraphicsUnit]::Pixel)
    }
  }

  $capW = 0
  if ($w -ge ($TileSize * 2)) { $capW = $TileSize }
  if ($capW -gt 0) {
    & $column 0 $capW 0
    & $column ($w - $capW) $capW 3
  }

  $tileIndex = 0
  for ($offsetX = $capW; $offsetX -lt ($w - $capW); $offsetX += $TileSize) {
    $drawWidth = [Math]::Min($TileSize, $w - $capW - $offsetX)
    & $column $offsetX $drawWidth (1 + ($tileIndex % 2))
    $tileIndex++
  }
}

$y = $pad
foreach ($c in $cases) {
  $gfx.DrawString($c.n, $font, $white, [single]$pad, [single]$y)
  $py = $y + $labelH
  Draw-Platform $gfx $src $pad $py $c.w $c.h $Zoom $TileSize $TileSource
  $box = New-Object System.Drawing.Rectangle -ArgumentList $pad, $py, ($c.w * $Zoom), ($c.h * $Zoom)
  $gfx.DrawRectangle($boxPen, $box)
  $y = $py + $c.h * $Zoom + $pad
}

$gfx.Dispose()
$canvas.Save((Join-Path (Get-Location) $TargetPath), [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Dispose(); $src.Dispose()
Write-Output "geschrieben: $TargetPath ($width x $height)"
