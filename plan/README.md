# Implementierungsplan Idlekin

Dieser Ordner ist die **Umsetzungsebene** der Spielbeschreibungen.

- `docs/` = **Was** das Spiel ist. Bleibt unverändert und ist die Wahrheit über das Design.
- `plan/` = **Wie und in welcher Reihenfolge** es gebaut wird. Ableitung, keine Neuerfindung.

Wenn ein Plan dem GDD widerspricht, gewinnt das GDD — es sei denn, die Abweichung ist im
jeweiligen Meilenstein unter *Abweichung vom GDD-Plan* begründet aufgeführt.

---

## Wie dieser Plan gelesen wird

Jeder Meilenstein (M1–M13) ist eine eigene Datei und beschreibt:

| Abschnitt | Inhalt |
|---|---|
| **Ziel** | Ein Satz: was danach spielbar ist, was vorher nicht ging |
| **Vorbedingungen** | Welche Meilensteine fertig sein müssen |
| **GDD-Bezug** | Welche Dokumente aus `docs/` umgesetzt werden |
| **Abweichung vom GDD-Plan** | Wo die Reihenfolge von `docs/26-entwicklungsplan.md` bewusst abweicht |
| **Schritte** | Nummerierte Arbeitspakete `S-<M>.<n>` |
| **Ergebnis** | Der spielbare Zustand am Ende |
| **Nicht in diesem Meilenstein** | Was ausdrücklich später kommt (gegen Scope-Creep) |

Jeder **Schritt** hat dieselbe Struktur:

- **Was** – die Arbeit in ein bis drei Sätzen
- **Dateien** – welche Pfade entstehen oder sich ändern
- **Details** – Datenstrukturen, Algorithmen, Formeln, Reihenfolge
- **Fertig wenn** – überprüfbare Abnahmekriterien, nicht "sieht gut aus"
- **Test** – wie das geprüft wird (Unit, manuell, Prototyp)
- **Risiko** – nur wenn es eins gibt

Ein Schritt ist so geschnitten, dass er in **einer Arbeitssitzung** abschließbar ist und
danach ein **lauffähiges Spiel** hinterlässt. Das ist die harte Regel aus
`docs/26-entwicklungsplan.md` §26.33: *spielbar wachsen*.

---

## Grundregeln der Umsetzung

1. **Nie zwei Meilensteine gleichzeitig.** Ein Meilenstein wird fertig, getestet und
   als spielbar bestätigt, bevor der nächste beginnt.
2. **Serverautorität ab Tag eins.** Alles, was Fortschritt erzeugt (XP, Items, Währung,
   Kills, Ressourcen), entsteht auf dem Server. Der Client fragt und zeigt an.
   Nachträglich lässt sich das nicht mehr einziehen (`docs/24` §24.7, §24.16).
3. **Daten vor Code.** Neue Gegner, Items, Rezepte, Gebiete, Ressourcen und Klassen sind
   Datensätze in `content/`, keine neuen Codepfade (`docs/25` §25.26).
4. **Kernlogik plattformfrei.** Simulation und Regeln liegen in `packages/shared` und
   kennen weder DOM noch Datenbank. Das ist die Steam-Vorbereitung aus `docs/24` §24.5.
5. **Prototypen bleiben getrennt.** `prototypes/` wird nie importiert und importiert nie
   aus dem Spiel. Bewährte Erkenntnisse werden **neu** implementiert
   (`prototypes/README.md`, Regeln 1 und 4).
6. **Kein Balancing vor M13.** Bis dahin gelten Platzhalterwerte, die klar als solche
   markiert sind. Frühes Balancing ist verlorene Arbeit, solange Systeme fehlen.

---

## Reihenfolge und Abhängigkeiten

```text
M1 Fundament
 └─ M2 Welt & Bewegung
     └─ M3 Charaktere & Wechsel
         ├─ M4 Items & Inventar
         │   ├─ M5 Berufe & Idle ──┐
         │   └─ M6 Kampf ──────────┤
         │                         └─ M7 Progression
         │                             └─ M8 Ausrüstung & Crafting
         │                                 └─ M9 Welt, Quests, Bosse
         │                                     └─ M10 Split-Screen, Multiplayer, Handel
         │                                         └─ M11 UI komplett
         │                                             └─ M12 Assets
         │                                                 └─ M13 Härtung & Release
```

M5 und M6 sind voneinander unabhängig und könnten getauscht werden. Empfohlen ist
**M5 zuerst**: das Idle-System ist das eigentliche Alleinstellungsmerkmal
(`docs/01` §1.10) und deckt mehr technisches Risiko ab als der Kampf.

---

## Meilensteine im Überblick

