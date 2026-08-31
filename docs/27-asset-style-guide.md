# 27. Asset Style Guide

## 27.1 Zweck und Status

Dieser Guide ist die verbindliche visuelle Arbeitsgrundlage für neue Assets von **Idlekin**. Er übersetzt die GDDs in konkrete Produktionsregeln und gilt für Charaktere, Ausrüstung, Gegner, Bosse, Welt, Ressourcen, Items, Effekte und UI.

Der Guide ist bewusst als lebendes Dokument angelegt. Bereits technisch festgelegte Werte sind als **fest** markiert. Noch nicht durch einen spielbaren Art-Test bestätigte Werte sind **vorläufig** und müssen bei einer Änderung an allen betroffenen Assets konsistent angepasst werden.

## 27.2 Visuelle Leitidee

**Idlekin ist eine freundliche, gut lesbare Side-View-Pixel-Fantasywelt, in der Tätigkeit, Rolle und Fortschritt eines Charakters auf den ersten Blick erkennbar sind.**

Die Bildsprache folgt fünf Prioritäten:

1. **Lesbarkeit vor Detail:** Silhouette, Aktivität und Interaktionszustand müssen auch in kleiner Darstellung verständlich bleiben.
2. **Locker statt düster:** Abenteuerlich und magisch, aber nicht grimdark, brutal oder realistisch-bedrohlich.
3. **Modular statt fest verbaut:** Körper, Kleidung, Ausrüstung, Waffen und Effekte müssen kombinierbar bleiben.
4. **Gameplay vor Dekoration:** Dekoration darf Gegner, Ressourcen, Portale, Drops oder Telegraphe nicht verdecken.
5. **Fortschritt wird sichtbar:** Höhere Klassen, seltenere Items und stärkere Ressourcen erhalten eine klarere Form- und Effektsprache, nicht nur höhere Zahlen.

## 27.3 Stil-DNA

- Echte, rasterbasierte Pixel-Art mit harten Kanten.
- Klare, kompakte Formen und bewusst gesetzte Pixelcluster.
- Leicht überzeichnete Proportionen und große, schnell lesbare Gesten.
- Freundliche Fantasy mit handwerklichen, natürlichen und magischen Materialien.
- Begrenzte Farben pro Asset; Kontrast wird gezielt für Fokus und Interaktion eingesetzt.
- Keine Fototexturen, kein Painterly-Look, kein 3D-Render-Look und keine weichgezeichneten Kanten.
- Kein Mikrodithering auf kleinen Gameplay-Sprites. Dithering nur sparsam auf großen Flächen, wenn es bei nativer Auflösung ruhig bleibt.
- Der finale Player-Atlas verwendet seine schwarzen Außen- und Innenkonturen unverändert. Für andere Assets sind dunkle, materialbezogene Konturen weiterhin zu bevorzugen.

## 27.4 Perspektive und Raster

### Welt

- **Fest:** 2D-Seitenansicht mit horizontaler Bewegung.
- Horizontale Oberflächen und begehbare Kanten müssen klar lesbar sein.
- Vordergrund, Gameplay-Ebene und Hintergrund werden über Kontrast und Sättigung getrennt.
- Hintergrundelemente sind kontrastärmer und detailärmer als interaktive Objekte.

### Basisraster

- **Fest:** Player-Frames sind `128 × 128 px`.
- **Fest:** Player-Anker ist `x: 64, y: 80`.
- **Fest:** Gameplay-Hitbox des Players ist `12 × 20 px` und bleibt unabhängig von sichtbarer Ausrüstung stabil.
- **Vorläufig:** Welt-Tiles verwenden ein `16 × 16 px`-Grundraster; größere Bauteile werden in `32 × 32 px`-Modulen komponiert.
- Alle Positionen, Pivots und Kontaktpunkte werden ganzzahlig gesetzt. Keine Subpixel-Skalierung im finalen Rendering.
- Darstellung nur in ganzzahligen Faktoren (`2×`, `3×`, `4×` usw.) mit Nearest-Neighbor und deaktiviertem Image Smoothing.

