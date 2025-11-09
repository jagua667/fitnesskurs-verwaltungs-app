# Performance-Messung – Methodik (Artillery)

**Ziel:**  
Vergleich der Design Patterns (Observer, Mediator, Pub/Sub) im Hinblick auf Durchsatz, Latenz, Fehlerraten und Ressourcenauslastung.

**Tool & Umgebung:**  
- Artillery (WS/HTTP)  
- Node.js v20.x, Artillery @2.0.0-27  
- Hardware: Laptop i7/16 GB RAM, Windows 11 / WSL  
- Testumgebung: lokaler Server, feste Payloads und identische Testdaten

**Szenarien:**  
1. Feature-Flow – Normalbetrieb (50–100 Clients, realistische Nutzung)  
2. Fehlerfall – Robustheit bei ungültigen Requests  
3. Peak – Stressphase (150–200 Clients, hohe Parallelität)

**Metriken:**  
- Durchsatz (msgs/s)  
- Latenz p95 / p99  
- Fehlerrate (%)  
- CPU- und RAM-Auslastung (Mittel/Peak, via pidstat oder docker stats)

**Durchführung:**  
- Drei Läufe pro Pattern × Szenario  
- Warm-up-Phasen verworfen  
- JSON-Ausgabe über `--output results/<pattern>-<scenario>.json`  
- Node- und Artillery-Version, OS und Hardware fixiert

**Auswertung:**  
- Mittelwert + p95/p99 aus JSON-Reports  
- Vergleich tabellarisch je Pattern  
- Ergänzende Systemmetriken aus `.metrics.txt`

**Status:**  
Setup (artillery.yml, run.sh) ist vorbereitet; Messläufe werden derzeit durchgeführt.
