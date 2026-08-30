# 7. Idle-System

## 7.1 Grundprinzip

Das Idle-System ermöglicht es den Charakteren, **selbstständig Fortschritt zu erzielen**, während der Spieler einen anderen Charakter spielt oder das Spiel nicht aktiv bedient.

Jeder Charakter kann unabhängig von den anderen Charakteren eine eigene Aktivität ausführen.

Das Idle-System ist ein zentraler Bestandteil des Spiels und soll sowohl aktive als auch passive Spielweisen unterstützen.

---

## 7.2 Parallele Aktivitäten

Jeder Charakter kann unabhängig eingesetzt werden.

Beispiel:

* Charakter 1 → kämpft
* Charakter 2 → Holzfällen
* Charakter 3 → Mining
* Charakter 4 → Angeln
* Charakter 5 → Landwirtschaft

Der Spieler kann zwischen den Charakteren wechseln, ohne dass die anderen ihre Aktivität beenden.

---

## 7.3 Charakter bleibt an seiner Position

Wenn ein Charakter bei einer Aktivität zurückgelassen wird, bleibt er dort.

Beispiel:

> Charakter 1 wird an einem Baum zum Holzfällen eingesetzt.

Der Spieler wechselt anschließend zu Charakter 2.

Charakter 1 bleibt beim Baum und arbeitet dort weiter.

Beim späteren Wechsel zu Charakter 1 befindet er sich weiterhin an diesem Ort.

---

## 7.4 Idle-Ressourcenproduktion

Während einer Idle-Aktivität produziert der Charakter automatisch die entsprechende Ressource.

Beispiel:

**Holzfällen**

> Baum → automatische Arbeitsaktion → Holz → Inventar

**Mining**

> Erzquelle → automatische Arbeitsaktion → Erz → Inventar

**Angeln**

> Angelstelle → automatische Angelaktion → Fisch → Inventar

**Landwirtschaft**

> Feld → automatische Produktion → Ernte → Inventar

---

## 7.5 Idle-Kampf

Auch Kämpfen kann als Idle-Aktivität ausgeführt werden.

Der Charakter kämpft automatisch gegen normale Gegner.

Dabei führt er seine normalen Angriffe selbstständig aus.

Abhängig von der Klasse können auch bestimmte Fähigkeiten automatisch eingesetzt werden.

Der Spieler muss den Kampf nicht permanent überwachen.

---

## 7.6 Online-Idle

Während das Spiel geöffnet ist, können Charaktere mit voller Idle-Effizienz arbeiten.

Beispiel:

> Charakter 1 → Holzfällen  
> Charakter 2 → Mining  
> Charakter 3 → Kampf

Während der Spieler einen Charakter aktiv steuert, laufen die anderen Aktivitäten weiter.

---

## 7.7 Offline-Idle

Das Spiel unterstützt Fortschritt während der Abwesenheit des Spielers.

Wenn der Spieler das Spiel schließt, werden die Aktivitäten der Charaktere weiterhin berechnet.

Offline-Fortschritt ist jedoch **weniger effizient als Online-Fortschritt**.

Dadurch wird aktives Spielen belohnt, ohne den Idle-Spielstil unbrauchbar zu machen.

---

## 7.8 Offline-Effizienz

Die Offline-Produktion besitzt eine geringere Effizienz als die Online-Produktion.

Beispielsweise kann ein Charakter online mit:

> **100 % Effizienz**

arbeiten und offline mit:

> **reduzierter Effizienz**

weiterarbeiten.

Der genaue Multiplikator wird während der Entwicklung festgelegt.

---

## 7.9 48-Stunden-Limit

Offline-Fortschritt wird maximal für **48 Stunden** gespeichert.

Nach Ablauf dieses Zeitraums wird kein weiterer Offline-Fortschritt angesammelt.

Beispiel:

> Spiel geschlossen: 24 Stunden  
> → Offline-Fortschritt für 24 Stunden

> Spiel geschlossen: 48 Stunden  
> → Offline-Fortschritt für 48 Stunden

> Spiel geschlossen: 72 Stunden  
> → maximal 48 Stunden Fortschritt

