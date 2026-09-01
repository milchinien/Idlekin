# M7 — Attribute, Klassen und aktive Fähigkeiten

**Ziel:** Charaktere entwickeln sich auseinander. Zwei Charaktere desselben Spielers
spielen sich unterschiedlich, nicht nur mit anderen Zahlen.

**Aufwand:** 7–9 Tage
**Vorbedingungen:** M6
**GDD-Bezug:** `docs/04-klassen-skilltree.md`, `docs/05-attribute.md`,
`docs/19-progression.md`, `docs/25` §25.4, §25.6, §25.7, `docs/26` Phasen 10–13

---

## Was hier auf dem Spiel steht

`docs/01` §1.9 nennt zwölf Kernprinzipien; vier davon werden erst in diesem Meilenstein
wahr: *jeder Charakter ist einzigartig*, *permanente Entscheidungen*, *viele
Spielwege*, *Kampf und Berufe sind verbunden*.

Wenn M7 misslingt, ist Idlekin ein Idle-Spiel mit hübscher Welt, in dem alle Charaktere
gleich sind. Der Prüfstein am Ende dieses Meilensteins lautet deshalb: **Zwei Charaktere
auf Level 25 mit unterschiedlichen Entscheidungen müssen sich spürbar unterschiedlich
spielen** — nicht nur unterschiedlich stark.

---

## Schritte

### S-7.1 Attribute

**Was:** Fünf Attribute pro Charakter, die auf Kampf **und** Berufe wirken.

**Dateien:**

- `packages/shared/src/types/attributes.ts`
- `packages/shared/src/rules/attributeEffects.ts`
- `packages/server/migrations/0005_attributes.sql`

**Details:**

Nach `docs/25` §25.4: Stärke, Intelligenz, Geschick, Vitalität, Weisheit.

Die entscheidende Regel steht in `docs/05` §5.6 und §5.10: **Kein Attribut wirkt nur auf
einen Bereich.** Die Wirkungsmatrix ist damit Design, nicht Beiwerk:

| Attribut | Kampf | Berufe |
|---|---|---|
| **Stärke** | Nahkampfschaden | Mining, Schmieden |
| **Intelligenz** | Magieschaden, Mana | Alchemie, Holzfällen |
| **Geschick** | Fernkampfschaden, Angriffsgeschw., Bewegung | Holzfällen, Angeln, Landwirtschaft |
| **Vitalität** | Leben, Verteidigung | Ausdauer bei langen Aktivitäten |
| **Weisheit** | Mana, Manaregeneration | Erfahrungsgewinn allgemein |

Dass Intelligenz aufs Holzfällen wirkt (`docs/05` §5.3) ist bewusst gegen die Erwartung
gesetzt und gehört genau so umgesetzt — es ist der Mechanismus, der Hybrid-Builds
sinnvoll macht.

**Wirkung mit abnehmendem Ertrag**, damit ein einzelnes Attribut nicht zur einzigen
richtigen Antwort wird:

```ts
bonus(wert) = wert * 0.01            // linear bis 100
            + max(0, wert - 100) * 0.004   // darüber ein Viertel
```

**Zwei Quellen für Attributpunkte** (`docs/05` §5.7, `docs/19` §19.8):

1. **Levelaufstieg:** 3 frei verteilbare Punkte pro Level
2. **Nutzung:** Aktivitäten geben kleine Attribut-XP nach `attributeXp` im Content
   (M5/S-5.2, M6/S-6.1). 100 Attribut-XP = 1 Punkt.

Der zweite Weg ist das, was `docs/01` §1.4 meint: „Ein Charakter, der häufig Holz fällt,
wird besser im Holzfällen" — auch ohne dass der Spieler das aktiv wählt.

**Fertig wenn:** Attribute existieren, werden durch Level und Nutzung erhöht, wirken
messbar auf Kampfwerte **und** auf die Idle-Effizienz aus M5/S-5.4. Der bislang mit null
belegte `attributBonus`-Term in der Zykluszeitformel wird jetzt gefüllt.

