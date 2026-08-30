# 6. Kampf

## 6.1 Grundprinzip

Das Kampfsystem kombiniert **aktiven Action-Kampf mit einem Idle-Kampfsystem**.

Der Spieler kann selbst entscheiden, ob er einen Charakter aktiv steuert oder ihn automatisch kämpfen lässt.

Der Kampf findet in einer **begehbaren 2D-Pixel-Art-Welt aus der Seitenperspektive** statt.

---

## 6.2 Bewegung

Während des aktiven Kampfes kann der Spieler seinen Charakter frei durch das Gebiet bewegen.

Der Charakter kann:

* nach links und rechts laufen
* sich innerhalb des Gebietes bewegen
* Gegner angreifen
* aktive Fähigkeiten einsetzen
* durch Portale reisen

Die Bewegung soll bewusst einfach gehalten werden und nicht zu einem komplexen Plattformspiel werden.

---

## 6.3 Gegner angreifen

Normale Gegner werden nicht über ein klassisches Zielmenü ausgewählt.

Der Spieler nähert sich einem Gegner und kann diesen gezielt angreifen.

Durch die vorgesehenen Eingaben kann der Charakter den Gegner anvisieren und seine normalen Angriffe ausführen.

Der normale Kampf soll dadurch leicht verständlich bleiben.

---

## 6.4 Normale Angriffe

Jeder Charakter besitzt abhängig von seiner Ausrüstung und Klasse normale Angriffe.

Die grundlegende Steuerung soll einfach sein:

* Linksklick/Rechtsklick zum Angreifen bzw. Anvisieren
* Bewegung über die normale Bewegungssteuerung
* aktive Fähigkeiten über Tasten/Hotkeys

Die konkrete Angriffsweise hängt von der Klasse und der ausgerüsteten Waffe ab.

---

## 6.5 Aktive Fähigkeiten

Jeder Charakter besitzt aktive Fähigkeiten.

Der Charakter startet mit einer einfachen Fähigkeit, beispielsweise einem **Dash**.

Mit zunehmender Klassenentwicklung erhält der Charakter weitere bzw. verbesserte Fähigkeiten.

Die Fähigkeiten sind abhängig von der gewählten Klasse.

Beispiele:

**Nahkampf**

* Dash
* mächtiger Angriff
* Flächenangriff
* defensive Fähigkeit

**Magie**

* Dash
* Zauber
* Flächenzauber
* stärkere magische Fähigkeiten

**Fernkampf**

* Dash
* schneller Schuss
* Mehrfachschuss
* Spezialangriff

**Pet Master**

* Dash
* Pet beschwören
* Pet-Angriff
* Pet-Unterstützung

---

## 6.6 Klassenabhängiger Kampf

Die Klassenentwicklung beeinflusst die tatsächliche Spielweise.

Ein Charakter soll sich nicht nur durch höhere Zahlen von einem anderen Charakter unterscheiden.

Unterschiedliche Klassen sollen beispielsweise:

* andere Angriffe besitzen
* andere Fähigkeiten besitzen
* andere Reichweiten besitzen
* andere Kampfrollen besitzen
* andere Synergien mit Attributen besitzen

Dadurch fühlt sich ein Wechsel zwischen Charakteren spielerisch unterschiedlich an.

---

## 6.7 Gegner

Normale Gegner werden bewusst einfach gehalten.

Ein normaler Gegner besitzt normalerweise:

* grundlegendes Bewegungsverhalten
* Lebenspunkte
* Schaden
* einen oder maximal zwei verschiedene Angriffe

Normale Gegner sollen keine komplizierten Bossmechaniken besitzen.

Die Herausforderung entsteht hauptsächlich durch die Stärke der Gegner, die Anzahl der Gegner und das Gebiet.

---

## 6.8 Automatischer Kampf

Der Spieler kann einen Charakter in den **Idle-/Auto-Kampf** versetzen.

Der Charakter kämpft dann selbstständig gegen verfügbare Gegner.

Dabei werden normale Angriffe automatisch ausgeführt.

