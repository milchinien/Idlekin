# M6 — Kampf, aktiv und automatisch

**Ziel:** Gegner leben in Gebieten, werden vom Spieler aktiv bekämpft oder vom Charakter
selbstständig, und hinterlassen Erfahrung und Beute.

**Aufwand:** 8–10 Tage
**Vorbedingungen:** M4 (Beute braucht Inventar), M5 empfohlen (Idle-Rahmen existiert)
**GDD-Bezug:** `docs/06-kampf.md`, `docs/14-gegner.md`, `docs/25` §25.17, §25.22,
`docs/22` §22.11, `docs/26` Phasen 5, 6, 7

---

## Leitentscheidung: Kampf tickt, Idle-Kampf rechnet nicht

Das Idle-System aus M5 rechnet Erträge aus Zeitdifferenzen. Beim Kampf wäre das ebenfalls
möglich, aber falsch:

- **Sichtbarer Kampf muss stattfinden.** `docs/12` §12.9 und `docs/18` §18.2 verlangen,
  dass man andere Charaktere kämpfen *sieht*. Ein hochgerechnetes Ergebnis hat keine
  Animation.
- **Kampf ist unsicher.** Ein Charakter kann sterben (`docs/06` §6.15). Eine Formel, die
  40 Stunden Kampf in einem Schritt auswürfelt, muss Tod, Erholung und Gegnerwechsel
  abbilden — dieselbe Komplexität wie die Simulation, nur ohne Nachvollziehbarkeit.

**Also zwei Betriebsarten:**

| Zustand | Verhalten |
|---|---|
| Gebiet ist beobachtet | volle Simulation im 20-Hz-Tick, sichtbar |
| Gebiet ist unbeobachtet, Spieler online | **abstrahierte Simulation**: Kampfrunden alle 2 s, ohne Positionen |
| Spieler offline | **Formelabrechnung** über `idleYield`, mit Kampfparametern |

Die drei Betriebsarten teilen sich **eine** Schadens- und Belohnungsberechnung aus
`shared/rules/combat.ts`. Nur die Auflösung unterscheidet sich. Wird das getrennt
implementiert, entstehen unterschiedliche Erträge je nachdem, ob man zusieht — und
Spieler merken das sofort.

---

## Abweichung vom GDD-Plan

`docs/26` trennt Phase 5 (Grundlagen), 6 (aktiv) und 7 (Idle). Die Trennung bleibt
inhaltlich, wird hier aber als Schrittfolge innerhalb eines Meilensteins geführt, weil
Phase 5 allein keinen spielbaren Zustand ergibt.

---

## Schritte

### S-6.1 Gegner als Daten und als Instanz

**Was:** Gegnerdefinition im Content, Gegnerinstanzen in der Gebietslaufzeit.

**Dateien:**

- `packages/shared/src/types/enemy.ts`
- `packages/shared/src/content/enemySchema.ts`
- `content/enemies/*.json`
- `packages/server/src/world/enemySpawner.ts`

**Details:**

Definition nach `docs/25` §25.17, Beispiel siehe
[00-grundlagen-und-entscheidungen.md](00-grundlagen-und-entscheidungen.md) E6.

**Erscheinen und Wiederkehr:** Gebietsdateien enthalten Erscheinungspunkte:

```jsonc
"enemies": [
  { "enemyId": "enemy.slime", "x": 400, "y": 320, "respawnMs": 8000, "count": 3 }
]
```

`docs/14` §14.14: Gegner sind nach dem Besiegen wieder verfügbar, damit Idle-Kampf
dauerhaft funktioniert. **Kein Erschöpfen, keine Konkurrenz zwischen Spielern.**
Konsequenterweise ist ein Gegner **pro Spieler instanziiert**: Zwei Spieler im selben
Gebiet sehen einander, kämpfen aber nicht um dieselben Schleime. Das ist die logische
Fortsetzung von `docs/18` §18.6 (keine direkte Konkurrenz) auf den Kampf.

**Gegnerverhalten** bleibt einfach (`docs/14` §14.4, §14.17): Patrouillieren im Bereich,
bei Nähe angreifen, ein bis zwei Angriffe, keine Verbundtaktik, keine Wegfindung über
Sprünge.

**Fertig wenn:** Mindestens fünf Gegnerarten über drei Gebiete existieren, erscheinen,
patrouillieren und nach dem Besiegen wiederkehren.

---

### S-6.2 Kampfwerte und Schadensformel

**Was:** Die eine Stelle, an der Schaden entsteht.

**Dateien:**

- `packages/shared/src/rules/combat.ts`
- `packages/shared/src/types/combatStats.ts`

**Details:**

Abgeleitete Werte eines Charakters aus Level, Attributen (M7), Ausrüstung (M8) und Klasse
(M7):

