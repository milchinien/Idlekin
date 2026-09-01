# M0 — Grundlagen und technische Entscheidungen

**Ziel:** Alles festlegen, was später teuer zu ändern wäre. Kein Gameplay-Code.

**Aufwand:** ~1 Tag
**Vorbedingungen:** keine
**GDD-Bezug:** `docs/24-technische-architektur.md`, `docs/25-datenstrukturen.md`, `docs/26-entwicklungsplan.md`

Die hier getroffenen Entscheidungen sind **Empfehlungen mit Begründung**, keine
Glaubenssätze. Wer sie ändert, ändert sie **vor M1** — danach kostet es echte Arbeit.
Offene Punkte stehen in [99-offene-entscheidungen.md](99-offene-entscheidungen.md).

---

## E1 — Sprache: TypeScript

**Entscheidung:** TypeScript überall, `strict: true`.

**Warum:** `docs/25` beschreibt ein stark datengetriebenes Spiel mit vielen ineinander
greifenden Strukturen (Item → Equipment → Slot → Bonus → Attribut → Skill). Genau dort
zahlt sich statische Typisierung aus. Die Prototypen bleiben bewusst bei reinem
JavaScript — dort zählt Tempo, nicht Wartbarkeit.

**Konsequenz:** Der Content in `content/` wird über generierte Typen validiert, nicht
über Kommentare.

---

## E2 — Ausführungsmodell: Autoritativer Server, dummer Client

**Entscheidung:** Der Server hält den Wahrheitszustand aller Charaktere. Der Client
rendert, sagt Eingaben durch und darf **optimistisch vorhersagen**, aber niemals
Fortschritt erzeugen.

**Warum:** `docs/24` §24.7 und §24.16 fordern das ausdrücklich für Ressourcen, Währung,
Items, XP, Level, Handel, Crafting und Drops. Es nachzurüsten bedeutet, jedes System neu
zu schreiben.

**Konkret erlaubt im Client:**

- Bewegung des selbst gesteuerten Charakters vorhersagen (Server korrigiert)
- Trefferanzeigen, Partikel, Kamera, Sound
- Alles, was ohne Serverbestätigung wieder verschwinden darf

**Konkret verboten im Client:**

- "Ich habe 3 Holz bekommen" — das sagt der Server
- "Der Gegner ist tot" — das sagt der Server
- "Das Portal ist frei" — das sagt der Server

---

## E3 — Zeitmodell: Simulation in festen Ticks, Idle über Zeitdifferenz

**Entscheidung:** Zwei getrennte Zeitsysteme.

| System | Takt | Wo | Für |
|---|---|---|---|
| **Echtzeit-Simulation** | 20 Hz Server-Tick, 60 Hz Client-Render | `packages/shared/sim` | Bewegung, Kampf, Kollision |
| **Idle-Abrechnung** | ereignisgesteuert, nicht getickt | `packages/server/idle` | Berufe, Offline-Fortschritt |

**Warum:** `docs/24` §24.11 verlangt ausdrücklich, dass Idle **nicht** Sekunde für
Sekunde simuliert wird, sondern aus der Zeitdifferenz berechnet. Ein Spieler mit acht
Charakteren mal tausend Spieler wären sonst achttausend simulierte Entitäten.

**Faustregel:** Alles, was der Spieler *sieht*, tickt. Alles, was er *nachgerechnet
bekommt*, wird integriert.

Der Client rendert mit fester Simulationsschrittweite und Interpolation — die
Erkenntnis aus `prototypes/01-side-view-movement` gilt unverändert.

---

## E4 — Laufzeitumgebung und Bibliotheken

| Bereich | Wahl | Begründung |
|---|---|---|
| Paketmanager | **pnpm Workspaces** | Bereits im Projekt (`pnpm-lock.yaml`) |
| Build Client | **Vite** | Bereits eingerichtet, inkl. Prototypen-Menü |
| Server | **Node.js 22 LTS + Fastify** | Klein, schnell, gute WebSocket-Anbindung |
| Echtzeit | **WebSocket (`ws`)** | `docs/24` §24.12 nennt es direkt |
| Datenbank | **SQLite über `better-sqlite3`** | Eine Datei, keine Infrastruktur, synchron |
| DB-Zugriff | **Drizzle ORM** | Typsicher, migrationsfähig, SQLite → Postgres |
| Rendering | **Canvas 2D, eigener Renderer** | Prototyp beweist, dass es reicht |
| Tests | **Vitest** | Gleiche Toolchain wie Vite |

