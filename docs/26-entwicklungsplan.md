# 26. Konkreter Entwicklungsplan für Claude Code + Codex

## 26.1 Grundprinzip
Das Spiel wird schrittweise entwickelt. Claude Code und Codex sollen **nicht versuchen, das komplette Spiel auf einmal zu programmieren**. Jede Entwicklungsphase muss zunächst funktionierend umgesetzt und getestet werden, bevor die nächste Phase begonnen wird. Die Entwicklung beginnt mit einer spielbaren Browser-Version und erweitert diese anschließend Schritt für Schritt.

# Phase 1 – Technisches Fundament
## Ziel
Eine funktionierende Browser-Anwendung erstellen.
### Aufgaben
* Projektstruktur, Frontend und Backend einrichten
* Datenbank und Entwicklungsserver einrichten
* Kommunikation zwischen Client und Server
* Game-State-System und Speicherung von Spielerdaten
### Ergebnis
Eine leere, aber funktionierende Browser-Spielanwendung mit Client, Server und persistenter Datenhaltung.

# Phase 2 – 2D-Spielwelt
## Ziel
Eine erste begehbare 2D-Pixel-Art-Welt erstellen.
### Aufgaben
* 2D-Rendering, Tile-System, erste Map und Kamera
* Charakter-Sprite, Bewegung und Kollisionen
* Portale und Gebietswechsel
### Ergebnis
Der Spieler kann einen Charakter durch eine kleine 2D-Welt bewegen und ein anderes Gebiet betreten.

# Phase 3 – Charakter-System
## Ziel
Das grundlegende Charakter-System implementieren.
### Aufgaben
* Charakter erstellen, benennen, speichern und laden
* Level, Erfahrung und Attribute
* mehrere Charaktere, Charakterwechsel und gespeicherte Positionen
### Ergebnis
Mehrere unabhängige Charaktere mit eigenem Fortschritt und eigener Position.

# Phase 4 – Mehrere Charaktere gleichzeitig
## Ziel
Das zentrale Spielprinzip technisch umsetzen.
### Aufgaben
* Charaktere unabhängig und Aktivitäten parallel simulieren
* Charakterwechsel bei weiterlaufender Aktivität
* mehrere Charaktere darstellen
* Split-Screen vorbereiten und bis zu 4 Charaktere steuerbar machen
### Ergebnis
Charaktere können gleichzeitig Holzfällen, Mining, Kampf und andere Aktivitäten ausführen.

# Phase 5 – Grundlegendes Kampfsystem
## Ziel
Funktionierenden Kampf gegen normale Gegner implementieren.
### Aufgaben
* Gegner-System, Werte, Lebenspunkte, Schaden und Bewegung
* Zielauswahl, Spieler- und Gegnerangriff, Tod, Erfahrung und Drops
### Ergebnis
Ein Charakter kann einen normalen Gegner aktiv bekämpfen und besiegen.

# Phase 6 – Aktiver Kampf
## Ziel
Das aktive Kampfsystem vollständig spielbar machen.
### Aufgaben
* Bewegung, Anvisieren und Linksklick/Rechtsklick-Angriffssystem
* aktive Fähigkeiten, erster Dash und Cooldowns
* Schadensberechnung, Treffer und einfache Kampfanimationen
### Ergebnis
Der Spieler kann einen Charakter aktiv steuern und mit ihm kämpfen.

# Phase 7 – Idle-Kampf
## Ziel
Normale Gegner automatisch bekämpfen können.
### Aufgaben
* Idle-Kampf, automatische Angriffe, Gegnerauswahl und Gegnerwechsel
* XP- und Drop-Berechnung, kontinuierliche Kämpfe
### Ergebnis
Ein Charakter kämpft selbstständig, während ein anderer gesteuert wird.