```ts
type CombatStats = {
  maxHealth: number; health: number;
  attackPower: number;      // physisch
  spellPower: number;       // magisch
  defense: number;
  attackSpeed: number;      // Angriffe pro Sekunde
  moveSpeed: number;
  critChance: number; critMultiplier: number;
  range: number;
};
```

Schadensformel, vorläufig:

```ts
roh        = attackPower * waffenFaktor * fähigkeitsFaktor
minderung  = defense / (defense + 50 + 10 * angreiferLevel)
schaden    = max(1, round(roh * (1 - minderung) * (kritisch ? critMultiplier : 1)))
```

Die Minderung ist **multiplikativ mit Sättigung**, nicht subtraktiv. Subtraktive Rüstung
(`schaden - defense`) führt bei einem Spiel ohne Levelobergrenze zwangsläufig dazu, dass
Gegner irgendwann null Schaden machen oder unbesiegbar werden. Diese Wahl ist nicht
Balancing, sondern Struktur — sie steht deshalb hier und nicht in M13.

**Fertig wenn:** Die Formel ist implementiert, getestet für Grenzfälle (Verteidigung 0,
sehr hohe Verteidigung, Level 1 gegen Level 100), liefert nie Werte unter 1 und ohne
kritischen Treffer nie mehr als den Rohschaden.

---

### S-6.3 Aktiver Kampf

**Was:** Der Spieler bewegt sich, zielt und greift an.

**Dateien:**

- `packages/shared/src/sim/combatSim.ts`
- `packages/server/src/systems/combatSystem.ts`
- `packages/client/src/scenes/combatView.ts`

**Details:**

Steuerung nach `docs/06` §6.3, §6.4:

- **Linksklick** = normaler Angriff in Blickrichtung. Getroffen wird, was in der
  Trefferzone liegt — **kein Zielmenü** (`docs/06` §6.3 schließt das aus).
- **Rechtsklick** = weiches Anvisieren: Der nächste Gegner im Umkreis wird markiert, die
  Figur dreht sich zu ihm. Das ersetzt Zielgenauigkeit, nicht Positionierung.
- **Tasten 1–4** = aktive Fähigkeiten (M7). In M6 ist nur der **Dash** belegt
  (`docs/06` §6.5: der Charakter startet mit Dash).

Der Server ist autoritativ. Der Client sendet `{ t: 'attack', sequence, direction }` und
zeigt die Animation sofort; Treffer, Schaden und Tod bestätigt der Server.

**Trefferzone** als Rechteck vor der Figur, Reichweite aus `CombatStats.range`. Die
Hitbox der Figur bleibt **12 × 20 px unabhängig von sichtbarer Ausrüstung** —
`docs/27` §27.4 legt das fest, und es ist wichtig: Sonst wird ein Charakter durch eine
größere Rüstung leichter zu treffen.

**Tod** nach `docs/06` §6.15: keine dauerhaften Verluste. Der Charakter wird nach
5 Sekunden am Gebietseinstieg mit voller Gesundheit wiederhergestellt und seine Aktivität
wird fortgesetzt. Keine Erfahrungsstrafe, keine Beschädigung von Ausrüstung.

**Fertig wenn:** Ein Charakter kann einen Schleim aktiv besiegen; Treffer sind sichtbar
(Schadenszahlen, Rückstoß, Trefferblinken); der Charakter kann sterben und kehrt zurück.

---

### S-6.4 Beute und Erfahrung

**Was:** Was beim Sieg passiert.

**Dateien:** `packages/server/src/systems/lootSystem.ts`

**Details:**

Nach `docs/06` §6.10: Charakter-XP, Kampf-Skill-XP, Ressourcen, Ausrüstung, Währung.

Ablauf beim Tod eines Gegners:

1. Drop-Tabelle auswürfeln (M4/S-4.4)
2. XP vergeben, Attribut-XP nach Gegnerdatensatz
3. Beute ins Inventar; **was nicht passt, fällt am Ort des Gegners zu Boden**
   (`docs/22` §22.7 nennt genau diesen Ort)
4. Herausforderungs- und Questzähler erhöhen (Aufhängepunkt jetzt, Inhalt in M9)

**Fertig wenn:** Beute erscheint, wird eingesammelt, fällt bei vollem Rucksack zu Boden
und überlebt einen Neustart.

---

### S-6.5 Idle-Kampf

**Was:** Der Charakter kämpft selbstständig weiter.

**Dateien:** `packages/server/src/systems/autoCombat.ts`

**Details:**

Aktivität `{ type: 'combat', areaId }`. Der Charakter greift automatisch den
nächsten verfügbaren Gegner an, nutzt normale Angriffe und — je nach Klasse (M7) —
Fähigkeiten automatisch (`docs/06` §6.8, `docs/07` §7.5).