## 27.5 Formensprache

### Charaktere

- Kompakte, leicht chibiartige Proportionen: großer Kopf, kurzer Torso, klare Gliedmaßen.
- Side-View-Grundpose mit Blickrichtung nach rechts; links wird im Spiel gespiegelt, sofern ein Asset keine asymmetrische Spezialversion benötigt.
- Gesicht bleibt minimal. Identität entsteht primär durch Silhouette, Haare, Kopfbedeckung, Kleidung, Waffe, Effekt und Animation.
- Hände, Füße und Waffen dürfen zugunsten der Lesbarkeit leicht überzeichnet sein.
- Jede Klasse benötigt mindestens ein bereits in der Silhouette sichtbares Merkmal.

### Klassen-Silhouetten

- **Krieger/Stärke:** breite, stabile Formen; schwere Waffe; robuste Schulter-/Rüstungselemente.
- **Bogenschütze/Geschick:** schmale, gerichtete Formen; gut sichtbarer Bogen/Köcher; leichte Ausrüstung.
- **Magier/Intelligenz:** vertikale oder fließende Formen; Stab/Fokus; klar begrenzte magische Akzente.
- **Pet Master:** eigene, kleine Begleiter-Silhouette; Charakter und Pet dürfen sich optisch nicht zu einer unlesbaren Masse verbinden.
- **Berufe:** Werkzeug und Arbeitsgeste müssen die Tätigkeit stärker kommunizieren als kleine Kostümdetails.

### Gegner

- Jeder Grundtyp erhält eine einzigartige Primärsilhouette.
- Normale Varianten teilen die Formfamilie, unterscheiden sich aber über mindestens zwei Merkmale: Farbe, Fortsatz, Ausrüstung, Größe oder Effekt.
- Frühe Gegner wirken einfach und zugänglich; spätere Varianten komplexer, aber nicht durch bloßes visuelles Rauschen.
- Blickrichtung, Angriffsseite und gefährliche Körperteile müssen klar erkennbar sein.

### Bosse

- Deutlich größer als normale Gegner; Zielwert mindestens etwa `2×` deren visuelle Masse.
- Ein einzigartiger Silhouettenanker pro Boss, etwa Hornform, Waffe, Krone, Pilzkappe oder magischer Kern.
- Phasenänderungen werden durch Form, Pose, Palette oder Effekt sichtbar – nicht nur durch UI.
- Angriffe besitzen klar getrennte Vorbereitung, aktive Gefahrenphase und Abklingen.

## 27.6 Farbe, Licht und Material

### Kernpalette

Der finale Player-Atlas setzt die verbindliche Player-Basispalette. Seine Pixel werden nicht automatisch umgefärbt:

| Funktion | Referenz |
|---|---:|
| Player-Kontur | `#000000` |
| Player-Körper | `#FFFFFF` |
| Player-Schatten | `#9A9A9A` |
| sekundärer Player-Schatten | `#B6B6B6` |
| Nahkampf-Effekt | `#A6FCDB` |
| Effekt-Schatten | `#5C2C4F` |

### Farblogik

- Pro kleinem Gameplay-Asset in der Regel `3–6` Farben inklusive Outline; Effekte dürfen zusätzliche Leuchtstufen verwenden.
- Licht kommt grundsätzlich von **oben links**. Highlights liegen oben/links, Schatten unten/rechts.
- Schatten sind farbig, nicht bloß schwarz. Reines Schwarz wird nur sehr sparsam für tiefste Trennung eingesetzt.
- Interaktive Objekte sind etwas heller oder gesättigter als nicht-interaktive Umgebung.
- Hintergrundebenen verlieren mit Entfernung Sättigung, Kontrast und Detail.
- Biom-Farbe unterstützt Orientierung, darf aber Items, Charaktere und Gefahren nicht einfärben oder verschlucken.

### Materiallesbarkeit

- Holz: warme Mitteltöne, wenige gerichtete Maserungscluster.
- Metall: dunkle Grundmasse plus ein knappes, helles Kantenlicht; keine weichen Verläufe.
- Stein: blockige Brüche und breite Schattenflächen.
- Stoff/Leder: weichere Konturen, geringe Spitzlichter.
- Magie: heller Kern, gesättigter Rand und wenige klar geführte Partikel.

