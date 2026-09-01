# Offene Entscheidungen

Punkte, die der Plan **nicht** einseitig entscheidet, weil sie das Spielgefühl oder die
Designabsicht betreffen — nicht die Technik.

Jeder Punkt nennt, **wann** er spätestens beantwortet sein muss. Wird er dann nicht
beantwortet, gilt die genannte Vorgabe, und der Plan macht damit weiter.

| Status | Bedeutung |
|---|---|
| **blockiert** | Ohne Antwort kann der genannte Meilenstein nicht beginnen |
| **offen** | Vorgabe greift, Änderung später möglich, aber mit Kosten |
| **entschieden** | Antwort liegt vor, hier vermerkt |

---

## O1 — Technikstack bestätigen

**Status:** entschieden – empfohlener Stack am 2026-09-01 umgesetzt
**Betrifft:** [00-grundlagen-und-entscheidungen.md](00-grundlagen-und-entscheidungen.md)

TypeScript, Fastify, WebSocket, SQLite → Postgres, Drizzle, eigener Canvas-Renderer, kein
Spiel-Framework. Alles begründet, aber nichts davon alternativlos.

**Wenn ein Framework gewünscht ist** (Phaser, PixiJS), muss das **vor M2** feststehen.
Danach ist der Renderer verwachsen.

---

## O2 — Bewegungs-Preset

**Status:** entschieden – `IdleOn-nah` am 2026-09-01 übernommen
**Betrifft:** `prototypes/01-side-view-movement`

Der Prototyp bietet vier Presets: *IdleOn-nah*, *Snappy*, *Floaty*, *Roh*. Die
`NOTES.md` führt die Erkenntnis als **offen**.

**Zu tun:** Prototyp starten, Testparcours mit allen Presets durchspielen, eines wählen,
die 21 Parameter als Zahlenwerte festhalten. Das ist eine halbe Stunde und bestimmt, wie
sich das Spiel für immer anfühlt.

**Vorgabe ohne Entscheidung:** *IdleOn-nah*, weil es die Voreinstellung ist und dem
Zielgefühl aus `docs/06` §6.2 am nächsten kommt.

---

## O3 — Charakterplätze und ihre Freischaltung

**Status:** offen, benötigt bis M3/S-3.2
**Betrifft:** `docs/03` §3.1 (5–8 Charaktere)

Das GDD nennt die Spanne, nicht den Weg dorthin.

Möglichkeiten: über Charakterlevel, über Gesamtfortschritt, über Herausforderungen, über
Währung, über Echtgeld (`docs/21` §21.5 erlaubt Komfortkäufe).

**Vorgabe:** Start mit 3. Plätze 4 und 5 über Spielfortschritt (erster Boss, zweite
Region). Plätze 6 bis 8 später über Endgame-Fortschritt oder optionalen Kauf.

---

## O4 — Offline-Effizienz

**Status:** offen, entschieden in M13/S-13.1
**Betrifft:** `docs/07` §7.8, `docs/24` §24.10

Das GDD sagt „reduziert" und überlässt die Zahl der Entwicklung.

**Vorgabe bis M13:** 50 %. Der Balancing-Simulator liefert die Grundlage für die
endgültige Zahl.

**Zu bedenken:** Zu niedrig macht Idle wertlos und widerspricht `docs/07` §7.16. Zu hoch
macht aktives Spielen sinnlos. 40–60 % ist der Bereich, in dem vergleichbare Spiele
liegen.

---

## O5 — Split-Screen-Steuerung

**Status:** offen, benötigt bis M10/S-10.2
**Betrifft:** `docs/03` §3.9, `docs/02` §2.6

`docs/03` §3.9 sagt „alle Charaktere können sich gleichzeitig bewegen und kämpfen", ohne
zu sagen, wie das mit einer Tastatur gehen soll.

**Vorgabe:** Fokus plus Automatik — ein Fenster wird voll gesteuert, die anderen kämpfen
automatisch, Fokuswechsel ohne Verzögerung. Mit vier Gamepads echte Parallelsteuerung.

**Empfehlung:** Vor der Umsetzung als Prototyp prüfen. Es ist die einzige
Steuerungsfrage im Projekt, die sich nicht aus dem GDD ableiten lässt, und sie
entscheidet, ob Split-Screen Spaß macht oder Verwaltungsarbeit ist.

---

## O6 — Bank oder gemeinsames Lager

**Status:** offen, benötigt bis M8
**Betrifft:** `docs/03` §3.13, `docs/09` §9.15, `docs/22` §22.7

Die `docs/` kennen **keine** Bank. Stattdessen: begrenzter Rucksack, überschüssige
Gegenstände liegen in der Welt und können später geholt werden.

Das ist ungewöhnlich und wirkt wie eine Auslassung — ist aber in drei Dokumenten
konsistent beschrieben und deshalb vermutlich Absicht: Die Bodenablage macht
Idle-Produktion **sichtbar** und bindet sie an Orte, statt sie in ein Menü zu verlagern.

