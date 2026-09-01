# M12 — Pixel-Art und Assets

**Ziel:** Die Platzhaltergrafik wird durch die Stilrichtung aus `docs/23` und `docs/27`
ersetzt. Das Spiel bekommt seine eigene visuelle Identität.

**Aufwand:** 8–12 Tage — stark abhängig vom Umfang der eigenen Produktion
**Vorbedingungen:** M11
**GDD-Bezug:** `docs/23-pixel-art-richtung.md`, `docs/27-asset-style-guide.md`,
`docs/26` Phase 25

**Zugehöriges Dokument:** [92-asset-pipeline.md](92-asset-pipeline.md)

---

## Warum Assets zuletzt

Nicht, weil sie unwichtig wären — `docs/23` §23.19 macht Grafik zum
Verständlichkeitswerkzeug, nicht zur Dekoration. Sondern weil erst jetzt feststeht,
**was überhaupt gebraucht wird**: welche Gegner, welche Ressourcen, welche
Ausrüstungsplätze, welche Effekte, welche UI-Elemente.

Assets vor M11 zu produzieren heißt, für Systeme zu zeichnen, die sich noch ändern.

**Ausnahme, die bereits gilt:** Der Player-Atlas `assets/player/Final Player/toUse.png`
ist laut `docs/27` §27.7 **fest** und wird seit M2 unverändert verwendet. Er wird in M12
nicht ersetzt, sondern nur um Ebenen ergänzt.

---

## Bestandsaufnahme

Was im Projekt bereits liegt und verwendet wird:

| Vorhanden | Status nach `docs/27` |
|---|---|
| `assets/player/Final Player/toUse.png` | **fest**, 1280 × 1152, 10 × 9 Zellen, 128 × 128 px |
| `assets/Font/ThaleahFat.ttf` | in Verwendung seit M11 |
| `assets/referenz (MUSS)/platforms/...` | **verbindliche** Plattformreferenz (§27.8) |
| `assets/referenz (MUSS)/archer animation referenz/` | Referenz für Fernkampfanimationen |
| `assets/props/Textures/*` | Ausgangsmaterial für Requisiten und Effekte |
| `assets/portals/production/*` | Portalgrafik, drei Stufen |
| `tools/generate-platform-tilesets.ps1` | erzeugt Plattform-Tilesets |

---

## Schritte

### S-12.1 Asset-Pipeline

**Was:** Der reproduzierbare Weg vom Einzelbild zum ausgelieferten Atlas.

**Dateien:** `tools/build-assets.mjs`, `packages/client/public/atlas/*`

**Details:** siehe [92-asset-pipeline.md](92-asset-pipeline.md). Kern:

- Quellen bleiben in `assets/`, Ausgabe in `packages/client/public/atlas/`
- Ein Aufruf baut alles neu, deterministisch
- Prüfungen brechen den Bau ab: falsche Zellgröße, Pixel außerhalb der Zelle,
  fehlende Frames, Farben außerhalb der Palette, nicht ganzzahlige Anker

**Warum eine Prüfung und nicht Sorgfalt:** `docs/27` §27.7 stellt fünf harte Bedingungen
an jede Ebene (gleiche Zellgröße, gleicher Anker, leere Frames transparent, alle Pixel
in der Zelle, Hitbox unverändert). Vier davon sind maschinell prüfbar. Ein Mensch
übersieht sie beim fünfzigsten Rüstungsteil.

**Fertig wenn:** `pnpm assets:build` erzeugt alle Atlanten; ein absichtlich fehlerhaftes
Asset bricht den Bau mit klarer Meldung ab.

---

### S-12.2 Charakterebenen

**Was:** Ausrüstung als Ebenen über dem festen Player-Atlas.

**Details:**

Ebenenreihenfolge ist in `docs/27` §27.7 festgelegt und wird nicht verhandelt:

```text
body → clothing → pants → hair → hat → accessory → weapon → effect
```

Jede Ebene nutzt **exakt** dieselbe Zellbelegung wie der Body-Atlas:

