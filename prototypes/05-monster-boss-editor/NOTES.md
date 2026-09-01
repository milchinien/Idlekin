# Prototyp 05 – Monster- & Boss-Studio

## Frage

Lassen sich Gegner, Spawnzonen und vollständige Frame-für-Frame-Animationen verständlich in den bestehenden Idlekin-Welten erstellen?

## Verbesserter Produkt-Prompt

Entwickle einen interaktiven Desktop-Prototypen für **Idlekin: Monster & Boss Studio**. Der Editor baut auf den Welten aus Prototyp 02 auf und vereint drei klar getrennte Arbeitsbereiche:

1. **Welt & Zonen:** Gegner aus `assets/enemy` auswählen und als einzelnen Spawner oder als sichtbare Monsterzone direkt auf einer Weltkarte platzieren. Für jede Platzierung sind Gegnertyp, maximale Gegnerzahl, Respawnzeit, Aggro-Radius, Rückkehrverhalten, KI-Grundverhalten und Form/Radius des Spawngebiets konfigurierbar. Platzierungen müssen auswählbar, verschiebbar und löschbar sein.
2. **Gegner erstellen:** Aussehen aus der Gegnerbibliothek auswählen und Name, Kategorie (Monster/Boss), Levelbereich, Leben, Schaden, Rüstung, Bewegung, Angriffstempo, Erfahrung, Gold und beliebig viele Drops mit Menge, Seltenheit und Dropchance bearbeiten. Der resultierende Gegner soll als sofortige Vorschau sichtbar sein.
3. **Design Studio:** Einen geführten Frame-für-Frame-Workflow anbieten. Die Sequenz umfasst Idle 1–3, Start Walking 1–2, Walking 1–5, Stop Walking 1–2 sowie je vier Bilder pro konfigurierter Attacke. Jeder Schritt zeigt eine eigene ausgegraute Bewegungsidee, das vorherige Bild als Onion Skin und eine Pixel-Zeichenfläche. Mit „Bild fertigstellen & weiter“ wird jeder Frame einzeln abgehakt. Weitere Attacken können ergänzt werden.

Der Prototyp soll sich wie ein fokussiertes Game-Development-Werkzeug anfühlen: dunkle, hochwertige Editor-Oberfläche, grüne Naturakzente, Pixel-Art-Vorschauen aus den gelieferten Assets, präzise Statusanzeigen, plausible Beispieldaten und funktionierende Kerninteraktionen. Alle Daten bleiben lokal im Browser; Speichern, Testlauf und Fortschritt geben sichtbares Feedback.

## Bedienung

- Gegner links auswählen und in der Welt platzieren; bestehende Zonen anklicken und rechts konfigurieren.
- Über die drei Schritte oben zwischen Welt, Gegnerdaten und Frame-Design wechseln.
- Im Design Studio Pixel zeichnen oder löschen und jeden Animationsframe einzeln abschließen.
- Das Projekt wird lokal im Browser gespeichert.
