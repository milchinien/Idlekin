# M4 — Items, Inventar und Weltgegenstände

**Ziel:** Gegenstände existieren als Daten, liegen im Rucksack oder sichtbar in der Welt
und gehen nie verloren.

**Aufwand:** 4–5 Tage
**Vorbedingungen:** M3
**GDD-Bezug:** `docs/03` §3.13, `docs/09` §9.15–§9.16, `docs/22` §22.6–§22.8,
`docs/25` §25.8, §25.10, §25.22, `docs/26` Phase 8

---

## Abweichung vom GDD-Plan

`docs/26` setzt Inventar auf Phase 8, **nach** Kampf (5–7) und **vor** Berufe (9). Hier
wird es vorgezogen: Sowohl Kampf als auch Berufe erzeugen Gegenstände. Ohne Inventar
müsste beides zweimal gebaut werden — einmal ohne Beute, einmal mit.

Das Inventar ist außerdem der Ort, an dem eine der eigenwilligsten Designregeln des
Spiels sitzt: **Bei vollem Rucksack geht nichts verloren, sondern fällt zu Boden**
(`docs/03` §3.13, `docs/09` §9.15, `docs/22` §22.7). Das betrifft Drop-Logik,
Weltdarstellung, Persistenz und Idle-Abrechnung gleichzeitig und will früh geklärt sein,
nicht als Sonderfall hinterhergeschoben.

---

## Schritte

### S-4.1 Item-Datenmodell

**Was:** Gegenstandsdefinitionen als Content, Bestände als Spielstand. Strikt getrennt.

**Dateien:**

- `packages/shared/src/types/item.ts`
- `packages/shared/src/content/itemSchema.ts`
- `content/items/resources.json`, `content/items/tools.json`

**Details:**

```jsonc
{
  "id": "item.wood.oak",
  "name": "Eichenholz",
  "type": "resource",              // resource | equipment | consumable | material | quest
  "rarity": "common",              // common | uncommon | rare | epic | legendary
  "stackSize": 999,
  "tradable": true,
  "icon": "icon/wood_oak",
  "description": "Gewöhnliches Holz. Grundlage der meisten Rezepte.",
  "sellValue": 2
}
```

Seltenheitsstufen nach `docs/09` §9.9 und `docs/11` §11.9 — dieselben fünf für
Ressourcen und Ausrüstung, damit Farbcodierung und Filter einheitlich bleiben.

**Stapelgrößen:** Ressourcen stapeln hoch (999), Ausrüstung gar nicht (1). Eine
Ausrüstung mit Verzauberung (M8) ist ein Einzelstück mit eigenen Werten und kann
prinzipiell nicht stapeln — das Modell muss das ab jetzt zulassen:

```ts
type InventorySlot =
  | { kind: 'stack';  itemId: ItemId; amount: number }
  | { kind: 'unique'; itemId: ItemId; instanceId: string; state: ItemInstanceState };
```

`ItemInstanceState` ist in M4 leer und wird in M8 gefüllt. Diese Unterscheidung
nachträglich einzuziehen bedeutet, jeden Inventarzugriff anzufassen.

**Fertig wenn:** Mindestens 12 Gegenstände sind definiert (Holz, drei Erze, drei Fische,
Pflanzen, Werkzeuge) und werden validiert geladen.

---

### S-4.2 Inventar

**Was:** Rucksack pro Charakter mit begrenzter Platzzahl, serverseitig autoritativ.

**Dateien:**

- `packages/shared/src/rules/inventory.ts`
- `packages/server/src/systems/inventorySystem.ts`
- `packages/server/migrations/0002_inventory.sql`

**Details:**

`docs/22` §22.6 nennt als Beispiel „18 / 20 Plätze belegt" — die Kapazität zählt
**Plätze**, nicht Gewicht oder Stückzahl. Startkapazität: **20**, erweiterbar in M8 über
Ausrüstung und in M9 über Belohnungen.

Kernoperationen, alle mit **Alles-oder-nichts**-Verhalten:

| Operation | Verhalten |
|---|---|
| `add(itemId, amount)` | füllt zuerst vorhandene Stapel, dann freie Plätze; gibt zurück, wie viel **nicht** gepasst hat |
| `remove(itemId, amount)` | schlägt fehl, wenn nicht genug vorhanden — verändert dann nichts |
| `move(from, to)` | tauscht oder legt zusammen |
| `split(slot, amount)` | braucht einen freien Platz |

**Die Rückgabe des Restes bei `add` ist die zentrale Stelle.** Sie ist die Schnittstelle
zur Regel „was nicht passt, fällt zu Boden" und wird von Kampf (M6), Berufen (M5),
Crafting (M8) und Quests (M9) genutzt. Wird sie ignoriert, verschwinden Gegenstände
lautlos — der schlimmste Fehler, den ein Spiel mit Fortschritt haben kann.

**Fertig wenn:** Alle Operationen sind implementiert und getestet, insbesondere:
Teilweise passende Stapel, voller Rucksack, gleichzeitige Anfragen auf demselben
Charakter.

**Test:** `inventory.test.ts` mit mindestens 20 Fällen; Eigenschaftstest: Die Summe aller
Gegenstände vor und nach beliebigen Operationsfolgen bleibt erhalten.

---

### S-4.3 Weltgegenstände

**Was:** Gegenstände, die in der Welt liegen — sichtbar, aufsammelbar, dauerhaft.

**Dateien:**

