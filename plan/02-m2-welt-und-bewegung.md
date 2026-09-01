# M2 — Spielwelt und Bewegung

**Ziel:** Eine Figur läuft sichtbar durch ein Gebiet in Seitenansicht, kollidiert mit
der Welt und wechselt durch ein Portal in ein zweites Gebiet.

**Aufwand:** 6–8 Tage
**Vorbedingungen:** M1
**GDD-Bezug:** `docs/12-welt.md`, `docs/13-gebiete.md`, `docs/23-pixel-art-richtung.md`,
`docs/25` §25.11, §25.14, §25.15, `docs/27` §27.4, `docs/26` Phase 2

**Vorarbeit:** `prototypes/01-side-view-movement` hat Bewegungsgefühl, Kollision, Kamera
und Tileset-Rendering bereits beantwortet. Die dort gefundenen **Werte** werden
übernommen, der **Code nicht** — `prototypes/README.md` Regel 4.

---

## Was aus dem Prototyp übernommen wird

| Erkenntnis | Übernahme |
|---|---|
| Fester Zeitschritt 1/60 s plus Renderinterpolation | verbindlich |
| AABB-Kollision, X und Y getrennt, Teilschritte max. 4 px | verbindlich |
| Asymmetrische Gravitation, Sprungkappung beim Loslassen | verbindlich |
| Apex-Modifikator, Coyote Time, Sprungpuffer, Eckenkorrektur | verbindlich |
| Kamera mit exponentieller Glättung, an Gebietsgrenzen geklemmt | verbindlich |
| Einweg-Plattformen | verbindlich |
| Gewähltes Tuning-Preset | **offen** — siehe [99-offene-entscheidungen.md](99-offene-entscheidungen.md) |
| Weltbreite 1680 px als Richtwert für ein Gebiet | Ausgangswert |

Bevor S-2.3 beginnt, wird im Prototyp **ein** Preset festgelegt und die 21 Parameter
werden als Zahlenwerte in `packages/shared/src/sim/movementConstants.ts` überführt. Der
Prototyp bleibt danach als Vergleichsmaßstab bestehen und wird nicht gelöscht.

---

## Abweichung vom GDD-Plan

`docs/26` Phase 2 nennt Rendering, Tiles, Map, Kamera, Sprite, Bewegung, Kollision,
Portale in einem Zug. Hier wird zusätzlich festgelegt, dass **die Bewegungssimulation in
`shared` liegt und der Server sie mitrechnet** — nicht erst in Phase 6. Grund: `docs/24`
§24.7. Ein Client, der seine Position frei bestimmt, kann in jedes gesperrte Gebiet
laufen. Das nachträglich zu ändern hieße, Bewegung zweimal zu schreiben.

---

## Schritte

### S-2.1 Gebietsformat und Tilemap

**Was:** Datenformat für ein Gebiet, inklusive Kollision, Hintergrundebenen,
Einstiegspunkten und Objekten.

**Dateien:**

- `packages/shared/src/types/area.ts`
- `packages/shared/src/content/areaSchema.ts`
- `content/areas/dorf.json`, `content/areas/wiese.json`

**Details:**

```jsonc
{
  "id": "area.dorf",
  "name": "Dorf",
  "size": { "width": 1680, "height": 480 },
  "tileSize": 16,                      // docs/27 §27.4, vorläufig
  "layers": [
    { "kind": "background", "image": "bg/dorf_fern.png",  "parallax": 0.25 },
    { "kind": "background", "image": "bg/dorf_nah.png",   "parallax": 0.6  },
    { "kind": "tiles",      "tileset": "ts/dorf",         "data": "..." },
    { "kind": "foreground", "image": "bg/dorf_vorn.png",  "parallax": 1.15 }
  ],
  "collision": { "solids": [ /* Rechtecke */ ], "platforms": [ /* Einweg */ ] },
  "spawns":   [ { "id": "spawn.default", "x": 96, "y": 320 } ],
  "portals":  [ /* siehe S-2.6 */ ],
  "nodes":    [ /* Ressourcenpunkte, ab M5 gefüllt */ ],
  "enemies":  [ /* ab M6 gefüllt */ ]
}
```

**Kollision als Rechteckliste, nicht aus Tiles abgeleitet.** Ein Gebiet hat
größenordnungsmäßig 50 Kollisionsrechtecke statt 3000 Tiles. Die Simulation wird
dadurch schneller und — wichtiger — unabhängig davon, wie die Grafik gebaut ist. Tiles
sind Darstellung, Kollision ist Regel. `docs/24` §24.13 verlangt genau diese Trennung.

**Fertig wenn:** Zwei Gebiete sind als JSON beschrieben, werden validiert geladen, und
ein Test prüft, dass sich Kollisionsrechtecke innerhalb der Gebietsgrenzen befinden und
alle `spawns` außerhalb von Kollision liegen.

