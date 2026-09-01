# M1 — Technisches Fundament

**Ziel:** Client, Server, Datenbank und Spielstand arbeiten zusammen. Noch kein Spiel,
aber alles, worauf ein Spiel aufsetzen kann.

**Aufwand:** 5–7 Tage
**Vorbedingungen:** M0
**GDD-Bezug:** `docs/24` (gesamt), `docs/25` §25.2, §25.25, `docs/26` Phase 1

**Ergebnis:** Ein Browser lädt eine Seite, meldet sich an, bekommt über WebSocket seinen
gespeicherten Spielstand, kann ihn verändern, und nach einem Neustart von Server und
Browser ist die Änderung noch da.

---

## Warum dieser Meilenstein zuerst

Es ist verlockend, mit der Spielwelt zu beginnen — die sieht man wenigstens. Die
Erfahrung sagt das Gegenteil: Persistenz und Serverautorität nachträglich einzuziehen
bedeutet, jedes bereits gebaute System anzufassen. `docs/24` §24.7 macht Serverautorität
zur Grundanforderung, nicht zum späteren Zusatz.

Was hier entsteht, ist bewusst **langweilig und vollständig**: eine Kette vom Klick im
Browser bis zur Zeile in der Datenbank und zurück. Steht die Kette, ist jedes weitere
System nur noch eine Erweiterung an einer bekannten Stelle.

---

## Schritte

### S-1.1 Gemeinsame Typen und Protokoll

**Was:** Die Datenstrukturen aus `docs/25` als TypeScript-Typen in `shared`, sowie das
Nachrichtenformat zwischen Client und Server.

**Dateien:**

- `packages/shared/src/types/player.ts`, `character.ts`, `ids.ts`
- `packages/shared/src/protocol/messages.ts`
- `packages/shared/src/protocol/index.ts`

**Details:**

Nachrichten sind ein unterscheidbarer Verbund mit Feld `t` (Typ). Zwei Richtungen,
strikt getrennt:

```ts
// Client -> Server
type ClientMessage =
  | { t: 'auth';        token: string }
  | { t: 'ping';        sent: number }
  | { t: 'subscribe';   characterId: CharacterId };

// Server -> Client
type ServerMessage =
  | { t: 'authOk';      player: PlayerSnapshot; serverTime: number }
  | { t: 'authFail';    reason: string }
  | { t: 'pong';        sent: number; serverTime: number }
  | { t: 'state';       characterId: CharacterId; state: CharacterSnapshot }
  | { t: 'error';       code: string; message: string };
```

Regeln, die ab hier gelten und später viel Ärger sparen:

- **Jede Servernachricht trägt `serverTime`** (Millisekunden seit Epoche). Der Client
  berechnet daraus einen Zeitversatz. Ohne das ist Idle-Abrechnung nicht prüfbar.
- **Kein Feld heißt `data`.** Namen sind Dokumentation.
- **Snapshots sind vollständig, nicht differenziell.** Differenzen kommen frühestens in
  M10, wenn Bandbreite messbar ein Problem ist.

**Fertig wenn:** `shared` baut, exportiert Typen für Player und Character gemäß
`docs/25` §25.2 und §25.3, und ein Vitest-Test prüft, dass sich jede Nachrichtenart
serialisieren und wieder einlesen lässt.

**Test:** `packages/shared/src/protocol/messages.test.ts` — Rundlauf pro Nachrichtenart.

---

### S-1.2 Datenbankschema und Migrationen

**Was:** Drizzle-Schema für Spieler, Charaktere und Sitzungen. Migrationswerkzeug
einrichten.

**Dateien:**

- `packages/server/src/db/schema.ts`
- `packages/server/src/db/index.ts`
- `packages/server/drizzle.config.ts`
- `packages/server/migrations/0000_init.sql` (generiert)

**Details:**

Tabellen in M1 — bewusst wenige. Die Trennung folgt `docs/25` §25.25
(spielerbezogen vs. charakterbezogen):

| Tabelle | Zweck | Wichtige Spalten |
|---|---|---|
| `players` | Account | `id`, `name`, `createdAt`, `currency`, `lastSeenAt` |
| `characters` | Charakter | `id`, `playerId`, `name`, `level`, `experience`, `areaId`, `posX`, `posY`, `createdAt` |
| `sessions` | Anmeldung | `token`, `playerId`, `expiresAt` |

Felder, die erst später gefüllt werden (Attribute, Skills, Klasse, Inventar), werden
**noch nicht angelegt**. Jeder Meilenstein bringt seine eigene Migration mit. Ein
vorausschauend leeres Schema ist kein Vorteil, sondern eine Behauptung über die Zukunft.

**Regel für alle späteren Migrationen:** Was abgefragt oder sortiert werden muss
(Ranglisten, Handel, Suche), bekommt eine eigene Spalte oder Tabelle. Was nur am Stück
geladen und geschrieben wird, darf in eine `*Json`-Spalte — so wie `activityJson` und
`appearanceJson` ab M3.

