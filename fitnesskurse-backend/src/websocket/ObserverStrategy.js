/**
 * @file ObserverStrategy.js
 * @description Konkrete Strategie für das Observer Pattern. 
 * Der Server führt eine direkte Liste aller verbundenen Clients und benachrichtigt diese einzeln.
 */

const DistributionStrategy = require('./DistributionStrategy');

class ObserverStrategy extends DistributionStrategy {
    constructor(io) {
        super(io);
        // Die zentrale Liste der Observer (Clients)
        this.observers = new Set(); 
        console.log('[WS:OBSERVER] Observer Strategy geladen.');
    }

    /**
     * Fügt den Client zur zentralen Liste der Observer hinzu.
     * Implementiert das Unregister-Handling bei Trennung (disconnect).
     * @param {object} clientSocket - Die Socket-Instanz des Clients.
     */
    registerClient(clientSocket) {
        this.observers.add(clientSocket);
        
        // Wichtig für das Aufräumen: Wenn der Client die Verbindung trennt, muss er
        // aus der Liste entfernt werden (Unregister-Logik des Observer Patterns).
        clientSocket.on('disconnect', () => {
            this.observers.delete(clientSocket);
            // console.log(`[WS:OBSERVER] Client ${clientSocket.id} wurde entfernt. Aktive: ${this.observers.size}`);
        });
        
        // Optional: Sende eine Bestätigung an den Client
        clientSocket.emit('status', { message: 'Als Observer registriert.' });
    }

    /**
     * Verteilt die Nachricht, indem alle registrierten Observer direkt iteriert werden.
     * @param {string} eventName - Der Name des Ereignisses.
     * @param {object} payload - Die zu sendenden Daten.
     */
    distributeMessage(eventName, payload) {
        const messageCount = this.observers.size;
        // console.log(`[WS:OBSERVER] Verteile Event '${eventName}' an ${messageCount} Clients.`);

        // Der Kern der Observer-Logik: Direkte Iteration und Benachrichtigung
        this.observers.forEach(clientSocket => {
            // Socket.IO sendet Events mit dem EventName und dem Payload
            clientSocket.emit(eventName, payload); 
        });
    }
}

module.exports = ObserverStrategy;
