# 25. Datenstrukturen

## 25.1 Grundprinzip
Alle wichtigen Spielobjekte werden strukturiert und eindeutig gespeichert.

Die Datenstrukturen müssen so aufgebaut sein, dass Claude Code und Codex neue Inhalte wie Charaktere, Klassen, Gegner, Gebiete, Gegenstände und Rezepte hinzufügen können, ohne bestehende Systeme grundlegend umzubauen.

## 25.2 Spieler
Der Spieler besitzt einen zentralen Account.
```text
Player
├── ID
├── Name
├── Charaktere
├── Währung
├── Freigeschaltete Gebiete
├── Quests
├── Handelsdaten
└── weitere globale Daten
```

## 25.3 Charakter
Jeder Charakter besitzt einen vollständig eigenen Entwicklungsstand.
```text
Character
├── ID
├── Name
├── Level
├── Erfahrung
├── Attribute
├── Skills
├── Klasse
├── Ausrüstung
├── Inventar
├── Position
├── aktuelle Aktivität
├── Idle-Status
└── weitere Charakterdaten
```
Jeder Charakter entwickelt sich unabhängig von den anderen Charakteren.

## 25.4 Attribute
Attribute werden als eigene Daten gespeichert.
```text
Attributes
├── Stärke
├── Intelligenz
├── Geschick
├── Vitalität
└── Weisheit
```
Die Werte können durch Charakterentwicklung, Klassen, Ausrüstung und weitere Systeme beeinflusst werden.

## 25.5 Skills
Berufliche und andere relevante Skills werden separat gespeichert.
```text
Skills
├── Holzfäller
├── Mining
├── Angeln
├── Landwirtschaft
├── Kochen
├── Schmieden
├── Alchemie
├── Verzaubern
└── Kampf
```
Jeder Skill besitzt mindestens:
```text
Skill
├── Level
├── Erfahrung
└── weitere Skillwerte
```

## 25.6 Klassen
Eine Klasse wird dauerhaft mit dem Charakter verbunden.
```text
Class
├── ID
├── Name
├── Kategorie
├── Voraussetzungen
├── passive Boni
├── aktive Fähigkeiten
└── weitere Klassendaten
```
Nach der Auswahl wird die Klasse nicht gewechselt.

## 25.7 Aktive Fähigkeiten
Fähigkeiten werden als eigene Datenobjekte definiert.
```text
Ability
├── ID
├── Name
├── Beschreibung
├── Klasse
├── Level/Voraussetzung
├── Cooldown
├── Kosten
├── Effekt
└── Animation
```
Dadurch können Klassen unterschiedliche Fähigkeiten erhalten.

## 25.8 Gegenstände
Alle Gegenstände besitzen eine eindeutige ID.
```text
Item
├── ID
├── Name
├── Typ
├── Seltenheit
├── Stack-Größe
├── Handelbar
├── Beschreibung
└── weitere Eigenschaften
```

## 25.9 Ausrüstung
Ausrüstungsgegenstände erweitern die normalen Itemdaten.
```text
Equipment
├── Item-ID
├── Ausrüstungsplatz
├── Werte
├── Boni
├── Verzauberungen
└── weitere Eigenschaften
```
Mögliche Slots:
```text
Weapon
Armor
Helmet
Shoes
Tool
Accessory
```

## 25.10 Inventar
Jeder Charakter besitzt ein eigenes Inventar.
```text
Inventory
├── maximale Kapazität
└── Items
```
Ein Item-Slot enthält beispielsweise:
```text
InventorySlot
├── Item-ID
└── Menge
```
Die Kapazität des Rucksacks ist begrenzt.

## 25.11 Weltposition
Die Position jedes Charakters wird gespeichert.
```text
CharacterPosition
├── Gebiet-ID
├── X
├── Y
└── weitere Positionsdaten
```
Dadurch kann ein Charakter beim Wechsel zu einem anderen Charakter an seiner vorherigen Position wieder angezeigt werden.

## 25.12 Aktivität
Der aktuelle Zustand eines Charakters wird gespeichert.
```text
Activity
├── Typ
├── Ziel-ID
├── Startzeit
├── letzter Fortschritt
└── Status
```
Mögliche Aktivitäten:

* Kämpfen
* Holzfällen
* Mining
* Angeln
* Landwirtschaft
* weitere Idle-Aktivitäten

## 25.13 Idle-Daten
Für Idle-Aktivitäten werden Zeit- und Zustandsinformationen gespeichert.
```text
IdleState
├── Aktivität
├── Startzeit
├── letzte Berechnung
├── Effizienz
└── weitere Berechnungswerte
```
Dadurch kann beim nächsten Login der Offline-Fortschritt berechnet werden.

## 25.14 Gebiete
Jedes Gebiet wird als eigenes Datenobjekt definiert.
```text
Area
├── ID
├── Name
├── Beschreibung
├── Level-/Schwierigkeitsbereich
├── Gegner
├── Ressourcen
├── NPCs
├── Portale
└── weitere Inhalte
```

