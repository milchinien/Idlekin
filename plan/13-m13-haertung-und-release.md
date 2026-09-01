# M13 — Balancing, Sicherheit, Performance und Veröffentlichung

**Ziel:** Aus einem vollständigen Spiel wird ein auslieferbares Spiel.

**Aufwand:** 10–14 Tage
**Vorbedingungen:** M12
**GDD-Bezug:** `docs/19`, `docs/20-endgame.md`, `docs/21-monetarisierung.md`,
`docs/24` §24.15, §24.16, `docs/26` Phasen 26–31

---

## Schritte

### S-13.1 Balancing

**Was:** Alle bis hierher als *vorläufig* markierten Zahlen festlegen.

**Dateien:** `packages/shared/src/rules/*Constants.ts`, `content/**`

**Details:**

Zu prüfen nach `docs/26` Phase 26:

| Bereich | Zielgröße |
|---|---|
| Charakter-XP-Kurve | Level 1→10 in ~1 h, 10→25 in ~8 h, 25→50 in ~40 h |
| Skill-XP-Kurven | Skill 50 in ~20 h gezielter Arbeit |
| Gegnerstärke je Gebiet | passend zum erwarteten Level, Kampf dauert 3–8 s |
| Bossstärke | allein anspruchsvoll, zu viert machbar |
| Ressourcenproduktion | ein Rezept braucht ~15–30 min Sammeln |
| Crafting-Zeiten | 5 s bis 5 min, mit Skill sinkend |
| Dropchancen | seltene Ausrüstung ~2 %, Bossbeute ~25 % je Einzelstück |
| Ausrüstungswerte | Stufenwechsel spürbar, aber nicht erdrückend |
| Klassenstärke | keine Klasse dominiert; alle Wege gangbar |
| **Offline-Effizienz** | offen seit M5 — **hier entschieden** |
| Wirtschaft | Goldzufluss und -abfluss ausgeglichen |

**Vorgehen — Werkzeug statt Gefühl:**

1. **Simulator** (`tools/balance-sim.mjs`): spielt ohne Renderer 100 simulierte
   Spielstunden verschiedener Spielweisen durch und gibt Level, Skills, Ausrüstung und
   Gold aus. Das kostet einen Tag und ersetzt Wochen Handprobe.
2. **Vergleich der Wege:** Reiner Kämpfer, reiner Sammler, Crafter und Mischform müssen
   nach 50 Stunden vergleichbar weit sein. `docs/26` Phase 26 fordert ausdrücklich, dass
   keine Spielweise die einzige richtige ist.
3. **Offline gegen online:** Der Faktor wird so gewählt, dass aktives Spielen sich lohnt,
   ohne Idle-Spieler abzuhängen. Ausgangswert 50 %, Prüfung über den Simulator.

**Grundsätzlich:** Balancing ändert **Content und Konstanten**, keinen Code. Muss dafür
Code geändert werden, war eine Zahl an der falschen Stelle — das wird korrigiert, statt
umgangen.

**Fertig wenn:** Der Simulator zeigt für vier Spielweisen vergleichbaren Fortschritt;
keine Zahl im Projekt trägt noch die Markierung *vorläufig*.

---

### S-13.2 Authentifizierung

**Was:** Die Entwicklungsanmeldung aus M1/S-1.3 durch eine echte ersetzen.

**Dateien:** `packages/server/src/net/auth.ts`

**Details:** E-Mail plus Passwort mit **Argon2id**, Sitzungstoken mit begrenzter
Lebensdauer und Erneuerung, Ratenbegrenzung bei Anmeldeversuchen,
Passwortzurücksetzung per E-Mail.

`IDLEKIN_ALLOW_DEV_AUTH` wird in Produktion nicht gesetzt und der Server verweigert den
Start, wenn beides gleichzeitig aktiv wäre.

**Fertig wenn:** Registrierung, Anmeldung, Abmeldung, Zurücksetzung funktionieren; die
Entwicklungsanmeldung ist in Produktion nicht erreichbar.

---

### S-13.3 Serverseitige Absicherung

**Was:** Systematische Prüfung, dass der Client nirgends Fortschritt erzeugt.

**Details:** `docs/24` §24.16 nennt Ressourcen, Währung, Gegenstände, Erfahrung, Level,
Handel, Crafting und Drops.

