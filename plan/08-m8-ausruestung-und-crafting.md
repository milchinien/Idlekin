# M8 — Ausrüstung und Crafting

**Ziel:** Gesammelte Ressourcen werden zu Ausrüstung, Ausrüstung verändert Charaktere
sichtbar und messbar, und die Charaktere eines Spielers arbeiten einander zu.

**Aufwand:** 7–9 Tage
**Vorbedingungen:** M7
**GDD-Bezug:** `docs/10-crafting.md`, `docs/11-ausruestung.md`, `docs/08` §8.11–§8.15,
`docs/25` §25.9, §25.20, `docs/26` Phasen 14, 15

**Was hier entsteht, ist der Kreislauf aus `docs/09` §9.18:** Sammeln → Verarbeiten →
Crafting → Ausrüsten → stärkerer Charakter → bessere Ressourcen. Erst damit hat das
Sammeln aus M5 einen Zweck.

---

## Schritte

### S-8.1 Ausrüstungsdaten und Instanzen

**Was:** Ausrüstung als Gegenstand mit eigenen Werten pro Exemplar.

**Dateien:**

- `packages/shared/src/types/equipment.ts`
- `content/items/equipment/*.json`
- `packages/server/migrations/0006_equipment.sql`

**Details:**

Sechs Plätze nach `docs/11` §11.2 und `docs/25` §25.9: Waffe, Rüstung, Helm, Schuhe,
Werkzeug, Schmuck.

```jsonc
{
  "id": "item.equipment.ironSword",
  "name": "Eisenschwert",
  "type": "equipment",
  "slot": "weapon",
  "rarity": "common",
  "requirements": { "level": 10, "attributes": { "strength": 15 } },
  "modifiers": [
    { "kind": "flat",    "target": "attackPower", "value": 12 },
    { "kind": "percent", "target": "attackSpeed", "value": -0.05 }
  ],
  "weaponProfile": { "attackType": "melee", "range": 28, "swingMs": 500 },
  "sprite": "equip/iron_sword"
}
```

**Instanzwerte:** Die in M4/S-4.1 vorbereitete `ItemInstanceState` wird jetzt gefüllt:

```ts
type ItemInstanceState = {
  enchantments: Modifier[];   // aus Verzaubern
  rolledModifiers: Modifier[]; // Streuung bei Herstellung/Drop
  craftedBy?: CharacterId;
};
```

**Streuung bei der Herstellung** (±10 % auf die Hauptwerte) gibt jedem Exemplar eine
kleine Eigenheit und macht Wiederholung interessant, ohne ein Zufallsaffix-System mit
eigener Balancierung einzuführen. `docs/11` §11.9 verlangt Seltenheitsstufen, nicht ein
Affix-System — mehr wäre Eigeninitiative über das GDD hinaus.

**Werkzeuge** (`docs/11` §11.7) sind derselbe Mechanismus mit Berufsmodifikatoren:
`{ kind: 'percent', target: 'woodcuttingSpeed', value: 0.25 }`. Der in M5/S-5.4
vorgesehene `werkzeugBonus`-Term wird damit korrekt gefüllt statt behelfsmäßig
berechnet.

**Fertig wenn:** Mindestens 25 Ausrüstungsgegenstände über alle sechs Plätze und drei
Wertstufen existieren, inklusive vier Werkzeugen für die vier Sammelberufe.

---

### S-8.2 Ausrüsten

**Was:** Anlegen, Ablegen, Voraussetzungen, Wirkung.

**Dateien:**

- `packages/server/src/systems/equipmentSystem.ts`
- `packages/client/src/ui/equipmentWindow.ts`

**Details:**

Der Server prüft Level und Attribute (`requirements`) und lehnt sonst mit konkreter
Begründung ab. Beim Wechsel werden Modifikatoren neu gesammelt und die Kampfwerte neu
berechnet — über dasselbe `modifiers.ts` aus M7/S-7.4, kein zweiter Rechenweg.

**Übertragung zwischen eigenen Charakteren** (`docs/11` §11.17): erlaubt, wenn beide
Charaktere sich im selben Gebiet befinden. Der Grund ist nicht Realismus, sondern
Nachvollziehbarkeit — ein Transfer über beliebige Entfernung macht Positionen
bedeutungslos, und `docs/12` §12.10 legt Wert auf persistente Positionen. Alternative
über einen Marktweg folgt in M10.