**Beobachtetes Gebiet:** volle Simulation. Der Charakter läuft sichtbar zum Gegner und
schlägt zu. Die Zielauswahl ist bewusst schlicht: nächster lebender Gegner in Reichweite
des Zielgebiets, kein Wechsel vor dessen Tod.

**Unbeobachtetes Gebiet, Spieler online:** Rundenmodell alle 2 Sekunden ohne Positionen.
Beide Seiten schlagen mit ihrer Angriffsgeschwindigkeit zu, `combat.ts` rechnet den
Schaden.

**Offline:** Formelabrechnung. Aus Kampfwerten und Gegnerwerten wird die durchschnittliche
Zeit pro getötetem Gegner bestimmt, daraus die Anzahl im Zeitraum:

```text
zeitProGegner = gegnerLeben / (schadenProSekunde) + 1 s Wegzeit
n             = floor(zeitraum * effizienz / zeitProGegner)
```

Kann der Charakter den Gegner **nicht** töten (Schaden pro Sekunde zu gering oder er
stirbt schneller als der Gegner), ist der Ertrag **null** und die Zusammenfassung nennt
den Grund: „Bran ist im Dunklen Wald gescheitert — die Gegner sind zu stark." Ein
stillschweigend leerer Ertrag ist der Fehlerbericht von morgen.

**Prüfung der Gleichwertigkeit:** Der Ertrag der drei Betriebsarten muss über eine Stunde
innerhalb von ±10 % übereinstimmen. Das ist der Abnahmetest dieses Schritts.

**Fertig wenn:** Ein Charakter kämpft im beobachteten Gebiet sichtbar; ein zweiter kämpft
gleichzeitig unbeobachtet; nach Abmelden und Wiederkommen weist die Zusammenfassung
Kills, XP und Beute aus; die ±10-%-Prüfung besteht.

**Risiko:** Der wahrscheinlichste Fehler des ganzen Projekts sitzt hier — drei Wege zu
denselben Zahlen. Deshalb der ausdrückliche Vergleichstest.

---

### S-6.6 Kampf-UI

**Was:** Was der Spieler während des Kampfes sieht.

**Dateien:**

- `packages/client/src/ui/healthBars.ts`
- `packages/client/src/ui/damageNumbers.ts`
- `packages/client/src/ui/abilityBar.ts`

**Details:** Nach `docs/22` §22.11: Lebensbalken am Gegner mit Name und Level,
Schadenszahlen, eigene Gesundheit gut sichtbar, Fähigkeitsleiste mit Abklingzeit.

Schadenszahlen versetzt und mit kurzer Lebensdauer, damit sie bei mehreren Gegnern nicht
zur Wand werden. Kritische Treffer optisch abgesetzt.

**Fertig wenn:** Im Kampf ist ohne Nachdenken erkennbar: wen ich treffe, wie viel, wie
es mir geht, was ich einsetzen kann.

---

### S-6.7 Erste aktive Fähigkeit: Dash

**Was:** Die Fähigkeit, mit der laut `docs/04` §4.9 und `docs/06` §6.5 jeder Charakter
startet.

**Dateien:**

- `packages/shared/src/types/ability.ts`
- `packages/server/src/systems/abilitySystem.ts`
- `content/abilities/dash.json`

**Details:**

Datensatz nach `docs/25` §25.7 — dieselbe Struktur, die in M7 alle Klassenfähigkeiten
tragen wird:

```jsonc
{
  "id": "ability.dash",
  "name": "Ausweichrolle",
  "class": null,
  "cooldownMs": 3000,
  "cost": null,
  "effect": { "kind": "dash", "distance": 72, "durationMs": 180, "invulnerable": true },
  "animation": "player.dash"
}
```

Der Dash ist mit Absicht die erste Fähigkeit: Er berührt Bewegung, Simulation,
Abklingzeit, Netzwerkvorhersage und Animation gleichzeitig. Was hier funktioniert, trägt
das gesamte Fähigkeitssystem in M7.

**Fertig wenn:** Dash funktioniert im aktiven Kampf, ist während der Bewegung
unverwundbar, hat eine sichtbare Abklingzeit, und die Client-Vorhersage stimmt mit dem
Server überein.

---

## Ergebnis

Ein Charakter kämpft aktiv gegen Gegner, ein anderer sammelt Holz, ein dritter kämpft
automatisch. Alle drei machen Fortschritt. Nach dem Wiederkommen weist eine
Zusammenfassung aus, was jeder erreicht hat.

**Das ist der erste Stand, den man Fremden zeigen kann** — der komplette Kernloop aus
`docs/02` §2.2 läuft.

## Nicht in diesem Meilenstein

- Bosse (M9)
- Klassenspezifische Fähigkeiten (M7)
- Pets (M7/M9)
- Split-Screen-Bosskämpfe (M10)
