# M9 — Welt, Herausforderungen, Quests und Bosse

**Ziel:** Aus zwei Testgebieten wird eine Welt mit Wegen, Zielen, NPCs und Bossen.

**Aufwand:** 10–12 Tage — der inhaltsreichste Meilenstein
**Vorbedingungen:** M8
**GDD-Bezug:** `docs/12-welt.md`, `docs/13-gebiete.md`, `docs/15-bosse.md`,
`docs/16-quests.md`, `docs/25` §25.14–§25.16, §25.21, `docs/26` Phasen 16–19

**Aufwandsverteilung:** rund 40 % Systemcode, 60 % Inhalte. Das ist der erste
Meilenstein, in dem das Bauen von Inhalten die Programmierung überwiegt — die
Vorarbeit aus M0/E6 (alles ist Content) zahlt sich hier aus oder rächt sich.

---

## Schritte

### S-9.1 Herausforderungen

**Was:** Das System, das Gebiete freischaltet.

**Dateien:**

- `packages/shared/src/types/challenge.ts`
- `packages/server/src/systems/challengeSystem.ts`

**Details:**

Nach `docs/25` §25.16 und `docs/13` §13.3:

```jsonc
{
  "id": "challenge.wiese.slimes",
  "name": "Schleimplage",
  "objective": { "kind": "kill", "targetId": "enemy.slime", "amount": 15 },
  "unlocks": ["portal.wiese.wald"]
}
```

Zielarten nach `docs/12` §12.5 und `docs/13` §13.3:
`kill`, `collect`, `skillLevel`, `defeatBoss`, `completeQuest`, `reachArea`.

**Fortschritt ist spielerbezogen, nicht charakterbezogen** (`docs/25` §25.2 führt
freigeschaltete Gebiete unter Spielerdaten, und `docs/16` §16.6 erlaubt ausdrücklich
charakterübergreifenden Fortschritt). Ein Charakter tötet Schleime, ein anderer kann
durchs Portal.

**Zähler steigen automatisch**, auch im Idle-Kampf (`docs/16` §16.11) und in der
Offline-Abrechnung. Der in M6/S-6.4 gesetzte Aufhängepunkt wird jetzt angeschlossen.

