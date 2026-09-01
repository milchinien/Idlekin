# M10 — Split-Screen, Multiplayer und Handel

**Ziel:** Bis zu vier eigene Charaktere gleichzeitig steuern, andere Spieler in der Welt
sehen, und über einen Markt handeln.

**Aufwand:** 9–11 Tage
**Vorbedingungen:** M9
**GDD-Bezug:** `docs/02` §2.6, `docs/03` §3.9, `docs/17-handel.md`,
`docs/18-multiplayer.md`, `docs/22` §22.4, §22.18, §22.19, `docs/25` §25.23, §25.24,
`docs/26` Phasen 20, 22, 23

---

## Warum diese drei zusammen

Sie teilen sich dieselbe technische Grundlage: **mehrere Zustände gleichzeitig sichtbar
halten und synchron halten**. Split-Screen ist Multiplayer mit sich selbst; Handel ist
der Punkt, an dem zwei Spielerzustände sich gegenseitig verändern. Wer sie trennt, baut
das Beobachtungs- und Synchronisationssystem dreimal.

---

## Schritte

### S-10.1 Mehrere Ansichtsfenster

**Was:** Der Renderer zeichnet mehrere unabhängige Ausschnitte.

**Dateien:**

- `packages/client/src/render/viewport.ts`
- `packages/client/src/scenes/splitScreen.ts`

**Details:**

Aufteilungen nach `docs/22` §22.4: 1, 2 (nebeneinander), 3 (eins groß, zwei klein) oder
4 (Raster).

Die Vorarbeit aus M2/S-2.5 (Kamera pro Ansichtsfenster statt global) wird jetzt genutzt.
Jedes Fenster hat eigene Kamera, eigenes Gebiet, eigenen Zeichenaufruf.

**Auflösung:** Bei vier Fenstern hat jedes ein Viertel der Fläche. Der ganzzahlige
Skalierungsfaktor aus M2/S-2.2 muss deshalb **pro Fenster** bestimmt werden. Bei 4-fach
kann das Faktor 2 statt 4 bedeuten — akzeptabel, weil Bosskämpfe von der Übersicht mehr
profitieren als von der Größe.

**Leistung:** vier Gebiete gleichzeitig zu zeichnen ist der Lastfall, der in M0/E4 als
Grenze für den eigenen Renderer benannt wurde. **Hier wird gemessen**: Bleibt die
Bildrate unter 60, wird zuerst der Zeichenaufwand pro Gebiet gesenkt (vorgerenderte
Tile-Ebenen), erst dann das Renderer-Backend infrage gestellt.

**Fertig wenn:** Vier Ansichten laufen gleichzeitig mit stabilen 60 Bildern pro Sekunde
auf einem Rechner mittlerer Leistung.

---

### S-10.2 Eingabe für mehrere Charaktere

**Was:** Steuerung von zwei bis vier Charakteren gleichzeitig.

**Dateien:** `packages/client/src/input/multiInput.ts`

**Details:**

Das eigentliche Entwurfsproblem dieses Meilensteins: **eine Tastatur, vier Charaktere.**
`docs/03` §3.9 verlangt, dass alle gleichzeitig steuerbar sind, sagt aber nicht wie.

Empfohlene Lösung — **Fokus plus Automatik**:

- Genau ein Fenster hat den Fokus und wird voll gesteuert
- Die anderen kämpfen automatisch weiter (das System aus M6/S-6.5 existiert bereits)
- Fokuswechsel über Tabulator oder Klick ins Fenster, ohne Ladezeit
- Fähigkeiten der nicht fokussierten Charaktere sind zusätzlich über Zusatztasten
  auslösbar (Umschalt + 1–4 für Charakter 2 und so weiter)

**Warum nicht echte Parallelsteuerung:** Vier Figuren gleichzeitig mit einer Tastatur
zu bewegen ist nicht bedienbar. Der Fokuswechsel muss dafür schnell genug sein, dass er
sich wie Parallelsteuerung anfühlt. Diese Entscheidung ist eine Auslegung des GDD und
gehört ausdrücklich in [99-offene-entscheidungen.md](99-offene-entscheidungen.md) —
sie sollte am Prototyp geprüft werden, bevor sie gebaut wird.

**Gamepads:** Bis zu vier angeschlossene Gamepads steuern je einen Charakter direkt. Das
ist die einzige Konstellation mit echter Parallelsteuerung und für die Steam-Version
(`docs/26` Phase 31) ohnehin nötig.

**Fertig wenn:** Vier Charaktere kämpfen gemeinsam gegen einen Boss; der Fokuswechsel
liegt unter 100 ms; mit vier Gamepads ist echte Parallelsteuerung möglich.