- `packages/shared/src/types/worldItem.ts`
- `packages/server/src/systems/worldItemSystem.ts`
- `packages/server/migrations/0003_world_items.sql`
- `packages/client/src/render/worldItems.ts`

**Details:**

```ts
type WorldItem = {
  id: string;
  areaId: AreaId;
  x: number; y: number;
  slot: InventorySlot;
  ownerId: PlayerId | null;   // null = für alle sichtbar und aufsammelbar
  droppedAt: number;
};
```

**Sie verschwinden nicht.** `docs/09` §9.16 ist an dieser Stelle unmissverständlich: Der
Spieler kann später zurückkehren und einsammeln. Das ist ungewöhnlich — die meisten
Spiele löschen Bodengegenstände nach Minuten — und hier zwingend, weil Idle-Charaktere
über Stunden produzieren, während der Spieler weg ist.

**Daraus folgende Probleme, die jetzt gelöst werden müssen:**

1. **Unbegrenztes Wachstum.** Ein Holzfäller mit vollem Rucksack legt 48 Stunden lang
   Holz ab. Lösung: Gegenstände am selben Ort **verschmelzen** zu einem Stapel, solange
   sie stapelbar sind und weniger als 24 px auseinanderliegen. Ein Haufen statt
   zehntausend Objekten.
2. **Obergrenze pro Gebiet.** Maximal **200** Weltgegenstände pro Gebiet und Spieler.
   Wird sie erreicht, **pausiert die Idle-Produktion** und wird als Grund in der
   Aktivitätsanzeige genannt („Rucksack und Boden voll"). Sie wird nicht überschrieben
   und nichts wird gelöscht.
3. **Persistenz.** Weltgegenstände liegen in der Datenbank, nicht nur im Speicher —
   sonst überleben sie keinen Neustart, und die Zusage aus §9.16 wäre gebrochen.

**Aufsammeln:** Nähe ≤ 24 px, Server prüft, `add` ins Inventar, Rest bleibt liegen.
Automatisches Aufsammeln beim Darüberlaufen ist bequem und kommt in M11 als Option.

**Fertig wenn:** Ein Gegenstand fällt bei vollem Rucksack sichtbar zu Boden, überlebt
den Serverneustart, wird nach dem Freimachen von Platz aufgesammelt, und 1000 abgelegte
Stapel Holz am selben Baum ergeben ein Objekt, nicht 1000.

**Risiko:** Die Verschmelzungsregel muss bei *unterschiedlichen* Gegenständen sauber
trennen — sonst wird aus Holz und Eisen ein Mischhaufen.

---

### S-4.4 Drop-Tabellen

**Was:** Gemeinsame Auswürfelung von Beute für Gegner, Bosse, Ressourcen und Quests.

**Dateien:**

- `packages/shared/src/rules/dropTable.ts`
- `packages/shared/src/content/dropSchema.ts`
- `content/droptables/*.json`

**Details:**

Nach `docs/25` §25.22:

```jsonc
{
  "id": "drop.slime",
  "rolls": 1,
  "entries": [
    { "itemId": "item.slime.goo", "min": 1, "max": 3, "chance": 0.8 },
    { "itemId": "item.currency.gold", "min": 2, "max": 6, "chance": 1.0 },
    { "itemId": "item.equipment.rustyDagger", "min": 1, "max": 1, "chance": 0.02 }
  ]
}
```

**Auswürfelung über den gesäten Zufallsgenerator** aus M0/S-0.3. Der Seed wird pro
Kampfereignis abgeleitet, damit ein Fehlerbericht nachstellbar ist.

**Chance ist unabhängig pro Eintrag**, nicht gewichtete Auswahl. Das ist einfacher zu
verstehen und zu balancieren, und `docs/14` §14.10 (seltene Zusatzdrops neben normalen)
setzt es voraus.

**Fertig wenn:** Ein Test mit 100 000 Würfen bei festem Seed liefert reproduzierbare
Häufigkeiten innerhalb von 1 % der erwarteten Werte.

---

### S-4.5 Inventar-UI

**Was:** Rucksackfenster mit Verschieben, Stapeln, Ablegen und Tooltip.

**Dateien:**

- `packages/client/src/ui/inventoryWindow.ts`
- `packages/client/src/ui/itemTooltip.ts`

**Details:** Raster mit Platzzahl in der Kopfzeile („18 / 20"), Ziehen und Ablegen,
Rechtsklick für Kontextmenü, Umschalt-Klick zum Aufteilen. Tooltip zeigt Name,
Seltenheitsfarbe, Typ, Beschreibung, Verkaufswert; ab M8 zusätzlich Werte und
Verzauberungen.

**Jede Aktion geht an den Server und wird erst nach Bestätigung angezeigt.** Optimistische
Inventaranzeige ist die klassische Quelle für Geisteritems.

**Fertig wenn:** Gegenstände lassen sich verschieben, stapeln, aufteilen und ablegen;
bei getrennter Verbindung wird keine Aktion angezeigt, die der Server nicht bestätigt
hat.

---

## Ergebnis

Gegenstände existieren, werden getragen, liegen in der Welt und werden aufgesammelt.
Die Zusage aus `docs/09` §9.16 („kein Verlust durch volles Inventar") ist technisch
eingelöst und getestet.

## Nicht in diesem Meilenstein

- Ausrüsten von Gegenständen (M8)
- Verbrauchsgegenstände benutzen (M8)
- Handel und Verkauf (M10)
- Bank oder Lager — ausdrücklich nicht im GDD vorgesehen, siehe
  [99-offene-entscheidungen.md](99-offene-entscheidungen.md)