| Animation | Zellen | Frames | FPS | Wiederholung |
|---|---|---:|---:|---|
| Idle | (0–9, 1) | 10 | 8 | ja |
| Walk | (0–9, 2) | 10 | 10 | ja |
| Run | (0–9, 3) | 10 | 14 | ja |
| Jump | (0–5, 4) | 6 | 12 | nein |
| Fall | (0–3, 5) | 4 | 10 | nein |
| Fall-Loop | (0–2, 6) | 3 | 8 | ja |
| Melee | (0–2, 7) + (0–3, 8) | 7 | 14 | nein |

**Wichtig:** `docs/27` §27.7 stellt ausdrücklich fest, dass **Climb, Dash, Cast und Bow
noch nicht Teil des bestätigten Templates sind** und erst ergänzt werden dürfen, wenn
geometrisch passende Referenz-Sheets vorliegen.

Das betrifft M6 (Dash), M7 (Cast, Bow) und M5 (Sammelanimationen) unmittelbar. **Diese
Referenzsheets zu beschaffen ist Aufgabe S-12.3 und gehört auf die Liste offener
Punkte** — bis dahin nutzen die betroffenen Aktionen ersatzweise vorhandene
Animationen (Dash → Run, Cast → Melee).

**Umfang:** je Ausrüstungsplatz drei Wertstufen, plus Klassenmerkmale nach `docs/27`
§27.5 (Krieger breit, Bogenschütze schmal, Magier vertikal, Pet Master mit Begleiter).

**Fertig wenn:** Ein Charakter mit vollständiger Ausrüstung zeigt in allen sieben
Animationen deckungsgleiche Ebenen ohne Versatz.

---

### S-12.3 Fehlende Animationen beschaffen

**Was:** Referenzsheets für Dash, Cast, Bow und die vier Sammelanimationen.

**Details:** Nach `docs/27` §27.7 dürfen fehlende Aktionen **nicht frei erfunden**
werden. Die Referenz muss geometrisch zum Pflichttemplate passen.

Zwei Wege:

1. Passendes Referenzsheet beschaffen — für Fernkampf existiert unter
   `assets/referenz (MUSS)/archer animation referenz/` bereits Material
2. Bestehende Animationen ableiten: Cast ist eine Umgestaltung von Melee mit anderer
   Handhaltung, das ist vom Verbot nicht betroffen

**Sammelanimationen** (Holzfällen, Mining, Angeln, Landwirtschaft) sind der wichtigste
Punkt: `docs/23` §23.7 und `docs/27` §27.7 verlangen einen eindeutig sichtbaren Kontakt
zwischen Werkzeug und Ressource. Ohne diese Animationen bleibt das Idle-System aus M5
optisch stumm — und die Sichtbarkeit von Idle-Arbeit ist laut `docs/12` §12.9 eine
Kernanforderung.

**Fertig wenn:** Sieben zusätzliche Animationen existieren, folgen dem Template und
werden von der Pipeline akzeptiert.

---

### S-12.4 Welt und Biome

**Was:** Tilesets, Hintergründe und Plattformen für alle Gebietsfamilien.

**Details:** Nach `docs/27` §27.8 acht Familien: Wiese, Wald, Dunkler Wald, Mine/Höhle,
Sumpf, Berge, Ruinen, Magisches Gebiet.

Je Familie werden **vor** den Einzelassets festgelegt: Bodenfamilie, Hintergrundtiefe,
drei Hauptmaterialien, Interaktions-Akzentfarbe, Portalvariante.

**Plattformen** folgen der verbindlichen Referenz unter
`assets/referenz (MUSS)/platforms/GandalfHardcore FREE Platformer Assets/`:
Körper dunkel und ruhig, Detail nur an Laufkante und Außenkontur, dünne Gras-Lippe, keine
flächigen Ziegel- oder Geröllstrukturen, wiederholende Mitteltiles ohne Seitenrahmen.