# Phase 8 – Inventar und Drops
## Ziel
Das grundlegende Item- und Inventarsystem implementieren.
### Aufgaben
* Items, IDs, Stacks, Inventar und Rucksackkapazität
* Aufnehmen, Droppen, Weltdarstellung und Inventar-UI
### Besonderheit
Bei vollem Rucksack wird der Gegenstand in der Welt abgelegt: bei Gegnern am Gegner, bei Bossen unter/am Boss.
### Ergebnis
Items können gesammelt, getragen und sichtbar abgelegt werden.

# Phase 9 – Erste Berufe
## Ziel
Holzfällen, Mining, Angeln und Landwirtschaft als Idle-System implementieren.
### Aufgaben
* Berufsskills, Erfahrung und Skilllevel
* Ressourcenstellen, Werkzeuge, Produktion, Drops und Skill-Anforderungen
### Ergebnis
Ein Charakter kann dauerhaft an einem Ressourcenpunkt arbeiten.

# Phase 10 – Skill-System
## Ziel
Das allgemeine Skill-System erweitern.
### Aufgaben
* Skill-Level und XP-Kurven
* mehrere Skills, Boni, Anforderungen und parallele Entwicklung
### Ergebnis
Charaktere entwickeln sich entsprechend ihrer tatsächlichen Aktivitäten.

# Phase 11 – Charakterlevel und Attribute
## Ziel
Die grundlegende Charakterprogression implementieren.
### Aufgaben
* Charakter-XP, Level-Ups ohne Maximalstufe
* Stärke, Intelligenz, Geschick, Vitalität und Weisheit
* Attributsteigerungen und Einfluss auf Spielsysteme
### Ergebnis
Charaktere können unabhängig dauerhaft stärker werden.

# Phase 12 – Klassen-System
## Ziel
Die dauerhafte Charakter-Spezialisierung implementieren.
### Aufgaben
* Klassenstruktur, Level-10-Auswahl und grobe Richtungen
* spätere Spezialisierung, Boni, Fähigkeiten und permanente Entscheidungen
### Ergebnis
Ursprünglich identische Charaktere entwickeln sich langfristig unterschiedlich.

# Phase 13 – Aktive Klassenfähigkeiten
## Ziel
Klassen- und Kampfsystem verbinden.
### Aufgaben
* klassenspezifische Fähigkeiten, Slots, Cooldowns und Kosten
* Animationen, Effekte und Fähigkeitsentwicklung; Dash als Ausgangspunkt
### Ergebnis
Klassen spielen sich aktiv unterschiedlich.

# Phase 14 – Ausrüstung
## Ziel
Das vollständige Ausrüstungssystem implementieren.
### Aufgaben
* Waffe, Rüstung, Helm, Schuhe, Werkzeug und Schmuck
* Ausrüsten, Werte, Boni, Seltenheiten, Kompatibilität und UI
### Ergebnis
Ausrüstung beeinflusst Charaktere und Builds.

# Phase 15 – Crafting
## Ziel
Kochen, Schmieden, Alchemie und Verzaubern implementieren.
### Aufgaben
* Rezepte, Materialien, Produktionszeit und Crafting-XP
* Herstellung, UI und Voraussetzungen
### Ergebnis
Ressourcen werden in nutzbare Gegenstände umgewandelt.

# Phase 16 – Welt und Gebiete erweitern
## Ziel
Aus dem Prototyp eine größere Spielwelt machen.
### Aufgaben
* mehrere Gebiete, Portale, Umgebungen, Gegner und Ressourcen
* Gebietsschwierigkeit und Ressourcenanforderungen
### Ergebnis
Eine zusammenhängende Fantasy-Welt mit mehreren Wegen.

# Phase 17 – Herausforderungen
## Ziel
Gebiete über Herausforderungen freischalten.
### Aufgaben
* Challenge-System, Fortschritt, Anforderungen, Portal-Anzeige und Freischaltung
### Ergebnis
Gebietsprogression funktioniert direkt über die Spielwelt.