## 25.15 Portale
Portale verbinden Gebiete miteinander.
```text
Portal
├── ID
├── Zielgebiet
├── Position
├── freigeschaltet
└── Voraussetzung
```
Die Voraussetzung kann beispielsweise eine Herausforderung sein.

## 25.16 Herausforderungen
```text
Challenge
├── ID
├── Name
├── Beschreibung
├── Ziel
├── aktueller Fortschritt
├── benötigter Fortschritt
└── Belohnung/Freischaltung
```
Beispiel:
```text
Töte 15 Slimes
15 benötigt
```

## 25.17 Gegner
```text
Enemy
├── ID
├── Name
├── Level
├── Lebenspunkte
├── Schaden
├── Verteidigung
├── Bewegung
├── Angriffe
├── Drops
└── Gebiet
```
Normale Gegner bleiben bewusst einfach aufgebaut.

## 25.18 Bosse
Bosse verwenden eine erweiterte Gegnerstruktur.
```text
Boss
├── Enemy-Daten
├── Phasen
├── Spezialangriffe
├── Mechaniken
├── Boss-Drops
└── weitere Eigenschaften
```
Dadurch können Bosse deutlich komplexer als normale Gegner sein.

## 25.19 Ressourcen
Ressourcen besitzen eigene Daten.
```text
Resource
├── ID
├── Name
├── Typ
├── erforderlicher Skill
├── benötigtes Werkzeug
├── Produktionsrate
├── mögliche Drops
└── Gebiet
```
Beispiel:
```text
Magischer Baum
├── Holzfäller-Anforderung: 50
├── Werkzeug: Axt
└── Ressource: Magisches Holz
```

## 25.20 Rezepte
Crafting-Rezepte werden unabhängig von den Items gespeichert.
```text
Recipe
├── ID
├── Name
├── Beruf
├── benötigte Materialien
├── Produktionszeit
├── Ergebnis
└── Voraussetzungen
```
Beispiel:
```text
Eisenschwert

10x Eisen
2x Holz

Produktionszeit: 10 Sekunden

→ 1x Eisenschwert
```

## 25.21 Quests
```text
Quest
├── ID
├── Name
├── Questgeber
├── Ziele
├── Voraussetzungen
├── Belohnungen
└── Folgequests
```
Ein Questziel kann beispielsweise sein:
```text
Kill
Enemy-ID: Slime
Amount: 20
```
oder:
```text
Collect
Item-ID: Holz
Amount: 100
```

## 25.22 Drops
Drops werden über Drop-Tabellen definiert.
```text
DropTable
├── Item-ID
├── minimale Menge
├── maximale Menge
└── Wahrscheinlichkeit
```
Damit können normale Gegner und Bosse unterschiedliche Belohnungen besitzen.

## 25.23 Handel
Handelsangebote werden separat gespeichert.
```text
TradeOffer
├── ID
├── Verkäufer
├── Item
├── Menge
├── Preis
├── Erstellungszeit
└── Ablaufzeit
```
Dadurch können Spieler Gegenstände über den Markt anbieten.

## 25.24 Ranglisten
Ranglisten können aus gespeicherten Spieler- und Charakterwerten erzeugt werden.
```text
LeaderboardEntry
├── Spieler-ID
├── Charakter-ID
├── Wert
└── Rang
```
Mögliche Kategorien:

* Level
* Skills
* Bossfortschritt
* weitere Leistungen

## 25.25 Globale und charakterbezogene Daten
Die Daten müssen klar zwischen Spieler- und Charakterdaten unterscheiden.

### Spielerbezogen
* Account
* Währung
* globale Freischaltungen
* Handel
* globale Fortschritte

### Charakterbezogen
* Level
* XP
* Attribute
* Skills
* Klasse
* Ausrüstung
* Inventar
* Position
* Aktivität

Dadurch bleiben die Charaktere unabhängig voneinander.

## 25.26 Datenorientierte Entwicklung
Neue Inhalte sollen möglichst über Daten definiert werden können.

Beispielsweise soll ein neuer Gegner nicht zwingend neue Programm-Logik benötigen.

Stattdessen soll ein Datensatz definiert werden:
```text
Enemy:
Name: Goblin
Level: 12
Health: ...
Damage: ...
Drops: ...
Attacks: ...
```
Dasselbe Prinzip soll möglichst für:

* Items
* Ressourcen
* Rezepte
* Quests
* Gebiete
* Gegner
* Bosse
* Klassen

verwendet werden.

## 25.27 Ziel der Datenstrukturen
Die Datenstrukturen sollen die Grundlage für eine **modulare und erweiterbare Entwicklung** bilden.

Das Ziel ist:

**Neue Inhalte hinzufügen → Daten definieren → bestehende Systeme verwenden.**

Dadurch können Claude Code und Codex später neue Gebiete, Klassen, Gegner, Ressourcen, Gegenstände und Rezepte hinzufügen, ohne jedes Mal die grundlegende Architektur des Spiels verändern zu müssen.
