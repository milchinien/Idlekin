# Prototyp 01: Side-View-Bewegung (IdleOn-Stil)

## Frage
**Fühlt sich die Steuerung gut an?**

Konkret: Welche Werte für Laufen, Springen und Luftkontrolle ergeben ein Gefühl,
das zu einem Idle-MMO in Seitenansicht passt? Nicht "sieht es gut aus", sondern
"reagiert es so, wie man es erwartet".

## Aufbau

Seitenansicht mit Gravitation und Sprung, wie in *Legends of IdleOn*: flache
Map, horizontal scrollende Kamera, Sprung mit variabler Höhe.

Die Welt ist **1680 px** breit, also 3,5 Bildschirme. Vorher waren es 2400 px —
das war für eine einzelne Welt zu weitläufig, zumal die Kulissen nur 480×270 px
groß sind, also genau einen Bildschirm füllen.

### Was echt ist
- Fixer Timestep (1/60 s), Simulation unabhängig von der Monitor-Framerate
- Render-Interpolation zwischen zwei Simulationsschritten — ohne die ruckelt es
  auf allem, was nicht exakt 60 Hz läuft
- AABB-Kollision gegen solide Blöcke, X und Y getrennt aufgelöst, in Teilschritten
  von maximal 4 px
- Einweg-Plattformen (von unten durchspringen, mit `S` durchfallen)
- Asymmetrische Gravitation: Fallen schneller als Steigen, Loslassen kappt den Sprung
- Apex-Modifikator: nahe am Scheitelpunkt weniger Gravitation und mehr
  Luftkontrolle — der Sprung „hängt" kurz
- Coyote Time, Sprung-Puffer, Ecken-Korrektur beim Deckenstoß
- Kamera mit exponentieller Glättung, ohne Vorausschau, an Map-Grenzen geklemmt
- Hintergrund gespiegelt gekachelt, dadurch mit einstellbarer Parallaxe scrollbar
- Screenshake und Staub bei harter Landung, Staub beim Bremsen

### Was bewusst gefaked ist
- Nahkampf ist nur eine visuelle Testanimation und besitzt weder Schaden noch Trefferbox
- Vier austauschbare Pixel-Art-Kulissen sind reine Bildschirmhintergründe
- Jede Kulisse besitzt ein passendes modulares 64-px-Quelltileset, das auf
  32 Weltpixel gerendert wird und dadurch im 2x-Backbuffer pixelgenau bleibt
- Keine Gegner, keine Ressourcen, kein Netzwerk, kein Idle-System
- Squash & Stretch statt echter Animationskurven

### Testparcours
| Zone | Wozu |
|---|---|
| Höhen-Lineal (Start) | Sprunghöhe in 20-px-Schritten ablesen |
| Lücken 40 / 60 / 80 / 100 px | Sprungweite — die ersten drei schaffbar, die letzte ist die Grenze |
| Treppe, 32 px pro Stufe | Reicht ein Sprung für eine Stufe? |
| Einweg-Plattformen | Von unten durch, mit `S` runter |
| Überhang | Ecken-Korrektur: knapp angestoßene Kante darf den Sprung nicht töten |
| Wand 60 px | Sprunghöhe gegen ein festes Hindernis |

### Tuning
21 Parameter live justierbar, vier Presets zum Vergleichen:

- **IdleOn-nah** — Schätzung fürs Zielgefühl, Voreinstellung
- **Snappy** — hohe Beschleunigung, schwere Gravitation, sehr direkt
- **Floaty** — träge, lange Luftzeit
- **Roh (ohne Hilfen)** — alle Komfortfunktionen aus: keine Coyote Time, kein
  Puffer, keine Ecken-Korrektur, kein Apex, keine Interpolation. Zum
  Gegenhören, was die Hilfen tatsächlich bringen — das ist der ehrlichste Test

Werte landen in `localStorage` und überleben ein Reload. *Werte als JSON kopieren*
gibt sie zum Übernehmen ins Spiel aus (Fallback: Konsole, da `file://` keine
Clipboard-API hat).

Der Hintergrund kann im Tuning-Panel ausgewählt oder mit `B` gewechselt werden.
Die Auswahl wird ebenfalls in `localStorage` gespeichert. Alle vier Kulissen sind
rein visuell. Die dazugehörigen Plattform-Tilesets werden über die bestehenden
Kollisionsrechtecke gerendert; die Grafik verändert die Physik nicht.