# Phase 18 – Quests
## Ziel
NPCs und Quests integrieren.
### Aufgaben
* NPCs, Questgeber, Ziele, Fortschritt, Belohnungen, Ketten und UI
### Ergebnis
Spieler können zusätzliche Weltaufgaben abschließen.

# Phase 19 – Bosse
## Ziel
Das Boss-System entwickeln.
### Aufgaben
* Bosswerte, Arena, Spezialangriffe, Phasen, Drops, Belohnungen und UI
### Ergebnis
Mehrere Charaktere können gemeinsam einen Boss bekämpfen.

# Phase 20 – Split-Screen
## Ziel
Das zentrale 4-Charakter-System fertigstellen.
### Aufgaben
* 2–4 Charaktere, unabhängige Steuerung und Kamera
* gemeinsame Bosskämpfe und UI pro Charakter
### Ergebnis
Bis zu vier eigene Charaktere können gleichzeitig aktiv gesteuert werden.

# Phase 21 – Offline-Idle
## Ziel
Das 48-Stunden-Offline-System implementieren.
### Aufgaben
* Aktivität und Zeitdifferenz speichern und berechnen
* maximal 48 Stunden bei reduzierter Effizienz
* Ressourcen, XP, Drops und Login-Zusammenfassung
### Ergebnis
Charaktere entwickeln sich offline weiter.

# Phase 22 – Handel
## Ziel
Die Spielerwirtschaft implementieren.
### Aufgaben
* Markt, Angebote, Kaufen, Verkaufen, Preise und handelbare Items
* Ingame-Währung und Transfers zwischen eigenen Charakteren
### Ergebnis
Spieler können Ressourcen und Gegenstände austauschen.

# Phase 23 – Multiplayer
## Ziel
Die Welt mit anderen Spielern verbinden.
### Aufgaben
* Darstellung, Bewegung und Charaktere anderer Spieler
* Server-Synchronisation, Positionen, Ranglisten und Optimierung
### Ergebnis
Eine gemeinsame MMO-Welt ohne Fokus auf direkte soziale Interaktion.

# Phase 24 – Vollständige UI
## Ziel
Alle Systeme einheitlich zugänglich machen.
### Aufgaben
* Haupt-UI, Charakterleiste und Charakterfenster
* Inventar, Ausrüstung, Skills, Klassen, Quests und Crafting
* Handel, Karte, Einstellungen, Split-Screen- und Boss-UI
### Ergebnis
Alle Systeme sind verständlich und komfortabel bedienbar.

# Phase 25 – Pixel-Art und Assets
## Ziel
Prototype-Grafik durch die geplante Pixel-Art-Richtung ersetzen bzw. erweitern.
### Codex-Aufgaben
* Charakter-Sprites, Gegner, Bosse, Tiles und Hintergründe
* Ressourcen, Items, Ausrüstung, Animationen, Partikeleffekte und UI-Elemente
### Ergebnis
Das Spiel erhält seine eigene visuelle Identität.

# Phase 26 – Balancing
## Ziel
Die Spielsysteme miteinander ausbalancieren.
### Überprüfen
* XP-Kurven, Skill-XP, Gegner- und Bossstärke
* Ressourcenproduktion, Crafting-Zeiten und Dropchancen
* Ausrüstungswerte, Klassenstärke, Idle- und Offline-Effizienz
* Charakterfortschritt und Wirtschaft

Keine Spielweise darf grundsätzlich die einzige optimale Lösung sein.

# Phase 27 – Persistenz und Sicherheit
## Ziel
Den Spielstand zuverlässig und manipulationsresistent machen.
### Aufgaben
* serverseitige Validierung und Datenbankoptimierung
* sichere Items, Währung, XP und Handelsaktionen
* Save-, Backup-, Fehlerbehandlungssystem