---

### S-7.2 Klassenbaum als Daten

**Was:** Der Baum aus `docs/04` als Content, nicht als Code.

**Dateien:**

- `packages/shared/src/types/class.ts`
- `content/classes/*.json`

**Details:**

Nach `docs/25` §25.6:

```jsonc
{
  "id": "class.strength",
  "name": "Stärke",
  "tier": 1,
  "parent": null,
  "requirement": { "level": 10 },
  "passives": [
    { "kind": "attributeGain", "attribute": "strength", "perLevel": 2 },
    { "kind": "skillEfficiency", "skill": "mining",     "factor": 0.15 },
    { "kind": "skillEfficiency", "skill": "smithing",   "factor": 0.15 },
    { "kind": "combatStat",      "stat": "attackPower", "factor": 0.10 }
  ],
  "abilities": ["ability.powerStrike"],
  "children": ["class.warrior", "class.berserker", "class.guardian"]
}
```

**Struktur nach `docs/04` §4.2, §4.4, §4.5:**

```text
Stufe 1 (Level 10)   Stärke        Intelligenz    Geschick
Stufe 2 (Level 25)   je 3 Klassen  je 3 Klassen   je 3 Klassen     = 9
Stufe 3 (Level 45)   je 2–3        ...                             = ~20
```

`docs/19` §19.10 nennt „ungefähr zwischen Level 20 und 40" für die zweite
Entscheidung — hier auf **25** festgelegt, damit sie klar hinter der ersten liegt und
nicht mit dem Erreichen neuer Gebiete zusammenfällt.

**Umfang in M7:** Stufe 1 vollständig (3), Stufe 2 vollständig (9). Stufe 3 ist
**vorbereitet, aber nicht gefüllt** — sie gehört ins Endgame und braucht Inhalte aus M9.
`docs/04` §4.5 warnt ausdrücklich davor, zu früh zu viele Klassen anzubieten.

**Fertig wenn:** Zwölf Klassendatensätze existieren, werden validiert, und der Baum ist
in sich schlüssig (jedes `parent` existiert, keine Zyklen, jedes Kind ist beim Elternteil
eingetragen).

---

### S-7.3 Klassenwahl

**Was:** Die permanente Entscheidung.

**Dateien:**

- `packages/server/src/systems/classSystem.ts`
- `packages/client/src/ui/classChoiceWindow.ts`

**Details:**

Bei Erreichen von Level 10 wird eine Entscheidung **angeboten**, nicht erzwungen. Der
Charakter spielt ohne Klasse weiter, bis der Spieler wählt — es gibt keinen Grund, ihn
zu blockieren, und `docs/04` §4.1 verlangt nur, dass die Wahl dann ansteht.

**Die Wahl ist endgültig** (`docs/03` §3.11, `docs/04` §4.6, `docs/19` §19.11). Deshalb:

- Ein Bestätigungsdialog, der **die Konsequenz zeigt**, nicht nur den Namen: welche Boni,
  welche Fähigkeiten, welche Folgeklassen möglich werden
- Ausdrücklicher Hinweis auf die Endgültigkeit
- Serverseitig: `class` lässt sich nur setzen, wenn sie noch leer ist. Kein Endpunkt zum
  Ändern. **Kein Umskillen, auch nicht gegen Bezahlung** — das würde `docs/21` §21.4
  (kein Pay-to-Win) und die Charakteridentität aus `docs/03` §3.15 gleichzeitig aushöhlen.

**Fertig wenn:** Die Wahl funktioniert, ist unumkehrbar, die Boni wirken sofort, und die
UI erklärt vor der Bestätigung, was folgt.