---

## 7.10 Offline-Berechnung

Beim erneuten Öffnen des Spiels wird berechnet, was die Charaktere während der Abwesenheit produziert haben.

Der Spieler erhält anschließend eine Übersicht über den Offline-Fortschritt.

Beispielsweise:

> **Offline-Fortschritt**
>
> Charakter 1  
> +2.450 Holz  
> +1.240 Holzfäller-XP
>
> Charakter 2  
> +870 Erz  
> +950 Mining-XP
>
> Charakter 3  
> +320 Monster besiegt  
> +4.800 Kampf-XP

---

## 7.11 Inventar während des Idle-Modus

Idle-Aktivitäten verwenden weiterhin das normale Inventarsystem.

Jeder Charakter besitzt eine begrenzte Rucksackkapazität.

Wenn während einer Idle-Aktivität kein Platz mehr vorhanden ist, können weitere Gegenstände nicht in den Rucksack aufgenommen werden.

Stattdessen werden die Gegenstände in der Welt beim jeweiligen Aktivitätsort abgelegt.

---

## 7.12 Idle und Charakterentwicklung

Idle-Aktivitäten geben ebenfalls Erfahrung.

Dadurch kann ein Charakter auch dann Fortschritt machen, wenn der Spieler ihn nicht aktiv steuert.

Beispiel:

> Charakter → Holzfällen  
> → Holzfäller-XP  
> → Charakter-XP  
> → kleinere passende Attributentwicklung

Der Charakter entwickelt sich somit auch während des Idle-Spiels weiter.

---

## 7.13 Idle-Effizienz durch Skills

Die Effizienz einer Idle-Aktivität hängt unter anderem von den Fähigkeiten des Charakters ab.

Beispielsweise können bessere Holzfäller-Skills dazu führen, dass:

* höherwertige Bäume verfügbar werden
* mehr Holz produziert wird
* die Arbeitsgeschwindigkeit steigt

Bestimmte Aktivitäten können Voraussetzungen besitzen.

Beispielsweise:

> Baum benötigt Holzfäller-Skill 25

Ein Charakter mit niedrigerem Holzfäller-Skill kann diesen Baum nicht effizient bzw. überhaupt nicht bearbeiten.

---

## 7.14 Unterschied zwischen aktivem und Idle-Sammeln

Einige Berufe besitzen im aktiven Spiel ein kleines Minigame.

Beim Idle-Modus wird dieses Minigame vollständig übersprungen.

Beispiel:

**Aktiv**

> Spieler führt das Holzfäller-Minispiel aus.

**Idle**

> Charakter fällt automatisch Holz.

Dadurch bleibt das Idle-System komfortabel, während aktives Spielen zusätzliche Interaktion bieten kann.

---

## 7.15 Wechsel zwischen Idle und aktivem Spielen

Der Spieler kann jederzeit entscheiden, einen Charakter aus einer Idle-Aktivität herauszunehmen und ihn aktiv zu steuern.

Beispiel:

> Charakter 1 → Holzfällen  
> ↓  
> Spieler wechselt zu Charakter 1  
> ↓  
> Charakter wird aktiv gesteuert  
> ↓  
> Spieler erkundet ein Gebiet / kämpft  
> ↓  
> Charakter wird wieder zum Holzfällen geschickt

Dadurch gibt es keinen festen Unterschied zwischen „Idle-Charakter“ und „aktiver Charakter“.

Jeder Charakter kann jederzeit zwischen beiden Spielweisen wechseln.

---

## 7.16 Ziel des Idle-Systems

Das Idle-System soll sicherstellen, dass der Spieler niemals das Gefühl bekommt, seine anderen Charaktere würden „stillstehen“, nur weil er gerade einen anderen Charakter spielt.

Der Spieler soll deshalb jederzeit mehrere parallele Fortschrittslinien haben.

**Ein Charakter wird aktiv gespielt, während die anderen weiterarbeiten.**

Das bildet gemeinsam mit dem Charakter-, Klassen-, Berufs- und Kampfsystem einen der wichtigsten Grundpfeiler des Spiels.

