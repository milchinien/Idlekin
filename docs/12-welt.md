# 12. Welt

## 12.1 Grundprinzip

Die Spielwelt ist eine **begehbare 2D-Fantasy-Pixel-Art-Welt**, die aus vielen miteinander verbundenen Gebieten besteht.

Der Spieler beobachtet die Welt aus der Seitenperspektive.

Die Welt dient nicht nur als Hintergrund für das Gameplay, sondern ist der Ort, an dem Charaktere:

* kämpfen
* Ressourcen sammeln
* Quests erledigen
* Portale betreten
* Bosse bekämpfen
* andere Spieler sehen
* sich zwischen Aktivitäten bewegen

---

## 12.2 Seitenperspektive

Die Welt wird als 2D-Side-Scrolling-Welt dargestellt.

Charaktere können sich innerhalb der Gebiete bewegen und interagieren mit der Umgebung.

Die Welt soll einen klaren Pixel-Art-Stil besitzen und eine erkennbare Fantasy-Atmosphäre vermitteln.

---

## 12.3 Aufbau der Welt

Die Welt besteht aus zahlreichen einzelnen Gebieten.

Diese Gebiete werden über Portale miteinander verbunden.

Ein grundlegender Aufbau kann beispielsweise sein:

```text
Dorf
 │
 ├── Wald
 │    ├── Tiefer Wald
 │    ├── Dunkler Wald
 │    └── Magischer Wald
 │
 ├── Wiesen
 │    ├── Slime-Gebiet
 │    └── Monster-Gebiet
 │
 ├── Mine
 │    ├── Kupfermine
 │    ├── Eisenmine
 │    └── Tiefenmine
 │
 └── weitere Regionen
```

Die konkrete Anzahl und Reihenfolge der Gebiete wird im weiteren Entwicklungsprozess festgelegt.

---

## 12.4 Portale

Portale sind die wichtigsten Verbindungspunkte zwischen den Gebieten.

Ein Charakter kann ein Portal betreten und dadurch in ein anderes Gebiet gelangen.

Nicht jedes Portal ist von Anfang an verfügbar.

Bestimmte Portale besitzen Voraussetzungen oder Herausforderungen.

---

## 12.5 Portal-Herausforderungen

Direkt über einem gesperrten Portal kann die entsprechende Herausforderung angezeigt werden.

Beispiel:

> **Nächstes Gebiet**  
> Töte 15 Slimes

Nach Erfüllung der Herausforderung wird das Portal freigeschaltet.

Weitere Beispiele:

> Besiege 50 Monster

> Sammle 100 Holz

> Erreiche Mining Level 20

> Besiege einen bestimmten Gegner

Dadurch sind die Ziele direkt in der Welt sichtbar.

---

## 12.6 Unterschiedliche Regionen

Die Welt soll viele unterschiedliche Umgebungen besitzen.

Beispielsweise:

* Wiesen
* Wälder
* Höhlen
* Minen
* Sümpfe
* Berge
* Ruinen
* Dungeons
* magische Regionen
* weitere Fantasy-Gebiete

Jede Region soll eigene Gegner, Ressourcen und visuelle Eigenschaften besitzen.

---

## 12.7 Ressourcen in der Welt

Ressourcen werden an bestimmten Orten der Welt gesammelt.

Ein Baum kann beispielsweise als dauerhaft vorhandener Holzfäller-Punkt dienen.

Eine Mine kann als Mining-Punkt dienen.

Angelstellen können dauerhaft verfügbar sein.

Landwirtschaft besitzt eigene feste Bereiche.

Die Sammelstellen werden nicht dauerhaft zerstört.

Dadurch können Charaktere langfristig an einem Ort eingesetzt werden.

---

## 12.8 Stationäre Aktivitäten

Viele Berufe benötigen keine permanente Bewegung durch die Welt.

Ein Charakter kann beispielsweise:

> zum Baum gehen → dort bleiben → Holzfällen

oder:

> zur Mine gehen → dort bleiben → Mining

Dadurch können die gleichen Orte dauerhaft als Idle-Stationen genutzt werden.

---

## 12.9 Welt und Idle-System

Die Welt bleibt auch für Idle-Aktivitäten relevant.

Ein Charakter befindet sich tatsächlich an seinem jeweiligen Ort.

Beispielsweise kann der Spieler einen Holzfällercharakter sehen, der an einem Baum arbeitet.

Währenddessen kann ein anderer Charakter an einer Mine stehen und Ressourcen sammeln.

Dadurch wird der Idle-Fortschritt sichtbar in die Welt integriert.

---

## 12.10 Charakterbewegung

Charaktere können sich innerhalb der Welt bewegen.

Beim aktiven Spielen steuert der Spieler die Bewegung selbst.

Beim Wechsel zu einem anderen Charakter bleibt der vorherige Charakter an seinem aktuellen Ort und setzt seine Aktivität fort.

Dadurch entsteht eine persistente Position jedes Charakters innerhalb der Welt.

---

## 12.11 Gebiete und Schwierigkeit

Mit zunehmender Entfernung bzw. Progression werden die Gebiete schwieriger.

Neue Gebiete können enthalten:

* stärkere Gegner
* bessere Ressourcen
* neue Ressourcenarten
* neue Quests
* neue Herausforderungen
* neue Crafting-Möglichkeiten
* seltenere Gegenstände

Dadurch bleibt die Welt langfristig relevant.

---

## 12.12 Bosse in der Welt

Bosse befinden sich nicht in jedem einzelnen Gebiet.

Stattdessen gibt es nach mehreren normalen Gebieten besondere Bossbereiche.

Ein Bossbereich kann als eigenes Gebiet oder als spezieller Abschnitt innerhalb der Welt aufgebaut sein.

Der Bosskampf soll visuell deutlich von normalen Gegnerkämpfen unterscheidbar sein.

---

## 12.13 Spieler in der Welt

Da das Spiel MMO-Elemente besitzt, können andere Spieler in bestimmten Bereichen der Welt sichtbar sein.

Andere Spieler können beispielsweise:

* kämpfen
* Ressourcen sammeln
* durch die Welt laufen
* ihre Charaktere entwickeln

Die Interaktion bleibt jedoch bewusst begrenzt.

Der Schwerpunkt liegt weiterhin auf dem eigenen Charakter-Team.

---

## 12.14 Welt als Fortschrittskarte

Die Welt dient gleichzeitig als sichtbare Darstellung des persönlichen Fortschritts.

Bereits freigeschaltete Gebiete können frei genutzt werden.

Noch gesperrte Gebiete zeigen dem Spieler, welche Herausforderung als Nächstes erfüllt werden muss.

Dadurch ist der Fortschritt direkt in der Spielwelt erkennbar.

---

## 12.15 Ziel der Welt

Die Welt soll sich wie eine zusammenhängende Fantasy-Welt anfühlen und gleichzeitig die Gameplay-Systeme unterstützen.

Sie soll:

* Erkundung ermöglichen
* Charaktere sichtbar machen
* Idle-Aktivitäten darstellen
* Kampf ermöglichen
* Ressourcenplätze enthalten
* Portale und Herausforderungen bereitstellen
* Quests integrieren
* Bossbereiche enthalten
* den Fortschritt des Spielers sichtbar machen

Die Welt soll nicht nur aus Menüs bestehen.

Die Charaktere und ihre Aktivitäten sollen **sichtbar in der 2D-Welt stattfinden**.

