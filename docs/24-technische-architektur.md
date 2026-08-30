# 24. Technische Architektur

## 24.1 Grundprinzip
Das Spiel wird zunächst als **Browser-Spiel** entwickelt und getestet.

Die technische Architektur soll von Anfang an so aufgebaut werden, dass das Spiel später auf **Steam** veröffentlicht werden kann.

Die Architektur muss deshalb möglichst modular und erweiterbar sein.

## 24.2 Entwicklungsumgebung
Die Entwicklung erfolgt hauptsächlich mit:

* **Claude Code**
* **Codex**

Claude Code und Codex übernehmen die Programmierung und Weiterentwicklung des Spiels.

Codex unterstützt zusätzlich bei der Erstellung bzw. Vorbereitung der benötigten Assets.

## 24.3 Client
Der Client ist für die Darstellung und direkte Interaktion des Spielers verantwortlich.

Er übernimmt unter anderem:

* Darstellung der 2D-Welt
* Charakterbewegung
* Animationen
* Kampfsteuerung
* aktive Fähigkeiten
* UI
* Inventar
* Crafting
* Charakterwechsel
* Split-Screen
* Darstellung anderer Spieler

## 24.4 Browser-Version
Die erste Version wird direkt im Browser ausführbar sein.

Ziel der Browser-Version:

* schnelle Entwicklung
* einfaches Testen
* schnelles Iterieren
* Testen der Gameplay-Systeme
* Testen mit mehreren Spielern

Die Browser-Version ist zunächst die primäre Entwicklungs- und Testplattform.

## 24.5 Spätere Steam-Version
Die technische Struktur soll eine spätere Veröffentlichung auf Steam ermöglichen.

Die Spielsysteme sollen deshalb möglichst unabhängig von einer bestimmten Plattform implementiert werden.

Die Kernlogik des Spiels darf nicht ausschließlich auf Browser-spezifischen Funktionen basieren.

## 24.6 Server
Da es sich um ein MMO mit persistenten Charakteren handelt, benötigt das Spiel einen zentralen Server.

Der Server verwaltet unter anderem:

* Spieleraccounts
* Charaktere
* Level
* Skills
* Attribute
* Klassen
* Inventare
* Ausrüstung
* Ressourcen
* Quests
* Fortschritt
* Handel
* Ranglisten
* Offline-Fortschritt

## 24.7 Serverautorität
Wichtige Spieldaten werden serverseitig kontrolliert.

Der Client soll nicht selbstständig entscheiden können, ob beispielsweise:

* ein Gegenstand erhalten wurde
* ein Level erreicht wurde
* eine Ressource gesammelt wurde
* ein Gegner besiegt wurde
* Geld erhalten wurde

Dadurch soll Manipulation des Spielstandes erschwert werden.

## 24.8 Persistenter Spielstand
Der Fortschritt wird dauerhaft gespeichert.

Beim erneuten Einloggen werden die Charaktere mit ihrem gespeicherten Zustand geladen.

Gespeichert werden beispielsweise:

```text id="4pf2rm"
Spieler
 ├── Charakter 1
 │    ├── Level
 │    ├── Skills
 │    ├── Attribute
 │    ├── Klasse
 │    ├── Ausrüstung
 │    └── Inventar
 │
 ├── Charakter 2
 │    └── ...
 │
 └── weitere Charaktere
```

## 24.9 Idle-System auf dem Server
Idle-Aktivitäten müssen serverseitig verarbeitet werden.

Wenn ein Charakter beispielsweise Holz fällt und der Spieler offline geht, muss der Server den Fortschritt entsprechend berechnen.

Dadurch kann der Charakter beim nächsten Login den während der Offline-Zeit erzielten Fortschritt erhalten.

## 24.10 Offline-Fortschritt
Der Offline-Fortschritt besitzt ein Limit von **48 Stunden**.

Der Offline-Fortschritt ist dabei **ineffizienter als aktives Spielen**.

Beispielsweise kann ein Charakter während der Offline-Zeit weniger effektiv arbeiten als während einer aktiven Spielsitzung.

Die genaue Effizienz wird im Balancing festgelegt.

