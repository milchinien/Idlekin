# Prototyp 02 – Tilemap-Editor

## Frage

Lässt sich mit den gelieferten 32-px-Tiles schnell und verständlich eine
spielbare, mehrschichtige Map inklusive Kollisionen bauen?

## Ziel

Eine Map direkt mit den 32-px-Assets aus `assets/tileset/PNG` bauen, ohne die
Produktionspakete zu importieren. Der Prototyp bleibt vollständig isoliert.

## Bedienung

- Mit **Spielen** den aktuellen, auch noch nicht gespeicherten Kartenstand direkt in Prototyp 01 testen.
- Im Tilesheet klicken oder ziehen, um ein einzelnes Tile oder ein mehrteiliges
  Objekt auszuwählen.
- Die fünf Sheets aus `assets/props/Textures` stehen in einer eigenen Gruppe.
  Ihr tatsächliches Raster wird berücksichtigt (32 px, 40 px oder 64 px), und
  beim Auswählen eines Props wechselt der Editor automatisch zu Dekoration.
- Mit **B** malen, **E** löschen, **R** Flächen füllen, **I** platzierte Tiles
  aufnehmen, **C** Kollisionen markieren und **H** bzw. Leertaste verschieben.
- Vier Ebenen trennen Hintergrund-Tiles, Boden, Dekoration und Vordergrund.
- Das Menü **Meine Maps** verwaltet beliebig viele benannte lokale Maps. Jeder
  Eintrag kann geladen, mit dem aktuellen Stand überschrieben oder gelöscht
  werden. Ein alter Einzelspeicherstand wird automatisch in die Bibliothek
  übernommen. Die Bibliothek nutzt nahezu die volle Browserfläche und erzeugt
  zu jedem Speicherstand eine Vorschau ohne Editor-Raster oder Kollisionsebene.
  Export/Import verwendet weiterhin JSON-Dateien.
- Standardgröße ist 30×17 Tiles bzw. 960×544 px und passt damit exakt zu den
  mitgelieferten `Background/x32`-Bildern.

## Exportformat

Das JSON enthält Mapgröße, Hintergrund, Ebenen mit Quellrechtecken sowie ein
separates Kollisionsraster. Alle Koordinaten sind ganzzahlige Tile-Koordinaten;
`tileSize` dokumentiert die Umrechnung in Pixel.
