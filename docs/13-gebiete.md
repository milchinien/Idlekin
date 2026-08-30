# 13. Gebiete

## 13.1 Grundprinzip

Die Spielwelt besteht aus vielen unterschiedlichen Gebieten.

Jedes Gebiet besitzt eine eigene Kombination aus:

* Gegnern
* Ressourcen
* Sammelstellen
* Herausforderungen
* Quests
* visueller Umgebung
* möglichen Portalen

Die Gebiete werden mit zunehmendem Fortschritt anspruchsvoller.

---

## 13.2 Gebietsstruktur

Ein Gebiet ist eine eigenständige 2D-Side-Scrolling-Szene.

Darin können sich befinden:

* Gegner
* Bäume
* Mining-Stellen
* Angelstellen
* Landwirtschaftsflächen
* NPCs
* Questgeber
* Portale
* weitere interaktive Elemente

Nicht jedes Gebiet muss alle diese Elemente besitzen.

---

## 13.3 Freischaltung

Neue Gebiete werden über konkrete Voraussetzungen freigeschaltet.

Die Voraussetzung wird direkt am entsprechenden Portal angezeigt.

Beispiel:

> **Töte 15 Slimes**

Nach Erfüllung der Herausforderung wird das nächste Gebiet zugänglich.

Weitere mögliche Voraussetzungen:

* bestimmte Gegner besiegen
* bestimmte Ressourcen sammeln
* einen bestimmten Skill erreichen
* eine Quest abschließen
* einen Boss besiegen

---

## 13.4 Herausforderungen

Herausforderungen sind direkte Voraussetzungen für die Freischaltung von Gebieten.

Sie befinden sich normalerweise direkt über dem Portal.

Beispiel:

```text id="t5v9w8"
┌──────────────────────┐
│  Töte 15 Slimes      │
│                      │
│       PORTAL         │
└──────────────────────┘
```

Der Spieler kann dadurch bereits vor dem Betreten des nächsten Gebiets erkennen, was benötigt wird.

---

## 13.5 Unterschiedliche Schwierigkeitsstufen

Die Gebiete werden schrittweise schwieriger.

Mit höherem Fortschritt steigen beispielsweise:

* Gegnerstärke
* Lebenspunkte der Gegner
* Schadenswerte
* benötigte Skills
* Ressourcenanforderungen

Gleichzeitig steigen die möglichen Belohnungen.

---

## 13.6 Ressourcen pro Gebiet

Gebiete besitzen unterschiedliche Ressourcen.

Beispielsweise:

**Wald**

* Holz
* seltenes Holz
* Pflanzen

**Mine**

* Kupfer
* Eisen
* seltene Erze

**Wiese**

* Pflanzen
* Landwirtschaft
* einfache Monster

**Höhle**

* seltene Erze
* Monster-Materialien
* stärkere Gegner

Dadurch besitzt jedes Gebiet eigene wirtschaftliche Bedeutung.

---

## 13.7 Ressourcenanforderungen

Bestimmte Ressourcen können erst ab einem bestimmten Berufsskill gesammelt werden.

Beispiel:

> Holzfäller Level 1 → normaler Baum

> Holzfäller Level 20 → Hartholzbaum

> Holzfäller Level 50 → magischer Baum

Dasselbe Prinzip kann auf Mining, Angeln und Landwirtschaft angewendet werden.

---

## 13.8 Kampfgebiete

Einige Gebiete konzentrieren sich stärker auf Kampf.

Dort befinden sich mehrere Gegner, die der Charakter besiegen kann.

Die Gegner können unterschiedliche Eigenschaften und Drops besitzen.

Diese Gebiete eignen sich besonders für:

* Kampf-XP
* Charakter-XP
* Beute
* Monster-Ressourcen
* Herausforderungen

---

## 13.9 Sammelgebiete

Andere Gebiete können stärker auf Berufe ausgerichtet sein.

Beispielsweise kann ein Wald besonders viele Holzfäller-Stellen besitzen.

Eine Mine kann mehrere Erzquellen besitzen.

Ein Angelgebiet kann mehrere Angelstellen besitzen.

Dadurch können Charaktere gezielt an passende Orte geschickt werden.

---

## 13.10 Questgebiete

In bestimmten Gebieten befinden sich Questgeber.

Diese NPCs können Quests anbieten, die unabhängig von den Portal-Herausforderungen existieren.

Eine Quest kann beispielsweise:

* Gegner besiegen
* Ressourcen sammeln
* einen bestimmten Ort erreichen
* Gegenstände herstellen
* andere Aufgaben erfüllen

Die Belohnung kann Erfahrung, Ressourcen, Ausrüstung oder andere Gegenstände enthalten.

---

## 13.11 Bossgebiete

Bosse erscheinen nicht in jedem Gebiet.

Nach mehreren normalen Gebieten kann ein besonderes Bossgebiet folgen.

Ein Bossgebiet besitzt einen stärkeren Gegner und besondere Belohnungen.

Der Boss kann zusätzliche Voraussetzungen oder eine eigene Herausforderung besitzen.

---

## 13.12 Mehrere Wege

Die Welt soll nicht ausschließlich aus einer einzigen geraden Kette von Gebieten bestehen.

Es können unterschiedliche Gebiete und Wege existieren.

Beispielsweise:

```text id="j2m3a5"
                 ┌── Wald ── Magischer Wald ──┐
Dorf ── Wiese ───┤                            ├── späteres Gebiet
                 └── Mine ── Tiefenmine ──────┘
```

Dadurch kann der Spieler unterschiedliche Inhalte zuerst erkunden.

Die Welt unterstützt dadurch die nicht-lineare Ausrichtung des Spiels.

---

## 13.13 Gebietsfortschritt

Das Freischalten eines Gebietes bedeutet nicht, dass ältere Gebiete bedeutungslos werden.

Frühere Gebiete können weiterhin verwendet werden für:

* bestimmte Ressourcen
* Quests
* bestimmte Gegner
* Skilltraining
* Idle-Aktivitäten
* fehlende Crafting-Materialien

Dadurch bleiben alte Gebiete langfristig relevant.

---

## 13.14 Charaktere in verschiedenen Gebieten

Jeder Charakter kann sich unabhängig in einem anderen Gebiet befinden.

Beispiel:

> Charakter 1 → Bossgebiet

> Charakter 2 → Wald

> Charakter 3 → Mine

> Charakter 4 → Angelgebiet

> Charakter 5 → Landwirtschaft

Der Spieler kann zwischen ihnen wechseln.

Die Position jedes Charakters bleibt erhalten.

---

## 13.15 Gebiete und Charakterentwicklung

Unterschiedliche Gebiete können unterschiedliche Charakter-Builds begünstigen.

Beispielsweise kann ein Wald besonders interessant für einen Holzfäller sein, während eine Mine einem Mining-Charakter einen größeren Nutzen bietet.

Kampfgebiete sind wiederum für kampforientierte Charaktere interessant.

Dadurch entsteht eine Verbindung zwischen:

**Gebiet → Aktivität → Skill → Charakterentwicklung**

---

## 13.16 Ziel des Gebietssystems

Die Gebiete sollen dem Spieler ständig neue Ziele und Möglichkeiten bieten.

Jedes neue Gebiet soll mindestens einen neuen Grund liefern, es zu besuchen:

* stärkere Gegner
* neue Ressourcen
* neue Herausforderungen
* neue Quests
* neue Crafting-Möglichkeiten
* neue Ausrüstung
* neue Klassen-/Build-Möglichkeiten

Dadurch soll die Welt langfristig interessant bleiben, ohne den Spieler auf einen einzigen linearen Weg zu zwingen.

