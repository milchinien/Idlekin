# Asset-Pipeline

Der reproduzierbare Weg von der Quelldatei zum ausgelieferten Atlas. Ableitung aus
`docs/27-asset-style-guide.md`; gebaut in M12/S-12.1, genutzt ab dann für jedes Asset.

---

## Warum eine Pipeline und nicht Handarbeit

`docs/27` §27.7 stellt fünf harte Bedingungen an jede Charakterebene:

1. exakt dieselbe Canvasgröße, Zellgröße, Framebelegung und Framezahl
2. identischer Anker
3. leere Frames vollständig transparent
4. alle Pixel innerhalb der Zelle
5. Gameplay-Hitbox unverändert

Bedingungen 1 bis 4 sind maschinell prüfbar. Bei drei Ausrüstungsplätzen mal drei
Wertstufen mal sieben Animationen sind das 63 Dateien, bei denen jede einzeln stimmen
muss. Handkontrolle versagt dort zuverlässig.

---

## Ordner

```text
assets/                                   Quellen — Aseprite, PSD, PNG
├── player/Final Player/toUse.png         FEST, docs/27 §27.7
├── player/layers/<slot>/<tier>/<anim>.png
├── enemies/<id>/<anim>.png
├── world/<biome>/{tileset,bg1,bg2,fg}.png
├── nodes/<id>.png
├── icons/<itemId>.png
├── effects/<abilityId>/*.png
└── ui/*.png

packages/client/public/atlas/             Ausgabe — nie von Hand bearbeitet
├── player.png + player.json
├── enemies.png + enemies.json
├── world_<biome>.png + .json
├── icons.png + icons.json
└── effects.png + effects.json
```

**Regel:** Nichts unter `public/atlas/` wird von Hand geändert. Was dort steht, entsteht
aus `assets/`. Sonst weiß nach zwei Wochen niemand mehr, welche Version stimmt.

---

## Ablauf

`pnpm assets:build` führt aus:

1. **Sammeln** — Quelldateien nach Kategorie einlesen
2. **Prüfen** — siehe unten; bei Verstoß Abbruch mit Datei und Grund
3. **Zuschneiden** — transparente Ränder entfernen, Versatz merken
4. **Packen** — Regalpackung, Zweierpotenz-Größe, 1 px Abstand gegen Farbbluten
5. **Beschreiben** — JSON mit Rahmen, Anker, Animationen, FPS, Wiederholung
6. **Schreiben** — PNG plus JSON, deterministisch

**Deterministisch** heißt: Gleiche Eingabe ergibt byteweise gleiche Ausgabe. Sonst
erzeugt jeder Bau eine Änderung in der Versionsverwaltung, auch wenn nichts anders ist.

---

## Prüfungen

| Prüfung | Regel | Quelle |
|---|---|---|
| Zellgröße | Charakterebenen 128 × 128 | §27.7 |
| Atlasgröße | Player 1280 × 1152, 10 × 9 | §27.7 |
| Anker | Player x 64, y 80, ganzzahlig | §27.4 |
| Framebelegung | identisch zum Body-Atlas | §27.7 |
| Pixelgrenzen | kein Pixel außerhalb der Zelle | §27.7 |
| Leere Frames | vollständig transparent | §27.7 |
| Farbanzahl | kleine Gameplay-Assets 3–6 inkl. Kontur | §27.6 |
| Alphakanal | nur 0 oder 255 — keine weichen Kanten | §27.3 |
| Tileraster | Welt-Tiles Vielfache von 16 | §27.4 |
| Player-Palette | Konturen und Basisfarben unverändert | §27.6 |

**Zur Alphaprüfung:** Halbtransparente Pixel entstehen unbemerkt beim Skalieren oder
Drehen in Bildbearbeitungsprogrammen. Sie widersprechen §27.3 (harte Kanten) und fallen
bei ganzzahliger Vergrößerung sofort auf. Automatisch geprüft sind sie erledigt, von
Hand nie.

---

## Player-Atlas — feste Werte

Aus `docs/27` §27.7, **nicht verhandelbar**:

| Eigenschaft | Wert |
|---|---|
| Atlas | `assets/player/Final Player/toUse.png` |
| Größe | 1280 × 1152 px, 10 × 9 Zellen |
| Zelle | 128 × 128 px |
| Anker | x 64, y 80 |
| Hitbox | 12 × 20 px, unabhängig von Ausrüstung |
| Produktionsrichtung | rechts; links wird gespiegelt |

