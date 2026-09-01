# 28. Verbindliche Player-Animationsvorgabe

## 28.1 Pflichtreferenz

`assets/player/Final Player/toUse.png` ist die unveränderliche Quelle für alle Player-Animationen.

- Die Datei wird niemals überschrieben, neu interpretiert oder durch eine generierte Variante ersetzt.
- Neue Aktionen werden als separate Sheets angelegt.
- Identität, Anatomie, Silhouette, Pixelmaßstab, Palette, Outline, Blickrichtung, Anchor und Bodenlinie werden 1:1 aus `toUse.png` übernommen.
- Eine ähnliche Figur oder ein nur stilistisch passender Charakter ist nicht zulässig.

## 28.2 Verbindliche Geometrie

- Atlaszelle: `128 × 128 px`.
- Player-Grundfigur: maximal `32 px` hoch.
- Player-Grundfigur: im Durchschnitt etwa `20 px` breit.
- Breitere Posen sind nur erlaubt, wenn die Aktion sie erfordert, zum Beispiel Bogenschuss, große Waffe oder Effekt.
- Verbindliche Player-Bodenlinie innerhalb jeder Zelle: `y = 79`.
- Verbindliches horizontales Zentrum innerhalb jeder Zelle: `x = 64`.
- Der erste Idle-Frame belegt exakt die Bounding Box `x = 53–72`, `y = 48–79` und ist `20 × 32 px` groß.
- Anchor, Hitbox und Bodenlinie dürfen durch eine Animation nicht sichtbar springen.

## 28.3 Technische Bildregeln

- Ausgabeformat: echtes RGBA-PNG mit transparentem Hintergrund.
- Keine gemalte Schachbrettfläche, Hintergrundfarbe oder weiße Matte.
- Harte Pixelkanten ohne Antialiasing, Skalierungsunschärfe, Subpixel oder weiche Transparenz an normalen Body-Pixeln.
- Unbenutzte Atlaszellen sind vollständig transparent.
- Jede Pose bleibt innerhalb ihrer `128 × 128 px` großen Zelle.
- Neue Sheets verwenden dieselbe Blickrichtung nach rechts; links wird im Spiel gespiegelt.

## 28.4 Verbindliche Layer

Neue Player-Animationen werden in dieser Reihenfolge aufgebaut:

`weapon_back → body → clothing → pants → hair → hat → accessory → weapon_front → effect`

- Der Body enthält keine fest eingebauten Schilde, Waffen, Werkzeuge, Kleidung oder Effekte.
- `weapon_back` liegt unter dem Body und trägt Rückenscheide, Köcher, Stabende und die abgewandte Hälfte zweihändiger Waffen. `weapon_front` liegt darüber und trägt Klinge, Griff und die zugewandte Hand.
- Ausrüstung bekleidet nur den zugewandten Arm; der abgewandte Arm bleibt in Body-Farbe.
- Jeder Layer verwendet dieselben Zellen, Frames, Anchors und Kontaktpunkte.
- Beim Faustblock sind die geschlossenen Fäuste Teil der Body-Pose; optionale Handschuhe und Blockeffekte bleiben eigene Layer. Ein späterer Schildblock erhält einen separaten Schild-Layer.

## 28.5 Zustände und Übergänge

Eine länger laufende Aktion wird grundsätzlich in Einstieg, Loop und Ausstieg getrennt:

`idle → <action>_start → <action>_loop → <action>_end → idle`

- Frame 1 von `<action>_start` entspricht der passenden Ausgangspose, normalerweise dem verbindlichen Idle-Frame.
- Der letzte Frame von `<action>_start` entspricht dem ersten Frame des Loops.
- Der letzte Frame von `<action>_end` entspricht pixelgenau dem Zielzustand, normalerweise Idle.
- Ein Loop wird regulär nur an einem festgelegten Zyklusende verlassen.
- `hurt` und `death` dürfen Aktionen sofort unterbrechen.
- Nach beweglichen Aktionen entscheidet die Eingabe zwischen Idle, Walk und Run; es wird nicht zwangsläufig immer Idle gewählt.

## 28.6 Block-Animationspaket

Das Blocken besteht aus vier getrennten Clips auf einem separaten Body-Sheet:

| Clip | Frames | FPS | Loop | Ablauf | Folgezustand |
|---|---:|---:|---|---|---|
| `block_start` | 5 | 12 | nein | exaktes Idle → Stand verbreitern → Knie senken → beide Fäuste vor Gesicht und Oberkörper heben → stabile Faustdeckung | `block_hold` |
| `block_hold` | 4 | 6 | ja | beide Fäuste geschlossen oben halten; sehr kleine Spannungs-/Atembewegung; Füße und Anchor bleiben fest | `block_hit` oder `block_end` |
| `block_hit` | 4 | 14 | nein | Faustdeckung → Unterarme zum Gesicht komprimieren → kurzer Rückstoß im Oberkörper → exakt zurück in Faustdeckung | `block_hold` |
| `block_end` | 5 | 12 | nein | Faustdeckung → Fäuste kontrolliert senken → Knie und Stand entspannen → pixelgenaues Idle | `idle` |

Zusätzliche Regeln:

- Die Füße bleiben bei `block_hold` und `block_hit` auf derselben Bodenlinie.
- Der Rückstoß kommt hauptsächlich aus Unterarmen, Schultern und Oberkörper, nicht aus einem Verschieben der ganzen Figur.
- Beide Hände sind als geschlossene Fäuste lesbar. Die vordere Faust schützt den Oberkörper, die hintere Faust liegt näher am Gesicht; die Pose darf nicht wie ein Angriff oder Schildgriff wirken.
- Ein gebrochener Block wechselt von `block_hit` zu `hurt` oder `death`; ein erfolgreicher Block kehrt zu `block_hold` zurück.

## 28.7 Abnahme vor Verwendung

Ein neues Player-Sheet wird erst als Produktionsasset verwendet, wenn alle Punkte erfüllt sind:

- [ ] `toUse.png` blieb unverändert.
- [ ] Figur und Einzelpixel entsprechen dem verbindlichen Player statt nur einem ähnlichen Design.
- [ ] Grundfigur ist maximal `32 px` hoch und etwa `20 px` breit.
- [ ] Bodenlinie ist in allen bodengebundenen Frames `y = 79`.
- [ ] Canvas und Zellen besitzen die vorgeschriebenen Abmessungen.
- [ ] PNG besitzt echte Transparenz.
- [ ] Keine Antialiasing- oder Skalierungsartefakte.
- [ ] Start-, Loop- und Endpose schließen ohne sichtbaren Sprung aneinander an.
- [ ] Start aus Idle und Rückkehr zu Idle sind vollständig enthalten.
- [ ] Body, Schild/Waffe und Effekte sind getrennte Layer.
- [ ] Kontakt-, Treffer- und Releaseframes sind in den Animationsdaten markiert.
- [ ] Das Sheet wurde im Prototyp bei nativer Pixelgröße und im vorgesehenen Rendering-Maßstab visuell geprüft.

Generierte Entwürfe, die diese Prüfung nicht bestehen, bleiben Referenzkonzepte und werden nicht unter `assets/player/` als Produktionsanimation gespeichert.
