param(
    [string]$WorldRoot = (Join-Path $PSScriptRoot '..\assets\world')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$Tile = 64
$AtlasWidth = $Tile * 4
$AtlasHeight = $Tile * 2

# Die generierten Master sind bewusst gross. Aus jedem Feld wird nur ein
# vollstaendig gefuellter Innenbereich entnommen; damit gelangen weder der
# von ImageGen erzeugte Hintergrund noch dessen Glow in den Spielatlas.
$definitions = @(
    @{
        Biome = 'meadow-mountains'
        SurfaceA = @(430, 220, 300, 180); SurfaceB = @(800, 220, 300, 180)
        BodyA = @(430, 610, 300, 180); BodyB = @(800, 610, 300, 180)
    },
    @{
        Biome = 'meadow-forest'
        SurfaceA = @(410, 225, 320, 175); SurfaceB = @(800, 225, 310, 175)
        BodyA = @(420, 620, 300, 180); BodyB = @(800, 620, 300, 180)
    },
    @{
        Biome = 'red-brown-cave'
        SurfaceA = @(435, 170, 300, 210); SurfaceB = @(800, 170, 300, 210)
        BodyA = @(435, 560, 300, 240); BodyB = @(800, 560, 300, 240)
    },
    @{
        Biome = 'jungle'
        SurfaceA = @(435, 245, 300, 250); SurfaceB = @(800, 245, 300, 250)
        BodyA = @(435, 700, 300, 210); BodyB = @(800, 700, 300, 210)
    }
)

function Copy-CropNearest(
    [System.Drawing.Bitmap]$Source,
    [System.Drawing.Bitmap]$Target,
    [int[]]$Crop,
    [int]$Column,
    [int]$Row
) {
    $cx, $cy, $cw, $ch = $Crop
    for ($y = 0; $y -lt $Tile; $y++) {
        $sy = $cy + [Math]::Min($ch - 1, [Math]::Floor(($y + 0.5) * $ch / $Tile))
        for ($x = 0; $x -lt $Tile; $x++) {
            $sx = $cx + [Math]::Min($cw - 1, [Math]::Floor(($x + 0.5) * $cw / $Tile))
            $c = $Source.GetPixel($sx, $sy)
            $Target.SetPixel($Column * $Tile + $x, $Row * $Tile + $y,
                [System.Drawing.Color]::FromArgb(255, $c.R, $c.G, $c.B))
        }
    }
}

function Copy-Tile(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$SourceColumn,
    [int]$TargetColumn,
    [int]$Row
) {
    for ($y = 0; $y -lt $Tile; $y++) {
        for ($x = 0; $x -lt $Tile; $x++) {
            $Bitmap.SetPixel($TargetColumn * $Tile + $x, $Row * $Tile + $y,
                $Bitmap.GetPixel($SourceColumn * $Tile + $x, $Row * $Tile + $y))
        }
    }
}

function Make-Cap(
    [System.Drawing.Bitmap]$Bitmap,
    [int]$Column,
    [int]$Row
) {
    $ox = $Column * $Tile
    $oy = $Row * $Tile
    for ($y = 0; $y -lt $Tile; $y++) {
        # Die Laufkante bleibt oben breit und gut lesbar. Erst darunter wird
        # die Aussenseite organisch schmaler, wie bei IdleOn-Plattformen.
        $baseInset = if ($Row -eq 0) {
            [Math]::Max(0, [Math]::Floor(($y - 12) * 17 / ($Tile - 12)))
        } else {
            8 + [Math]::Floor($y * 14 / ($Tile - 1))
        }
        $jitter = if (($y % 11) -eq 4) { 2 } elseif (($y % 7) -eq 2) { -1 } else { 0 }
        $inset = [Math]::Max(0, $baseInset + $jitter)
        for ($x = 0; $x -lt $Tile; $x++) {
            $outside = if ($Column -eq 0) { $x -lt $inset } else { $x -ge ($Tile - $inset) }
            if ($outside) { $Bitmap.SetPixel($ox + $x, $oy + $y, [System.Drawing.Color]::Transparent) }
        }
    }
}

function Stitch-HorizontalEdges([System.Drawing.Bitmap]$Bitmap, [int]$Row) {
    $oy = $Row * $Tile
    for ($y = 0; $y -lt $Tile; $y++) {
        $samples = @(
            $Bitmap.GetPixel($Tile + 8, $oy + $y),
            $Bitmap.GetPixel($Tile * 2 - 9, $oy + $y),
            $Bitmap.GetPixel($Tile * 2 + 8, $oy + $y),
            $Bitmap.GetPixel($Tile * 3 - 9, $oy + $y)
        )
        $r = [int](($samples | Measure-Object R -Average).Average)
        $g = [int](($samples | Measure-Object G -Average).Average)
        $b = [int](($samples | Measure-Object B -Average).Average)
        $edge = [System.Drawing.Color]::FromArgb(255, $r, $g, $b)
        foreach ($column in @(1, 2)) {
            foreach ($x in @(0, 1, 62, 63)) {
                $Bitmap.SetPixel($column * $Tile + $x, $oy + $y, $edge)
            }
        }
    }
}

foreach ($definition in $definitions) {
    $master = Join-Path $WorldRoot "$($definition.Biome)\tiles\masters\platform-tileset-generated-master.png"
    $target = Join-Path $WorldRoot "$($definition.Biome)\tiles\platform-tileset-generated.png"
    if (-not (Test-Path $master)) { throw "Missing generated master: $master" }

    $source = [System.Drawing.Bitmap]::FromFile($master)
    $atlas = New-Object System.Drawing.Bitmap $AtlasWidth, $AtlasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        Copy-CropNearest $source $atlas $definition.SurfaceA 1 0
        Copy-CropNearest $source $atlas $definition.SurfaceB 2 0
        Copy-CropNearest $source $atlas $definition.BodyA 1 1
        Copy-CropNearest $source $atlas $definition.BodyB 2 1

        Stitch-HorizontalEdges $atlas 0
        Stitch-HorizontalEdges $atlas 1

        Copy-Tile $atlas 1 0 0
        Copy-Tile $atlas 2 3 0
        Copy-Tile $atlas 1 0 1
        Copy-Tile $atlas 2 3 1
        Make-Cap $atlas 0 0
        Make-Cap $atlas 3 0
        Make-Cap $atlas 0 1
        Make-Cap $atlas 3 1

        $atlas.SetResolution(96, 96)
        $atlas.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-Output "Generated $target ($AtlasWidth x $AtlasHeight)"
    }
    finally {
        $source.Dispose()
        $atlas.Dispose()
    }
}