**Risiko:** Ein Fehler, der die falsche Klasse setzt, ist für den Spieler nicht
reparabel. Deshalb: Test mit allen zwölf Klassen, Prüfung der Voraussetzungen, und ein
Verwaltungsbefehl zum Zurücksetzen für den Notfall — nicht im Spiel erreichbar.

---

### S-7.4 Klassenboni in allen Systemen

**Was:** Die Boni aus S-7.2 wirken tatsächlich — auch auf Berufe.

**Dateien:** `packages/shared/src/rules/modifiers.ts`

**Details:**

Ein gemeinsames Modifikatorsystem, das aus **Attributen, Klasse, Ausrüstung (M8), Buffs
(M8) und Verzauberungen (M8)** einen Endwert bildet.

```ts
type Modifier =
  | { kind: 'flat';    target: StatKey; value: number }
  | { kind: 'percent'; target: StatKey; value: number };

// Reihenfolge, verbindlich:
endwert = (basis + summe(flat)) * (1 + summe(percent))
```

**Warum die Reihenfolge festgeschrieben wird:** Sobald Ausrüstung und Verzauberungen
dazukommen, entscheidet sie über die Werte. Sie später zu ändern verschiebt jedes
Balancing. Additive Prozente statt multiplikativer, weil sich multiplikative Stapel bei
einem Spiel ohne Levelobergrenze zwangsläufig aufschaukeln.

`docs/04` §4.7 und `docs/08` §8.17 verlangen, dass Klassen **Berufe** beeinflussen: Stärke
begünstigt Mining und Schmieden, Intelligenz Alchemie und Magie, Geschick Holzfällen,
Angeln und Landwirtschaft. Der `klassenBonus`-Term in der Zykluszeitformel aus M5/S-5.4
wird jetzt gefüllt.

**Ausdrücklich:** Berufe bleiben für alle offen (`docs/08` §8.17, `docs/05` §5.9). Die
Klasse verändert die Effizienz, nie die Verfügbarkeit.

**Fertig wenn:** Ein Stärke-Charakter mit gleichem Mining-Skill produziert messbar mehr
als ein Geschick-Charakter, kann aber weiterhin Holz fällen. Ein Test vergleicht drei
Charaktere über eine simulierte Stunde.

---

### S-7.5 Aktive Klassenfähigkeiten

**Was:** Pro Klasse eigene Fähigkeiten, die den Kampf spürbar verändern.

**Dateien:**

- `packages/server/src/systems/abilitySystem.ts` (aus M6/S-6.7 erweitert)
- `content/abilities/*.json`
- `packages/client/src/render/abilityEffects.ts`

**Details:**

Nach `docs/04` §4.9 und `docs/06` §6.5, je Richtung ein eigenes Kampfgefühl:

| Richtung | Fähigkeiten |
|---|---|
| Nahkampf | Dash, mächtiger Angriff, Flächenangriff, Verteidigungshaltung |
| Magie | Dash, Projektilzauber, Flächenzauber, verstärkte Magie |
| Fernkampf | Dash, Schnellschuss, Mehrfachschuss, Spezialangriff |
| Pet Master | Dash, Pet beschwören, Pet-Angriff, Pet-Unterstützung |

**Vier Fähigkeitsplätze**, Taste 1–4. Dash liegt fest auf 1, die übrigen drei kommen mit
der Klassenentwicklung.

**Wirkungsarten**, die dafür im Code existieren müssen — und ausdrücklich nicht mehr:

- `dash` (M6 vorhanden)
- `meleeArc` — Schaden in einem Bogen vor der Figur
- `projectile` — fliegendes Geschoss mit Trefferprüfung
- `areaAtPoint` — Fläche an einer Zielstelle, mit Vorwarnung
- `buffSelf` — zeitlich begrenzter Modifikator
- `summonPet` — begleitende Einheit mit eigener einfacher KI

Jede weitere Fähigkeit ist danach **ein Datensatz**, kein Code. `docs/25` §25.26 verlangt
genau das.