**Vorgehen:** Ein bewusst manipulierter Client, der Grenzen verletzt, und für jeden
Angriff ein Test:

| Angriff | Erwartung |
|---|---|
| Bewegung außerhalb der Gebietsgrenzen | Server korrigiert |
| Angriff aus 1000 px Entfernung | abgelehnt |
| Portal ohne erfüllte Herausforderung | abgelehnt |
| Fähigkeit während der Abklingzeit | abgelehnt |
| Item ausrüsten ohne Voraussetzung | abgelehnt |
| Crafting ohne Material | abgelehnt |
| Kauf ohne Gold | abgelehnt |
| Minispiel-Bonus über dem Maximum | begrenzt |
| Nachricht mit fehlerhafter Struktur | Verbindung getrennt, kein Absturz |
| 10 000 Nachrichten pro Sekunde | Ratenbegrenzung greift |

**Fertig wenn:** Alle Angriffe schlagen fehl und sind als automatischer Test hinterlegt.

---

### S-13.4 Persistenz und Sicherung

**Was:** Spielstände dürfen nicht verloren gehen.

**Details:** Nach `docs/26` Phase 27:

- Tägliche automatische Sicherung, sieben Tage vorgehalten
- Nachvollziehbares Protokoll für alle wertbehafteten Vorgänge (Handel, Beute, Crafting)
  über 30 Tage — die Grundlage jeder Beschwerdebearbeitung
- Wiederherstellungsverfahren **einmal geprobt**, nicht nur beschrieben
- Migrationen sind vorwärts sicher und werden auf einer Kopie der Produktionsdaten
  getestet

**Fertig wenn:** Eine Sicherung wurde erfolgreich zurückgespielt; das Protokoll beantwortet
die Frage „wo kommt dieses Item her" für einen beliebigen Gegenstand.

---

### S-13.5 Performance

**Was:** Messen, dann optimieren. Nicht umgekehrt.

**Details:** Nach `docs/26` Phase 28. Zielwerte:

| Größe | Ziel |
|---|---|
| Server-Tick | < 25 ms bei 100 gleichzeitigen Spielern |
| Offline-Abrechnung | < 200 ms für 8 Charaktere über 48 h |
| Client-Bildrate | 60 bei Einzelansicht, 60 bei vier Ansichten |
| Ladezeit erstes Bild | < 3 s |
| Bandbreite | < 20 kB/s je Spieler im aktiven Gebiet |
| Speicher Server | < 500 MB bei 100 Spielern |

**Zuerst messen.** Die Tickmessung aus M1/S-1.7 und die Fenstermessung aus M10/S-10.1
liefern die Grundlage. Optimiert wird, was die Messung zeigt — nicht, was man vermutet.

**Wahrscheinliche Kandidaten**, nach Erwartungswert:

1. Datenbankabfragen ohne Index (Markt, Ranglisten)
2. Vollständige Snapshots statt Differenzen bei vielen Spielern im Gebiet
3. Tile-Zeichnen ohne Vorrendern der statischen Ebenen
4. Idle-Abrechnung, die über Gegenstände schleift statt zu bündeln

**Fertig wenn:** Alle Zielwerte werden mit einem Lasttest über 100 simulierte Spieler
erreicht.

---

### S-13.6 Endgame

**Was:** Die Inhalte, die nach dem Ende der geplanten Progression tragen.

**Details:** Nach `docs/20`:

- **Zwei bis drei Endgame-Gebiete** mit sehr starken Gegnern und seltenen Ressourcen
- **Zwei Endgame-Bosse** mit vier Phasen, wiederholbar
- **Endgame-Rezepte**, die Materialien aus allen Bereichen verlangen — Kampf, Sammeln,
  Bosse. Das ist der Mechanismus, mit dem `docs/20` §20.12 das ganze Team relevant hält.
- **Endgame-Verzauberungen** mit stärkerer Spezialisierung (`docs/20` §20.9)
- **Kleiner Gesamtbonus** nach `docs/20` §20.14 — ausdrücklich klein, kein neuer
  Spielweg, kein Prestige-Neustart im ersten Wurf

**Zum Prestige-/Ascension-System:** `docs/01` §1.8 nennt es als Möglichkeit, `docs/20`
§20.14 relativiert es zu einem kleinen Bonus. **Empfehlung: nicht im ersten Release.**
Ein Zurücksetzen widerspricht `docs/03` §3.15 (Charakteridentität) und `docs/19` §19.19
(kein Fortschrittsverlust). Wenn es kommt, dann als bewusster Nachfolgeschritt mit
eigenem Entwurf — siehe [99-offene-entscheidungen.md](99-offene-entscheidungen.md).