---

### S-2.2 Renderer

**Was:** Canvas-2D-Renderer mit Ganzzahlskalierung, Ebenen, Kamera und Sprite-Zeichnung.

**Dateien:**

- `packages/client/src/render/renderer.ts`
- `packages/client/src/render/camera.ts`
- `packages/client/src/render/atlas.ts`
- `packages/client/src/render/layers.ts`

**Details:**

- Interner Puffer in **Weltauflösung** (Richtwert 480 × 270), skaliert auf die
  Fenstergröße mit **ganzzahligem Faktor**, `imageSmoothingEnabled = false`.
  `docs/27` §27.4 nennt das als feste Regel.
- Bei nicht ganzzahlig passender Fenstergröße wird der nächstkleinere Faktor gewählt und
  der Rest als Rand gelassen. **Kein** krummer Skalierungsfaktor — er zerstört Pixelart
  sichtbar.
- Zeichenreihenfolge: Hintergründe (nach Parallaxe) → Tiles → Weltobjekte nach `y`
  sortiert → Vordergrund → Effekte → Weltbeschriftungen.
- Der Atlas-Lader kennt das Format aus `docs/27` §27.7 (Player: 1280 × 1152, 10 × 9
  Zellen, Frames 128 × 128, Anker x 64 / y 80). Das ist **fest** und wird nicht
  nachgerechnet, sondern als Konstante hinterlegt.
- **Sprite-Anker sind ganzzahlig.** Die Renderposition wird vor dem Zeichnen gerundet,
  nicht die Simulationsposition — sonst driftet die Physik.

**Fertig wenn:** Ein Gebiet wird mit Hintergrundparallaxe und Tiles gezeichnet, ein
Testsprite steht pixelgenau, und die Fenstergröße lässt sich verändern, ohne dass Pixel
verwaschen.

**Test:** manuell plus ein Screenshot-Vergleich im Debug-Werkzeug (analog zu
`tools/debug-tileset.ps1`).

---

### S-2.3 Bewegungssimulation in `shared`

**Was:** Die Bewegungslogik als reine Funktion, ohne DOM, ohne Canvas, ohne Netzwerk.

**Dateien:**

- `packages/shared/src/sim/movement.ts`
- `packages/shared/src/sim/collision.ts`
- `packages/shared/src/sim/movementConstants.ts`

**Details:**

Die zentrale Funktion ist bewusst zustandslos:

```ts
function stepMovement(
  state: MovementState,     // Position, Geschwindigkeit, Bodenkontakt, Zeitgeber
  input: MovementInput,     // links, rechts, springen, herunterfallen
  area: AreaCollision,
  constants: MovementConstants,
): MovementState
```

**Warum zustandslos:** Der Client ruft sie zur Vorhersage auf, der Server zur
Verifikation, und ein Test ruft sie tausendmal mit aufgezeichneten Eingaben auf. Alle
drei müssen dasselbe Ergebnis bekommen. Verstecktes Objektinneres macht das unmöglich.

Kollision nach Prototyp: X und Y getrennt auflösen, Bewegung in Teilschritten von
maximal 4 px, damit bei hoher Geschwindigkeit nichts durchtunnelt.

Einweg-Plattformen: Kollision nur, wenn die vertikale Geschwindigkeit nach unten zeigt
**und** die Unterkante der Figur im vorherigen Schritt oberhalb der Plattform war.

**Fertig wenn:** Der Testparcours aus `prototypes/01-side-view-movement/NOTES.md`
(Höhenlineal, Lücken 40/60/80/100 px, Treppe 32 px, Einweg-Plattformen, Überhang,
Wand 60 px) verhält sich in der neuen Implementierung identisch zum Prototyp — geprüft
als automatischer Test mit aufgezeichneten Eingabefolgen, nicht nach Gefühl.

**Risiko:** Genau hier entstehen Abweichungen zwischen Client- und Servervorhersage.
Deshalb ein Test, der 600 Ticks Eingabe abspielt und die Endposition auf das Pixel genau
vergleicht.

---

### S-2.4 Eingabe, Vorhersage und Abgleich

**Was:** Der Client sagt Bewegung sofort voraus, der Server bestätigt, Abweichungen
werden weich korrigiert.

**Dateien:**

- `packages/client/src/net/prediction.ts`
- `packages/client/src/input/keyboard.ts`
- `packages/server/src/systems/movementSystem.ts`

**Details:**

1. Der Client nummeriert jede Eingabe (`sequence`) und schickt sie mit.
2. Er wendet sie sofort lokal an und legt sie in einen Puffer.
3. Der Server rechnet mit derselben Funktion und antwortet mit
   `{ t: 'moveAck', sequence, x, y, vx, vy }`.
4. Der Client verwirft alle Eingaben bis `sequence`, setzt auf den Serverzustand und
   spielt die verbleibenden Eingaben erneut ab.