| # | Datei | Ziel in einem Satz | Aufwand | GDD-Phasen |
|---|---|---|---|---|
| M0 | [00-grundlagen-und-entscheidungen.md](00-grundlagen-und-entscheidungen.md) | Stack, Ordnerstruktur und Konventionen festlegen | 1 T | — |
| M1 | [01-m1-fundament.md](01-m1-fundament.md) | Client, Server, DB und Spielstand laufen zusammen | 5–7 T | 1 |
| M2 | [02-m2-welt-und-bewegung.md](02-m2-welt-und-bewegung.md) | Eine Figur läuft durch ein Gebiet und durch ein Portal | 6–8 T | 2 |
| M3 | [03-m3-charaktere.md](03-m3-charaktere.md) | Mehrere Charaktere mit eigener Position, umschaltbar | 4–5 T | 3, 4 (teilw.) |
| M4 | [04-m4-items-und-inventar.md](04-m4-items-und-inventar.md) | Items existieren, liegen in der Welt und im Rucksack | 4–5 T | 8 |
| M5 | [05-m5-berufe-und-idle.md](05-m5-berufe-und-idle.md) | Charaktere arbeiten parallel weiter — online und offline | 8–10 T | 9, 21, 4 (Rest) |
| M6 | [06-m6-kampf.md](06-m6-kampf.md) | Gegner werden aktiv und automatisch besiegt | 8–10 T | 5, 6, 7 |
| M7 | [07-m7-progression.md](07-m7-progression.md) | Level, Attribute, Skills, Klassen, aktive Fähigkeiten | 7–9 T | 10, 11, 12, 13 |
| M8 | [08-m8-ausruestung-und-crafting.md](08-m8-ausruestung-und-crafting.md) | Ressourcen werden zu Ausrüstung, Ausrüstung wirkt | 7–9 T | 14, 15 |
| M9 | [09-m9-welt-quests-bosse.md](09-m9-welt-quests-bosse.md) | Eine echte Welt mit Freischaltungen, Quests und Bossen | 10–12 T | 16, 17, 18, 19 |
| M10 | [10-m10-splitscreen-multiplayer-handel.md](10-m10-splitscreen-multiplayer-handel.md) | Vier Charaktere gleichzeitig, andere Spieler, Markt | 9–11 T | 20, 22, 23 |
| M11 | [11-m11-ui.md](11-m11-ui.md) | Alle Systeme sind ohne Vorwissen bedienbar | 6–8 T | 24 |
| M12 | [12-m12-assets.md](12-m12-assets.md) | Platzhaltergrafik ist durch die Stilrichtung ersetzt | 8–12 T | 25 |
| M13 | [13-m13-haertung-und-release.md](13-m13-haertung-und-release.md) | Balancing, Sicherheit, Performance, Steam-Vorbereitung | 10–14 T | 26–31 |

**Aufwand in Personentagen für eine Person mit KI-Unterstützung**, ohne Assetproduktion
außerhalb von M12 und ohne Wartezeiten. Summe: rund **95–125 Tage**. Die Zahlen sind
Größenordnungen zur Reihenfolgeplanung, keine Zusagen.

**Erster echt spielbarer Stand** ist Ende M6 (rund 35–45 Tage): mehrere Charaktere,
parallele Aktivitäten, Kampf, Idle, Inventar. Das ist der sinnvolle Punkt für die erste
Rückmeldung von außen.

---

## Querschnittsdokumente

| Datei | Inhalt |
|---|---|
| [90-datenmodell.md](90-datenmodell.md) | Verbindliche Typen und Tabellen, aus `docs/25` konkretisiert |
| [91-teststrategie-und-qualitaet.md](91-teststrategie-und-qualitaet.md) | Was getestet wird, womit, und was bewusst nicht |
| [92-asset-pipeline.md](92-asset-pipeline.md) | Weg vom Rohbild zum Atlas, aus `docs/27` abgeleitet |
| [99-offene-entscheidungen.md](99-offene-entscheidungen.md) | Was noch entschieden werden muss, und bis wann |

---

## Fortschritt

Status pro Meilenstein hier pflegen. Ein Meilenstein ist erst `fertig`, wenn **alle**
Abnahmekriterien seiner Schritte erfüllt sind.

| Meilenstein | Status | Beendet am | Bemerkung |
|---|---|---|---|
| M0 | offen | — | |
| M1 | offen | — | |
| M2 | offen | — | Vorarbeit in `prototypes/01-side-view-movement` |
| M3 | offen | — | |
| M4 | offen | — | |
| M5 | offen | — | |
| M6 | offen | — | |
| M7 | offen | — | |
| M8 | offen | — | |
| M9 | offen | — | |
| M10 | offen | — | |
| M11 | offen | — | |
| M12 | offen | — | |
| M13 | offen | — | |
