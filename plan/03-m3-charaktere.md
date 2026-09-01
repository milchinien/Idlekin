# M3 — Charakter-System und Charakterwechsel

**Ziel:** Der Spieler besitzt mehrere Charaktere, wechselt zwischen ihnen, und jeder
bleibt an seinem Ort in seinem Gebiet.

**Aufwand:** 4–5 Tage
**Vorbedingungen:** M2
**GDD-Bezug:** `docs/03-charakter-system.md`, `docs/25` §25.3, §25.11, §25.25,
`docs/22` §22.3, §22.5, `docs/26` Phase 3 und Phase 4 (teilweise)

**Kernaussage des GDD, die hier technisch wahr wird:** `docs/03` §3.7 — beim Wechsel
bleibt der vorherige Charakter an seinem Ort und setzt seine Aktivität fort. Das ist
laut `docs/01` §1.10 das Alleinstellungsmerkmal des Spiels.

---

## Abweichung vom GDD-Plan

`docs/26` teilt in Phase 3 (Charakter-System) und Phase 4 (mehrere gleichzeitig, inkl.
Split-Screen-Vorbereitung). Hier werden Phase 3 und der **Datenanteil** von Phase 4
zusammengelegt, weil ein einzelner Charakter kein sinnvoller Zwischenstand ist — die
Trennung zwischen „ein Charakter" und „mehrere Charaktere" verläuft im Datenmodell, und
das zweimal anzufassen ist verschwendete Arbeit.

Der **Steueranteil** von Phase 4 (Split-Screen) wandert nach M10. Begründung: Split-Screen
braucht mehrere Kameras, mehrere Eingabezuordnungen und mehrere UI-Sätze. Ohne Kampf und
ohne Bosse ist das nicht beurteilbar und nicht testbar (`docs/02` §2.6 nennt Bosskämpfe
als Hauptzweck).

---

## Schritte

### S-3.1 Charakterdatensatz vervollständigen

**Was:** Migration, die `characters` um alles ergänzt, was `docs/25` §25.3 nennt und in
M3 tatsächlich benötigt wird.

**Dateien:**

- `packages/server/migrations/0001_characters.sql`
- `packages/server/src/db/schema.ts`
- `packages/shared/src/types/character.ts`

**Details:**

Neue Spalten:

| Spalte | Typ | Bemerkung |
|---|---|---|
| `slotIndex` | INTEGER | Position in der Charakterleiste, 0-basiert |
| `appearance` | TEXT (JSON) | Aussehen, in M12 mit Inhalt gefüllt |
| `activityJson` | TEXT (JSON) | aktuelle Aktivität, ab M5 genutzt |
| `createdAt`, `lastActiveAt` | INTEGER | Zeitstempel in ms |

Noch **nicht** angelegt: Attribute, Skills, Klasse, Inventar, Ausrüstung. Die kommen in
M4, M5 und M7 mit ihren eigenen Migrationen, wenn ihre Form feststeht.

Die Struktur `Activity` folgt `docs/25` §25.12 und ist ab jetzt vorhanden, auch wenn sie
in M3 nur den Wert `idle` annehmen kann:

```ts
type Activity =
  | { type: 'none' }
  | { type: 'combat';   targetAreaId: AreaId }
  | { type: 'gather';   nodeId: NodeId }
  | { type: 'crafting'; recipeId: RecipeId; startedAt: number };
```

**Fertig wenn:** Migration läuft vorwärts, Bestandsdaten aus M1 bleiben erhalten.

---

### S-3.2 Charaktergrenzen und Erstellung

**Was:** Charaktere anlegen, benennen, löschen. Grenzen durchsetzen.

**Dateien:**

- `packages/server/src/systems/characterService.ts`
- `packages/shared/src/rules/characterLimits.ts`

**Details:**

`docs/03` §3.1 nennt **5–8 Charaktere**. Umsetzung:

- Startkontingent: **3 Plätze**
- Freischaltbar bis **8**, über Spielfortschritt (welcher genau: siehe
  [99-offene-entscheidungen.md](99-offene-entscheidungen.md))