## 27.7 Player-Produktionsstandard

Der vom Projekt vorgegebene Atlas `assets/player/Final Player/toUse.png` definiert die verbindliche technische und visuelle Geometrie des Players. Frühere generierte Player-Versionen sind verworfen. Dieser Atlas ist für alle weiteren Player-Body- und Cosmetic-Animationen verbindlich und darf nicht durch abgeleitete Ersatzversionen ausgetauscht werden.

### Finaler Atlas

- **Fest:** Atlasgröße `1280 × 1152 px`, angeordnet als `10 × 9` Zellen.
- **Fest:** Jede Zelle ist `128 × 128 px`.
- **Fest:** Die Pixel, Farben, Posen und Alpha-Masken aus `toUse.png` werden unverändert verwendet.
- **Fest:** Waffen, Kleidung, Haare, Hüte und Accessoires werden nie in den Body eingebrannt.
- **Fest:** Fehlende Aktionen werden nicht frei erfunden. Neue Aktionen benötigen ein zur Pflichtvorlage passendes Referenz-Sheet.

| Animation | Atlas-Zellen (Spalte, Zeile) | Frames | FPS | Loop |
|---|---|---:|---:|---|
| Idle | `(0–9, 1)` | 10 | 8 | ja |
| Walk | `(0–9, 2)` | 10 | 10 | ja |
| Run | `(0–9, 3)` | 10 | 14 | ja |
| Jump | `(0–5, 4)` | 6 | 12 | nein |
| Fall | `(0–3, 5)` | 4 | 10 | nein |
| Fall-Loop | `(0–2, 6)` | 3 | 8 | ja |
| Melee | `(0–2, 7)`, danach `(0–3, 8)` | 7 | 14 | nein |

Climb, Dash, Cast und Bow sind noch nicht Teil des bestätigten Pflicht-Templates und dürfen erst ergänzt werden, wenn geometrisch passende Referenz-Sheets vorliegen.

### Layer-Reihenfolge

`body → clothing → pants → hair → hat → accessory → weapon → effect`

Jeder Layer muss:

- für dieselbe Animation exakt dieselbe Canvasgröße, Zellgröße, Framebelegung und Framezahl verwenden,
- am identischen Anchor ausgerichtet sein,
- in leeren Frames vollständig transparent bleiben,
- alle Pixel innerhalb seiner Zelle halten,
- ohne Änderung der Gameplay-Hitbox funktionieren.

### Animation

- Eine Aktion muss bereits als Silhouette verständlich sein.
- Idle bewegt nur wenig: Atmung, Gewichtsverlagerung oder ein kleiner Ausrüstungsimpuls.
- Walk braucht klare Kontakt-, Passier- und Gegenkontaktphasen.
- Angriffe brauchen Antizipation, Trefferpose und Erholung.
- Sammelanimationen zeigen einen eindeutigen Kontakt zwischen Werkzeug und Ressource.
- Sekundärbewegung bleibt klein und darf den Körper-Anchor nicht sichtbar schwimmen lassen.
- Rechts ist die Produktionsrichtung. Beim Spiegeln müssen asymmetrische Schriftzeichen, Schilde, Scheiden oder Handlogik separat geprüft werden.

## 27.8 Welt und Biome

Jedes Gebiet erhält eine eigene Kombination aus Silhouette, Palette, Material und atmosphärischem Akzent.

