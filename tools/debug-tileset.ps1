# Debug-Hilfe: rendert das Plattform-Tileset vergroessert in eine PNG-Datei,
# damit man sich die einzelnen Kacheln ansehen kann.
param(
  [string]$AtlasPath = 'assets/world/meadow-mountains/tiles/platform-tileset.png',
  [string]$TargetPath = 'tools/_debug-tileset.png',
  [int]$Zoom = 3
)

Add-Type -AssemblyName System.Drawing

$src = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) $AtlasPath))

$tileSrc = 64
$cols = 4
$rows = 2
$labels = @('left-cap', 'middle-a', 'middle-b', 'right-cap')

$pad = 14
$cell = $tileSrc * $Zoom
$width = $cols * $cell + ($cols + 1) * $pad
$height = $rows * $cell + ($rows + 1) * $pad + 40

$canvas = New-Object System.Drawing.Bitmap -ArgumentList $width, $height
$gfx = [System.Drawing.Graphics]::FromImage($canvas)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$gfx.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
# Magenta-Hintergrund: alles Transparente faellt damit sofort auf.
$gfx.Clear([System.Drawing.Color]::FromArgb(255, 200, 0, 200))

$font = New-Object System.Drawing.Font -ArgumentList 'Consolas', 11
$white = [System.Drawing.Brushes]::White
$pen = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(255, 255, 255, 0)), 1

for ($r = 0; $r -lt $rows; $r++) {
  for ($c = 0; $c -lt $cols; $c++) {
    $dx = $pad + $c * ($cell + $pad)
    $dy = 24 + $pad + $r * ($cell + $pad)
    $dest = New-Object System.Drawing.Rectangle -ArgumentList $dx, $dy, $cell, $cell
    $srcRect = New-Object System.Drawing.Rectangle -ArgumentList ($c * $tileSrc), ($r * $tileSrc), $tileSrc, $tileSrc
    $gfx.DrawImage($src, $dest, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $gfx.DrawRectangle($pen, $dest)
    if ($r -eq 0) { $gfx.DrawString($labels[$c], $font, $white, [single]$dx, [single]4) }
  }
}
$gfx.DrawString('oben: surface   unten: body-fill   magenta = transparent', $font, $white, [single]$pad, [single]($height - 26))

$gfx.Dispose()
$canvas.Save((Join-Path (Get-Location) $TargetPath), [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Dispose()
$src.Dispose()
Write-Output "geschrieben: $TargetPath ($width x $height)"