| Animation | Zellen | Frames | FPS | Wiederholung |
|---|---|---:|---:|---|
| Idle | (0–9, 1) | 10 | 8 | ja |
| Walk | (0–9, 2) | 10 | 10 | ja |
| Run | (0–9, 3) | 10 | 14 | ja |
| Jump | (0–5, 4) | 6 | 12 | nein |
| Fall | (0–3, 5) | 4 | 10 | nein |
| Fall-Loop | (0–2, 6) | 3 | 8 | ja |
| Melee | (0–2, 7) + (0–3, 8) | 7 | 14 | nein |

**Ebenenreihenfolge:** `body → clothing → pants → hair → hat → accessory → weapon → effect`

**Noch nicht im bestätigten Template:** Climb, Dash, Cast, Bow. `docs/27` §27.7 verbietet
ausdrücklich, sie frei zu erfinden — es braucht geometrisch passende Referenzsheets.
Behandlung in M12/S-12.3.

---

## Spiegelung

Links entsteht durch Spiegeln (§27.7). Beim Spiegeln gesondert zu prüfen: asymmetrische
Schriftzeichen, Schilde, Scheiden und Handlogik. Ein Schwert in der falschen Hand fällt
bei jedem Richtungswechsel auf.

Die Pipeline markiert Ebenen mit `"asymmetric": true` im JSON; der Renderer nutzt dann
eine eigene Linksvariante statt zu spiegeln.

---

## Plattformen

Verbindliche Referenz: `assets/referenz (MUSS)/platforms/GandalfHardcore FREE Platformer
Assets/`, besonders `Floor Tiles1.png`, `Floor Tiles2.png`, `Other Tiles1.png`,
`Other Tiles2.png` (§27.8).

Regeln, die dabei gelten:

- Körper überwiegend dunkel, ruhig, nahezu flächig
- Detail nur an Laufkante, Außenkontur und wenigen Akzentstellen
- Gras und Moos als dünne, fein gepixelte Lippe — keine dicke Hecke
- keine vollflächigen Geröll-, Pflaster-, Ziegel- oder Bouldertexturen
- Biomvarianten ändern Palette und Randmaterial, nicht die Detaildichte
- wiederholende Mitteltiles ohne sichtbare Seitenrahmen; gestaltete Kanten nur an Enden

Die vorhandenen Werkzeuge `tools/generate-platform-tilesets.ps1` und
`tools/debug-platforms.ps1` werden in die Pipeline eingebunden, statt daneben betrieben
zu werden.

---

## Biome

Nach §27.8 werden **vor** den Einzelassets festgelegt: Bodenfamilie, Hintergrundtiefe,
drei Hauptmaterialien, Interaktions-Akzentfarbe, Portalvariante.

| Familie | Form | Palette |
|---|---|---|
| Wiese | offen, rund | helles Grün, Gelb, Himmel |
| Wald | vertikale Stämme, dichte Kronen | mittleres Grün, warmes Braun |
| Dunkler Wald | enger | kühleres, dunkleres Grün und Blau |
| Mine/Höhle | kantig, klare Erzadern | gedämpftes Grau, Braun, Blau |
| Sumpf | flach, organisch | oliv, türkis, violette Akzente |
| Berge | große Diagonalen | kühles Grau, Himmel |
| Ruinen | gebrochene Architektur | entsättigter Stein plus Akzent |
| Magisch | Runen, Kristalle | dunkle Basis, gesättigtes Leuchten |

---

## Laufzeit

Der Atlas-Lader (`packages/client/src/render/atlas.ts`, ab M2/S-2.2) liest das JSON und
stellt bereit:

```ts
type AtlasFrame  = { x: number; y: number; w: number; h: number; ox: number; oy: number };
type AtlasAnim   = { frames: AtlasFrame[]; fps: number; loop: boolean };
type Atlas       = { image: HTMLImageElement; anims: Record<string, AtlasAnim> };
```

`ox`/`oy` tragen den beim Zuschneiden entfernten Rand. **Ohne sie sitzt jede
zugeschnittene Ebene versetzt** — der häufigste Fehler bei selbstgebauten Packern.

Der Renderer zeichnet ausschließlich an ganzzahligen Positionen (`docs/27` §27.4) und
rundet die Renderposition, nicht die Simulationsposition (M2/S-2.2).