| Gebietsfamilie | Form | Palette | Atmosphäre |
|---|---|---|---|
| Wiese | offene, runde Formen | helle Grün-, Gelb- und Himmeltöne | freundlich, weit, ruhig |
| Wald | vertikale Stämme, dichte Kronen | mittlere Grün- und warme Brauntöne | lebendig, geschützt |
| Dunkler/Tiefer Wald | engere Silhouetten | kühlere, dunklere Grün- und Blautöne | geheimnisvoll, nicht Horror |
| Mine/Höhle | kantige Felsen, klare Erzadern | gedämpfte Grau-, Braun- und Blautöne | kompakt, handwerklich |
| Sumpf | flache organische Formen | oliv, türkis, violette Akzente | fremdartig, aber lesbar |
| Berge | große diagonale Flächen | kühle Grau- und Himmelstöne | rau, offen |
| Ruinen | gebrochene Architektur | entsättigter Stein plus Biom-Akzent | alt, abenteuerlich |
| Magisches Gebiet | wiederholte Runen-/Kristallform | dunklere Basis plus gesättigte Leuchtfarbe | wundersam, energiereich |

Für jedes neue Biom werden vor Einzelassets zuerst festgelegt: Bodenfamilie, Hintergrundtiefe, drei Hauptmaterialien, Interaktions-Akzentfarbe und Portalvariante.

### Verbindliche Plattformreferenz

Für Plattformen ist `assets/referenz (MUSS)/platforms/GandalfHardcore FREE Platformer Assets/` die verbindliche visuelle Quelle. Besonders maßgeblich sind `Floor Tiles1.png`, `Floor Tiles2.png`, `Other Tiles1.png` und `Other Tiles2.png`.

- Der Plattformkörper bleibt überwiegend dunkel, ruhig und nahezu flächig.
- Detail sitzt an Laufkante, Außenkontur und wenigen einzelnen Akzentstellen.
- Gras und Moos bilden eine dünne, fein gepixelte Lippe; keine dicke Hecke.
- Keine vollflächigen Geröll-, Pflaster-, Ziegel- oder Bouldertexturen.
- Biomvarianten verändern Palette und Randmaterial, nicht die grundlegende Detaildichte.
- Wiederholende Mitteltiles besitzen keine sichtbaren Seitenrahmen; gestaltete Seitenkanten erscheinen nur an Plattformenden.

## 27.9 Ressourcen, Stationen und Drops

- Eine Sammelstelle muss ohne UI als Baum, Erzader, Angelstelle, Feld oder Werkbank erkennbar sein.
- Permanenten Sammelstellen wird keine endgültig zerstörte Endpose gegeben; Trefferfeedback darf vorübergehend sein.
- Höhere Ressourcenstufen behalten die Grundform der Familie und erhalten sichtbare Material-/Farbmerkmale.
- Werkzeuge zeigen klar zur Kontaktstelle.
- Weltdrops besitzen eine kompakte Silhouette, einen kleinen Bodenschatten und bei hoher Seltenheit einen zurückhaltenden Akzent.
- Viele Drops nebeneinander müssen unterscheidbar bleiben und dürfen die Figur nicht vollständig verdecken.

## 27.10 Items, Ausrüstung und Seltenheit

### Icons

- **Vorläufig:** Standard-Iconfläche `32 × 32 px`; Motiv mit mindestens `2 px` Innenabstand.
- Ein Icon zeigt genau ein Hauptmotiv, möglichst in leichter Dreiviertelansicht.
- Transparenter Hintergrund; Rahmen und Seltenheitsfarbe werden von der UI ergänzt und nicht in das Motiv eingebrannt.
- Kleine Icons nutzen starke Form- und Hell-Dunkel-Trennung statt feiner Textur.

### Seltenheit

Seltenheit darf nie ausschließlich über Farbe kommuniziert werden. Zusätzlich werden Rahmenform, Funkelakzent oder ein kleines Eckzeichen verwendet.

| Stufe | Akzent-Richtung |
|---|---|
| Gewöhnlich | neutral/grau |
| Ungewöhnlich | grün |
| Selten | blau |
| Episch | violett |
| Legendär | warmes Gold/Orange |

Die endgültigen UI-Farben werden nach einem Kontrast- und Farbenblindheits-Test festgeschrieben.

## 27.11 Magie, Treffer und Telegraphe