Je nach Charakterklasse können auch Fähigkeiten automatisch eingesetzt werden.

Der Spieler muss den Kampf nicht permanent überwachen.

---

## 6.9 Aktiver Kampf vs. Idle-Kampf

Es gibt zwei grundlegende Spielweisen:

### Aktiver Kampf

Der Spieler:

* bewegt den Charakter
* greift Gegner an
* nutzt aktive Fähigkeiten
* positioniert sich
* kann mehrere Charaktere gemeinsam steuern

### Idle-Kampf

Der Charakter:

* kämpft automatisch
* führt normale Angriffe automatisch aus
* nutzt verfügbare automatische Kampfaktionen
* sammelt Erfahrung und Beute

Beide Spielweisen sollen miteinander funktionieren.

---

## 6.10 Kampfbelohnungen

Das Besiegen von Gegnern kann unter anderem geben:

* Charaktererfahrung
* Kampf-/Skill-Erfahrung
* Ressourcen
* Ausrüstung
* Währung
* weitere Gegenstände

Stärkere Gegner sollen entsprechend bessere Belohnungen bieten.

---

## 6.11 Gegnergebiete

Gegner befinden sich in den verschiedenen Gebieten der Welt.

Ein Portal kann beispielsweise zu einem Gebiet mit bestimmten Gegnern führen.

Beispiel:

> Gebiet 1 → Slimes  
> Gebiet 2 → stärkere Monster  
> Gebiet 3 → weitere Monster  
> Gebiet 4 → stärkere Gegner

Die Schwierigkeit steigt mit dem Fortschritt des Spielers.

---

## 6.12 Bosskampf

Bosse unterscheiden sich deutlich von normalen Gegnern.

Während normale Gegner einfache Angriffsmuster besitzen, können Bosse:

* mehrere Angriffe besitzen
* besondere Fähigkeiten besitzen
* besondere Mechaniken besitzen
* mehrere Phasen besitzen
* deutlich stärkere Belohnungen geben

Bosse erscheinen nicht in jedem Gebiet.

Stattdessen befinden sich beispielsweise nach mehreren normalen Gebieten besondere Bossbereiche.

---

## 6.13 Mehrere Charaktere im Kampf

Der Spieler kann mehrere Charaktere gemeinsam einsetzen.

Mit dem Split-Screen-System können bis zu **4 Charaktere gleichzeitig aktiv gesteuert** werden.

Dadurch können beispielsweise vier unterschiedliche Klassen gemeinsam einen Boss bekämpfen.

Beispiel:

> Charakter 1 → Nahkampf  
> Charakter 2 → Fernkampf  
> Charakter 3 → Magie  
> Charakter 4 → Pet Master

Die Charaktere können dabei gleichzeitig kämpfen und ihre individuellen Fähigkeiten einsetzen.

---

## 6.14 Charakterwechsel während des Kampfes

Der Spieler kann jederzeit zwischen seinen Charakteren wechseln.

Ein Charakter, der gerade nicht aktiv gesteuert wird, kann seinen aktuellen Kampf bzw. seine Aktivität weiterhin automatisch fortsetzen.

Dadurch muss der Spieler nicht dauerhaft bei einem einzelnen Charakter bleiben.

---

## 6.15 Tod

Der Tod eines Charakters besitzt keine dauerhaften negativen Konsequenzen.

Es werden keine:

* Level verloren
* Gegenstände zerstört
* Ressourcen dauerhaft entfernt

Der Spieler soll nach einem Fehlschlag ohne großen Verlust weiterspielen können.

---

## 6.16 Ziel des Kampfsystems

Das Kampfsystem soll drei Dinge miteinander verbinden:

**Einfacher Einstieg**

→ normale Gegner sind leicht verständlich.

**Aktive Kontrolle**

→ Spieler können Bewegung und Fähigkeiten selbst übernehmen.

**Idle-Komfort**

→ Charaktere können automatisch kämpfen und währenddessen Fortschritt erzielen.

Dadurch kann der Spieler selbst entscheiden, wie aktiv er spielen möchte.
