# M5 — Berufe und Idle-System

**Ziel:** Charaktere arbeiten selbstständig an Ressourcenpunkten weiter — während der
Spieler einen anderen Charakter steuert und während er das Spiel geschlossen hat.

**Aufwand:** 8–10 Tage — der aufwendigste Meilenstein bis M9
**Vorbedingungen:** M4
**GDD-Bezug:** `docs/07-idle-system.md` (gesamt), `docs/08-berufe.md`,
`docs/09-ressourcen.md`, `docs/24` §24.9–§24.11, `docs/25` §25.12, §25.13, §25.19,
`docs/26` Phasen 4 (Rest), 9, 21

**Das ist der Meilenstein, in dem Idlekin zu Idlekin wird.** Alles davor ist ein
gewöhnliches 2D-Spiel mit Speicherstand.

---

## Der zentrale Entwurf: Integration statt Simulation

`docs/24` §24.11 verlangt, dass Idle-Fortschritt **aus der Zeitdifferenz berechnet** und
nicht Sekunde für Sekunde simuliert wird. Diese eine Entscheidung bestimmt die gesamte
Bauweise dieses Meilensteins.

Eine Idle-Aktivität ist deshalb kein Prozess, sondern **ein Zeitstempel plus eine
Rechenvorschrift**:

```text
gespeichert:  { aktivität, gestartetAm, zuletztAbgerechnetAm }
              +
gefragt:      "wie spät ist es jetzt?"
              ↓
ergibt:       Ressourcen, XP, Drops für den Zeitraum dazwischen
```

**Daraus folgt die wichtigste Eigenschaft des Systems:** Es ist völlig gleichgültig, ob
zwischen zwei Abrechnungen 50 Millisekunden oder 40 Stunden liegen. Online-Idle und
Offline-Idle sind **derselbe Code**, aufgerufen mit unterschiedlichen Zeiträumen und
unterschiedlichem Effizienzfaktor.

Wer das trennt und für Offline eine zweite Berechnung schreibt, bekommt zwei Systeme,
die auseinanderdriften, und Spielerberichte der Form „offline bekomme ich mehr als
online". Diese Falle ist der Grund, warum dieser Abschnitt hier so ausführlich steht.

**Abgerechnet wird bei:** Charakterwechsel, Aktivitätswechsel, Anmeldung, Abmeldung,
Speicherzeitpunkt (alle 30 s), Inventarabfrage und Level-relevanten Ereignissen.

---

## Abweichung vom GDD-Plan

`docs/26` trennt Berufe (Phase 9) und Offline-Idle (Phase 21) um zwölf Phasen. Hier
werden sie zusammengezogen, weil sie nach obiger Bauweise **dieselbe Berechnung** sind.
Offline erst in Phase 21 zu bauen hieße, die Abrechnung zweimal zu entwerfen.

Der 48-Stunden-Deckel und der Offline-Effizienzfaktor aus `docs/07` §7.8/§7.9 sind
lediglich Parameter dieser Berechnung.

---

## Schritte

### S-5.1 Skills

**Was:** Neun Skills pro Charakter mit eigener XP und eigenem Level.

**Dateien:**

- `packages/shared/src/types/skills.ts`
- `packages/shared/src/rules/skillExperience.ts`
- `packages/server/migrations/0004_skills.sql`

**Details:**

Skills nach `docs/25` §25.5: Holzfäller, Mining, Angeln, Landwirtschaft, Kochen,
Schmieden, Alchemie, Verzaubern, Kampf.

Speicherung als eigene Tabelle `character_skills (characterId, skillId, level,
experience)`, nicht als JSON. Grund: Ranglisten nach höchstem Berufsskill
(`docs/18` §18.7, `docs/20` §20.11) brauchen Sortierung in der Datenbank.

Kurve, getrennt von der Charakter-XP-Kurve, weil Skills sich anders anfühlen sollen —
schnell am Anfang, deutlich langsamer oben:

```ts
skillXpToNext(n) = round(80 * n^1.42)
```

Beispiele: 1→2: 80, 20→21: 5 631, 50→51: 20 684, 99→100: 54 562.

**Vorläufig.** Balancing in M13.

**Skill-Level-Obergrenze:** 100. Anders als das Charakterlevel (`docs/19` §19.4:
unbegrenzt) sind Skills gedeckelt, weil an sie **Freischaltungen** gebunden sind
(`docs/08` §8.5: Skill 1 / 20 / 50). Eine unbegrenzte Skala ohne Inhalt darüber wäre
leer. Wenn das Endgame (`docs/20` §20.7) mehr braucht, wird die Grenze angehoben — das
ist eine Zahl, kein Umbau.