### Warum SQLite und nicht sofort Postgres

`docs/24` §24.15: *Einfach starten → sauber strukturieren → später skalieren.* SQLite
braucht keinen Container, kein Passwort, kein Setup, und ein Spielstand ist eine Datei,
die man kopieren kann. Der Umstieg ist über Drizzle ein Dialektwechsel plus Migration —
solange **keine SQLite-spezifische Syntax** in Abfragen landet. Diese Regel gilt ab M1.

**Umstiegspunkt:** sobald mehr als ein Serverprozess nötig ist (in M10, Multiplayer).

### Warum kein Spiel-Framework

Phaser oder PixiJS würden M2 beschleunigen und M13 verlangsamen. Der Prototyp zeigt,
dass Kollision, Kamera, Parallaxe und Tileset-Rendering in überschaubarem eigenem Code
lösbar sind. Entscheidend ist die Anforderung aus `docs/24` §24.13: Simulation ist von
Darstellung getrennt. Diese Trennung wird mit einem Framework eher schwerer.

**Revidierbar bei:** mehr als ~2000 gleichzeitig sichtbaren Sprites (Split-Screen mit
vier Gebieten in M10). Dann Renderer-Backend austauschen, nicht das Spiel.

---

## E5 — Ordnerstruktur

```text
Idlekin/
├── docs/                    GDDs — unverändert
├── plan/                    dieser Ordner
├── prototypes/              Wegwerf-Experimente — bleibt isoliert
├── tools/                   PowerShell/Node-Werkzeuge für Assets
├── assets/                  Rohassets, Quellmaterial
│
├── packages/
│   ├── shared/              plattformfrei: kein DOM, keine DB, kein Netzwerk
│   │   ├── src/types/       Datenstrukturen aus docs/25
│   │   ├── src/sim/         Bewegung, Kollision, Kampfformeln
│   │   ├── src/rules/       XP-Kurven, Effizienz, Boni, Anforderungen
│   │   ├── src/content/     Loader + Validierung für content/
│   │   └── src/protocol/    Nachrichtenformat Client <-> Server
│   │
│   ├── server/
│   │   ├── src/db/          Drizzle-Schema und Migrationen
│   │   ├── src/systems/     charakter, idle, kampf, crafting, handel ...
│   │   ├── src/net/         WebSocket, HTTP, Sitzungen
│   │   └── src/world/       geladene Gebiete, Ressourcen- und Gegnerinstanzen
│   │
│   └── client/
│       ├── src/render/      Canvas-Renderer, Kamera, Atlas, Partikel
│       ├── src/scenes/      Weltansicht, Split-Screen
│       ├── src/ui/          Fenster, Leisten, Overlays
│       ├── src/net/         Verbindung, Vorhersage, Abgleich
│       └── public/          gebaute Assets
│
└── content/                 Spieldaten als JSON — keine Logik
    ├── areas/  enemies/  resources/  items/  recipes/
    ├── quests/ classes/   abilities/  droptables/
```

**Regel:** `shared` darf von niemandem abhängen. `server` und `client` dürfen von
`shared` abhängen. `client` und `server` kennen sich **nie** direkt — nur über
`shared/protocol`.

Das ist die technische Umsetzung von `docs/24` §24.17 (Modularität) und die Bedingung
dafür, dass §24.5 (Steam-Version) später überhaupt möglich ist.

---

## E6 — Content-Format

Alle Inhalte sind JSON-Dateien in `content/`, eine Datei pro Kategorie oder pro Gebiet.
Geladen und **beim Serverstart validiert**. Ein ungültiger Datensatz bricht den Start
ab — nicht erst im Spiel.

```jsonc
// content/enemies/slime.json
{
  "id": "enemy.slime",
  "name": "Schleim",
  "level": 3,
  "health": 40,
  "damage": 4,
  "defense": 1,
  "movement": { "type": "patrol", "speed": 18, "range": 64 },
  "attacks": [{ "id": "attack.slime.bounce", "damage": 4, "cooldown": 1.8, "range": 20 }],
  "dropTable": "drop.slime",
  "xp": { "character": 12, "combat": 9 }
}
```

