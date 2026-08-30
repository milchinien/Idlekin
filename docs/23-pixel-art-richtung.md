# 23. Pixel-Art-Richtung

## 23.1 Grundprinzip

Das Spiel verwendet einen **2D-Pixel-Art-Stil** aus der Seitenperspektive.

Die Grafik soll eine lockere Fantasy-Atmosphäre vermitteln und gleichzeitig übersichtlich genug sein, damit Gameplay-Informationen jederzeit verständlich bleiben.

Der genaue visuelle Stil wird während der Entwicklung weiter festgelegt, ohne die grundlegende Richtung zu verändern.

---

## 23.2 Perspektive

Die gesamte Spielwelt wird grundsätzlich als **2D-Side-Scrolling-Welt** dargestellt.

Charaktere, Gegner, Ressourcen, NPCs und Gegenstände werden als Pixel-Art-Sprites dargestellt.

---

## 23.3 Fantasy-Stil

Die Welt basiert auf einer Fantasy-Welt.

Mögliche visuelle Elemente:

* Wälder
* Wiesen
* Höhlen
* Minen
* Berge
* Ruinen
* magische Gebiete
* Monster
* Fantasy-NPCs
* Portale

Der Stil soll eher locker und zugänglich wirken und nicht übermäßig düster oder realistisch sein.

---

## 23.4 Charaktere

Jeder Charakter soll einen klar erkennbaren Pixel-Art-Sprite besitzen.

Die Charaktere sollen sich durch folgende Elemente unterscheiden können:

* Kleidung
* Waffen
* Rüstung
* Helm
* Schuhe
* Pets
* Klassenmerkmale
* Animationen

Dadurch soll der Fortschritt eines Charakters auch visuell erkennbar sein.

---

## 23.5 Klassen

Klassen sollen sich optisch deutlich voneinander unterscheiden.

Beispiele:

**Krieger**

→ Nahkampfwaffe und robuste Ausrüstung

**Bogenschütze**

→ Bogen und leichte Ausrüstung

**Magier**

→ Stab und magische Effekte

**Pet Master**

→ sichtbare Begleiter/Pets

Die optische Darstellung soll zur jeweiligen Klassenidentität passen.

---

## 23.6 Animationen

Wichtige Aktivitäten erhalten eigene Animationen.

Beispiele:

* Laufen
* Springen
* Angreifen
* Schaden nehmen
* Sterben
* Holzfällen
* Mining
* Angeln
* Crafting
* Zaubern
* aktive Fähigkeiten

Die Animationen müssen nicht extrem komplex sein, sollen aber die Aktivitäten klar erkennbar machen.

---

## 23.7 Idle-Aktivitäten

Idle-Aktivitäten sollen sichtbar in der Welt stattfinden.

Beispiel:

Ein Charakter beim Holzfällen:

```text id="m2m9c8"
     Charakter
        ↓
       🪓
        ↓
      Baum
```

Der Charakter führt die Aktivität dauerhaft aus, während der Spieler andere Charaktere steuern kann.

---

## 23.8 Ressourcen

Ressourcen sollen visuell eindeutig erkennbar sein.

Beispiele:

* unterschiedliche Baumarten
* verschiedene Erzadern
* Angelstellen
* Pflanzen
* Landwirtschaftsflächen

Höherwertige Ressourcen können ein erkennbar anderes Erscheinungsbild besitzen.

---

## 23.9 Gegner

Jeder Gegnertyp erhält einen eigenen Pixel-Art-Sprite.

Unterschiede sollen gut erkennbar sein durch:

* Körperform
* Größe
* Farben
* Ausrüstung
* Animationen
* Effekte

Stärkere Varianten können visuell an die normale Gegnerart angelehnt sein.

---

## 23.10 Bosse

Bosse sollen deutlich größer und auffälliger als normale Gegner sein.

Sie sollen sich durch:

* Größe
* Animationen
* besondere Effekte
* einzigartige Designs
* mehrere Kampfphasen

klar von normalen Gegnern unterscheiden.

---

## 23.11 Weltgestaltung

Jedes Gebiet soll eine eigene visuelle Identität besitzen.

Beispielsweise:

**Wiese**

→ helle, offene Landschaft

**Wald**

→ Bäume, Pflanzen und dichter Hintergrund

**Mine**

→ Felsen, Erzadern und dunklere Umgebung

**Magisches Gebiet**

→ magische Elemente und besondere Effekte

Dadurch soll der Spieler bereits anhand der Umgebung erkennen können, wo er sich befindet.

---

## 23.12 Portale

Portale sollen visuell auffällig sein.

Ein Portal kann beispielsweise durch:

* besondere Animationen
* leuchtende Effekte
* charakteristische Formen

erkennbar sein.

Gesperrte und freigeschaltete Portale sollen optisch unterscheidbar sein.

---

## 23.13 Gegenstände

Gegenstände im Inventar und in der Welt werden als Pixel-Art-Icons dargestellt.

Die Icons sollen auch bei kleiner Darstellung eindeutig erkennbar sein.

Seltene Gegenstände können zusätzliche visuelle Merkmale besitzen.

---

## 23.14 Ausrüstung

Ausrüstung soll möglichst direkt am Charakter sichtbar sein.

Wenn ein Charakter beispielsweise eine neue Waffe oder Rüstung erhält, soll sich sein Sprite entsprechend verändern.

Dadurch wird Ausrüstung nicht nur über Zahlen, sondern auch visuell dargestellt.

---

## 23.15 Effekte

Aktive Fähigkeiten, Zauber und besondere Angriffe können Pixel-Art-Partikeleffekte besitzen.

Beispielsweise:

* Dash-Effekt
* Magie
* Treffer
* Explosionen
* Bossfähigkeiten
* Verzauberungen

Die Effekte sollen verständlich bleiben und nicht die Spielwelt überladen.

---

## 23.16 UI und Pixel-Art

Die Benutzeroberfläche soll optisch zum Pixel-Art-Stil passen.

Dazu gehören beispielsweise:

* Pixel-Schrift bzw. passende Schrift
* Pixel-Art-Icons
* einfache Rahmen
* klare Symbole
* passende Menüelemente

Die Lesbarkeit hat dabei Vorrang vor dekorativen Elementen.

---

## 23.17 Technische Zielrichtung

Die Assets sollen so erstellt werden, dass sie für eine Browser-Version und später für eine Steam-Version verwendet werden können.

Die Assets müssen daher möglichst:

* wiederverwendbar
* modular
* performant
* sauber strukturiert

sein.

---

## 23.18 Asset-Erstellung

Codex soll bei der Entwicklung die benötigten Assets generieren bzw. vorbereiten.

Dazu gehören unter anderem:

* Charakter-Sprites
* Gegner
* Bosse
* Tiles
* Hintergründe
* Ressourcen
* Gegenstände
* Ausrüstung
* Icons
* Animationen
* Effekte

Die Assets werden anschließend in das Spiel integriert.

---

## 23.19 Ziel des Pixel-Art-Stils

Der Pixel-Art-Stil soll eine **erkennbare, lockere Fantasy-Welt** schaffen, in der der Spieler jederzeit erkennen kann:

* welcher Charakter gerade aktiv ist
* was er macht
* gegen wen er kämpft
* welche Ressourcen vorhanden sind
* in welchem Gebiet er sich befindet
* welche Ausrüstung er trägt
* welche Klasse er besitzt

Die Grafik soll damit nicht nur dekorativ sein, sondern direkt zur Verständlichkeit des Gameplays beitragen.