**Vorgabe:** keine Bank. Die Bodenablage aus M4/S-4.3 ist die Antwort.

**Falls sich das im Spiel als lästig erweist**, ist die kleinste Ergänzung ein
**Lager im Dorf** — ein Ort, kein Menü. Das bliebe im Rahmen von `docs/12` §12.9.

---

## O7 — Prestige / Ascension

**Status:** offen, nach M13
**Betrifft:** `docs/01` §1.8, `docs/20` §20.14

`docs/01` §1.8 nennt es als Möglichkeit für das Endgame. `docs/20` §20.14 relativiert es
zu einem „kleinen allgemeinen Bonus", der das Balancing nicht dominieren soll.

**Der Widerspruch:** Ein Charakter-Reset steht gegen `docs/03` §3.15
(Charakteridentität), `docs/03` §3.11 (permanente Entscheidungen) und `docs/19` §19.19
(kein Fortschrittsverlust).

**Vorgabe:** Nicht im ersten Release. Falls doch, dann als **kontobezogener** Bonus, der
keinen Charakter zurücksetzt — das erfüllt §20.14 ohne §3.15 zu brechen.

---

## O8 — Umfang der Klassen

**Status:** offen, benötigt bis M7/S-7.2
**Betrifft:** `docs/04` §4.4, §4.5

`docs/04` beschreibt drei Stufen, nennt aber keine Gesamtzahl und warnt gleichzeitig vor
zu vielen Klassen zu früh (§4.5).

**Vorgabe:** 3 / 9 / ~20 über drei Stufen (Level 10 / 25 / 45). Stufe 3 erst in M9, wenn
es Inhalte gibt, an denen sich Endklassen beweisen können.

**Zu bedenken:** Jede Endklasse braucht mindestens eine eigene Fähigkeit, um sich nicht
wie eine Zahlenvariante anzufühlen (`docs/06` §6.6). Bei 20 Endklassen sind das 20
Fähigkeiten. Weniger Klassen mit mehr Eigenheit sind vermutlich die bessere Wahl.

---

## O9 — Skill-Obergrenze

**Status:** offen, benötigt bis M5/S-5.1
**Betrifft:** `docs/19` §19.4, `docs/20` §20.7

Das Charakterlevel ist ausdrücklich unbegrenzt. Für Skills sagt das GDD nichts.

**Vorgabe:** 100, weil an Skill-Level Freischaltungen hängen (`docs/08` §8.5: Stufen 1,
20, 50) und eine unbegrenzte Skala ohne Inhalt darüber leer wäre.

`docs/20` §20.7 spricht von „sehr hohem Skill" für besondere Ressourcen — das passt
innerhalb von 100. Die Grenze anzuheben ist später eine Zahl, kein Umbau.

---

## O10 — Erster externer Test

**Status:** offen, empfohlen nach M6
**Betrifft:** Vorgehen

Nach M6 läuft der komplette Kernloop: mehrere Charaktere, parallele Aktivitäten, Kampf,
Idle, Inventar. Das ist Tag 36–46.

**Empfehlung:** Dort zwei bis drei Personen spielen lassen, bevor M7 bis M9 rund 25
weitere Tage in Klassen, Ausrüstung und Welt investieren. Die teuerste Version dieses
Fehlers ist, das Grundgefühl erst nach M12 zu prüfen.

---

## O11 — Zielgruppe und Sprache

**Status:** offen, benötigt bis M11/S-11.6
**Betrifft:** Textinhalte

Die `docs/` sind auf Deutsch; das Spiel ist damit implizit deutschsprachig. Für ein MMO
mit Markt und Ranglisten ist die Spielerbasis dann klein.

**Vorgabe:** Deutsch zuerst. Ab M11 liegen alle Texte in Sprachdateien, sodass Englisch
später eine Übersetzung ist und kein Umbau.

---

## O12 — Direkter Spielerhandel

**Status:** offen, benötigt bis M10/S-10.8
**Betrifft:** `docs/17` §17.3, §17.6, §17.9

`docs/17` §17.3 sagt, Spieler sollen grundsätzlich miteinander handeln können. §17.6
nennt den Markt als Weg, der keinen permanenten Kontakt erfordert. Ob es **zusätzlich**
einen direkten Tausch zwischen zwei Spielern geben soll, sagt das GDD nicht.

**Vorgabe:** nur Markt. Das spart eine zweite Handelsoberfläche mit eigenem
Bestätigungsablauf und schließt Betrug durch vorgetäuschte Tauschgeschäfte aus.

**Dagegen spricht:** Ein gezielter Tausch unter Bekannten ist über den Markt umständlich
(einstellen, hoffen, dass niemand anders kauft). Falls das gewünscht ist, ist der
kleinste Weg ein **gerichtetes Angebot**, das nur ein bestimmter Spieler kaufen kann —
das nutzt den bestehenden Markt und braucht keine neue Oberfläche.

---

## Änderungsprotokoll

| Datum | Punkt | Entscheidung |
|---|---|---|
| — | — | — |
