# Datenmodell — verbindliche Referenz

Konkretisierung von `docs/25-datenstrukturen.md`. Wo dieses Dokument von `docs/25`
abweicht, ist die Abweichung begründet vermerkt; sonst gilt `docs/25`.

**Zweck:** Eine Stelle, an der die tatsächliche Form der Daten nachgeschlagen wird —
statt sie aus dem Code zu rekonstruieren.

---

## Grundregeln

1. **IDs sind Zeichenketten mit Namensraum.** `item.ore.iron`, `enemy.slime`,
   `area.forest.deep`, `recipe.ironSword`. Content-IDs sind stabil und ändern sich nie;
   ein Umbenennen bricht Spielstände.
2. **Instanz-IDs sind UUIDv7.** Zeitlich sortierbar, das erspart einen zusätzlichen
   Index auf `createdAt`.
3. **Zeiten sind Ganzzahl-Millisekunden seit Epoche**, immer Serverzeit.
4. **Weltkoordinaten sind Ganzzahl-Pixel** (`docs/27` §27.4).
5. **Content ist unveränderlich, Spielstand ist veränderlich.** Nie mischen.

---

## Spielerbezogen vs. charakterbezogen

`docs/25` §25.25 trennt strikt. Diese Zuordnung ist verbindlich, weil sie darüber
entscheidet, was zwischen Charakteren geteilt wird:

| Spielerbezogen | Charakterbezogen |
|---|---|
| Konto, Anmeldung | Level, Erfahrung |
| **Währung** | Attribute |
| Freigeschaltete Gebiete | Skills |
| Herausforderungsfortschritt | Klasse |
| Questfortschritt | Ausrüstung |
| Marktangebote | Inventar |
| Ranglisteneinträge | Position, Gebiet |
| Charakterplätze | Aktivität, Idle-Zustand |
| | Buffs |

**Währung ist spielerbezogen** — Abweichung von einer naheliegenden Lesart von
`docs/25` §25.3. Begründung in M10/S-10.6: Bei acht Charakteren wäre getrenntes Gold
Verwaltungsaufwand ohne Spielwert, und `docs/25` §25.2 führt Währung ausdrücklich unter
`Player`.

**Questfortschritt ist spielerbezogen** nach `docs/16` §16.6 (ausdrücklich
charakterübergreifend). **Herausforderungsfortschritt ebenso**, abgeleitet aus `docs/25`
§25.2: freigeschaltete Gebiete stehen dort unter `Player`, also muss auch der Zähler
dorthin, der sie freischaltet.

---

## Tabellen

Reihenfolge entspricht der Entstehung; die Migrationsnummer ist angegeben.

### `players` (M1)

| Spalte | Typ | Bemerkung |
|---|---|---|
| `id` | TEXT PK | UUIDv7 |
| `name` | TEXT UNIQUE | Anzeigename |
| `email` | TEXT UNIQUE NULL | ab M13 |
| `passwordHash` | TEXT NULL | Argon2id, ab M13 |
| `currency` | INTEGER | Gold |
| `characterSlots` | INTEGER | Start 3, max 8 |
| `createdAt`, `lastSeenAt` | INTEGER | ms |

`lastSeenAt` ist die Grundlage der Offline-Abrechnung (M5/S-5.6) und darf nur beim
Abmelden und beim regelmäßigen Speichern gesetzt werden.

### `characters` (M1, erweitert M3)

| Spalte | Typ | Bemerkung |
|---|---|---|
| `id` | TEXT PK | |
| `playerId` | TEXT FK | |
| `name` | TEXT | eindeutig **pro Spieler** |
| `slotIndex` | INTEGER | Reihenfolge in der Leiste |
| `level`, `experience` | INTEGER | kein Maximum (`docs/19` §19.4) |
| `classId` | TEXT NULL | **einmalig setzbar** |
| `areaId` | TEXT | |
| `posX`, `posY` | INTEGER | |
| `health`, `mana` | INTEGER | aktuelle Werte |
| `activityJson` | TEXT | siehe unten |
| `appearanceJson` | TEXT | |
| `createdAt`, `lastActiveAt` | INTEGER | |
| `deletedAt` | INTEGER NULL | Löschfrist (M3/S-3.2) |

### `character_attributes` (M7)

`(characterId, attribute)` als Primärschlüssel, Spalten `value`, `experience`.
Attribute: `strength`, `intelligence`, `dexterity`, `vitality`, `wisdom`.

Eigene Tabelle statt JSON, weil Ranglisten darauf sortieren.

### `character_skills` (M5)

`(characterId, skillId)`, Spalten `level`, `experience`.
Skills: `woodcutting`, `mining`, `fishing`, `farming`, `cooking`, `smithing`,
`alchemy`, `enchanting`, `combat` (`docs/25` §25.5).

### `inventory_slots` (M4)

| Spalte | Typ |
|---|---|
| `characterId` | TEXT FK |
| `slotIndex` | INTEGER |
| `itemId` | TEXT |
| `amount` | INTEGER |
| `instanceId` | TEXT NULL |

Primärschlüssel `(characterId, slotIndex)`. Bei `instanceId != NULL` ist `amount` immer 1.

### `item_instances` (M8)

`id`, `itemId`, `enchantmentsJson`, `rolledModifiersJson`, `craftedBy`, `createdAt`.

Nur für Einzelstücke. Eine Instanz existiert in **genau einem** Zustand: Inventar,
Ausrüstung, Weltgegenstand, Marktangebot oder Postfach. Die Eindeutigkeit ist eine
Datenbankbedingung, keine Vereinbarung — sonst entsteht Duplikation.

### `equipment` (M8)