**Gesundheit beim Wechsel:** Steigt die maximale Gesundheit, steigt die aktuelle mit;
sinkt sie, wird gekappt, aber nie unter 1. Ein Rüstungswechsel darf nicht töten.

**Fertig wenn:** Ausrüsten wirkt sofort auf Kampfwerte und Berufseffizienz; nicht
erfüllte Voraussetzungen werden mit Zahl abgelehnt; ein Transfer zwischen zwei eigenen
Charakteren im selben Gebiet funktioniert.

---

### S-8.3 Rezepte

**Was:** Crafting-Rezepte als Content.

**Dateien:**

- `packages/shared/src/types/recipe.ts`
- `content/recipes/{cooking,smithing,alchemy,enchanting}.json`

**Details:**

Nach `docs/25` §25.20 und dem Beispiel in `docs/10` §10.10:

```jsonc
{
  "id": "recipe.ironSword",
  "name": "Eisenschwert",
  "profession": "smithing",
  "requiredSkillLevel": 10,
  "materials": [
    { "itemId": "item.ore.iron", "amount": 10 },
    { "itemId": "item.wood.oak", "amount": 2 }
  ],
  "craftTimeMs": 10000,
  "result": { "itemId": "item.equipment.ironSword", "amount": 1 },
  "xp": { "skill": 45, "character": 15 },
  "unlock": { "kind": "skillLevel" }
}
```

**Freischaltung** nach `docs/10` §10.11 über mehrere Wege: Skill-Level, Charakterlevel,
Gebietsfortschritt, Quest, Boss, besondere Ressource. Umgesetzt als
`unlock`-Unterscheidung; die Prüfung liegt an einer Stelle, damit ein neuer
Freischaltweg ein Fall mehr ist und kein neues System.

**Umfang in M8:** je Beruf mindestens acht Rezepte über drei Stufen. Genug, um den
Kreislauf zu prüfen; die Fülle kommt in M9 mit den Gebieten.

**Fertig wenn:** Rezepte werden geladen, Querverweise geprüft (jedes Material und jedes
Ergebnis existiert), und die Freischaltbedingungen greifen.

---

### S-8.4 Crafting-Ablauf

**Was:** Herstellen mit Zeit, auch im Idle.

**Dateien:**

- `packages/server/src/systems/craftingSystem.ts` (erweitert `craftingActivity.ts` aus M5/S-5.7)
- `packages/client/src/ui/craftingWindow.ts`

**Details:**

Ablauf: Rezept wählen → Material wird **beim Start reserviert** (nicht erst am Ende) →
Zeit läuft → Ergebnis ins Inventar, Rest zu Boden → Skill-XP.

**Warum Reservierung beim Start:** Sonst kann der Spieler dasselbe Material für mehrere
gleichzeitige Herstellungen einsetzen oder es zwischendurch verkaufen. Der klassische
Duplikationsfehler.

**Warteschlange:** Mehrfaches Herstellen desselben Rezepts wird als Anzahl übergeben und
Stück für Stück abgearbeitet. Das ist die Form, die mit dem Idle-System aus M5
zusammenpasst.

**Crafting-Zeit** sinkt mit dem Beruf-Skill (`docs/10` §10.6, §10.9), Untergrenze 20 %
der Grundzeit.

**Abbruch** gibt reserviertes Material vollständig zurück. Keine Strafe — `docs/19`
§19.19 kennt keinen Fortschrittsverlust.

**Fertig wenn:** Ein Eisenschwert entsteht aus Erz und Holz, die Herstellung läuft nach
dem Charakterwechsel und nach dem Abmelden weiter, und ein Abbruch verliert nichts.

---

### S-8.5 Kochen, Alchemie und Buffs

**Was:** Verbrauchsgegenstände mit zeitlich begrenzter Wirkung.

**Dateien:**

- `packages/shared/src/types/buff.ts`
- `packages/server/src/systems/buffSystem.ts`

**Details:**

Nach `docs/10` §10.4 und §10.7: Nahrung und Tränke geben zeitlich begrenzte Boni auf
Leben, Mana, Kampfeffizienz, Bewegung, Berufseffizienz.