---

### S-10.3 Bosskämpfe mit mehreren Charakteren

**Was:** Der Anwendungsfall, für den Split-Screen existiert.

**Dateien:** `packages/server/src/systems/bossSystem.ts` (erweitert)

**Details:**

Nach `docs/15` §15.5: bis zu vier Charaktere gegen einen Boss. Der Boss wählt sein Ziel
nach zuletzt erlittenem Schaden und Nähe — kein Bedrohungssystem, das wäre für
`docs/15` §15.6 („Rollenverteilung nicht vorgeschrieben") zu starr.

**Skalierung:** Bosswerte steigen mit der Zahl beteiligter Charaktere, aber unterhalb
der Linearität (Faktor 1,0 / 1,7 / 2,3 / 2,8). Sonst wäre allein zu spielen entweder
sinnlos oder zu viert trivial.

**Fertig wenn:** Vier Charaktere besiegen gemeinsam einen Boss, der allein sehr schwer
ist; Beute wird einmal vergeben, nicht viermal.

---

### S-10.4 Andere Spieler sichtbar machen

**Was:** Fremde Charaktere in derselben Welt.

**Dateien:**

- `packages/server/src/net/areaBroadcast.ts`
- `packages/client/src/render/remoteCharacters.ts`

**Details:**

Nach `docs/18` §18.2 und §18.5: Andere Spieler laufen, kämpfen und sammeln sichtbar.

**Übertragung:** 10 Hz Positionsaktualisierung pro Gebiet, nur für Charaktere im
sichtbaren Ausschnitt plus Rand. Der Client interpoliert zwischen den Paketen.

**Datenumfang pro Fremdcharakter:** Position, Blickrichtung, Animationszustand, Name,
Level, Aussehen. Keine Werte, kein Inventar — `docs/18` §18.11 will sichtbaren
Fortschritt über Ausrüstung, nicht über Zahlen.

**Obergrenze pro Gebiet:** 30 sichtbare Fremdcharaktere. Darüber werden die entferntesten
ausgeblendet. Die Welt soll bevölkert wirken (`docs/18` §18.2), nicht überfüllt.

**Keine Beeinflussung** (`docs/18` §18.6): Fremde Spieler blockieren keine
Ressourcenpunkte, keine Gegner, keine Wege. Die Instanziierung aus M6/S-6.1 sorgt bereits
dafür.

**Fertig wenn:** Zwei Browser mit zwei Konten sehen sich gegenseitig laufen, kämpfen und
Holz fällen; die Bewegung ist bei 100 ms Latenz flüssig.

---

### S-10.5 Postgres-Umstellung

**Was:** Der in M0/E4 benannte Umstiegspunkt.

**Dateien:** `packages/server/drizzle.config.ts`, Migrationen

**Details:**

Mehrere gleichzeitige Spieler mit Handel bedeuten schreibende Nebenläufigkeit. SQLite
kann das mit WAL grundsätzlich, aber nur in **einem** Prozess. Spätestens beim zweiten
Serverprozess ist Schluss.

**Umstellung jetzt und nicht später**, weil sie in M13 unter Zeitdruck stattfinden
würde. Wenn seit M1 keine SQLite-spezifische Syntax verwendet wurde, ist es ein
Dialektwechsel plus Datenübernahme.

**Fertig wenn:** Der Server läuft auf Postgres, alle Tests laufen gegen beide Dialekte,
ein bestehender SQLite-Spielstand ist übernommen.

**Risiko:** Wurde die Regel aus M1 gebrochen, kostet dieser Schritt statt einem Tag
mehrere. Deshalb wird sie ab M1 automatisch geprüft — siehe
[91-teststrategie-und-qualitaet.md](91-teststrategie-und-qualitaet.md).

---

### S-10.6 Währung und Verkauf an NPCs

**Was:** Gold als Wirtschaftsgrundlage.

**Dateien:** `packages/server/src/systems/currencySystem.ts`

**Details:**

Währung ist **spielerbezogen**, nicht charakterbezogen (`docs/25` §25.25). Alle
Charaktere teilen sich denselben Beutel — bei acht Charakteren wäre alles andere
Verwaltungsarbeit ohne Spielwert.

NPC-Händler kaufen zum `sellValue` aus dem Itemdatensatz. Das ist der Preisboden, an dem
sich der Spielermarkt orientiert. **Kein NPC-Verkauf von Ausrüstung** — sonst wird der
Spielermarkt aus `docs/17` §17.6 überflüssig.

**Fertig wenn:** Verkaufen funktioniert, die Währung ist spielerweit sichtbar und
korrekt.

---

### S-10.7 Transfer zwischen eigenen Charakteren

**Was:** Das Team arbeitet einander zu.

**Dateien:** `packages/server/src/systems/transferSystem.ts`

**Details:** Nach `docs/09` §9.14 und `docs/17` §17.2. Erweiterung des direkten
Transfers aus M8/S-8.2 um einen **Postweg**: Ein Charakter schickt Gegenstände an einen
anderen, Zustellung nach 5 Minuten, unabhängig vom Gebiet.

Damit bleibt Nähe der schnelle Weg und Entfernung ist kein Hindernis — ein Kompromiss
zwischen `docs/12` §12.10 (Positionen zählen) und `docs/17` §17.2 (Team funktioniert
gemeinsam).

**Fertig wenn:** Direkt und per Post funktioniert beides; nichts geht verloren, wenn der
Empfänger volles Inventar hat (Postfach hält es).

---

### S-10.8 Markt

**Was:** Spielerhandel über Angebote.

**Dateien:**

- `packages/server/src/systems/marketSystem.ts`
- `packages/client/src/ui/marketWindow.ts`
- `packages/server/migrations/00xx_market.sql`

**Details:**

Nach `docs/25` §25.23 und `docs/17` §17.6–§17.8: Angebot mit Gegenstand, Menge, Preis,
Ablaufzeit. Suche nach Name, Kategorie, Seltenheit, Preis.

**Nur über den Markt, kein direkter Tausch zwischen zwei Spielern.** Das ist eine
**Auslegung, keine GDD-Vorgabe**: `docs/17` §17.3 erlaubt Spielerhandel grundsätzlich,
§17.6 und §17.9 stellen den Markt lediglich als Weg dar, der keinen permanenten Kontakt
erfordert. Ein direkter Tausch ist damit nicht ausgeschlossen, nur nicht gefordert.

Die Beschränkung spart eine zweite Handelsoberfläche und schließt Betrug durch
vorgetäuschte Tauschgeschäfte aus. Sie steht als **O12** in
[99-offene-entscheidungen.md](99-offene-entscheidungen.md).

**Sicherheitsanforderungen — hier ist die schärfste Stelle des ganzen Projekts:**

- Kauf ist eine **Transaktion**: Gegenstand und Währung wechseln gemeinsam oder gar nicht
- Der Gegenstand liegt zwischen Einstellen und Verkauf **beim Markt**, nicht beim
  Verkäufer — sonst kann er ihn zwischenzeitlich benutzen
- Preisgrenzen gegen Zahlendreher (Warnung bei mehr als dem Zehnfachen des
  Durchschnittspreises)
- **Handelssteuer von 5 %**, die Gold aus dem Spiel entfernt. Ohne Abfluss inflationiert
  jede Spielwirtschaft.
- Angebote laufen nach 48 Stunden ab, unverkaufte Gegenstände gehen per Post zurück

**Nicht handelbar:** questgebundene und einzigartige Gegenstände (`docs/17` §17.4). Das
Feld `tradable` aus M4/S-4.1 wird jetzt ausgewertet.

**Fertig wenn:** Einstellen, Suchen, Kaufen, Ablaufen funktioniert; ein Test mit 100
gleichzeitigen Kaufversuchen auf dasselbe Angebot verkauft es genau einmal.

**Risiko:** Wettlaufsituationen beim Kauf sind die klassische Quelle für Duplikation.
Deshalb der ausdrückliche Nebenläufigkeitstest.

---

### S-10.9 Ranglisten

**Was:** Der indirekte Wettbewerb.

**Dateien:** `packages/server/src/systems/leaderboardSystem.ts`

**Details:** Nach `docs/25` §25.24 und `docs/18` §18.7: höchstes Charakterlevel, höchster
Berufsskill je Beruf, Bossfortschritt, Gesamtlevel des Teams.

Berechnung **stündlich als Momentaufnahme**, nicht bei jeder Abfrage. Eine Rangliste, die
sich sekündlich ändert, ist kein Ziel, sondern Rauschen.

**Fertig wenn:** Ranglisten existieren, aktualisieren stündlich, zeigen den eigenen Rang
auch außerhalb der Anzeige.

---

## Ergebnis

Vier eigene Charaktere kämpfen gemeinsam gegen einen Boss. Andere Spieler sind in der
Welt sichtbar. Ein Markt verbindet die Spielstile. Das MMO-Gefühl aus `docs/18` §18.13
entsteht — ohne Zwang zur Interaktion.

## Nicht in diesem Meilenstein

- Chat (`docs/17` §17.9 und `docs/18` §18.3 schließen ihn ausdrücklich aus)
- Gruppen, Gilden, PvP (`docs/18` §18.9)
- Endgültige UI (M11)