**Fertig wenn:** Skills werden geladen, gespeichert, steigen korrekt, und ein Mehrfach-
aufstieg aus einem großen Offline-Ertrag funktioniert in einem Aufruf.

---

### S-5.2 Ressourcenpunkte in der Welt

**Was:** Bäume, Erzadern, Angelstellen und Felder als dauerhafte Weltobjekte.

**Dateien:**

- `packages/shared/src/types/resourceNode.ts`
- `packages/shared/src/content/resourceSchema.ts`
- `content/resources/*.json`
- Gebietsdateien bekommen `nodes` gefüllt

**Details:**

Nach `docs/25` §25.19:

```jsonc
{
  "id": "node.tree.oak",
  "name": "Eiche",
  "skill": "woodcutting",
  "requiredSkillLevel": 1,
  "requiredTool": "tool.axe",
  "baseTimeMs": 3000,
  "drops": [ { "itemId": "item.wood.oak", "min": 1, "max": 2, "chance": 1.0 } ],
  "xp": { "skill": 12, "character": 4 },
  "attributeXp": { "dexterity": 1, "strength": 1 },
  "sprite": "node/tree_oak"
}
```

**Ressourcenpunkte werden nicht zerstört** (`docs/08` §8.5, `docs/12` §12.7). Kein
Abbau-Zustand, kein Nachwachsen, keine Konkurrenz zwischen Spielern
(`docs/18` §18.6). Das ist eine bewusste Vereinfachung des Designs und macht das
Idle-System deutlich einfacher — es gibt keinen Grund, davon abzuweichen.

**Mehrere Charaktere an einem Punkt** sind erlaubt, auch von verschiedenen Spielern. Sie
stehen versetzt, damit die Silhouetten lesbar bleiben (`docs/27` §27.5).

**`attributeXp`** setzt `docs/05` §5.7 und `docs/08` §8.4 um: Die Hauptaktivität gibt
viel Skill-XP und kleine Attributfortschritte. Die Werte stehen im Ressourcendatensatz,
nicht im Code — sonst ist jede Balancingänderung eine Codeänderung.

**Fertig wenn:** Mindestens zehn Ressourcenpunkte über drei Gebiete sind definiert, alle
vier Sammelberufe sind vertreten, und ein Charakter kann sich sichtbar daneben stellen.

---

### S-5.3 Aktivität zuweisen

**Was:** Ein Charakter wird einem Ressourcenpunkt zugewiesen und bleibt dort.

**Dateien:**

- `packages/server/src/systems/activitySystem.ts`
- `packages/client/src/ui/activityPrompt.ts`
- Protokoll: `{ t: 'setActivity', characterId, activity }`

**Details:**

Ablauf: Spieler läuft zum Baum → Aufforderung erscheint → bestätigt → Server prüft
Nähe (≤ 48 px), Skill-Anforderung und Werkzeug → setzt Aktivität → Charakter beginnt
sichtbar zu arbeiten.

**Beim Wechsel der Aktivität wird die alte zuerst abgerechnet.** Sonst geht der
angefangene Zeitraum verloren.

**Fehlt die Voraussetzung**, sagt die Antwort **warum**: „Benötigt Holzfäller 20 (du hast
14)" statt „nicht möglich". `docs/07` §7.13 und `docs/22` §22.14 machen die
Skill-Anforderungen zu einem sichtbaren Fortschrittsziel — dazu muss der Spieler die
Zahl sehen.

**Der Charakter bleibt beim Abmelden zugewiesen.** Genau das ist der Sinn
(`docs/07` §7.3).

**Fertig wenn:** Zuweisen, Wechseln und Beenden funktionieren; die Zuweisung überlebt
Abmelden und Serverneustart; zu niedriger Skill wird mit konkreter Zahl abgelehnt.

---

### S-5.4 Idle-Abrechnung

**Was:** Das Herzstück. Aus einem Zeitraum werden Ressourcen, XP und Drops.

**Dateien:**

- `packages/shared/src/rules/idleYield.ts` ← reine Funktion, testbar
- `packages/server/src/systems/idleSystem.ts` ← wendet an, schreibt, verteilt

**Details:**

```ts
function computeYield(
  activity: Activity,
  node: ResourceNode,
  character: CharacterStats,
  fromMs: number,
  toMs: number,
  efficiency: number,      // 1.0 online, kleiner offline
  rng: SeededRandom,
): YieldResult                // { items, skillXp, characterXp, attributeXp, actions }
```

Berechnung in Schritten:

1. **Zykluszeit**
   `zeit = node.baseTimeMs / (1 + skillBonus + attributBonus + werkzeugBonus + klassenBonus)`
   Untergrenze: 400 ms pro Zyklus, damit Formeln nicht gegen null laufen.
