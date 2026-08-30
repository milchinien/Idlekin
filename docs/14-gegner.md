# 14. Gegner

## 14.1 Grundprinzip

Gegner sind ein zentraler Bestandteil der Welt und des Kampfsystems.

Sie befinden sich in den verschiedenen Gebieten und werden mit zunehmendem Fortschritt stärker.

Normale Gegner sollen bewusst einfach verständlich sein. Komplexe Mechaniken sind hauptsächlich den Bossen vorbehalten.

---

## 14.2 Gegnerarten

Die Welt besitzt unterschiedliche Gegnertypen.

Beispiele:

* Slimes
* Goblins
* Wölfe
* Skelette
* Monster
* magische Kreaturen
* weitere Fantasy-Gegner

Jeder Gegnertyp kann eigene Werte, Drops und visuelle Eigenschaften besitzen.

---

## 14.3 Normale Gegner

Normale Gegner besitzen ein einfaches Kampfsystem.

Sie verfügen grundsätzlich über:

* Lebenspunkte
* Schaden
* Bewegung
* einen normalen Angriff
* optional einen zweiten Angriff

Normale Gegner sollen keine komplizierten Spezialmechaniken benötigen.

---

## 14.4 Gegnerverhalten

Normale Gegner können sich innerhalb ihres vorgesehenen Bereichs bewegen.

Wenn ein Charakter mit ihnen kämpft, greifen sie den Charakter an.

Das Verhalten soll übersichtlich bleiben und nicht mit komplexen KI-Systemen überladen werden.

---

## 14.5 Gegnerstärke

Die Stärke eines Gegners hängt unter anderem vom Gebiet ab.

Ein Gegner in einem frühen Gebiet ist deutlich schwächer als ein Gegner in einem späteren Gebiet.

Mit zunehmender Gebietsprogression steigen beispielsweise:

* Lebenspunkte
* Schaden
* Verteidigung
* mögliche Belohnungen

---

## 14.6 Gegner und Level

Gegner besitzen eigene Level bzw. Stärke-Stufen.

Der Spieler kann dadurch erkennen, wie gefährlich ein Gegner ungefähr ist.

Beispiel:

> Schleim Level 3

> Goblin Level 15

> Schattenmonster Level 40

Die konkreten Werte werden an das jeweilige Gebiet angepasst.

---

## 14.7 Gegner und Charakterlevel

Das Charakterlevel ist nicht die einzige Voraussetzung für einen erfolgreichen Kampf.

Auch relevant sind:

* Attribute
* Skills
* Klasse
* Ausrüstung
* aktive Fähigkeiten
* Spielersteuerung

Dadurch kann ein gut entwickelter Charakter auch mit vergleichbarem Level unterschiedlich stark sein.

---

## 14.8 Gegnerdrops

Besiegte Gegner können verschiedene Belohnungen hinterlassen.

Beispielsweise:

* Ressourcen
* Monster-Materialien
* Ausrüstung
* Währung
* Erfahrung
* seltene Gegenstände

Die Drops unterscheiden sich je nach Gegner.

---

## 14.9 Monster-Materialien

Viele Gegner liefern Materialien, die für andere Systeme benötigt werden.

Beispiele:

**Slime**

→ Schleim-Material

**Wolf**

→ Fell / Fleisch

**Skelett**

→ Knochen

Diese Materialien können anschließend für:

* Crafting
* Alchemie
* Kochen
* Quests
* weitere Systeme

verwendet werden.

---

## 14.10 Seltene Drops

Normale Gegner können zusätzlich seltene Gegenstände fallen lassen.

Die Wahrscheinlichkeit für seltene Drops ist gering.

Stärkere Gegner können bessere Drop-Tabellen besitzen.

Dadurch kann auch das wiederholte Besiegen bestimmter Gegner langfristig interessant bleiben.

---

## 14.11 Gegner als Ressourcenquelle

Kampf ist nicht nur eine Möglichkeit, Erfahrung zu sammeln.

Bestimmte Ressourcen können ausschließlich oder hauptsächlich durch bestimmte Gegner erhalten werden.

Dadurch können auch nicht-kampfbezogene Charaktere indirekt von Kampfcharakteren profitieren.

Beispiel:

> Kampfcharakter → Monster-Materialien

> Monster-Materialien → Alchemie

> Alchemie → Tränke

---

## 14.12 Gegner und Berufe

Gegner können Ressourcen liefern, die für Berufe benötigt werden.

Beispielsweise:

> Monster töten → Fleisch

> Fleisch → Kochen

oder:

> Monster töten → seltenes Material

> seltenes Material → Schmieden / Alchemie

Dadurch wird der Kampf in den allgemeinen Ressourcen-Kreislauf integriert.

---

## 14.13 Gegner und Gebiete

Jedes Gebiet kann eigene Gegnertypen besitzen.

Ein Gebiet soll dadurch eine eigene Identität erhalten.

Beispiel:

```text id="v7c2x4"
Wiese
→ Slimes

Wald
→ Wölfe / Goblins

Höhle
→ Skelette / Höhlenmonster

Magisches Gebiet
→ magische Kreaturen
```

Spätere Gebiete können stärkere Varianten bereits bekannter Gegner enthalten.

---

## 14.14 Gegnergruppen

In einem Gebiet können mehrere Gegner gleichzeitig vorhanden sein.

Dadurch kann ein Charakter während des Idle-Kampfes fortlaufend Gegner besiegen.

Die Gegner erscheinen bzw. werden nach dem Besiegen wieder verfügbar, sodass der Charakter langfristig weiterkämpfen kann.

---

## 14.15 Idle-Kampf gegen Gegner

Im Idle-Modus kämpft der Charakter automatisch gegen normale Gegner.

Dabei:

* sucht bzw. greift der Charakter verfügbare Gegner an
* führt normale Angriffe automatisch aus
* erhält Erfahrung
* erhält Drops
* setzt den Kampf fort

Der Spieler muss den Kampf nicht aktiv überwachen.

---

## 14.16 Aktiver Kampf gegen Gegner

Im aktiven Modus kann der Spieler den Charakter selbst steuern.

Der Spieler kann:

* sich bewegen
* Gegner angreifen
* Gegner anvisieren
* aktive Fähigkeiten einsetzen
* Angriffen ausweichen bzw. sich positionieren

Dadurch kann aktives Spielen einen höheren Einfluss auf den Kampf besitzen.

---

## 14.17 Keine komplexen Gegnermechaniken

Normale Gegner sollen bewusst nicht mit vielen Spezialmechaniken ausgestattet werden.

Der Unterschied zwischen normalen Gegnern soll hauptsächlich durch:

* Werte
* Angriffe
* Größe
* Bewegung
* Drops
* Gebiet

entstehen.

Komplexere Mechaniken bleiben hauptsächlich den Bossen vorbehalten.

---

## 14.18 Gegner als Fortschrittsziel

Gegner können direkt Teil von Quests und Herausforderungen sein.

Beispiel:

> „Töte 15 Slimes“

oder:

> „Besiege 50 Goblins“

Dadurch kann das Besiegen von Gegnern gleichzeitig zum Fortschritt bei einem Quest- oder Gebiets-Ziel beitragen.

---

## 14.19 Ziel des Gegnersystems

Das Gegnersystem soll einfach genug sein, damit Kämpfe auch langfristig als Idle-Aktivität funktionieren.

Gleichzeitig sollen unterschiedliche Gegner genügend Unterschiede besitzen, damit neue Gebiete und Gegner sich relevant anfühlen.

**Normale Gegner = einfache, kontinuierliche Kämpfe.**

**Bosse = besondere und komplexere Herausforderungen.**