**Fertig wenn:** Ein Charakter auf Level 60 hat mindestens 40 Stunden sinnvolle Ziele
vor sich.

---

### S-13.7 Monetarisierung

**Was:** Die Struktur aus `docs/21`, ohne die Philosophie zu brechen.

**Details:**

`docs/21` §21.10: *Free-to-Play + erspielbare Vorteile + optionale Echtgeldkäufe + kein
direkter Pay-to-Win-Zwang.*

Umsetzbar innerhalb dieser Grenzen:

- Zusätzliche Charakterplätze über die Grundausstattung hinaus
- Zeitersparnis (`docs/21` §21.5): Erhöhung der Offline-Effizienz, sofortiger Abschluss
  von Crafting
- Kosmetik ohne Werteinfluss

**Ausgeschlossen**, weil dem GDD widersprechend:

- Werte oder Ausrüstung, die es nur gegen Geld gibt (§21.4)
- Umgehung der Klassenwahl (§21.7, `docs/03` §3.11)
- Echtgeldwährung im Spielermarkt (§21.8)

**Empfehlung:** Im ersten Release **keine Kaufmöglichkeit einbauen**, nur die technische
Trennung von Konto und Berechtigungen vorbereiten. Monetarisierung vor der ersten
Nutzerrückmeldung festzulegen bedeutet, gegen Vermutungen zu balancieren.

**Fertig wenn:** Die Kontostruktur trägt spätere Berechtigungen; keine
Kaufmöglichkeit ist aktiv.

---

### S-13.8 Testversion und Fehlerbehebung

**Was:** Der Durchlauf, der zeigt, was wirklich fehlt.

**Details:** Nach `docs/26` Phasen 29 und 30.

- **Vollständiger Durchlauf** von der Registrierung bis zum ersten Endgame-Boss, mit
  Protokoll jeder Reibungsstelle
- **Geschlossener Test mit 10–20 Personen** über zwei Wochen
- **Fehlermeldeweg** im Spiel: Beschreibung plus automatisch angehängter Zustand
- Priorisierung: Fortschrittsverlust > Blockade > Wirtschaftsfehler > Balancing >
  Darstellung

**Fertig wenn:** Kein bekannter Fehler mit Fortschrittsverlust oder Blockade ist offen;
alle Testpersonen haben ohne Hilfe Level 25 erreicht.

---

### S-13.9 Steam-Vorbereitung

**Was:** Die Desktop-Version.

**Details:** Nach `docs/26` Phase 31 und `docs/24` §24.5.

**Verpackung:** Tauri statt Electron — deutlich kleineres Paket, und der Client ist
ohnehin eine Webanwendung ohne Node-Abhängigkeiten. Die Trennung aus M0/E5 (`shared`
kennt kein DOM) zahlt sich hier aus.

Zu klären:

- Steam-Anmeldung mit dem Spielkonto verknüpfen
- Vollbild, Auflösungen, ganzzahlige Skalierung auf allen Seitenverhältnissen
- Gamepad-Steuerung vollständig (Grundlage aus M10/S-10.2)
- Steam-Errungenschaften aus vorhandenen Fortschrittszählern
- Automatische Aktualisierung
- Verhalten ohne Verbindung: klare Meldung, kein stiller Fehlschlag

**Fertig wenn:** Ein signierter Desktop-Build startet, verbindet sich, ist vollständig
mit Gamepad bedienbar und läuft in allen Auflösungen ohne Skalierungsfehler.

---

## Ergebnis

Ein ausbalanciertes, abgesichertes, performantes Spiel mit Endgame, das im Browser läuft
und als Desktop-Version vorbereitet ist.

---

## Danach

Was bewusst **nicht** Teil dieses Plans ist und einen eigenen Entwurf braucht:

- Prestige-/Ascension-System (`docs/01` §1.8, `docs/20` §20.14)
- Saisonale Inhalte, Ereignisse
- Gilden oder Gruppenspiel — `docs/18` §18.3 schließt sie derzeit aus
- Mobile Version
- Weitere Sprachen (Grundlage liegt seit M11/S-11.6)
