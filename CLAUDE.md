# Idlekin – verbindliche Entwicklungsregeln

- `docs/` beschreibt das Spiel, `plan/` die Reihenfolge. Bei Widerspruch gewinnt `docs/`.
- `prototypes/` bleibt vollständig isoliert. Erkenntnisse werden neu implementiert, niemals importiert.
- Fortschritt entsteht ausschließlich auf dem autoritativen Server.
- `packages/shared` bleibt frei von DOM, Datenbank und Netzwerk.
- Fachbegriffe des Spiels sind deutsch, technische Begriffe englisch.
- Kommentare erklären warum, nicht was. Datenmodelle verwenden keine Abkürzungen.
- Persistierte Zeiten sind ganzzahlige Millisekunden, Content- und Speicherkoordinaten ganzzahlige Pixel.
- Die Simulation darf intern Nachkommastellen führen; nur die Renderposition wird gerundet.
- Zufall läuft über `shared/sim/random`, niemals über `Math.random()`.
- Jeder Meilenstein hinterlässt ein baubares, getestetes und spielbares Projekt.
