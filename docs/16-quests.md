# 16. Quests

## 16.1 Grundprinzip

Quests sind optionale Aufgaben innerhalb der Welt.

Sie geben dem Spieler zusätzliche Ziele und Belohnungen und unterstützen die nicht-lineare Spielweise.

Quests sind von den **Herausforderungen zur Gebietsfreischaltung** getrennt.

---

## 16.2 Questgeber

Quests werden von NPCs vergeben.

Die Questgeber befinden sich direkt in der Spielwelt.

Ein NPC kann beispielsweise über einem Gebiet oder an einem bestimmten Ort stehen und eine oder mehrere Quests anbieten.

---

## 16.3 Questannahme

Der Spieler kann mit einem Questgeber interagieren und die verfügbare Quest annehmen.

Die Quest zeigt anschließend:

* Aufgabe
* Fortschritt
* Ziel
* Belohnung

Der Fortschritt wird automatisch aktualisiert, wenn der Spieler die entsprechenden Aktionen ausführt.

---

## 16.4 Questtypen

Quests können verschiedene Aufgaben besitzen.

Beispiele:

### Kampfquests

> Töte 20 Slimes

> Besiege 10 Goblins

### Sammelquests

> Sammle 100 Holz

> Sammle 50 Eisen

### Craftingquests

> Schmiede 5 Schwerter

> Koche 10 Mahlzeiten

### Skillquests

> Erreiche Holzfäller Level 20

> Erreiche Mining Level 15

### Erkundungsquests

> Erreiche ein bestimmtes Gebiet

> Betrete eine bestimmte Höhle

### Bossquests

> Besiege einen bestimmten Boss

---

## 16.5 Questfortschritt

Der Fortschritt wird direkt im Quest-System angezeigt.

Beispiel:

> **Töte 20 Slimes**  
> Fortschritt: **13 / 20**

Sobald die Voraussetzung erfüllt ist, kann die Quest beim entsprechenden Questgeber abgeschlossen werden.

---

## 16.6 Charakterübergreifender Fortschritt

Quests können mit mehreren Charakteren erfüllt werden.

Da alle Charaktere zum gleichen Spieler gehören, kann beispielsweise ein Charakter Gegner töten, während ein anderer Ressourcen sammelt.

Der Questfortschritt soll dadurch nicht unnötig auf einen einzelnen Charakter beschränkt sein, sofern die Quest keine explizite Charakteranforderung besitzt.

---

## 16.7 Questbelohnungen

Quests können verschiedene Belohnungen geben.

Beispielsweise:

* Charakter-XP
* Ressourcen
* Währung
* Ausrüstung
* Crafting-Materialien
* neue Rezepte
* weitere Belohnungen

Die Belohnung hängt von der Schwierigkeit und Art der Quest ab.

---

## 16.8 Questketten

Mehrere Quests können miteinander verbunden sein.

Beispiel:

```text
Quest 1
↓
Hilf dem Holzfäller
↓
Quest 2
↓
Sammle Holz
↓
Quest 3
↓
Besiege die Monster im Wald
↓
Quest 4
↓
Erreiche das nächste Gebiet
```

Dadurch kann eine Geschichte oder ein größerer Aufgabenstrang entstehen.

---

## 16.9 Optionale Quests

Quests sollen nicht den gesamten Spielfortschritt bestimmen.

Der Spieler kann einen großen Teil seiner Zeit auch durch:

* Kämpfen
* Berufe
* Crafting
* Erkundung
* Charakterentwicklung

fortschreiten.

Dadurch bleiben Quests eine zusätzliche Möglichkeit und keine zwingende lineare Route.

---

## 16.10 Quests und Berufe

Quests können gezielt bestimmte Berufe einbeziehen.

Beispielsweise:

> Sammle 100 Holz

> Mine 50 Eisen

> Fange 20 Fische

> Koche 10 Mahlzeiten

> Schmiede 5 Gegenstände

Dadurch können Spieler ihre normalen Aktivitäten gleichzeitig für Quests nutzen.

---

## 16.11 Quests und Kampf

Kampfquests können mit dem normalen Kampf verbunden sein.

Beispiel:

> Töte 50 Monster

Während der Charakter im Idle-Modus kämpft, kann der Questfortschritt automatisch steigen.

Dadurch funktionieren Quests auch mit dem Idle-System.

---

## 16.12 Questziele in der Welt

Questziele sollen nach Möglichkeit direkt in der Welt erkennbar sein.

Beispielsweise kann ein Questgeber:

* ein Symbol über dem Kopf besitzen
* auf ein Zielgebiet hinweisen
* relevante NPCs oder Orte markieren

Dadurch soll der Spieler nicht ausschließlich über Menüs navigieren müssen.

---

## 16.13 Quests und Gebiete

Quests können mit bestimmten Gebieten verbunden sein.

Ein neues Gebiet kann beispielsweise einen NPC enthalten, der dort eine neue Questreihe anbietet.

Dadurch entsteht eine Verbindung zwischen:

**Gebiet → NPC → Quest → Belohnung → weiterer Fortschritt**

---

## 16.14 Quests und Charakterentwicklung

Quests können Erfahrung für Charaktere oder andere Fortschritte liefern.

Dadurch können auch Charaktere, die hauptsächlich Berufe ausüben, über Quests zusätzlichen Fortschritt erhalten.

---

## 16.15 Questanzeige

Die aktive Quest kann in der UI angezeigt werden.

Die Anzeige soll mindestens enthalten:

* Name
* Aufgabe
* aktuellen Fortschritt
* Ziel
* mögliche Belohnung

Beispiel:

> **Der hungrige Schmied**  
> Sammle Eisen  
> **32 / 50**  
> Belohnung: 500 Gold + Rezept

---

## 16.16 Ziel des Quest-Systems

Quests sollen zusätzliche Ziele und Inhalte bieten, ohne den Spieler auf einen einzigen Spielweg festzulegen.

Sie sollen insbesondere:

* die Welt lebendiger machen
* NPCs sinnvoll integrieren
* Berufe und Kampf verbinden
* zusätzliche Belohnungen bieten
* neue Gebiete und Inhalte erklären
* optionale Fortschrittswege schaffen

Das Quest-System unterstützt damit die zentrale Philosophie des Spiels:

**Der Spieler soll selbst entscheiden können, wie er seine Charaktere entwickelt und welchen Weg er durch die Welt nimmt.**