- Effekte unterstützen eine Aktion und verdecken sie nicht dauerhaft.
- Ein Effekt besitzt einen hellsten Fokuspunkt und eine klar geführte Bewegungsrichtung.
- Partikelanzahl bleibt gering; wenige große Pixelcluster sind besser als gleichmäßiges Rauschen.
- Gefahrenflächen müssen sich in Helligkeit, Form und Rhythmus deutlich vom Biom unterscheiden.
- Boss-Telegraphen bleiben auch im Split-Screen und bei mehreren Charakteren lesbar.
- Trefferfeedback ist kurz und präzise: Kontaktblitz, wenige Partikel, optional kleiner Rückstoß.
- Dauerhafte Auren sind schwächer als aktive Angriffe.

## 27.12 Portale und Interaktionszustände

- Portale erhalten eine charakteristische, wiedererkennbare Rahmenform.
- **Gesperrt:** ruhiger, dunkler, unterbrochener Energiefluss; kein Eindruck einer aktiven Passage.
- **Freigeschaltet:** klarer Innenraum, zyklische Energiebewegung, heller Fokus.
- Interaktionsbereit: zusätzlicher kurzer Puls oder UI-Prompt, keine dauerhafte Vollbildhelligkeit.
- Portal-Animation und darüberliegende Challenge-UI müssen getrennt lesbar bleiben.

## 27.13 UI-Sprache

- Die Welt bleibt visuell dominant; UI-Flächen sind kompakt und funktional.
- Dunkle, leicht warme oder violett-neutrale Panels mit klaren hellen Textwerten passen zur vorhandenen Prototyp-Richtung.
- Einfache Pixelrahmen, wenige Zierstufen, konsistente Ecken und Abstände.
- Pixel-Schrift nur, wenn Umlaute, Zahlen und längere deutsche Texte bei Zielgröße sauber lesbar bleiben; sonst eine gut lesbare bitmap-nahe Schrift.
- Text wird nicht als Pixelbild generiert, sondern im Client gerendert.
- Icons ergänzen Beschriftung, ersetzen kritische Informationen aber nicht.
- Zustände nutzen mindestens zwei Signale, etwa Farbe plus Form, Icon oder Bewegung.
- Boss-, Quest-, Portal- und Inventar-UI müssen auch in einem Viertel des Bildschirms funktionieren.

## 27.14 Technische Dateiregeln

- Produktionsformat für Rasterassets: `PNG` mit echter Alpha-Transparenz.
- Keine halbtransparenten oder geglätteten Randpixel an normalen Sprites; Teiltransparenz nur für bewusst gestaltete Effekte.
- Farbraum: sRGB.
- Dateinamen: klein, englisch, kebab-case und rollenbasiert, zum Beispiel `slime-green-idle.png` oder `tree-magic-tier-03.png`. Der vorgegebene Pfad `assets/player/Final Player/toUse.png` ist die verbindliche Ausnahme.
- Keine Leerzeichen, Umlaute oder Versionswörter wie `final-final`.
- Vorschauen werden getrennt von nativen Produktionsassets gespeichert.
- Vorschauen dürfen vergrößert sein; das Spiel lädt ausschließlich die native Pixelauflösung.
- Ein Atlas erhält eine gleichnamige Metadatendatei, sobald Framebelegung, Anchor oder Layer nicht bereits global eindeutig definiert sind.

Empfohlene Struktur:

```text
assets/
├── player/
│   ├── concepts/
│   └── production/
├── enemies/<family>/
├── bosses/<boss-id>/
├── world/<biome>/
│   ├── tiles/
│   ├── props/
│   └── backgrounds/
├── resources/<profession>/
├── items/<category>/
├── effects/<ability-or-family>/
└── ui/<system>/
```

## 27.15 Produktionsworkflow für neue Assets

1. Assettyp, Gameplayfunktion, native Größe, Zustände und Animationen festlegen.
2. Passende bestehende Assets als Geometrie-, Stil- oder Palettenreferenz benennen.
3. Zuerst Silhouette und Wertkontrast bei nativer Größe prüfen.
4. Farben und Materialdetails innerhalb der Assetpalette ausarbeiten.
5. Animation/Layers auf Anchor, Zellen und Kontaktpunkte ausrichten.
6. In einer hellen und einer dunklen Testszene sowie bei `1×` und ganzzahlig vergrößert prüfen.
7. Falls relevant, mit zwei bis vier Charakteren, Gegnern und Effekten gleichzeitig testen.
8. Produktionsdatei und Metadaten im vorgesehenen Assetordner speichern.