`(characterId, slot)`, Spalten `itemId`, `instanceId`.
Slots: `weapon`, `armor`, `helmet`, `shoes`, `tool`, `accessory` (`docs/25` §25.9).

### `world_items` (M4)

`id`, `areaId`, `x`, `y`, `itemId`, `amount`, `instanceId`, `ownerId`, `droppedAt`.

Index auf `(areaId, ownerId)`. **Kein automatisches Löschen** (`docs/09` §9.16).

### `player_progress` (M9)

`(playerId, key)` → `value`. Ein gemeinsamer Zähler für Herausforderungen und Quests
(M9/S-9.4). Schlüsselform: `kill:enemy.slime`, `collect:item.wood.oak`,
`boss:boss.forestWarden`.

### `player_quests` (M9)

`(playerId, questId)`, Spalten `state` (`available`/`active`/`completed`),
`startedAt`, `completedAt`.

### `player_unlocks` (M9)

`(playerId, unlockId)` — freigeschaltete Portale, Gebiete, Rezepte.

### `market_offers` (M10)

`id`, `sellerId`, `itemId`, `instanceId`, `amount`, `pricePerUnit`, `createdAt`,
`expiresAt`, `state`. Index auf `(itemId, pricePerUnit)`.

### `mail` (M10)

`id`, `toPlayerId`, `toCharacterId`, `itemId`, `amount`, `instanceId`, `currency`,
`deliverAt`, `claimedAt`.

### `leaderboard_snapshots` (M10)

`category`, `rank`, `playerId`, `characterId`, `value`, `computedAt`.

---

## Zentrale Typen

### Activity

```ts
type Activity =
  | { type: 'none' }
  | { type: 'gather';   nodeId: NodeId;     startedAt: number; lastYieldAt: number }
  | { type: 'combat';   areaId: AreaId;     startedAt: number; lastYieldAt: number }
  | { type: 'crafting'; recipeId: RecipeId; startedAt: number; lastYieldAt: number; queued: number };
```

**`lastYieldAt` ist der wichtigste Wert im gesamten Modell.** Es ist der Zeitpunkt, **bis
zu dem tatsächlich ausgezahlt wurde** — nicht der Zeitpunkt der letzten Abrechnung.

Der Unterschied ist der ganze Punkt: Beim Abrechnen wird der Marker um
`n * zykluszeit / effizienz` vorgerückt, nicht auf `jetzt`. Die verbleibende Differenz
ist der angefangene Zyklus und geht dadurch nicht verloren. Wird stattdessen auf `jetzt`
gesetzt, verliert der Spieler bei jeder Abrechnung Bruchteile — bei 30-Sekunden-Takt und
3-Sekunden-Zyklus bis zu 10 %.

Ein zusätzliches Restfeld wäre redundant und würde irgendwann vom Marker abweichen.
Ausführlich in M5/S-5.4.

### Modifier

```ts
type Modifier =
  | { kind: 'flat';    target: StatKey; value: number }
  | { kind: 'percent'; target: StatKey; value: number };

// verbindliche Reihenfolge (M7/S-7.4):
endwert = (basis + summe(flat)) * (1 + summe(percent))
```

`StatKey` umfasst Kampfwerte **und** Berufseffizienzen — dieselbe Struktur trägt
`attackPower` wie `woodcuttingSpeed`. Das ist die technische Grundlage dafür, dass
`docs/05` §5.6 (Attribute wirken auf mehrere Systeme) und `docs/11` §11.14 (Ausrüstung
wirkt auf Berufe) ohne Sonderfälle umsetzbar sind.

### InventorySlot

```ts
type InventorySlot =
  | { kind: 'stack';  itemId: ItemId; amount: number }
  | { kind: 'unique'; itemId: ItemId; instanceId: string };
```

Diese Unterscheidung existiert ab M4, obwohl `unique` erst in M8 vorkommt. Sie
nachträglich einzuziehen hieße, jeden Inventarzugriff anzufassen.

---

## Content-Kategorien

| Ordner | Typ | Ab | GDD |
|---|---|---|---|
| `content/areas/` | `Area` | M2 | §25.14 |
| `content/items/` | `Item`, `Equipment` | M4, M8 | §25.8, §25.9 |
| `content/droptables/` | `DropTable` | M4 | §25.22 |
| `content/resources/` | `ResourceNode` | M5 | §25.19 |
| `content/enemies/` | `Enemy` | M6 | §25.17 |
| `content/abilities/` | `Ability` | M6, M7 | §25.7 |
| `content/classes/` | `Class` | M7 | §25.6 |
| `content/recipes/` | `Recipe` | M8 | §25.20 |
| `content/quests/` | `Quest` | M9 | §25.21 |
| `content/challenges/` | `Challenge` | M9 | §25.16 |
| `content/bosses/` | `Boss` | M9 | §25.18 |
| `content/npcs/` | `Npc` | M9 | — |

Alle werden beim Serverstart geladen, validiert und auf Querverweise geprüft (M1/S-1.6).

---

## Was ausdrücklich fehlt

| Fehlt | Grund |
|---|---|
| Bank / gemeinsames Lager | In `docs/` nicht vorgesehen. Rucksackgrenze und Bodenablage sind ein bewusstes Designelement (`docs/03` §3.13). Siehe [99-offene-entscheidungen.md](99-offene-entscheidungen.md). |
| Gilden, Gruppen, Chat | `docs/18` §18.3, §18.9 schließen sie aus |
| PvP | `docs/18` §18.9 |
| Haltbarkeit von Ausrüstung | `docs/06` §6.15: keine Gegenstände werden zerstört |
| Gewicht statt Plätze | `docs/22` §22.6 zählt Plätze |