- Grenze steht in `characterLimits.ts`, nicht verstreut im Code

**Namensregeln:** 3–16 Zeichen, Buchstaben, Ziffern, Leerzeichen, Bindestrich.
Eindeutig pro Spieler, nicht global — globale Eindeutigkeit ist bei einem Spiel mit
acht Charakteren pro Kopf schnell erschöpft und für nichts nötig.

**Löschen:** möglich, mit Bestätigung durch Eingabe des Namens, und mit einer
**Aufschubfrist von 24 Stunden**, in der es zurückgenommen werden kann. `docs/19` §19.19
stellt fest, dass Fortschritt dauerhaft ist — ein Fehlklick darf das nicht aushebeln.

**Fertig wenn:** Erstellen, Umbenennen, Löschen und Wiederherstellen funktionieren; der
Server lehnt einen neunten Charakter und einen doppelten Namen ab.

**Test:** `characterService.test.ts` — Grenzen, Namensregeln, Löschfrist.

---

### S-3.3 Mehrere Charaktere im Speicher

**Was:** Der Server hält **alle** Charaktere eines angemeldeten Spielers als lebenden
Zustand, nicht nur den aktiven.

**Dateien:**

- `packages/server/src/world/playerRuntime.ts`
- `packages/server/src/world/areaRuntime.ts`

**Details:**

Aufbau:

```text
PlayerRuntime
 ├── alle Charaktere als lebender Zustand
 ├── welcher Charakter ist "beobachtet" (Client sieht ihn)
 └── Verbindung

AreaRuntime  (eine pro geladenem Gebiet)
 ├── Charaktere in diesem Gebiet (auch fremde Spieler, ab M10)
 ├── Gegner (ab M6)
 ├── Ressourcenpunkte (ab M5)
 └── Weltgegenstände (ab M4)
```

Ein Charakter ist **immer** in genau einer `AreaRuntime` eingetragen, unabhängig davon,
ob sein Spieler ihn gerade ansieht. Das ist die Voraussetzung dafür, dass `docs/12` §12.9
erfüllt werden kann: andere Spieler sollen einen Holzfäller tatsächlich am Baum stehen
sehen.

**Ticken oder nicht:** Eine `AreaRuntime` tickt nur, wenn mindestens ein Beobachter
darin ist. Nicht getickte Gebiete rechnen ihre Charaktere über das Idle-System ab (M5).

**Speicherverbrauch abschätzen:** 1000 Spieler × 8 Charaktere × ~2 kB Zustand ≈ 16 MB.
Unkritisch. Die Grenze ist die Zahl der **aktiven Gebiete**, nicht der Charaktere.

**Fertig wenn:** Fünf Charaktere in vier verschiedenen Gebieten existieren gleichzeitig
im Serverspeicher; ein Test prüft, dass ein Charakterwechsel keine Runtime neu erzeugt.

---

### S-3.4 Charakterwechsel

**Was:** Der Client wechselt den beobachteten Charakter. Der Server ändert nur, wer
beobachtet wird — sonst nichts.

**Dateien:**

- `packages/server/src/systems/characterService.ts`
- `packages/client/src/scenes/characterSwitch.ts`
- Protokoll: `{ t: 'switchCharacter', characterId }` → `{ t: 'characterView', ... }`

**Details:**

Ablauf beim Wechsel:

1. Client sendet `switchCharacter`
2. Server prüft Eigentum, meldet den Client vom alten Gebiet ab und beim neuen an
3. Server schickt vollständigen Gebiets-Snapshot plus Charakterzustand
4. Client baut die Szene auf und blendet ein

**Der alte Charakter wird nicht angehalten, nicht gespeichert und nicht verändert.** Er
existiert weiter; nur niemand schaut zu. Genau das fordert `docs/07` §7.3.

**Wechselzeit:** Ziel unter 200 ms bei geladenem Gebiet. Ist das Zielgebiet noch nicht
im Speicher, wird es geladen — dieser Fall wird gemessen, nicht geschätzt.

**Eingabe:** Zifferntasten 1–8 für den direkten Wechsel, zusätzlich Klick in der
Charakterleiste (`docs/22` §22.3).

