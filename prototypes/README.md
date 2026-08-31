# Prototypen

Spielwiese für schnelle Experimente. **Nichts hier ist Teil des eigentlichen Spiels.**

## Regeln

1. **Keine Abhängigkeit zum Hauptprojekt.** Kein Import aus zukünftigen `src/`- oder `server/`-Ordnern, kein gemeinsames `package.json`. Wenn ein Prototyp etwas aus dem Spiel braucht, wird es kopiert — nicht referenziert.
2. **Jeder Prototyp ist ein eigener Ordner** und für sich allein lauffähig.
3. **Wegwerf-Code ist erlaubt.** Hier gelten keine Architektur-Vorgaben aus `docs/24-technische-architektur.md`. Ziel ist Erkenntnis, nicht Wartbarkeit.
4. **Umgekehrte Richtung ist auch tabu:** Das Spiel importiert niemals aus `prototypes/`. Was sich bewährt, wird bewusst neu implementiert.

## Neuen Prototyp starten

```bash
cp -r prototypes/_template prototypes/02-mein-experiment
```

Der neue Ordner erscheint **automatisch** unter <http://localhost:5180/prototypes/> — es muss nichts registriert und nichts neu gestartet werden. Das Menü liest bei jedem Aufruf den Ordner neu. Titel und Frage im Menü kommen aus der `NOTES.md`: die erste `#`-Überschrift und die erste Zeile unter `## Frage`.

Falls ein Prototyp doch Dependencies braucht, bekommt er sein **eigenes** `package.json` im eigenen Ordner. Nie eins auf `prototypes/`-Ebene.

## Zwei Wege zum Öffnen

**Per Dev-Server** (empfohlen) — im Repo-Wurzelverzeichnis:

```bash
pnpm dev
```

Dann <http://localhost:5180/prototypes/>. Vorteil: Live-Reload, die Seite lädt bei jeder Dateiänderung neu.

**Per Doppelklick** auf die `index.html` funktioniert ebenfalls. Deshalb benutzen die Prototypen bewusst klassische `<script>`-Tags statt ES-Module — `file://` blockt Module. Wer `fetch` oder Assets lädt, braucht den Dev-Server.

Der Dev-Server ist eine Bequemlichkeit, keine Abhängigkeit: kein Prototyp darf so gebaut sein, dass er nur mit Vite läuft.

## Übersicht

| Ordner | Frage, die er beantworten soll | Status | Erkenntnis |
|---|---|---|---|
| `_template` | — (Vorlage) | — | — |
| `01-side-view-movement` | Fühlt sich die Steuerung in 2D-Seitenansicht (IdleOn-Stil) gut an? | spielbar | offen |

> Trag jeden Prototyp hier ein. Die Spalte **Erkenntnis** ist der eigentliche Wert — der Code darf danach sterben.