# Phase 28 – Performance
## Ziel
Das Spiel mit vielen Charakteren und Spielern performant machen.
### Aufgaben
* Rendering, Netzwerk, Idle-Berechnung und Datenbankabfragen optimieren
* Speicherverbrauch und Multiplayer-Synchronisation optimieren

Besonders wichtig: Viele Spieler können mehrere Charaktere gleichzeitig besitzen.

# Phase 29 – Testversion
## Ziel
Eine vollständige spielbare Browser-Version erstellen.

Sie enthält mindestens mehrere Charaktere und Wechsel, parallele Aktivitäten, Kampf und Idle-Kampf, Berufe, Skills, Level, Attribute, Klassen, Ausrüstung, Inventar, Crafting, Gebiete, Portale, Herausforderungen, Quests, Bosse, Split-Screen, Offline-Fortschritt, grundlegenden Multiplayer und Handel.

# Phase 30 – Testen und Fehlerbehebung
## Ziel
Das Spiel intensiv testen.
### Claude Code
* Fehler analysieren, Bugs beheben, Systeme testen, Code verbessern und Performanceprobleme beheben
### Codex
* Assets prüfen und erstellen, Animationen und visuelle Fehler verbessern sowie Asset-Integration unterstützen

# Phase 31 – Steam-Vorbereitung
## Ziel
Die Browser-Version auf Steam vorbereiten.
### Aufgaben
* Steam-kompatiblen Build und Desktop-Integration vorbereiten
* Speicher-/Login-System, Performance, Eingaben und Auflösungen prüfen
* Fullscreen und Steam-spezifische Integration vorbereiten

# 26.32 Arbeitsweise von Claude Code + Codex
Die Systeme arbeiten koordiniert:
```text
GDD → Aufgabe definieren → Claude Code / Codex implementieren → Testen → Fehler beheben → Funktion bestätigen → nächste Aufgabe
```
Neue Systeme beginnen erst, wenn benötigte vorherige Systeme stabil funktionieren.

# 26.33 Entwicklungsprinzip
Das Projekt soll **spielbar wachsen**:
```text
kleines funktionierendes System → testen → erweitern → testen → nächstes System
```
Damit soll jederzeit eine funktionierende Version vorhanden sein.

# 26.34 Priorität
1. **Kern-Spielprinzip:** mehrere Charaktere gleichzeitig und parallele Aktivitäten
2. **Charakterentwicklung:** Level → Attribute → Skills → Klassen → Spezialisierungen
3. **Aktivitäten:** Kampf → Holzfällen → Mining → Angeln → Landwirtschaft → Crafting
4. **Welt:** Gebiete → Portale → Herausforderungen → Quests → Bosse
5. **Multiplayer:** andere Spieler → Handel → Ranglisten
6. **Präsentation:** UI → Pixel-Art → Animationen → Effekte
7. **Langfristige Systeme:** Endgame → Balancing → Monetarisierung → Steam

# 26.35 Endziel
Am Ende soll eine Browser-Version entstehen, in der der Spieler:

1. mehrere Charaktere besitzt,
2. jeden Charakter individuell entwickelt,
3. Charaktere unterschiedlichen Aktivitäten zuweist,
4. mehrere Charaktere gleichzeitig laufen lässt,
5. zwischen ihnen wechseln kann,
6. bis zu vier Charaktere gleichzeitig steuern kann,
7. unterschiedliche Klassen und Spezialisierungen entwickelt,
8. kämpft,
9. Ressourcen sammelt,
10. Crafting betreibt,
11. Gebiete freischaltet,
12. Bosse bekämpft,
13. handelt,
14. auch offline Fortschritt erzielt,
15. und langfristig immer weitere Verbesserungen erreichen kann.

**Das zentrale technische Ziel bleibt dabei unverändert:**

> **Ein Idle-MMO, in dem mehrere individuell entwickelte Charaktere gleichzeitig aktiv sind und sich durch unterschiedliche Spielweisen dauerhaft spezialisieren können.**