**Anzeige über dem Portal** nach `docs/13` §13.4 und `docs/22` §22.13, mit Fortschritt
(„12 / 15"). Der in M2/S-2.6 vorbereitete Ankerpunkt wird jetzt genutzt.

**Fertig wenn:** Schleime töten schaltet ein Portal frei, die Anzeige über dem Portal
zählt mit, und der Fortschritt zählt über alle Charaktere.

---

### S-9.2 Weltaufbau

**Was:** Die eigentlichen Gebiete.

**Dateien:** `content/areas/*.json`, `packages/client/public/bg/*`

**Details:**

Struktur nach `docs/12` §12.3 und ausdrücklich **nicht linear** (`docs/13` §13.12):

```text
                    ┌── Wald ── Tiefer Wald ── Magischer Wald ──┐
Dorf ── Wiese ──────┼── Slime-Wiese ── Monster-Wiese ── Sumpf ──┼── Ruinen
                    └── Kupfermine ── Eisenmine ── Tiefenmine ──┘
                            │                          │
                       [Boss: Waldschrat]        [Boss: Steingolem]
```

Zwölf normale Gebiete, zwei Bossgebiete, drei parallele Wege.

**Umfang in M9: 12 Gebiete und 2 Bossgebiete.** Genug für mehrere Wege, wenig genug, um
sie ordentlich zu bauen. Jedes Gebiet braucht nach `docs/13` §13.16 **mindestens einen
neuen Grund**, es zu besuchen — neue Ressource, neuer Gegner, neue Quest, neues Rezept
oder neue Herausforderung. Ein Gebiet ohne eigenen Grund wird gestrichen, nicht
ausgeliefert.

**Pro Gebiet:** Kollisionsaufbau, zwei bis drei Hintergrundebenen, drei bis acht
Ressourcenpunkte, zwei bis vier Gegnerarten, null bis zwei NPCs, ein bis drei Portale.

**Alte Gebiete bleiben relevant** (`docs/13` §13.13): Ihre Ressourcen werden in späteren
Rezepten weiterverwendet. Das ist eine Regel für den Rezeptentwurf, nicht für den Code —
sie steht hier, damit sie beim Bauen der Inhalte nicht vergessen wird.

**Fertig wenn:** 14 Gebiete sind begehbar, verbunden, gefüllt, und mindestens zwei
unterschiedliche Wege führen von Gebiet 3 zum Endbereich.

---

### S-9.3 NPCs und Questgeber

**Was:** Figuren, mit denen man reden kann.

**Dateien:**

- `packages/shared/src/types/npc.ts`
- `packages/client/src/ui/dialogWindow.ts`

**Details:** NPCs sind Weltobjekte mit Position, Sprite, Namen und einer Liste von
Quests. Über dem Kopf ein Symbol nach `docs/16` §16.12: Quest verfügbar, Quest läuft,
Quest abschließbar.

Dialoge bleiben schlicht: Text und Auswahlmöglichkeiten, kein Dialogbaum mit Zuständen.
`docs/16` §16.1 stellt Quests ausdrücklich als optionale Zusatzziele dar, nicht als
Erzählstrang.

**Fertig wenn:** NPCs stehen in der Welt, sind ansprechbar, zeigen ihren Zustand über
dem Kopf.

---

### S-9.4 Quests

**Was:** Annehmen, Fortschritt, Abgeben, Belohnung, Ketten.

**Dateien:**

- `packages/shared/src/types/quest.ts`
- `packages/server/src/systems/questSystem.ts`
- `packages/client/src/ui/questWindow.ts`
- `content/quests/*.json`

**Details:**

Nach `docs/25` §25.21:

```jsonc
{
  "id": "quest.smith.iron",
  "name": "Der hungrige Schmied",
  "giver": "npc.smith.dorf",
  "requirements": { "level": 5 },
  "objectives": [ { "kind": "collect", "itemId": "item.ore.iron", "amount": 50 } ],
  "rewards": [
    { "kind": "currency", "amount": 500 },
    { "kind": "recipe", "recipeId": "recipe.ironPickaxe" }
  ],
  "next": "quest.smith.steel"
}
```

Questarten nach `docs/16` §16.4: Kampf, Sammeln, Crafting, Skill, Erkundung, Boss.
Dieselben Zielarten wie bei Herausforderungen — **ein gemeinsamer Fortschrittszähler**
für beide Systeme. Zwei getrennte Zähler wären doppelte Arbeit und doppelte Fehlerquelle.

**Fortschritt charakterübergreifend** (`docs/16` §16.6), außer die Quest verlangt
ausdrücklich einen bestimmten Charakter.

**Umfang in M9:** 20–25 Quests, davon zwei Ketten mit je vier Teilen.

**Quest-UI** nach `docs/22` §22.12: Name, Aufgabe, Fortschritt, Belohnung — kompakt und
ohne Spielunterbrechung.

**Fertig wenn:** Quests annehmen, erfüllen, abgeben funktioniert; der Fortschritt zählt
auch aus Idle-Aktivitäten; Ketten schalten die Folgequest frei.

---

### S-9.5 Bosse

**Was:** Die großen Herausforderungen.

**Dateien:**

- `packages/shared/src/types/boss.ts`
- `packages/server/src/systems/bossSystem.ts`
- `content/bosses/*.json`

**Details:**

Nach `docs/25` §25.18 und `docs/15`: erweiterte Gegnerstruktur mit Phasen,
Spezialangriffen und Mechaniken.

```jsonc
{
  "id": "boss.forestWarden",
  "enemy": { "level": 20, "health": 4000, "defense": 25 },
  "phases": [
    { "atHealthPercent": 100, "attacks": ["slam", "rootGrab"] },
    { "atHealthPercent": 50,  "attacks": ["slam", "rootGrab", "summonSaplings"],
      "modifiers": [{ "kind": "percent", "target": "attackSpeed", "value": 0.25 }] },
    { "atHealthPercent": 20,  "attacks": ["enrage", "areaSlam"] }
  ],
  "dropTable": "drop.forestWarden",
  "arena": { "areaId": "area.boss.forest", "entry": "spawn.arena" }
}
```

**Angriffe sind angekündigt** (`docs/15` §15.8): sichtbare Vorwarnung, aktive
Gefahrenphase, Abklingen. `docs/27` §27.5 verlangt diese drei Stufen ausdrücklich für
die Darstellung. Ohne Vorwarnung ist aktives Spielen gegen Bosse nicht besser als
automatisches — und genau das ist laut `docs/15` §15.4 der Sinn.

**Wiederholbar** (`docs/15` §15.15). **Kein Verlust beim Scheitern** (`docs/15` §15.17).
**Beute erscheint am Boss**, auch bei vollem Rucksack (`docs/15` §15.11) — die
Weltgegenstände aus M4/S-4.3 tragen das bereits.

**Automatischer Bosskampf** ist erlaubt (`docs/15` §15.4), aber deutlich schwächer: Die
automatische Steuerung weicht Angriffen nicht aus. Das entsteht von selbst und braucht
keine künstliche Strafe.

**Umfang in M9:** zwei Bosse mit je drei Phasen. Endgame-Bosse folgen später.

**Fertig wenn:** Ein Charakter besiegt einen Boss aktiv, die Phasen wechseln sichtbar,
Angriffe sind vorher erkennbar, Beute liegt am Boss, ein zweiter Versuch ist sofort
möglich.

---

### S-9.6 Weltkarte

**Was:** Übersicht über Gebiete, Verbindungen und Sperren.

**Dateien:** `packages/client/src/ui/worldMap.ts`

**Details:** Nach `docs/22` §22.17 und `docs/12` §12.14: freigeschaltete und gesperrte
Gebiete, Portale, Bossbereiche, Position **aller eigenen Charaktere**.

Die Karte ist damit nicht nur Orientierung, sondern die Übersicht über das eigene Team —
sie beantwortet die Frage „wo ist wer und was tut er". Das ist bei fünf bis acht
Charakteren die meistgestellte Frage.

**Fertig wenn:** Die Karte zeigt alle Gebiete mit Zustand, alle Charakterpositionen und
die nächste offene Herausforderung je gesperrtem Übergang.

---

### S-9.7 Klassenstufe 3

**Was:** Die dritte Klassenentscheidung, jetzt mit Inhalt dahinter.

**Dateien:** `content/classes/tier3/*.json`

**Details:** Nach `docs/04` §4.4 ab Level 45. Rund 20 Endklassen, aufbauend auf den
neun Klassen aus M7.

Sie kommen erst jetzt, weil ihre Fähigkeiten Gegner, Bosse und Ausrüstung brauchen, an
denen sie sich beweisen können. In M7 wären sie Zahlen ohne Kontext gewesen.

**Fertig wenn:** Der Baum ist dreistufig vollständig, alle Endklassen haben mindestens
eine eigene Fähigkeit, und der Weg von Level 10 bis 45 ist einmal durchgespielt.

---

## Ergebnis

Eine Welt aus 14 Gebieten mit mehreren Wegen, Freischaltungen, NPCs, Quests und zwei
Bossen. Der Spieler hat immer mehrere sichtbare Ziele gleichzeitig — genau das fordert
`docs/01` §1.6 und `docs/13` §13.16.

## Nicht in diesem Meilenstein

- Split-Screen-Bosskämpfe (M10)
- Andere Spieler in der Welt (M10)
- Endgame-Gebiete (M13)
