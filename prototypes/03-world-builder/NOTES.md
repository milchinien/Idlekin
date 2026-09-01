# Prototyp 03 – Weltenbauer und Portale

## Frage

Lassen sich die in Prototyp 02 gebauten Kartenabschnitte verständlich zu einer großen Welt zusammensetzen und mit Portalen verbinden?

## Ziel

Der Prototyp liest die lokale Kartenbibliothek aus Prototyp 02. Karten können mehrfach auf einer großen Weltfläche platziert und verschoben werden. Innerhalb eines Abschnitts platzierte Portale verweisen auf einen Zielabschnitt und eine konkrete Ankunftsposition. Ein weltweiter Spawnpunkt legt fest, wo jeder neu erstellte Charakter startet.

## Bedienung

- Mit **Spielen** die aktuelle, auch noch nicht gespeicherte Welt direkt in Prototyp 01 testen.
- Links einen gespeicherten Kartenabschnitt aus Prototyp 02 hinzufügen.
- Abschnitte mit **V** auswählen und per Drag anordnen.
- Mit **P** in einen Abschnitt klicken, um dort ein Portal zu bauen.
- Mit **S** in einen Abschnitt klicken, um den Spawnpunkt für neue Charaktere zu setzen.
- Rechts Zielabschnitt und Ankunftskoordinaten einstellen.
- Der Platzierungsfang ist auf 1, 8, 16 oder 32 Pixel einstellbar; Zahlenfelder akzeptieren exakte Pixelwerte.
- Mit **H** oder gehaltener Leertaste die Weltfläche verschieben.
- Mit **Strg+Z** oder dem Rückgängig-Knopf die letzte Änderung zurücknehmen.
- Welt lokal speichern oder als JSON exportieren/importieren.

## Exportformat

Die Weltdatei enthält eigenständige Snapshots der Karten, ihre Weltpositionen, Portale und den Charakter-Spawn. Portal-, Ziel- und Spawnkoordinaten liegen in ganzzahligen Pixeln relativ zum jeweiligen Kartenabschnitt.