`tools/generate-platform-tilesets.ps1` und `tools/debug-platforms.ps1` sind dafür bereits
vorhanden und werden in die Pipeline aus S-12.1 eingebunden statt daneben betrieben.

**Fertig wenn:** Alle 14 Gebiete aus M9 nutzen endgültige Grafik; jede Gebietsfamilie ist
an ihrer Palette erkennbar (`docs/23` §23.11).

---

### S-12.5 Gegner und Bosse

**Was:** Endgültige Sprites für alle Gegner aus M6 und M9.

**Details:** Nach `docs/27` §27.5: jede Grundart eine eigene Primärsilhouette; Varianten
unterscheiden sich in **mindestens zwei** Merkmalen (Farbe, Fortsatz, Ausrüstung, Größe,
Effekt).

Bosse: mindestens **doppelte visuelle Masse** eines normalen Gegners, ein einzigartiger
Silhouettenanker, sichtbare Phasenwechsel über Form, Pose, Palette oder Effekt — nicht
nur über die Anzeige.

**Angriffe brauchen drei klar getrennte Stufen:** Vorbereitung, Gefahrenphase, Abklingen.
Das ist die Bedingung dafür, dass der aktive Bosskampf aus M9/S-9.5 überhaupt
funktioniert.

**Fertig wenn:** Alle Gegner und beide Bosse haben endgültige Sprites mit Lauf-,
Angriffs-, Treffer- und Todesanimation.

---

### S-12.6 Ressourcen, Gegenstände und Effekte

**Was:** Ressourcenpunkte, Item-Symbole, Partikel.

**Details:**

- **Ressourcenpunkte** nach `docs/23` §23.8: Höherwertige Stufen erkennbar anders, nicht
  nur eingefärbt. Ein Hartholzbaum muss sich von einer Eiche in der Silhouette
  unterscheiden — sonst ist der Skill-Fortschritt aus M5 unsichtbar.
- **Symbole** bei kleiner Darstellung eindeutig (`docs/23` §23.13); Seltenheit über Rahmen
  **und** Farbe, nie nur Farbe (M11/S-11.6).
- **Effekte** nach `docs/23` §23.15 und `docs/27` §27.6: heller Kern, gesättigter Rand,
  wenige geführte Partikel. Sie dürfen Gegner, Ressourcen, Portale und Beute nicht
  verdecken — `docs/27` §27.2 stellt Gameplay über Dekoration.

**Fertig wenn:** Jeder Gegenstand hat ein Symbol; jede Ressourcenstufe ist optisch
unterscheidbar; alle Fähigkeiten aus M7 haben Effekte.

---

### S-12.7 UI-Grafik und Ton

**Was:** Rahmen, Schaltflächen, Symbole im Pixelstil — und die ersten Töne.

**Details:** Nach `docs/23` §23.16: Lesbarkeit hat Vorrang vor Dekoration. Rahmen als
9-Slice, damit sie mit dem Inhalt wachsen.

**Ton** ist in `docs/23` nicht behandelt, wird aber gebraucht. Minimalumfang: Treffer,
Levelaufstieg, Sammelgeräusch je Beruf, Portal, Fehlermeldung, Umgebungsschleife je
Biom, Bossmusik. Umsetzung mit der Web Audio API; die Lautstärkeregler aus M11/S-11.3
sind bereits vorhanden.

**Fertig wenn:** Die UI ist stilistisch geschlossen; alle genannten Töne existieren und
sind regelbar.

---

## Ergebnis

Idlekin sieht aus wie Idlekin. Ein Betrachter erkennt nach `docs/23` §23.19 auf einen
Blick: welcher Charakter aktiv ist, was er tut, gegen wen er kämpft, welche Ressourcen
da sind, in welchem Gebiet er ist, welche Ausrüstung er trägt, welche Klasse er hat.

## Nicht in diesem Meilenstein

- Neue Gebiete oder Gegner — hier wird nur ersetzt, nicht erweitert
- Zwischensequenzen, Vertonung