**Warum JSON und nicht TypeScript-Dateien:** `docs/25` §25.26 verlangt, dass neue Inhalte
**ohne neue Programmlogik** entstehen. JSON kann von Werkzeugen, von Codex und später
von einem Editor erzeugt werden. TypeScript-Konstanten wären bequemer zu tippen, aber
nur für Menschen mit Compiler.

**IDs sind Zeichenketten mit Namensraum** (`enemy.slime`, `item.wood.oak`,
`area.forest.deep`). Keine Zahlen: Zahlen kollidieren beim Zusammenführen, Namen nicht.

---

## E7 — Umgang mit dem bestehenden Repository

| Vorhanden | Was passiert |
|---|---|
| `docs/` | unverändert. Ergänzungen dort, nicht hier. |
| `prototypes/` | bleibt. Isolation nach `prototypes/README.md` gilt weiter. |
| `vite.config.js` | wandert nach `packages/client/vite.config.ts`; das Prototypen-Menü-Plugin bleibt in einer eigenen Vite-Konfiguration im Wurzelverzeichnis erhalten |
| `index.html` (Wurzel) | wird in M1 durch den echten Client-Einstiegspunkt ersetzt |
| `tools/*.ps1` | bleiben Werkzeuge; `generate-platform-tilesets.ps1` wird in M12 in die Asset-Pipeline eingebunden |
| `tools/_*.png` | Debug- und Zwischenausgaben (`_debug-*`, `_scene-*`, `_final-*`), gehören in `.gitignore` |
| `assets/` | bleibt Quellordner; gebaute Atlanten landen in `packages/client/public/` |

---

## Schritte

### S-0.1 Entscheidungen bestätigen oder ändern

**Was:** Dieses Dokument durchgehen. Jede Entscheidung E1–E7 entweder bestätigen oder
ersetzen. Änderungen hier eintragen, nicht im Kopf behalten.

**Fertig wenn:** Kein Punkt in [99-offene-entscheidungen.md](99-offene-entscheidungen.md)
mehr als `blockiert M1` markiert ist.

### S-0.2 Repository umbauen

**Was:** Workspace-Struktur nach E5 anlegen. Noch kein Spielcode — nur leere Pakete,
die sich bauen und testen lassen.

**Dateien:**

- `pnpm-workspace.yaml`
- `package.json` (Wurzel: nur Skripte und geteilte Werkzeuge)
- `packages/{shared,server,client}/package.json` und `tsconfig.json`
- `tsconfig.base.json`
- `.gitignore` (ergänzt um `tools/_*.png`, `*.sqlite`, `dist/`)

**Details:** Wurzelskripte:
`dev` (Client und Server parallel), `dev:proto` (bestehendes Prototypen-Menü),
`build`, `test`, `typecheck`, `db:migrate`, `db:seed`.

**Fertig wenn:** `pnpm install && pnpm typecheck && pnpm test` läuft grün durch,
`pnpm dev:proto` öffnet weiterhin die Prototypen-Übersicht auf Port 5180.

**Test:** manuell, einmalig.

### S-0.3 Konventionen festschreiben

**Was:** `CLAUDE.md` im Wurzelverzeichnis mit den Regeln, die sonst in jeder Sitzung neu
verhandelt werden.

**Inhalt mindestens:**

- Kommentare und Bezeichner in Spielsprache: **Deutsch für Fachbegriffe**
  (Holzfäller-Skill, Gebiet), Englisch für technische Begriffe (`renderer`, `tick`)
- Kommentare erklären **warum**, nicht was — wie in `vite.config.js` bereits gehandhabt
- Keine Abkürzungen in Datenmodellen: `characterId`, nicht `cid`
- Alle Zeiten in **Millisekunden als Ganzzahl**, alle Weltkoordinaten in **Pixeln als
  Ganzzahl** (`docs/27` §27.4: keine Subpixel)
- Alle Zufallszahlen laufen über einen **gesäten Generator** aus `shared/sim/random`,
  nie über `Math.random()` — sonst sind Kämpfe nicht reproduzierbar und Fehler nicht
  nachstellbar

**Fertig wenn:** Die Datei existiert und die Regeln sind auf S-0.2 bereits angewendet.