5. Liegt die Abweichung unter 2 px, wird **nicht** zurückgesetzt, sondern über 200 ms
   angeglichen. Sonst zuckt die Figur bei jedem Paket.

**Eingabebelegung** nach `docs/06` §6.4: A/D oder Pfeiltasten laufen, Leertaste springt,
S fällt durch Einweg-Plattformen. Maustasten sind ab M6 für Angriffe reserviert und
werden hier noch nicht belegt.

**Fertig wenn:** Bei 150 ms künstlicher Verzögerung fühlt sich Bewegung unverändert an,
und bei absichtlich manipulierter Clientposition zieht der Server die Figur binnen eines
Ticks zurück.

**Test:** Server mit künstlicher Verzögerung und Paketverlust (`IDLEKIN_NET_LAG`,
`IDLEKIN_NET_LOSS`) — dieselben Schalter werden in M10 wieder gebraucht.

---

### S-2.5 Kamera

**Was:** Kamera folgt der Figur, geglättet, an Gebietsgrenzen geklemmt.

**Dateien:** `packages/client/src/render/camera.ts`

**Details:** Exponentielle Glättung, **keine Vorausschau** — der Prototyp hat gezeigt,
dass Vorausschau bei häufigem Richtungswechsel unruhig wirkt. Klemmung an
Gebietsgrenzen. Ist ein Gebiet schmaler als der Bildausschnitt, wird zentriert.

Für M10 vorbereitet: Die Kamera ist ein Objekt pro **Ansichtsfenster**, nicht global.
Das kostet jetzt fünf Minuten und spart in M10 einen Umbau.

**Fertig wenn:** Kamera folgt weich, zeigt nie über den Gebietsrand hinaus, und vier
Kamerainstanzen können ohne Zustandsvermischung gleichzeitig existieren.

---

### S-2.6 Portale und Gebietswechsel

**Was:** Portale als Weltobjekte, Wechsel serverseitig, mit Voraussetzungsprüfung.

**Dateien:**

- `packages/shared/src/types/portal.ts`
- `packages/server/src/systems/areaSystem.ts`
- `packages/client/src/scenes/areaTransition.ts`

**Details:**

Datensatz nach `docs/25` §25.15:

```jsonc
{
  "id": "portal.dorf.wiese",
  "targetArea": "area.wiese",
  "targetSpawn": "spawn.vomDorf",
  "position": { "x": 1580, "y": 300 },
  "requirement": null                  // ab M9: Herausforderung
}
```

Ablauf: Client meldet `enterPortal`, Server prüft Nähe (maximal 32 px), prüft
Voraussetzung, setzt `areaId` und Position, antwortet mit dem neuen Gebiets-Snapshot.
Der Client blendet über.

**Die Prüfung liegt beim Server**, obwohl in M2 noch keine Voraussetzung existiert. Der
Aufhängepunkt wird trotzdem jetzt gebaut, damit M9 nur den Regelteil ergänzt und nicht
den Ablauf umbaut.

**Vorschau auf M9:** Über gesperrten Portalen wird der Fortschritt der Herausforderung
angezeigt (`docs/13` §13.4, `docs/22` §22.13). In M2 entsteht dafür bereits der
Ankerpunkt für eine Weltbeschriftung über dem Portal.

**Fertig wenn:** Die Figur läuft ins Portal, landet im zweiten Gebiet am richtigen
Einstiegspunkt, und ein manipulierter Client kann kein Portal aus 500 px Entfernung
auslösen.

---

### S-2.7 Platzhaltergrafik

**Was:** Genug Bild, um Bewegung zu beurteilen. Nicht mehr.

**Dateien:** `packages/client/public/placeholder/*`

**Details:** Der vorhandene Player-Atlas `assets/player/Final Player/toUse.png` wird
verwendet — er ist laut `docs/27` §27.7 **fest** und bereits produktionsreif. Für Welt
und Objekte reichen einfarbige Rechtecke mit Beschriftung.

**Ausdrücklich nicht:** Zeit in hübsche Zwischenassets stecken. Die richtigen entstehen
in M12 nach `docs/27` und [92-asset-pipeline.md](92-asset-pipeline.md).

**Fertig wenn:** Laufen, Stehen und Springen sind an der Figur erkennbar unterscheidbar.

---

## Ergebnis

Der Spieler öffnet die Seite, sieht eine Figur in einem Gebiet, läuft und springt mit
dem Gefühl aus dem Prototyp, und wechselt durch ein Portal ins zweite Gebiet. Position
und Gebiet überleben das Neuladen der Seite.

## Nicht in diesem Meilenstein

- Mehrere Charaktere (M3)
- Gegner, Kampf (M6)
- Ressourcenpunkte (M5)
- Andere Spieler (M10)
- Endgültige Grafik (M12)
