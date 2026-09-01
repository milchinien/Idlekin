# Diagnose: zeigt fuer jede Spalte eines Masters das erkannte Inhaltsband,
# den daraus abgeleiteten Zuschnitt und eine Farbprobe aus dessen Mitte.
param([string]$World = 'jungle')
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile((Join-Path (Get-Location) "assets/world/$World/tiles/masters/platform-tileset-concept.png"))
$Columns = 4

function Test-GeneratedBackground([System.Drawing.Color]$Color) {
  $max = [Math]::Max($Color.R, [Math]::Max($Color.G, $Color.B))
  $min = [Math]::Min($Color.R, [Math]::Min($Color.G, $Color.B))
  $lowSaturation = ($max - $min) -le 18
  return ($lowSaturation -and $min -ge 214) -or $min -ge 246
}

Write-Output ("Master {0}x{1}" -f $src.Width, $src.Height)
for ($c = 0; $c -lt $Columns; $c++) {
  $left = [Math]::Floor($c * $src.Width / $Columns)
  $right = [Math]::Floor(($c + 1) * $src.Width / $Columns)

  $minPixels = 6
  $rows = New-Object 'bool[]' $src.Height
  for ($y = 0; $y -lt $src.Height; $y++) {
    $count = 0
    for ($x = $left; $x -lt $right; $x += 2) {
      $col = $src.GetPixel($x, $y)
      if ($col.A -eq 0 -or (Test-GeneratedBackground $col)) { continue }
      $count++
      if ($count -ge $minPixels) { break }
    }
    $rows[$y] = ($count -ge $minPixels)
  }
  $start = -1; $end = -1; $gap = 0
  for ($y = 0; $y -lt $src.Height; $y++) {
    if ($rows[$y]) { if ($start -lt 0) { $start = $y }; $end = $y; $gap = 0 }
    elseif ($start -ge 0) { $gap++; if ($gap -ge 8) { break } }
  }

  # Bounding-Box im Band
  $minX = $right; $maxX = -1
  for ($y = $start; $y -le $end; $y += 2) {
    for ($x = $left; $x -lt $right; $x += 2) {
      $col = $src.GetPixel($x, $y)
      if ($col.A -eq 0 -or (Test-GeneratedBackground $col)) { continue }
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
    }
  }
  $cx = [int](($minX + $maxX) / 2)
  $cy = [int](($start + $end) / 2)
  $probe = $src.GetPixel($cx, $cy)
  Write-Output ("Spalte {0}: x {1}..{2} | Band y {3}..{4} | Inhalt x {5}..{6} | Probe A={7} R={8} G={9} B={10}" -f `
    $c, $left, $right, $start, $end, $minX, $maxX, $probe.A, $probe.R, $probe.G, $probe.B)
}
$src.Dispose()