```ts
type ActiveBuff = {
  id: BuffId; sourceItemId: ItemId;
  modifiers: Modifier[];
  expiresAt: number;         // Serverzeit in ms
};
```

**Buffs laufen in Echtzeit ab, auch offline.** Ein Trank mit 30 Minuten Wirkung ist nach
einer Nacht abgelaufen — alles andere wäre eine Aufbewahrungsmechanik, die zu einem
Idle-Spiel nicht passt und zum Hortverhalten einlädt.

**Buffs wirken in die Idle-Abrechnung**, indem `computeYield` aus M5/S-5.4 den
Zeitraum an Buff-Grenzen aufteilt. Ohne diese Aufteilung wäre der Buff entweder für den
ganzen Zeitraum aktiv oder gar nicht.

**Höchstens drei gleichzeitige Buffs**, gleiche Quelle ersetzt sich statt zu stapeln.

**Fertig wenn:** Ein Trank wirkt messbar auf Kampf und auf Idle-Erträge, läuft korrekt
ab und die Teilung des Abrechnungszeitraums stimmt bis auf eine Sekunde.

---

### S-8.6 Verzaubern

**Was:** Bestehende Ausrüstung mit zusätzlichen Eigenschaften versehen.

**Dateien:** `packages/server/src/systems/enchantSystem.ts`

**Details:**

Nach `docs/10` §10.8 und `docs/11` §11.16: Gegenstand plus Verzauberungsmaterial ergibt
einen Gegenstand mit einem zusätzlichen Modifikator.

- Höchstens **drei** Verzauberungen pro Gegenstand
- Dieselbe Verzauberung ersetzt sich, statt zu stapeln
- Verzauberungen können auf Berufe wirken (`docs/11` §11.16 nennt „+Holzfäller-Effizienz"
  als Beispiel) — nicht nur auf Kampf
- **Kein Zerstörungsrisiko.** `docs/19` §19.19 und `docs/06` §6.15 schließen dauerhaften
  Verlust aus. Ein Verzauberungsversuch, der den Gegenstand zerstört, wäre ein
  Fremdkörper in diesem Design.

**Fertig wenn:** Verzaubern funktioniert, Werte erscheinen im Tooltip, drei
Verzauberungen sind das Maximum, und nichts geht dabei kaputt.

---

### S-8.7 Sichtbare Ausrüstung

**Was:** Der Charaktersprite verändert sich mit der Ausrüstung.

**Dateien:**

- `packages/client/src/render/characterComposite.ts`
- `packages/shared/src/types/appearance.ts`

**Details:**

`docs/23` §23.14 und `docs/27` §27.5 verlangen sichtbaren Fortschritt am Sprite. Umsetzung
als **Ebenenkomposition** über dem Player-Atlas: Körper, Rüstung, Helm, Waffe, Effekte.

Die Ebenen nutzen dieselbe Rasterung wie der Atlas (`docs/27` §27.7: 128 × 128 px, Anker
x 64 / y 80). Für M8 reichen **drei Wertstufen pro Platz** als Platzhalter; die volle
Ausarbeitung ist M12.

**Wichtig aus `docs/27` §27.4:** Die Gameplay-Hitbox bleibt 12 × 20 px, unabhängig von
sichtbarer Ausrüstung.

**Fertig wenn:** Ein Charakter mit Schwert sieht anders aus als einer mit Bogen; der
Wechsel ist sofort sichtbar; die Ebenen sind korrekt gestapelt und im Sprung wie im Lauf
deckungsgleich.

---

## Ergebnis

Der vollständige Wirtschaftskreislauf läuft: Ein Charakter mint Eisen, ein zweiter
schmiedet daraus ein Schwert, ein dritter kämpft damit besser und bringt bessere
Materialien zurück. Genau das Beispiel aus `docs/10` §10.12.

**Abnahmeprüfung:** Diese Kette einmal vollständig durchspielen — mit drei verschiedenen
Charakteren, ohne Verwaltungsbefehle.

## Nicht in diesem Meilenstein

- Marktverkauf (M10)
- Endgame-Rezepte und -Materialien (M9, M13)
- Endgültige Ausrüstungsgrafik (M12)
