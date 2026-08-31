param(
    [string]$OutputRoot = (Join-Path $PSScriptRoot '..\assets\world')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$TileSize = 64
$Columns = 4
$Rows = 2
$AtlasWidth = $TileSize * $Columns
$AtlasHeight = $TileSize * $Rows

function New-Crop([int]$X, [int]$Y, [int]$Width, [int]$Height) {
    return [System.Drawing.Rectangle]::new($X, $Y, $Width, $Height)
}

function Test-GeneratedBackground([System.Drawing.Color]$Color) {
    $max = [Math]::Max($Color.R, [Math]::Max($Color.G, $Color.B))
    $min = [Math]::Min($Color.R, [Math]::Min($Color.G, $Color.B))
    $lowSaturation = ($max - $min) -le 18
    return ($lowSaturation -and $min -ge 214) -or $min -ge 246
}

function Get-CellCrop([System.Drawing.Bitmap]$Source, [int]$Column, [int]$Row) {
    $scanRow = if ($Row -eq 1) { 0 } else { $Row }
    $regionX = [Math]::Floor($Column * $Source.Width / $Columns)
    $regionRight = [Math]::Floor(($Column + 1) * $Source.Width / $Columns)
    $regionY = [Math]::Floor($scanRow * $Source.Height / $Rows)
    $regionBottom = [Math]::Floor(($scanRow + 1) * $Source.Height / $Rows)
    $minX = $regionRight
    $minY = $regionBottom
    $maxX = -1
    $maxY = -1

    for ($y = $regionY; $y -lt $regionBottom; $y += 2) {
        for ($x = $regionX; $x -lt $regionRight; $x += 2) {
            $color = $Source.GetPixel($x, $y)
            if ($color.A -eq 0 -or (Test-GeneratedBackground $color)) { continue }
            $minX = [Math]::Min($minX, $x)
            $minY = [Math]::Min($minY, $y)
            $maxX = [Math]::Max($maxX, $x)
            $maxY = [Math]::Max($maxY, $y)
        }
    }
    if ($maxX -lt 0) { throw "No tile art found in cell $Column,$Row" }

    $minX = [Math]::Max($regionX, $minX - 2)
    $minY = [Math]::Max($regionY, $minY - 2)
    $maxX = [Math]::Min($regionRight - 1, $maxX + 2)
    $maxY = [Math]::Min($regionBottom - 1, $maxY + 2)
    $crop = [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
    if ($Column -eq 1 -or $Column -eq 2) {
        $insetX = [Math]::Max(2, [Math]::Floor($crop.Width * 0.20))
        $crop.X += $insetX
        $crop.Width -= $insetX * 2
    }
    if ($Row -eq 0) {
        $crop.Height -= [Math]::Max(1, [Math]::Floor($crop.Height * 0.05))
    } else {
        $interiorY = [Math]::Max(1, [Math]::Floor($crop.Height * 0.34))
        $interiorHeight = [Math]::Max(4, [Math]::Floor($crop.Height * 0.38))
        $crop.Y += $interiorY
        $crop.Height = $interiorHeight
    }
    return $crop
}

function Copy-CropNearest(
    [System.Drawing.Bitmap]$Source,
    [System.Drawing.Bitmap]$Target,
    [System.Drawing.Rectangle]$Crop,
    [int]$TargetColumn,
    [int]$TargetRow
) {
    $targetX = $TargetColumn * $TileSize
    $targetY = $TargetRow * $TileSize

    for ($y = 0; $y -lt $TileSize; $y++) {
        $sourceY = $Crop.Y + [Math]::Min($Crop.Height - 1, [Math]::Floor(($y + 0.5) * $Crop.Height / $TileSize))
        for ($x = 0; $x -lt $TileSize; $x++) {
            $sourceX = $Crop.X + [Math]::Min($Crop.Width - 1, [Math]::Floor(($x + 0.5) * $Crop.Width / $TileSize))
            $color = $Source.GetPixel($sourceX, $sourceY)
            if (-not (Test-GeneratedBackground $color)) {
                $Target.SetPixel($targetX + $x, $targetY + $y, [System.Drawing.Color]::FromArgb(255, $color.R, $color.G, $color.B))
            }
        }
    }
}

function Close-MiddleEdges([System.Drawing.Bitmap]$Bitmap, [int]$Column, [int]$Row) {
    $offsetX = $Column * $TileSize
    $offsetY = $Row * $TileSize

    for ($y = 0; $y -lt $TileSize; $y++) {
        $first = -1
        $last = -1
        for ($x = 0; $x -lt $TileSize; $x++) {
            if ($Bitmap.GetPixel($offsetX + $x, $offsetY + $y).A -gt 0) {
                if ($first -lt 0) { $first = $x }
                $last = $x
            }
        }
        if ($first -lt 0) { continue }

        if ($Column -ne 0) {
            for ($x = 0; $x -lt $first; $x++) {
                $color = if ($Column -eq ($Columns - 1)) {
                    $Bitmap.GetPixel($offsetX - $TileSize + $x, $offsetY + $y)
                } else {
                    $Bitmap.GetPixel($offsetX + $first, $offsetY + $y)
                }
                $Bitmap.SetPixel($offsetX + $x, $offsetY + $y, $color)
            }
        }

        if ($Column -ne ($Columns - 1)) {
            for ($x = $last + 1; $x -lt $TileSize; $x++) {
                $color = if ($Column -eq 0) {
                    $Bitmap.GetPixel($offsetX + $TileSize + $x, $offsetY + $y)
                } else {
                    $Bitmap.GetPixel($offsetX + $last, $offsetY + $y)
                }
                $Bitmap.SetPixel($offsetX + $x, $offsetY + $y, $color)
            }
        }
    }

    for ($x = 0; $x -lt $TileSize; $x++) {
        $first = -1
        $last = -1
        for ($y = 0; $y -lt $TileSize; $y++) {
            if ($Bitmap.GetPixel($offsetX + $x, $offsetY + $y).A -gt 0) {
                if ($first -lt 0) { $first = $y }
                $last = $y
            }
        }
        if ($first -lt 0) { continue }

        if ($Row -ne 0) {
            $topColor = $Bitmap.GetPixel($offsetX + $x, $offsetY + $first)
            for ($y = 0; $y -lt $first; $y++) { $Bitmap.SetPixel($offsetX + $x, $offsetY + $y, $topColor) }
        }

        if ($Row -ne ($Rows - 1)) {
            $bottomColor = $Bitmap.GetPixel($offsetX + $x, $offsetY + $last)
            for ($y = $last + 1; $y -lt $TileSize; $y++) { $Bitmap.SetPixel($offsetX + $x, $offsetY + $y, $bottomColor) }
        }
    }
}

function New-CapFromMiddle([System.Drawing.Bitmap]$Bitmap, [int]$CapColumn, [int]$SourceColumn, [int]$Row) {
    $capX = $CapColumn * $TileSize
    $sourceX = $SourceColumn * $TileSize
    $offsetY = $Row * $TileSize

    for ($y = 0; $y -lt $TileSize; $y++) {
        $inset = if ($Row -eq 0) {
            [Math]::Max(0, [Math]::Floor(($y - 18) * 14 / ($TileSize - 18)))
        } else {
            14 + [Math]::Floor($y * 10 / ($TileSize - 1))
        }

        for ($x = 0; $x -lt $TileSize; $x++) {
            $outside = if ($CapColumn -eq 0) { $x -lt $inset } else { $x -ge ($TileSize - $inset) }
            $color = if ($outside) {
                [System.Drawing.Color]::Transparent
            } else {
                $Bitmap.GetPixel($sourceX + $x, $offsetY + $y)
            }
            $Bitmap.SetPixel($capX + $x, $offsetY + $y, $color)
        }
    }
}

function Blend-CapInnerEdges([System.Drawing.Bitmap]$Bitmap) {
    foreach ($row in 0..($Rows - 1)) {
        $offsetY = $row * $TileSize
        for ($y = 0; $y -lt $TileSize; $y++) {
            for ($distance = 0; $distance -lt 8; $distance++) {
                $amount = (8 - $distance) / 8.0

                $leftX = $TileSize - 1 - $distance
                $leftSource = $Bitmap.GetPixel($TileSize * 2 - 1 - $distance, $offsetY + $y)
                $leftCurrent = $Bitmap.GetPixel($leftX, $offsetY + $y)
                if ($leftCurrent.A -eq 0) { $leftCurrent = $leftSource }
                $Bitmap.SetPixel($leftX, $offsetY + $y, (Blend-Color $leftCurrent $leftSource $amount))

                $rightX = $TileSize * 3 + $distance
                $rightSource = $Bitmap.GetPixel($TileSize * 2 + $distance, $offsetY + $y)
                $rightCurrent = $Bitmap.GetPixel($rightX, $offsetY + $y)
                if ($rightCurrent.A -eq 0) { $rightCurrent = $rightSource }
                $Bitmap.SetPixel($rightX, $offsetY + $y, (Blend-Color $rightCurrent $rightSource $amount))
            }
        }
    }
}

function Flatten-SurfaceBottom([System.Drawing.Bitmap]$Bitmap) {
    foreach ($column in 0..($Columns - 1)) {
        $offsetX = $column * $TileSize
        for ($x = 0; $x -lt $TileSize; $x++) {
            $interior = $Bitmap.GetPixel($offsetX + $x, 40)
            if ($interior.A -eq 0) { continue }
            for ($distance = 0; $distance -lt 8; $distance++) {
                $y = $TileSize - 8 + $distance
                $current = $Bitmap.GetPixel($offsetX + $x, $y)
                if ($current.A -eq 0) { continue }
                $amount = ($distance + 1) / 8.0
                $Bitmap.SetPixel($offsetX + $x, $y, (Blend-Color $current $interior $amount))
            }
        }
    }
}

function Get-AverageColor([System.Drawing.Color[]]$Colors) {
    $red = 0
    $green = 0
    $blue = 0
    $count = 0
    foreach ($color in $Colors) {
        if ($color.A -eq 0) { continue }
        $red += $color.R
        $green += $color.G
        $blue += $color.B
        $count++
    }
    if ($count -eq 0) { return [System.Drawing.Color]::Transparent }
    return [System.Drawing.Color]::FromArgb(255, [int]($red / $count), [int]($green / $count), [int]($blue / $count))
}

function Blend-Color([System.Drawing.Color]$From, [System.Drawing.Color]$To, [double]$Amount) {
    if ($From.A -eq 0 -or $To.A -eq 0) { return $From }
    $inverse = 1.0 - $Amount
    return [System.Drawing.Color]::FromArgb(
        255,
        [int]($From.R * $inverse + $To.R * $Amount),
        [int]($From.G * $inverse + $To.G * $Amount),
        [int]($From.B * $inverse + $To.B * $Amount)
    )
}

function Blend-MiddleSeams([System.Drawing.Bitmap]$Bitmap) {
    foreach ($row in 0..($Rows - 1)) {
        $offsetY = $row * $TileSize
        for ($y = 0; $y -lt $TileSize; $y++) {
            $edge = Get-AverageColor @(
                $Bitmap.GetPixel($TileSize + 8, $offsetY + $y),
                $Bitmap.GetPixel($TileSize * 2 - 9, $offsetY + $y),
                $Bitmap.GetPixel($TileSize * 2 + 8, $offsetY + $y),
                $Bitmap.GetPixel($TileSize * 3 - 9, $offsetY + $y)
            )
            for ($distance = 0; $distance -lt 4; $distance++) {
                $amount = (4 - $distance) / 4.0
                foreach ($column in @(1, 2)) {
                    foreach ($localX in @($distance, ($TileSize - 1 - $distance))) {
                        $x = $column * $TileSize + $localX
                        $current = $Bitmap.GetPixel($x, $offsetY + $y)
                        $Bitmap.SetPixel($x, $offsetY + $y, (Blend-Color $current $edge $amount))
                    }
                }
            }
        }
    }

    foreach ($column in 0..($Columns - 1)) {
        $offsetX = $column * $TileSize
        for ($x = 0; $x -lt $TileSize; $x++) {
            $edge = Get-AverageColor @(
                $Bitmap.GetPixel($offsetX + $x, $TileSize - 24),
                $Bitmap.GetPixel($offsetX + $x, $TileSize + 32)
            )
            for ($distance = 0; $distance -lt 4; $distance++) {
                foreach ($y in @(($TileSize - 1 - $distance), ($TileSize + $distance))) {
                    $amount = (4 - $distance) / 4.0
                    $current = $Bitmap.GetPixel($offsetX + $x, $y)
                    $Bitmap.SetPixel($offsetX + $x, $y, (Blend-Color $current $edge $amount))
                }
            }
        }
    }
}

function New-Tileset([hashtable]$Definition) {
    $sourcePath = Join-Path (Join-Path (Join-Path (Join-Path $OutputRoot $Definition.Biome) 'tiles') 'masters') 'platform-tileset-concept.png'
    if (-not (Test-Path $sourcePath)) { throw "Missing concept master: $sourcePath" }

    $targetDir = Join-Path (Join-Path $OutputRoot $Definition.Biome) 'tiles'
    $targetPath = Join-Path $targetDir 'platform-tileset.png'
    $source = [System.Drawing.Bitmap]::FromFile($sourcePath)
    $atlas = New-Object System.Drawing.Bitmap $AtlasWidth, $AtlasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    try {
        for ($row = 0; $row -lt $Rows; $row++) {
            for ($column = 0; $column -lt $Columns; $column++) {
                $crop = Get-CellCrop $source $column $row
                if ($crop.Right -gt $source.Width -or $crop.Bottom -gt $source.Height) {
                    throw "Crop outside $($source.Width)x$($source.Height) master for $($Definition.Biome)"
                }
                Copy-CropNearest $source $atlas $crop $column $row
            }
        }

        # Middle cells provide seamless texture. Caps reuse that texture and only
        # add an outer erosion silhouette; their inner edge remains fully closed.
        foreach ($row in 0..($Rows - 1)) {
            foreach ($column in @(1, 2)) { Close-MiddleEdges $atlas $column $row }
        }
        Blend-MiddleSeams $atlas
        Flatten-SurfaceBottom $atlas
        Blend-CapInnerEdges $atlas

        $atlas.SetResolution(96, 96)
        $atlas.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $source.Dispose()
        $atlas.Dispose()
    }
}

$definitions = @(
    @{ Biome = 'meadow-mountains' },
    @{ Biome = 'meadow-forest' },
    @{ Biome = 'red-brown-cave' },
    @{ Biome = 'jungle' }
)

foreach ($definition in $definitions) { New-Tileset $definition }

Write-Output "Extracted and cleaned four organic $AtlasWidth x $AtlasHeight platform tilesets from their concept masters."
