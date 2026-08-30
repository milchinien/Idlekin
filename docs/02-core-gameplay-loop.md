# 2. Core Gameplay Loop

## 2.1 Grundprinzip

Der Core Gameplay Loop besteht aus dem **Entwickeln, Spezialisieren und gleichzeitigen Nutzen mehrerer Charaktere**.

Der Spieler gibt seinen Charakteren unterschiedliche Aufgaben, sammelt dadurch Ressourcen und Erfahrung, verbessert Ausrüstung und Fähigkeiten und schaltet dadurch neue Gebiete, Klassen und Inhalte frei.

Der Loop soll sowohl bei kurzen Spielsessions als auch beim längeren Idle-Spielen funktionieren.

---

## 2.2 Haupt-Gameplay-Loop

Der grundlegende Ablauf ist:

**Charaktere einsetzen → Aktivitäten durchführen → Erfahrung & Ressourcen erhalten → Charaktere verbessern → neue Inhalte freischalten → stärkere Aktivitäten durchführen → wiederholen**

Dabei können verschiedene Charaktere gleichzeitig unterschiedliche Teile dieses Loops übernehmen.

Beispiel:

> Charakter 1 → kämpft  
> Charakter 2 → Holzfällen  
> Charakter 3 → Mining  
> Charakter 4 → Angeln  
> Charakter 5 → Landwirtschaft

Währenddessen sammeln die Charaktere unabhängig voneinander Erfahrung und Ressourcen.

---

## 2.3 Charakter auswählen und Aufgabe bestimmen

Der Spieler entscheidet für jeden Charakter, was dieser aktuell tun soll.

Mögliche Aktivitäten sind beispielsweise:

* Kämpfen
* Holzfällen
* Mining
* Angeln
* Landwirtschaft
* Monster bekämpfen
* Quests erledigen
* andere verfügbare Aktivitäten

Die Charaktere bleiben dabei an ihrer jeweiligen Position bzw. Aktivität, wenn der Spieler zu einem anderen Charakter wechselt.

---

## 2.4 Aktives Spielen

Der Spieler kann jederzeit einen Charakter aktiv übernehmen.

Beim aktiven Spielen kann der Spieler:

* sich durch die 2D-Welt bewegen
* Gegner bekämpfen
* Fähigkeiten einsetzen
* Ressourcen aufsammeln
* Gebiete erkunden
* Portale betreten
* Quests erledigen
* Bosse bekämpfen

Der Charakter kann anschließend wieder in eine Idle-Aktivität versetzt werden.

---

## 2.5 Mehrere Charaktere gleichzeitig

Das zentrale Element des Core Loops ist, dass die Charaktere **parallel Fortschritt machen**.

Beispiel:

> Charakter 1 befindet sich beim Holzfällen.  
> Charakter 2 befindet sich in einer Mine.  
> Charakter 3 kämpft gegen Monster.  
> Charakter 4 angelt.  
> Charakter 5 betreibt Landwirtschaft.

Der Spieler kann jederzeit zwischen diesen Charakteren wechseln.

Die anderen Charaktere laufen währenddessen weiter.

---

## 2.6 Split-Screen

Für aktives Spielen können mehrere Charaktere gleichzeitig gesteuert werden.

Der Spieler kann zwischen 2–4 Charakteren einen Split-Screen aktivieren.

Beispielsweise können vier Charaktere gemeinsam gegen einen Boss kämpfen.

Dadurch kann ein Team aus verschiedenen Builds gleichzeitig eingesetzt werden.

Beispiel:

> Charakter 1 → Nahkampfschaden  
> Charakter 2 → Fernkampfschaden  
> Charakter 3 → Magie  
> Charakter 4 → Unterstützung/Pet

Alle vier Charaktere können gleichzeitig aktiv gesteuert werden.

---

## 2.7 Ressourcen-Loop

Ressourcen bilden einen wichtigen Teil des Core Loops.

Der Ablauf lautet:

**Ressource auswählen → Charakter arbeitet → Ressource erhalten → Inventar füllt sich → Ressource für Crafting verwenden → bessere Ausrüstung/Werkzeuge herstellen → effizienter Ressourcen sammeln**

Beispiel:

> Holzfällen → Holz → Crafting → bessere Axt → schnelleres Holzfällen → höherwertige Bäume

Dasselbe Prinzip gilt für Mining, Landwirtschaft, Angeln und weitere Ressourcenaktivitäten.

---

## 2.8 Kampf-Loop

Der Kampf folgt einem eigenen Loop:

**Gebiet betreten → Gegner finden → Gegner angreifen → Erfahrung & Beute erhalten → Charakter verbessern → stärkeres Gebiet betreten**

Normale Gegner besitzen einfache Angriffsmuster.

Der Spieler kann zwischen aktivem Kampf und Idle-Kampf wählen.

Bei aktiver Steuerung kann der Spieler den Charakter bewegen und seine klassenspezifischen Fähigkeiten einsetzen.

---

## 2.9 Fortschritts-Loop

Der langfristige Fortschritt entsteht durch mehrere miteinander verbundene Systeme:

**Aktivität → Erfahrung → Level → Attribute/Klasse → bessere Effizienz → stärkere Gegner/Ressourcen → bessere Belohnungen**

Mit zunehmendem Charakterlevel werden neue Entscheidungen und Spezialisierungen verfügbar.

Dadurch verändert sich der Charakter nicht nur numerisch, sondern auch spielerisch.

---

## 2.10 Gebiets-Loop

Neue Gebiete werden durch Herausforderungen und Fortschritt freigeschaltet.

Beispiel:

> Aktuelles Gebiet  
> ↓  
> Herausforderung: „Töte 15 Slimes“  
> ↓  
> Portal wird freigeschaltet  
> ↓  
> Neues Gebiet  
> ↓  
> Stärkere Gegner & bessere Ressourcen  
> ↓  
> Neue Herausforderung

Dadurch erhält der Spieler kontinuierlich neue Ziele.

---

## 2.11 Quest-Loop

Quests werden direkt bei Questgebern angenommen.

Der Spieler erhält eine Aufgabe, erfüllt diese und erhält eine Belohnung.

Quests können beispielsweise:

* Erfahrung geben
* Ressourcen geben
* Ausrüstung geben
* Währung geben
* neue Inhalte freischalten
* andere Belohnungen bieten

Quests existieren parallel zu den normalen Aktivitäten und sollen nicht den gesamten Spielfortschritt bestimmen.

---

## 2.12 Ausrüstungs-Loop

Gefundene oder hergestellte Ausrüstung verbessert die Charaktere.

Der grundlegende Ablauf:

**Ressourcen/Beute sammeln → Ausrüstung herstellen oder erhalten → Ausrüstung anlegen → Charakter wird stärker → schwierigere Inhalte → bessere Beute**

Dadurch entsteht eine Verbindung zwischen Kampf, Berufen, Ressourcen und Crafting.

---

## 2.13 Langfristiger Core Loop

Der langfristige Loop lautet:

**Charakter entwickeln → Spezialisierung wählen → Aktivitäten kombinieren → Ressourcen sammeln → Crafting betreiben → Ausrüstung verbessern → neue Gebiete freischalten → stärkere Gegner und Bosse bekämpfen → neue Ressourcen und Ausrüstung erhalten → Charakter weiter spezialisieren**

Durch die Möglichkeit, mehrere Charaktere gleichzeitig zu betreiben, entsteht daraus ein übergeordneter Team-Loop:

**Mehrere Charaktere entwickeln → unterschiedliche Rollen aufbauen → Charaktere ergänzen sich → gemeinsame Ziele erreichen → neue Entwicklungsmöglichkeiten freischalten → Team weiter optimieren.**

Der Spieler soll dadurch jederzeit mehrere sinnvolle Ziele gleichzeitig verfolgen können, ohne gezwungen zu sein, einen einzigen vorgegebenen Fortschrittspfad abzuarbeiten.