Für KI-generierte Rasterbilder gilt zusätzlich:

- Generierung dient zuerst als Konzept-, Form- oder Materialentwurf.
- Ein generiertes Bild wird nicht ungeprüft als Sprite, Atlas oder Tile übernommen.
- Produktionsassets werden auf exaktes Raster, harte Pixelkanten, Palette, Alpha, Seamlessness, Anchor und Framekonsistenz bereinigt.
- Unterschiedliche Assets werden separat spezifiziert; Varianten eines Motivs dürfen aus einer gemeinsamen Referenz abgeleitet werden.
- Bei Edits werden unveränderliche Merkmale ausdrücklich genannt: Geometrie, Pose, Palette, Anchor, Layer und Hintergrundtransparenz.

## 27.16 Abnahmecheckliste

Ein Asset ist erst produktionsbereit, wenn alle zutreffenden Punkte erfüllt sind:

- [ ] Rolle und Aktivität sind bei nativer Größe erkennbar.
- [ ] Silhouette bleibt vor hellem und dunklem Hintergrund lesbar.
- [ ] Perspektive und Lichtrichtung stimmen mit diesem Guide überein.
- [ ] Pixelkanten sind hart; es gibt keine unbeabsichtigten Halbtransparenzen.
- [ ] Palette ist begrenzt und der Kontrast hat einen klaren Fokus.
- [ ] Größe, Zellen, Anchor und Kontaktpunkte stimmen.
- [ ] Animationsframes bleiben innerhalb ihrer Zellen.
- [ ] Modularer Inhalt ist im richtigen Layer und nicht fest eingebrannt.
- [ ] Wiederholende Tiles sind nahtlos und ohne auffällige Musterbildung.
- [ ] Seltenheit oder Zustand wird nicht nur über Farbe vermittelt.
- [ ] Effekt oder Dekoration verdeckt keine wichtige Gameplayinformation.
- [ ] Asset funktioniert in Split-Screen-Größe.
- [ ] Dateiname, Ordner und Metadaten entsprechen den Konventionen.
- [ ] Keine Schrift, Logos, Wasserzeichen oder unbeabsichtigten Fremdelemente.

## 27.17 Klare Negativliste

Nicht passend für Idlekin sind:

- realistische Anatomie oder düstere Grimdark-Ästhetik,
- weich gemalte oder anti-aliased „Pixel-Art“,
- extrem kleinteilige Texturen ohne Nutzen für die Lesbarkeit,
- austauschbare Gegner, die sich nur durch Farbtausch unterscheiden,
- übergroße Effekte, die Figuren, Drops oder Telegraphe dauerhaft verdecken,
- fest in Charakterkörper eingebaute Waffen, Kleidung oder Zaubereffekte,
- nicht-ganzzahlige Skalierung und unterschiedliche Frame-Geometrien,
- in Bildassets eingebrannter UI-Text,
- reine Farbkommunikation für kritische Zustände,
- unkontrollierte hochauflösende KI-Ausgaben als angebliche Produktionssprites.

## 27.18 Referenzhierarchie

Bei widersprüchlichen Vorgaben gilt folgende Reihenfolge:

1. technische Laufzeitvorgaben und Atlas-Metadaten,
2. ausdrücklich als `MUSS` markierte Referenzassets für die jeweilige Assetfamilie,
3. dieser Asset Style Guide,
4. GDD 22 (UI) und GDD 23 (Pixel-Art-Richtung),
5. Gameplayanforderungen der übrigen GDDs,
6. vorhandene Konzeptbilder.

Für den Player definiert ausschließlich `assets/player/Final Player/toUse.png` die verbindliche Ingame-Geometrie, Farbe und Animation. Frühere Konzepte oder generierte Player-Versionen dürfen nicht mehr als Produktionsreferenz verwendet werden.