**Fertig wenn:** Charakter 1 wird an Position A in Gebiet 1 zurückgelassen, Charakter 2
wird 30 Sekunden lang gespielt, Rückwechsel zu Charakter 1 zeigt ihn unverändert an
Position A. Nach Server-Neustart gilt dasselbe.

**Risiko:** Speicherlecks durch nicht abgemeldete Beobachter. Ein Test meldet 100 Mal
hin und her und prüft, dass die Beobachterlisten leer bleiben.

---

### S-3.5 Charakterleiste und Charakterfenster

**Was:** Die minimale UI, um mehrere Charaktere überhaupt bedienen zu können.

**Dateien:**

- `packages/client/src/ui/characterBar.ts`
- `packages/client/src/ui/characterWindow.ts`

**Details:**

Charakterleiste nach `docs/22` §22.3, unten oder oben am Bildrand:

```text
[1 Bran]  [2 Miri]  [3 Tolk]  [+]
 Lv 4      Lv 2      Lv 1
 Wald      Dorf      Mine
```

Pro Eintrag: Name, Level, Gebiet, aktuelle Aktivität (ab M5 mit Symbol), sowie eine
Markierung für den gerade beobachteten Charakter.

Charakterfenster nach `docs/22` §22.5 zeigt in M3, was existiert: Name, Level,
Erfahrung, Gebiet, Position. Attribute, Skills, Klasse und Ausrüstung erscheinen dort,
sobald sie in M7 und M8 entstehen — die Abschnitte werden **jetzt** als leere Bereiche
angelegt, damit das Fenster nicht dreimal umgebaut wird.

**Fertig wenn:** Die Leiste zeigt alle Charaktere, der Wechsel ist per Klick und per
Zifferntaste möglich, und die Aktivitätsanzeige aktualisiert sich ohne Neuladen.

---

### S-3.6 Charakter-XP als Grundlage

**Was:** Die Erfahrungskurve und Levelaufstiege — ohne Belohnungen, nur die Mechanik.

**Dateien:**

- `packages/shared/src/rules/experience.ts`
- `packages/server/src/systems/progressionSystem.ts`

**Details:**

`docs/19` §19.4: **kein Levelmaximum**, die benötigte Erfahrung wächst mit dem Level.
Vorläufige Kurve:

```ts
// XP für den Aufstieg von Level n auf n+1
xpToNext(n) = round(50 * n^1.5 + 25 * n)
```

Beispiele: L1→2: 75, L10→11: 1831, L50→51: 19 926, L100→101: 52 500.

**Vorläufig** und als solche markiert. Das Balancing folgt in M13 (`docs/26` Phase 26).
Entscheidend ist jetzt nur, dass die Kurve **an einer einzigen Stelle** steht und
Levelaufstiege stapelbar sind (ein großer Offline-Ertrag kann mehrere Level auf einmal
bringen — der häufigste Fehler ist eine Schleife, die nur ein Level pro Aufruf vergibt).

**Fertig wenn:** Ein Testbefehl vergibt XP, das Level steigt korrekt, 100 000 XP auf
Level 1 ergeben in einem Aufruf das richtige Endlevel und den richtigen Rest.

**Test:** `experience.test.ts` — Monotonie, Mehrfachaufstieg, kein Überlauf bei sehr
großen Werten.

---

## Ergebnis

Der Spieler hat drei Charaktere, verteilt sie auf verschiedene Gebiete, wechselt
zwischen ihnen und findet sie unverändert wieder. Charaktere sammeln Erfahrung und
steigen im Level. Alles überlebt Neustarts.

Das ist der erste Stand, an dem die Grundidee aus `docs/01` §1.2 sichtbar wird —
auch wenn die Charaktere noch nichts tun können.

## Nicht in diesem Meilenstein

- Attribute und Skills (M7 — nur die XP-Mechanik entsteht hier)
- Klassenwahl (M7)
- Parallele Aktivitäten (M5 — hier entsteht nur die Datenstruktur)
- Split-Screen (M10)