## 24.11 Zeitberechnung
Idle-Aktivitäten sollen nicht zwingend jede einzelne Sekunde simulieren müssen.

Stattdessen kann der Server anhand der vergangenen Zeit berechnen, was während der Abwesenheit passiert ist.

Beispiel:

```text
Letzter Spielstand
        ↓
Zeit seit letztem Update
        ↓
Idle-Berechnung
        ↓
Ressourcen / XP / Drops
        ↓
neuer Spielstand
```

Dies reduziert die notwendige Serverleistung.

## 24.12 Echtzeit-System
Für aktive Bereiche des Spiels werden Echtzeitverbindungen benötigt.

Dazu gehören insbesondere:

* aktive Bewegung
* aktive Kämpfe
* Split-Screen
* andere Spieler
* Bosskämpfe
* Interaktionen

Für die Kommunikation zwischen Client und Server kann ein Echtzeitprotokoll wie WebSocket verwendet werden.

## 24.13 Spielsimulation
Die grundlegende Spielsimulation soll logisch von der Darstellung getrennt sein.

Beispielsweise:

```text
Gameplay Logic
      ↓
Game State
      ↓
Client / UI / Rendering
```

Dadurch können Spielregeln verändert werden, ohne die gesamte Darstellung neu entwickeln zu müssen.

## 24.14 Datenbank
Persistente Spielerdaten werden in einer Datenbank gespeichert.

Die Datenbank muss unter anderem große Mengen an:

* Charakterdaten
* Inventaren
* Gegenständen
* Skills
* Questfortschritt
* Handelsangeboten
* Ranglisten

verwalten können.

## 24.15 Skalierbarkeit
Die Architektur soll so entwickelt werden, dass sie bei wachsender Spielerzahl erweitert werden kann.

Zu Beginn soll die Architektur jedoch nicht unnötig kompliziert sein.

Das Ziel ist:

**Einfach starten → sauber strukturieren → später skalieren.**

## 24.16 Sicherheit
Da das Spiel persistent und online ist, müssen wichtige Aktionen serverseitig validiert werden.

Insbesondere:

* Ressourcen
* Währung
* Gegenstände
* Erfahrung
* Level
* Handel
* Crafting
* Drops

dürfen nicht ausschließlich vom Client kontrolliert werden.

## 24.17 Modularität
Die wichtigsten Spielsysteme sollen voneinander getrennt entwickelt werden.

Beispielsweise:

```text
Character System
Skill System
Class System
Combat System
Idle System
Profession System
Inventory System
Equipment System
Crafting System
Quest System
World System
Trading System
Multiplayer System
```

Jedes System soll möglichst klar definierte Schnittstellen besitzen.

## 24.18 Asset-System
Grafische Assets sollen unabhängig von der Gameplay-Logik geladen und verwaltet werden.

Dazu gehören:

* Sprites
* Animationen
* Tiles
* Icons
* Effekte
* UI-Elemente

Neue Assets sollen möglichst hinzugefügt werden können, ohne Kernsysteme verändern zu müssen.

## 24.19 Entwicklungsphasen
Die technische Entwicklung wird zunächst auf eine funktionierende Browser-Version ausgerichtet.

Priorität:

1. grundlegende Spielwelt
2. Charaktere
3. Bewegung
4. Kampf
5. Idle-System
6. Berufe
7. Inventar
8. Progression
9. weitere Spielsysteme
10. Multiplayer
11. langfristige Systeme
12. Steam-Vorbereitung

Die konkrete Reihenfolge und Umsetzung wird im **26. Entwicklungsplan für Claude Code + Codex** festgelegt.

## 24.20 Ziel der technischen Architektur
Die Architektur soll drei Anforderungen gleichzeitig erfüllen:

**1. Schnell entwickelbar**

→ geeignet für die erste Browser-Version.

**2. Erweiterbar**

→ neue Klassen, Gebiete, Gegner, Berufe und Systeme können später hinzugefügt werden.

**3. Für Steam vorbereitbar**

→ die Kernsysteme sind nicht dauerhaft an die Browser-Version gebunden.

Das technische Fundament soll damit die langfristige Entwicklung des Spiels ermöglichen, ohne für den ersten Prototyp unnötig komplex zu werden.