Das HUD zeigt zu jedem Sprung **gemessene** Höhe/Weite/Luftzeit und daneben die
**simulierten** Werte. Letztere entstehen durch numerisches Durchrechnen eines
vollen Sprungs, nicht per Formel — der Apex-Modifikator lässt sich analytisch
nicht sauber ausdrücken. Fürs spätere Leveldesign ergibt sich daraus, wie breit
eine Lücke maximal sein darf.

`F1` zeigt zusätzlich die Hitboxen und das Kameraziel.

Der finale Player-Atlas `assets/player/Final Player/toUse.png` ist pixelgenau
eingebunden. Idle, Walk, Run, Jump, Fall, Fall-Loop und Nahkampf verwenden direkt
dessen 128×128-Zellen; Player-Hitbox und Physik bleiben davon unabhängig. `J`
spielt den rein visuellen Nahkampf ab.

## Verifiziert
Physik headless durchgesteppt, alles wie erwartet:

- Landung exakt auf Bodenkante, Endgeschwindigkeit trifft `maxSpeed` genau
- Variable Sprunghöhe greift: 34 px (kurzer Tipp) / 44 px / 48 px (voll gehalten)
- Simulierte Kennwerte (48 px, 0,62 s) treffen die echte Messung exakt
- Apex-Modifikator: Luftzeit 0,55 s → 0,62 s bei praktisch gleicher Höhe
- Ecken-Korrektur: 3 px zur Seite, Sprung läuft mit unveränderter Geschwindigkeit
  weiter. Ohne sie steht `vy` sofort auf 0
- Coyote Time trägt einen Sprung 3 Frames nach Verlassen der Kante
- Einweg-Plattform: von oben landen, mit `S` durchfallen, von unten durchspringen
- Kamera folgt und klemmt an der Map-Grenze; das Kameraziel hängt nachweislich
  weder von der Blickrichtung noch vom Tempo ab
- Rendering wirft nicht — mit und ohne Interpolation, mit Debug-Overlay, mit Shake
- Presets schalten um, Slider und Checkbox folgen, Persistenz greift
- Boden-Segmente und Lücken summieren sich exakt auf 1680 px; beide Portale und
  beide Ankunftspunkte stehen auf festem Boden
- Hintergrund-Kachelung deckt den Bildschirm bei Parallaxe 0 / 0,15 / 0,25 /
  0,35 / 0,5 / 1 und an jeder Kameraposition lückenlos ab (2–3 Kacheln pro Bild)
- Ein Auto-Spieler überwindet die Lücken 40/60/80 und erreicht das rechte Portal

### Zur Größe der Welt und den Lücken
Die maximale Sprungweite mit vollem Anlauf beträgt gemessen **93 px**
(Snappy 92, Floaty 112). Die alten Lücken von 110 und 140 px waren damit *nie*
überwindbar — das gesamte rechte Drittel der Welt war unerreichbar und das
rechte Portal stand zusätzlich hinter der 60-px-Wand, die mit rund 48 px
Sprunghöhe ebenfalls nicht zu schaffen ist.

Die Lücken sind deshalb auf 40/60/80/100 px geschrumpft: Die ersten drei sind
sicher schaffbar, die vierte liegt knapp über der Sprungweite und markiert die
Grenze. Beide Portale stehen jetzt im erreichbaren Teil.

### Zum Hintergrund
Die Kulissen sind exakt 480×270 px, also genau ein Bildschirm. Damit gibt es
keinen Überschuss, den man verschieben könnte — der Hintergrund klebte fest am
Bildschirm, während die Welt darunter wegscrollte.

Jetzt wird er gekachelt und **jede zweite Kachel gespiegelt**. Dadurch trifft
die rechte Kante einer Kachel immer auf ihr eigenes Spiegelbild, es entsteht nie
eine sichtbare Naht — unabhängig davon, ob das Bild nahtlos gebaut ist. Kein
Hochskalieren, kein Beschnitt, keine Verzerrung. Der Regler *Hintergrund-
Parallaxe* geht von 0 (steht still wie vorher) bis 1 (scrollt mit der Welt).

### Zu den Plattformen
Die Kacheln kommen aus einem 4x2-Atlas (256x128): Spalten sind linke Kappe,
zwei Mittelkacheln und rechte Kappe, Zeilen sind Oberflaeche und Fuellung.
64 Quellpixel entsprechen 32 Weltpixeln.

Drei Fehler behoben:

1. **Rechte Kappe war angeschnitten.** Der Code lief in festen 32-px-Schritten
   und machte den *letzten Schritt* zur Kappe. Bei Breiten, die keine
   Vielfachen von 32 sind, blieb dafuer nur ein Rest von 8-20 px, und daraus
   wurde nur der aeussere Teil des Kappen-Tiles genommen - bei vier von fuenf
   Bodensegmenten also 25-62 % der Kappe. Jetzt sitzen beide Kappen buendig an
   den echten Kanten, die Mittelkacheln fuellen nur dazwischen.

2. **Fuellzeile hatte einen anderen Massstab** als die Oberflaeche (0,571 statt
   0,500), wodurch die Erde dort 14 % groesser war. Der noetige Versatz von
   8 Quellpixeln - er ueberspringt die helle Abschlusskante der Fuellkachel -
   bleibt erhalten, verkuerzt aber jetzt die Wiederholung auf 28 statt 32
   Weltpixel, statt den Massstab zu verbiegen.

3. **Zuschnitt aus dem Master** (`tools/generate-platform-tilesets.ps1`): Die
   feste Teilung in zwei gleich hohe Haelften passte nicht zu allen Mastern.
   In der Hoehle beginnt die untere Blockreihe oberhalb der Bildmitte, deren
   Oberkante landete mit in der Oberflaechenkachel - sichtbar als zweite
   Lichtlinie mitten im Boden. Jetzt werden die Inhaltsbaender erkannt.
   Dabei genuegt nicht das erste Band: im Dschungel ragen Blattwedel frei
   ueber die Bloecke und bilden ein eigenes kleines Band weiter oben.
   Genommen wird das erste Band mit Blockhoehe. Ausserdem wurden transparente
   Quellpixel als deckendes Schwarz uebernommen - daher der schwarze Streifen
   ueber der Grasnarbe im Dschungel.

### Zur Farbe der Plattformen
Die Master-Konzepte liefern ein nahezu texturloses Fast-Schwarz (~#2b2822).
Vor den hellen, gemalten Hintergruenden liest sich das als ausgeschnittene
Silhouette statt als Boden. `tools/grade-platform-tilesets.ps1` hebt deshalb
die Schatten an, waermt die Erde und legt eine feine Koernung darueber; das
Gras bleibt unangetastet. Die Hoehle wird nur zu 62 % aufgehellt, sonst
verliert sie ihren Charakter.

Das Skript geht immer von einer ungefaerbten Sicherung unter `tiles/raw/` aus
und ist dadurch wiederholt ausfuehrbar. Nach einem erneuten Lauf von
`generate-platform-tilesets.ps1` muss `raw/` geloescht werden.

Ein Lichtabfall unter der Grasnarbe ist eingebaut, aber standardmaessig aus:
auf der sehr ebenen Erdflaeche erzeugt er sichtbare Streifen statt Tiefe.

### Zum Thema Teilschritte
Die Bewegung läuft in Schritten von maximal 4 px, damit dünne Plattformen bei
hohem Tempo nicht übersprungen werden. Nachgemessen: Tunneling durch die 6 px
hohen Einweg-Plattformen beginnt erst ab **26 px pro Schritt**, das Slider-Maximum
für die Fallgeschwindigkeit erzeugt **25 px**. Es war also nie ein aktiver Fehler —
der 20 px hohe Körper wirkt als Puffer. Aber 1 px Reserve ist keine, und jede
spätere Änderung an Fallgeschwindigkeit oder Charaktergröße hätte es gekippt.

## Erkenntnis
*<Nach dem Spielen ausfüllen — das ist der eigentliche Wert des Prototyps.>*

Leitfragen:
- Welches Preset kommt dem Zielgefühl am nächsten?
- Ist die Luftkontrolle zu hoch/zu niedrig?
- Braucht ein Idle-MMO überhaupt präzises Platforming, oder stört der Sprung eher?
- Wie liest sich die Szene, wenn später 5–8 Charaktere gleichzeitig darin stehen?

## Konsequenz fürs Spiel
*<Was übernehmen, was verwerfen?>*

Offene Frage, die dieser Prototyp **nicht** beantwortet: ob Side View mit
Gravitation zum Idle-Kampf und zu den Berufen passt (Doc 07, Doc 08). Ein
Charakter, der offline Holz fällt, steht nur herum — Sprungphysik ist dafür
irrelevant. Das wäre ein eigener Prototyp.
