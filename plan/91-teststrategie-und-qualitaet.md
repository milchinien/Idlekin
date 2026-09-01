# Teststrategie und Qualitätssicherung

**Grundhaltung:** Getestet wird, was **falsch sein kann, ohne dass es auffällt**. Ein
Renderfehler sieht man. Ein Idle-Ertrag, der 3 % zu niedrig ist, sieht man nie — und er
kostet den Spieler über Wochen echten Fortschritt.

Daraus folgt die Priorisierung: **Zahlen vor Verhalten, Verhalten vor Aussehen.**

---

## Was getestet wird — und was nicht

| Bereich | Wie | Warum |
|---|---|---|
| Idle-Abrechnung | Unit, gründlich | Fehler sind unsichtbar und kumulativ |
| Kampfformeln | Unit | dito |
| XP- und Skill-Kurven | Unit | dito |
| Inventaroperationen | Unit + Eigenschaftstest | Gegenstände dürfen nicht verschwinden |
| Drop-Tabellen | statistischer Test | Wahrscheinlichkeiten sind nicht anschaubar |
| Bewegungssimulation | Unit mit Aufzeichnung | Client und Server müssen übereinstimmen |
| Modifikatorkette | Unit | Reihenfolge entscheidet über alle Werte |
| Content-Validierung | beim Start | fällt sonst beim Spieler auf |
| Protokoll | Rundlauftest | |
| Handel | Nebenläufigkeitstest | Duplikationsgefahr |
| Serverautorität | Angriffstests | |
| UI | manuell | automatisierte UI-Tests kosten mehr, als sie hier finden |
| Grafik | manuell + Bildvergleich | |
| Spielgefühl | Spielen | nicht automatisierbar |

**Ausdrücklich nicht angestrebt:** eine Abdeckungsquote. Eine Quote belohnt Tests für
triviale Zugriffsmethoden und sagt nichts über die Bereiche oben.

---

## Ebenen

### Unit-Tests (Vitest)

Der Schwerpunkt liegt in `packages/shared`. Der gesamte Regelteil ist als **reine
Funktionen** entworfen (M0/E5), genau damit er ohne Server, Datenbank und Browser
prüfbar ist.

Bei jedem Meilenstein entstehen die Tests **mit** dem Schritt, nicht danach.

### Integrationstests

Server mit In-Memory-Datenbank, echtem WebSocket, synthetischem Client. Geprüft werden
vollständige Abläufe: anmelden → Aktivität setzen → abmelden → Zeit vorstellen →
anmelden → Ertrag prüfen.

### Simulationstests

Der Balancing-Simulator aus M13/S-13.1 ist auch ein Testwerkzeug: Er spielt 100
simulierte Stunden und meldet Auffälligkeiten — negative Werte, Überläufe, nicht
erreichbare Freischaltungen, Charaktere ohne Fortschritt.

### Manuelle Prüfliste

Pro Meilenstein die Abnahmekriterien seiner Schritte. Die Kriterien sind absichtlich als
überprüfbare Sätze formuliert („nach Serverneustart ist der Wert erhalten"), nicht als
Absichten.

---

## Die fünf Tests, die am meisten wert sind

Wenn Zeit knapp wird, sind das die letzten, die gestrichen werden:

1. **Zeitraum-Äquivalenz** (M5/S-5.4)
   Eine Abrechnung über 10 Stunden ergibt dasselbe wie 1200 Abrechnungen über 30
   Sekunden. Sichert `remainderMs` und damit den gesamten Idle-Fortschritt.

2. **Betriebsart-Äquivalenz im Kampf** (M6/S-6.5)
   Beobachtet, unbeobachtet und offline ergeben über eine Stunde denselben Ertrag ±10 %.
   Ohne diesen Test driften die drei Wege auseinander, und Spieler merken es zuerst.

3. **Bewegungsgleichheit Client/Server** (M2/S-2.3)
   600 Ticks aufgezeichneter Eingabe ergeben auf beiden Seiten dieselbe Endposition.
   Verhindert dauerndes Zurückziehen der Figur.

4. **Inventarerhaltung** (M4/S-4.2)
   Eigenschaftstest: Nach beliebigen Operationsfolgen ist die Summe aller Gegenstände in
   Inventar, Welt und Postfach unverändert.

5. **Markt-Nebenläufigkeit** (M10/S-10.8)
   100 gleichzeitige Kaufversuche auf dasselbe Angebot verkaufen es genau einmal.

---

## Automatische Prüfungen

Laufen bei jedem Commit, nicht auf Zuruf:

| Prüfung | Prüft |
|---|---|
| `typecheck` | TypeScript strict über alle Pakete |
| `test` | alle Unit- und Integrationstests |
| `content:validate` | alle JSON-Dateien inklusive Querverweise |
| `deps:check` | `shared` importiert nichts; `client` und `server` kennen sich nicht |
| `sql:dialect` | keine SQLite-spezifische Syntax (Voraussetzung für M10/S-10.5) |
| `assets:validate` | ab M12: Zellgröße, Anker, Palette, leere Frames |

**`deps:check` und `sql:dialect` sind Architekturprüfungen.** Sie verhindern genau die
zwei Verstöße, die still passieren und teuer werden: eine DOM-Abhängigkeit in `shared`
(bricht die Steam-Vorbereitung aus `docs/24` §24.5) und SQLite-Syntax in einer Abfrage
(bricht die Postgres-Umstellung).

---

## Fehlerklassen und Reaktion

| Klasse | Beispiel | Reaktion |
|---|---|---|
| **Fortschrittsverlust** | Item verschwindet, XP geht verloren | sofort, alles andere wartet |
| **Blockade** | Quest nicht abschließbar, Portal nicht passierbar | binnen 24 h |
| **Wirtschaftsfehler** | Duplikation, negatives Gold | sofort, betroffene Funktion abschalten |
| **Balancing** | Gegner zu stark | nächster Balancing-Durchgang |
| **Darstellung** | Sprite versetzt | nächster Asset-Durchgang |

**Bei Wirtschaftsfehlern gilt:** erst die Funktion abschalten, dann untersuchen. Ein
laufender Duplikationsfehler ist nach einer Stunde nicht mehr reparabel, ohne
Spielständen zu schaden.

---

## Reproduzierbarkeit

Der gesäte Zufallsgenerator aus M0/S-0.3 ist keine Formalie: Ein Fehlerbericht mit Seed
und Zeitstempel lässt sich nachspielen. Ohne ihn ist jeder Bericht über Beute, Kampf oder
Drops unprüfbar.

**Regel:** `Math.random()` kommt im Spielcode nicht vor. Die Prüfung dafür läuft in
`deps:check`.