2. **Zyklenzahl** `n = floor((toMs - fromMs) * efficiency / zeit)`
3. **Marker vorrücken:** `lastYieldAt = fromMs + n * zeit / efficiency` — **nicht** auf
   `toMs`. Die Differenz zu `toMs` ist der angefangene, noch nicht bezahlte Teilzyklus
   und bleibt dadurch erhalten.
   **Wird stattdessen auf `toMs` gesetzt, verliert der Spieler bei jeder Abrechnung
   einen Teilzyklus** — bei 30-Sekunden-Takt und 3-Sekunden-Zyklus bis zu 10 %. Das ist
   der häufigste Fehler in Idle-Spielen und deshalb hier ausdrücklich benannt.
   Ein separates Restfeld gibt es nicht: Der Marker trägt den Rest bereits, und zwei
   Felder für dieselbe Information driften irgendwann auseinander.
4. **Beute** `n`-fache Auswürfelung der Drop-Tabelle. Bei großem `n` (offline) wird
   nicht `n`-mal gewürfelt, sondern über die Binomialverteilung gezogen — bei 40 Stunden
   und 3 Sekunden Zyklus wären das 48 000 Würfe pro Charakter.
5. **XP** `n * node.xp.*`, Attribut-XP entsprechend.
6. **Einlagern** über `inventory.add`. Der **Rest fällt am Ressourcenpunkt zu Boden**
   (M4/S-4.3) — `docs/07` §7.11 und `docs/09` §9.15.

**Effizienzfaktoren** nach `docs/09` §9.11: Skill-Level, Attribute, Klasse, Werkzeug,
Ausrüstung, Buffs. In M5 wirken **Skill und Werkzeug**; Attribute und Klasse kommen in
M7 dazu, Ausrüstung in M8. Die Formel enthält alle Terme von Anfang an, sie sind nur
zunächst null.

**Fertig wenn:**

- Ein Charakter am Baum produziert online sichtbar Holz
- 30 Sekunden Abwesenheit und 30 Sekunden Anwesenheit ergeben denselben Ertrag
- Eine Abrechnung über 10 Stunden in einem Aufruf liefert dasselbe wie 1200 Abrechnungen
  über je 30 Sekunden (Toleranz: 1 Zyklus)

**Test:** `idleYield.test.ts`. Der letzte Punkt ist der wichtigste Test des ganzen
Projekts — er sichert die Restzeit-Behandlung und die Gleichwertigkeit der Zeiträume.

**Risiko:** Fließkommadrift über tausende Abrechnungen. Deshalb alle Zeiten und auch
`lastYieldAt` als Ganzzahl-Millisekunden.

---

### S-5.5 Parallelbetrieb aller Charaktere

**Was:** Alle Charaktere eines Spielers rechnen gleichzeitig ab, unabhängig davon,
welcher beobachtet wird.

**Dateien:** `packages/server/src/world/playerRuntime.ts`, `idleSystem.ts`

**Details:**

Jeder Charakter mit einer Aktivität wird beim Speicherzeitpunkt (alle 30 s) abgerechnet.
Charaktere in beobachteten Gebieten zusätzlich häufiger, damit die Anzeige lebt.

**Sichtbare Rückmeldung** ist dabei nicht dasselbe wie Abrechnung: Der Client zeigt eine
laufende Fortschrittsanzeige und Animation zwischen den Abrechnungen an, gespeist aus
Zykluszeit und Startzeitpunkt. Die Zahlen springen dabei nicht, weil der Client die
Zwischenwerte **interpoliert und nicht rät**.

`docs/07` §7.2 und `docs/02` §2.5 verlangen genau diesen Zustand: fünf Charaktere in
fünf Gebieten, alle produzierend.

**Fertig wenn:** Fünf Charaktere mit fünf verschiedenen Aktivitäten laufen zwanzig
Minuten; alle Erträge stimmen; das Umschalten zwischen ihnen ändert an den Erträgen
nichts.

---

### S-5.6 Offline-Fortschritt

**Was:** Der 48-Stunden-Deckel, der Effizienzabschlag und die Zusammenfassung beim
Anmelden.

**Dateien:**

- `packages/server/src/systems/offlineSystem.ts`
- `packages/client/src/ui/offlineSummary.ts`

**Details:**

Nach `docs/07` §7.7–§7.10 und `docs/24` §24.10:

| Regel | Wert | Quelle |
|---|---|---|
| Deckel | **48 Stunden** | `docs/07` §7.9 — fest |
| Effizienz offline | **50 %** (vorläufig) | `docs/07` §7.8 — Zahl offen |
| Effizienz online | 100 % | |