**Kein vorsorgliches Sammelfeld.** Eine generische `stateJson` von Anfang an klingt
flexibel, wird aber zur Ablage für alles, was gerade eilig war, und ist danach nicht mehr
abfragbar.

**Fertig wenn:** `pnpm db:migrate` legt eine frische `idlekin.sqlite` an;
erneutes Ausführen ist wirkungslos statt fehlerhaft.

**Risiko:** Der Reiz, das ganze Schema aus `docs/25` sofort anzulegen. Nicht tun — die
Hälfte davon wird sich bis M8 noch ändern.

---

### S-1.3 Serverskelett mit HTTP und WebSocket

**Was:** Fastify-Server mit Gesundheitsendpunkt, Anmeldung und WebSocket-Aufwertung.

**Dateien:**

- `packages/server/src/main.ts`
- `packages/server/src/net/http.ts`
- `packages/server/src/net/socket.ts`
- `packages/server/src/net/session.ts`

**Details:**

Endpunkte in M1:

| Route | Zweck |
|---|---|
| `GET /health` | Betriebsprüfung, gibt Version und Betriebszeit zurück |
| `POST /auth/dev` | Entwicklungsanmeldung: Name rein, Sitzungstoken raus |
| `WS /ws` | Alles Weitere |

**Zur Anmeldung:** In M1 bewusst eine Attrappe — Name eingeben, Spieler wird angelegt,
falls nicht vorhanden. Kein Passwort, kein E-Mail-Versand, kein OAuth. Echte
Authentifizierung kommt in M13 (`docs/26` Phase 27), weil sie bis dahin nichts schützt,
was schützenswert wäre. Die Attrappe wird über eine Umgebungsvariable
`IDLEKIN_ALLOW_DEV_AUTH` freigeschaltet, die in Produktion fehlt — damit sie nicht
versehentlich überlebt.

Der WebSocket-Handler ist ein Zustandsautomat mit genau drei Zuständen:
`verbunden → angemeldet → geschlossen`. Nachrichten vor der Anmeldung außer `auth`
führen zum Verbindungsabbruch. Das ist keine Sicherheitsmaßnahme, sondern verhindert
eine ganze Klasse von Folgefehlern.

**Fertig wenn:** `pnpm dev:server` startet, `curl localhost:3000/health` antwortet, ein
WebSocket-Client kann sich anmelden und bekommt `authOk` mit einem Spieler-Snapshot.

**Test:** `packages/server/src/net/socket.test.ts` — Anmeldung erfolgreich, Anmeldung
mit falschem Token, Nachricht vor Anmeldung.

---

### S-1.4 Spielstand laden und speichern

**Was:** Repository-Schicht zwischen Systemen und Datenbank. Systeme sehen nie SQL.

**Dateien:**

- `packages/server/src/db/playerRepository.ts`
- `packages/server/src/db/characterRepository.ts`
- `packages/server/src/systems/playerService.ts`

**Details:**

Der Server hält angemeldete Spieler **im Speicher** als lebenden Zustand und schreibt
sie:

1. **regelmäßig** alle 30 Sekunden, falls verändert,
2. **bei Abmeldung** sofort,
3. **bei sauberem Serverstopp** für alle,
4. **bei jedem als kritisch markierten Ereignis** sofort (später: Handel, Boss-Beute).

**Warum nicht nach jeder Änderung schreiben:** Ein Charakter beim Holzfällen erzeugt
mehrere Änderungen pro Sekunde. Bei acht Charakteren und tausend Spielern wären das
zehntausende Schreibvorgänge pro Sekunde für Daten, deren Verlust maximal 30 Sekunden
Fortschritt kostet. `docs/24` §24.11 argumentiert in dieselbe Richtung.

**Warum das trotzdem korrekt ist:** Das Idle-System rechnet aus Zeitstempeln, nicht aus
Zwischenständen. Ein Absturz verliert höchstens 30 Sekunden *Aktivzeit*; die
Idle-Produktion wird beim nächsten Laden ohnehin aus `lastCalculatedAt` neu ermittelt.
Diese Eigenschaft muss ab M5 erhalten bleiben — sie ist der Grund, warum das
Speicherintervall überhaupt vertretbar ist.

**Fertig wenn:** Spieler anmelden, Charakterwert ändern, Server neu starten, erneut
anmelden — der Wert ist erhalten. Ein Test erzwingt einen Absturz zwischen zwei
Speicherpunkten und prüft, dass der letzte gespeicherte Stand konsistent ist.

---

### S-1.5 Client-Grundgerüst und Verbindung

**Was:** Vite-Client, der sich verbindet, anmeldet und den Spielstand anzeigt.

**Dateien:**

- `packages/client/index.html`
- `packages/client/src/main.ts`
- `packages/client/src/net/connection.ts`
- `packages/client/src/net/store.ts`

**Details:**

`connection.ts` kapselt:

