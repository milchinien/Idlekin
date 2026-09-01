# Rendert die komplette Szene (Hintergrund + Plattformen) so, wie sie im
# Prototyp erscheint, damit man sich das Gesamtbild ansehen kann.
param(
  [string]$World = 'meadow-mountains',
  [string]$Background = 'mountains-meadow-day.png',
  [int]$CamX = 0,
  [int]$Zoom = 2,
  [string]$TargetPath = 'tools/_debug-scene.png'
)
Add-Type -AssemblyName System.Drawing

$root = Get-Location
$bg = [System.Drawing.Bitmap]::FromFile((Join-Path $root "assets/world/$World/backgrounds/$Background"))
$atlas = [System.Drawing.Bitmap]::FromFile((Join-Path $root "assets/world/$World/tiles/platform-tileset-surface.png"))

$VIEW_W = 480; $VIEW_H = 270; $GROUND_Y = 230
$TileSize = 32; $TileSource = 64
$Columns = 12; $MiddleCount = 10
$srcPerWorld = $TileSource / $TileSize
$bodyInset = 8
$bodyStep = ($TileSource - $bodyInset) / $srcPerWorld

# genau die Rechtecke aus main.js
$solids = @(
  @{x=0;    y=$GROUND_Y; w=320; h=40}, @{x=360; y=$GROUND_Y; w=240; h=40},
  @{x=660;  y=$GROUND_Y; w=300; h=40}, @{x=1040;y=$GROUND_Y; w=340; h=40},
  @{x=1480; y=$GROUND_Y; w=200; h=40},
  @{x=680;  y=190; w=60; h=8}, @{x=760; y=158; w=60; h=8}, @{x=840; y=126; w=60; h=8},
  @{x=400;  y=148; w=120; h=14},
  @{x=1600; y=170; w=16; h=60}, @{x=1630; y=170; w=50; h=8}
)
$oneway = @(@{x=1070;y=185;w=70;h=6}, @{x=1160;y=150;w=70;h=6}, @{x=1250;y=185;w=70;h=6})

$canvas = New-Object System.Drawing.Bitmap -ArgumentList ([int]($VIEW_W*$Zoom)), ([int]($VIEW_H*$Zoom))
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

# Hintergrund (Parallaxe 0.25, gespiegelt gekachelt)
$par = 0.25
$bx = $CamX * $par
$first = [Math]::Floor($bx / $VIEW_W)
for ($k = $first; $k * $VIEW_W -lt $bx + $VIEW_W; $k++) {
  $sx = ($k * $VIEW_W - $bx) * $Zoom
  $d = New-Object System.Drawing.Rectangle -ArgumentList ([int]$sx), 0, ([int]($VIEW_W*$Zoom)), ([int]($VIEW_H*$Zoom))
  if ((($k % 2) + 2) % 2 -eq 1) {
    $g.TranslateTransform([single]($sx + $VIEW_W*$Zoom), 0)
    $g.ScaleTransform(-1, 1)
    $d2 = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, ([int]($VIEW_W*$Zoom)), ([int]($VIEW_H*$Zoom))
    $g.DrawImage($bg, $d2)
    $g.ResetTransform()
  } else { $g.DrawImage($bg, $d) }
}

function Draw-Platform($p) {
  $x = ($p.x - $CamX) * $Zoom
  $y = $p.y * $Zoom
  $w = $p.w; $h = $p.h
  if (($p.x - $CamX + $w) -lt 0 -or ($p.x - $CamX) -gt $VIEW_W) { return }

  $col = {
    param($ox, $dw, $c)
    $sx = $c * $TileSource
    $sw = $dw * $srcPerWorld
    $th = [Math]::Min($TileSize, $h)
    $d = New-Object System.Drawing.Rectangle -ArgumentList `
      ([int]($x + $ox*$Zoom)), ([int]$y), ([int]($dw*$Zoom)), ([int]($th*$Zoom))
    $g.DrawImage($atlas, $d, [single]$sx, [single]0, [single]$sw, [single]($th*$srcPerWorld), [System.Drawing.GraphicsUnit]::Pixel)
    for ($oy = $TileSize; $oy -lt $h; $oy += $bodyStep) {
      $dh = [Math]::Min($bodyStep, $h - $oy)
      $d2 = New-Object System.Drawing.Rectangle -ArgumentList `
        ([int]($x + $ox*$Zoom)), ([int]($y + $oy*$Zoom)), ([int]($dw*$Zoom)), ([int]($dh*$Zoom))
      $g.DrawImage($atlas, $d2, [single]$sx, [single]($TileSource + $bodyInset), [single]$sw, [single]($dh*$srcPerWorld), [System.Drawing.GraphicsUnit]::Pixel)
    }
  }
  $capW = 0
  if ($w -ge ($TileSize*2)) { $capW = $TileSize }
  if ($capW -gt 0) { & $col 0 $capW 0; & $col ($w - $capW) $capW ($Columns - 1) }
  $ti = 0
  for ($ox = $capW; $ox -lt ($w - $capW); $ox += $TileSize) {
    & $col $ox ([Math]::Min($TileSize, $w - $capW - $ox)) (1 + ($ti % $MiddleCount))
    $ti++
  }
}

foreach ($p in $solids) { Draw-Platform $p }
foreach ($p in $oneway) { Draw-Platform $p }

$g.Dispose()
$canvas.Save((Join-Path $root $TargetPath), [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Dispose(); $bg.Dispose(); $atlas.Dispose()
Write-Output "geschrieben: $TargetPath  (Kamera x=$CamX)"