Der Effizienzwert steht in `packages/shared/src/rules/idleConstants.ts` und wird in M13
festgelegt. 50 % ist ein Ausgangswert, kein Ergebnis.

**Anmeldeablauf:**

1. Zeitdifferenz seit `lastSeenAt` bestimmen, auf 48 h kappen
2. Für **jeden** Charakter mit Aktivität abrechnen, Effizienz 0,5
3. Ergebnisse sammeln, Inventar füllen, Reste zu Boden legen
4. Zusammenfassung senden

Die Zusammenfassung folgt der Form aus `docs/07` §7.10 — pro Charakter, mit Ressourcen
und XP, plus ausdrücklichem Hinweis, wenn etwas zu Boden gefallen ist oder die Produktion
wegen voller Ablage pausiert hat.

**Manipulationsschutz:** Es zählt **ausschließlich die Serverzeit**. Die Uhr des Clients
wird nirgends verwendet. Springt die Serverzeit rückwärts (NTP-Korrektur), wird die
Differenz als 0 behandelt statt negativ — sonst entstehen negative Erträge.

**Fertig wenn:** Server anhalten, Systemzeit um 10 Stunden vorstellen, starten,
anmelden → Zusammenfassung nennt für jeden arbeitenden Charakter plausible Erträge;
bei 72 Stunden Abwesenheit wird für genau 48 Stunden gutgeschrieben.

**Test:** `offlineSystem.test.ts` mit gefälschter Uhr: 0 h, 1 h, 47 h, 48 h, 72 h,
Rückwärtssprung.

---

### S-5.7 Verarbeitungsberufe als Idle-Aktivität

**Was:** Der Rahmen für Kochen, Schmieden, Alchemie und Verzaubern — als Aktivität, noch
ohne Rezepte.

**Dateien:** `packages/server/src/systems/craftingActivity.ts`

**Details:** `docs/10` §10.14 verlangt, dass Crafting im Idle weiterläuft. Der
Unterschied zum Sammeln: Crafting **verbraucht** Material aus dem Inventar und stoppt,
wenn es leer ist.

In M5 entsteht nur der Aktivitätstyp mit korrektem Anhalten und Fortsetzen. Rezepte,
UI und Skills der Verarbeitungsberufe folgen in M8.

**Fertig wenn:** Eine Attrappen-Aktivität „verbrauche 1 Holz alle 5 Sekunden" läuft,
stoppt bei leerem Vorrat, und die Zusammenfassung nennt den Grund.

---

### S-5.8 Sammel-Minispiele (aktiv)

**Was:** Der aktive Modus mit kleiner Interaktion, wie in `docs/08` §8.6, §8.8, §8.9
beschrieben.

**Dateien:** `packages/client/src/minigames/*`

**Details:**

`docs/07` §7.14: Im Idle-Modus entfällt das Minispiel vollständig. Aktives Spielen darf
**etwas** effizienter sein, aber nicht so viel, dass Idle sich sinnlos anfühlt — das
würde `docs/07` §7.16 widersprechen. Richtwert: aktiv bis **+25 %**.

Wichtige Einschränkung, die den Aufwand klein hält: Das Minispiel entscheidet über einen
**Bonusfaktor**, den der Client als Ergebnis meldet und der Server auf ein plausibles
Maximum begrenzt. Es erzeugt keine Gegenstände. Damit bleibt E2 (Serverautorität)
gewahrt, und ein manipulierter Client gewinnt höchstens die 25 %.

**Empfehlung zur Reihenfolge:** Diesen Schritt **als letzten** in M5 machen und bei
Zeitdruck nach M11 verschieben. Er ist der einzige Teil des Meilensteins, den man
weglassen kann, ohne dass etwas anderes darauf wartet.

**Fertig wenn:** Mindestens Holzfällen hat ein Minispiel, das den Bonus vergibt und
dessen Schwierigkeit mit steigendem Skill sinkt (`docs/08` §8.6).

---

## Ergebnis

Fünf Charaktere arbeiten in fünf Gebieten an fünf verschiedenen Ressourcen. Der Spieler
wechselt zwischen ihnen, schließt das Spiel, kommt am nächsten Tag wieder und bekommt
eine Zusammenfassung dessen, was in seiner Abwesenheit passiert ist.

**Das ist der Punkt, an dem das Spielprinzip aus `docs/01` §1.10 erstmals vollständig
erfahrbar ist** — auch ohne Kampf.

## Nicht in diesem Meilenstein

- Rezepte und Crafting-Ergebnisse (M8)
- Attribute und Klassenboni in der Effizienzformel (M7 — Terme sind vorhanden, aber null)
- Ausrüstungsboni (M8)
- Idle-Kampf (M6)
