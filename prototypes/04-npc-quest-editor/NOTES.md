# Prototyp 04 – NPC- & Quest-Schmiede

## Frage

Lassen sich NPCs, Dialoge und mehrstufige Quests direkt auf den Welten aus Prototyp 03 verständlich und spannend gestalten?

## Ziel

Der Prototyp übernimmt den gespeicherten Welt-Snapshot aus Prototyp 03. Darauf lassen sich NPCs platzieren, Dialogzeilen vor der Questannahme verfassen, Questketten anlegen und Ziele direkt durch einen Klick auf Portale oder Orte in der Welt festlegen.

XP, Gold und Gegner sind bewusst als Platzhalter markiert. Das Questformat ist bereits darauf vorbereitet, damit diese Systeme später angeschlossen werden können.

## Bedienung

- Mit **Spielen** den aktuellen Stand aus Welt, NPCs und Quests direkt in Prototyp 01 testen.
- Oben die gespeicherte Welt aus Prototyp 03 laden.
- Links eine der acht NPC-Vorlagen auswählen, dann **N** drücken und in einen Kartenabschnitt klicken.
- Rechts Name, Rolle, Beschreibung und beliebig viele Dialogzeilen bearbeiten.
- Im Reiter **Quests** mehrere Quests pro NPC und mehrere Etappen pro Quest anlegen.
- Bei einer Portal- oder Orts-Etappe **Ziel wählen** anklicken und das Ziel direkt in der Welt bestimmen.
- Projekte lokal speichern oder als vollständige JSON-Datei exportieren/importieren.

## Questmodell

Eine Quest besteht aus Motivation, geordneten Etappen, Abschlussdialog und Belohnungen. Unterstützte Etappen sind Portal durchqueren, Ort erreichen, mit NPC sprechen, Gegenstand sammeln sowie Gegner besiegen. Sammel-, Gegner-, XP- und Goldfunktionen bleiben bis zu ihrer Umsetzung im Spiel sichtbare Platzhalter.