- automatische Wiederverbindung mit exponentiell wachsender Wartezeit (250 ms bis 10 s)
- Warteschlange für Nachrichten, die während einer Unterbrechung entstehen
- Zeitversatz zum Server aus `ping`/`pong`, gemittelt über die letzten fünf Messungen
- ein Ereignis `verbindungsstatus`, das die UI später anzeigt

`store.ts` ist ein einfacher beobachtbarer Zustand. **Kein Framework.** Der Client hat
in M11 vielleicht zwanzig UI-Fenster; das trägt ein selbst geschriebener Speicher mit
Abonnenten problemlos, und er kostet keine 40 kB und keine Lernkurve.

**Fertig wenn:** Die Seite zeigt Verbindungsstatus, Spielername, Charakterliste und
gemessene Latenz. Server neu starten → Client verbindet sich innerhalb von 10 Sekunden
selbstständig neu, ohne dass die Seite neu geladen wird.

**Risiko:** Wiederverbindung ist eine der Stellen, an denen später schwer reproduzierbare
Fehler entstehen. Deshalb **jetzt** richtig, nicht als Notlösung in M10.

---

### S-1.6 Content-Loader und Validierung

**Was:** JSON aus `content/` laden, gegen Schemata prüfen, typisiert bereitstellen.

**Dateien:**

- `packages/shared/src/content/schema.ts`
- `packages/shared/src/content/registry.ts`
- `content/areas/dorf.json` (ein Minimalgebiet als Beweis)

**Details:**

Validierung mit **Zod** oder handgeschriebenen Prüffunktionen. Wichtiger als das
Werkzeug sind zwei Eigenschaften:

1. **Der Fehler nennt die Datei und den Pfad im Dokument.**
   `content/enemies/slime.json: attacks[0].cooldown erwartet number, erhielt "1.8"`
2. **Querverweise werden geprüft.** Ein Gegner mit `dropTable: "drop.tippfehler"` bricht
   den Start ab. Nicht geprüfte Verweise sind die häufigste Fehlerquelle in
   datengetriebenen Spielen und fallen sonst erst zur Laufzeit auf — beim Spieler.

Die Registry ist nach dem Laden **unveränderlich**. Kein System darf Content zur
Laufzeit ändern; Fortschritt gehört in den Spielstand, nicht in die Inhaltsdaten.

**Fertig wenn:** Serverstart lädt alle Dateien aus `content/`, meldet die Anzahl je
Kategorie im Log, und ein absichtlich kaputter Datensatz verhindert den Start mit einer
Meldung, aus der die Ursache ohne Nachdenken hervorgeht.

**Test:** Ein Testverzeichnis mit je einem gültigen und einem ungültigen Datensatz pro
Kategorie.

---

### S-1.7 Tickschleife des Servers

**Was:** Der Takt, in dem der Server die Welt fortschreibt.

**Dateien:**

- `packages/server/src/world/tick.ts`
- `packages/shared/src/sim/clock.ts`

**Details:**

- Fester Takt: **20 Hz** (50 ms). Genug für Kampf in Seitenansicht, ein Drittel der Last
  von 60 Hz.
- **Akkumulator statt `setInterval`-Vertrauen.** Node-Zeitgeber laufen unter Last nach.
  Der Tick verarbeitet aufgelaufene Zeit in ganzen Schritten und begrenzt auf maximal
  fünf Schritte pro Durchlauf, damit ein Aussetzer keine Aufholspirale auslöst.
- **Nur Gebiete mit mindestens einem aktiven Beobachter ticken.** Ein Gebiet, das gerade
  niemand ansieht, braucht keine Bewegungssimulation — die Charaktere darin laufen über
  das Idle-System (M5), nicht über den Tick.
- Der Tick misst seine eigene Dauer und protokolliert eine Warnung ab 25 ms, also der
  halben Taktzeit. Diese Zahl wird in M13 zur Messgrundlage.

**Fertig wenn:** Der Server tickt stabil mit 20 Hz, die gemessene Abweichung liegt unter
5 ms, und ein künstlich blockierender Tick von 500 ms führt zu genau fünf Aufholschritten,
nicht zu zehn.

**Test:** `tick.test.ts` mit gefälschter Uhr.

---

## Ergebnis

- Anmeldung, Verbindung, Wiederverbindung funktionieren
- Spieler und Charaktere liegen in der Datenbank und überleben Neustarts
- Inhalte werden aus JSON geladen und beim Start validiert
- Der Server hat einen verlässlichen Takt
- `shared` enthält Typen, die Client und Server gemeinsam nutzen

**Prüfung des Meilensteins:** Anmelden, Charakternamen ändern, Server hart abschießen
(`kill -9`), neu starten, anmelden — Name ist erhalten oder höchstens 30 Sekunden alt.

## Nicht in diesem Meilenstein

- Grafik jeder Art
- Bewegung
- echte Authentifizierung mit Passwort
- Postgres
- Mehrere Serverprozesse