**Pets** sind der aufwendigste Punkt: eine eigene Entität mit Bewegung, Zielauswahl und
Lebensdauer. Sie sind laut `docs/04` §4.9 und `docs/15` §15.6 aber eine der vier
Kernrollen und deshalb nicht verschiebbar.

**Automatischer Einsatz im Idle-Kampf** (`docs/06` §6.8): Fähigkeiten werden eingesetzt,
sobald sie bereit sind und ein Ziel in Reichweite ist — in der Reihenfolge, in der sie
in der Leiste liegen. Keine ausgeklügelte Priorisierung; die Leistenreihenfolge ist die
Steuerung, die der Spieler dafür hat.

**Fertig wenn:** Alle vier Richtungen haben vier funktionierende Fähigkeiten mit
Abklingzeit, Kosten, Effekt und sichtbarer Wirkung; im Idle-Kampf werden sie automatisch
eingesetzt; ein Pet folgt, greift an und verschwindet nach Ablauf.

---

### S-7.6 Mana und Ressourcen für Fähigkeiten

**Was:** Kosten, ohne die Fähigkeiten beliebig oft einsetzbar wären.

**Dateien:** `packages/shared/src/rules/resources.ts`

**Details:** Mana aus Intelligenz und Weisheit (`docs/05` §5.3, §5.5), Regeneration über
Zeit, stärker außerhalb des Kampfes. Nahkampfklassen nutzen dieselbe Leiste mit
niedrigeren Kosten und schnellerer Regeneration, statt eine zweite Ressource einzuführen
— zwei Ressourcensysteme verdoppeln UI, Balancing und Erklärungsaufwand ohne
entsprechenden Gewinn.

**Fertig wenn:** Mana wird verbraucht, regeneriert, ist sichtbar, und der automatische
Einsatz respektiert es.

---

### S-7.7 Charakterfenster vervollständigen

**Was:** Die in M3/S-3.5 angelegten leeren Bereiche füllen.

**Dateien:** `packages/client/src/ui/characterWindow.ts`

**Details:** Nach `docs/22` §22.5: Name, Level, Erfahrung, Attribute mit Verteilungs-
möglichkeit, alle neun Skills mit Fortschritt, Klasse mit Baumansicht, aktuelle
Aktivität. Die Ausrüstung folgt in M8.

Die Baumansicht zeigt **auch die nicht gewählten Zweige** — ausgegraut. `docs/04` §4.13
will, dass der Spieler das Gefühl hat, seinen Charakter zu bauen; dazu muss er sehen,
was er nicht gewählt hat und was mit einem anderen Charakter möglich wäre.

**Fertig wenn:** Alle Werte sind sichtbar und aktuell; die Verteilung freier
Attributpunkte funktioniert; der Klassenbaum zeigt gewählte, verfügbare und gesperrte
Knoten unterscheidbar.

---

## Ergebnis

Zwei Charaktere desselben Spielers auf Level 25 mit unterschiedlichen Entscheidungen
haben unterschiedliche Fähigkeiten, unterschiedliche Kampfweisen und unterschiedliche
Berufseffizienzen.

**Abnahmeprüfung des Meilensteins:** Drei Charaktere auf Level 25 anlegen — Stärke →
Krieger, Intelligenz → Magier, Geschick → Bogenschütze. Alle drei denselben Gegner
bekämpfen lassen und dieselbe Ressource abbauen lassen. Es müssen sich **drei
unterschiedliche Spielgefühle und drei unterschiedliche Effizienzprofile** ergeben.
Ergibt sich das nicht, ist M7 nicht fertig, egal wie viel Code existiert.

## Nicht in diesem Meilenstein

- Klassenstufe 3 (Endgame, nach M9)
- Ausrüstung (M8)
- Prestige/Ascension (`docs/01` §1.8, `docs/20` §20.14 — M13 oder später)
