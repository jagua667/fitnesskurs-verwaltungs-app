/**
 * @file MediatorStrategy.js
 * @description Konkrete Strategie für das Mediator Pattern.
 * Eine zentrale Instanz verwaltet alle Clients und regelt die Kommunikation.
 */

const DistributionStrategy = require('./DistributionStrategy');

class MediatorStrategy extends DistributionStrategy {
    constructor(io) {
        super(io);
        // Der Mediator verwaltet die Clients, die an den Updates interessiert sind
        this.participants = new Set();
        console.log('[WS:MEDIATOR] Mediator Strategy geladen.');
    }

    /**
     * Der Client registriert sich beim zentralen Mediator (diese Strategie-Instanz).
     * @param {object} clientSocket - Die Socket-Instanz des Clients.
     */
    registerClient(clientSocket) {
        this.participants.add(clientSocket);
        
        // Entferne den Client, wenn die Verbindung getrennt wird
        clientSocket.on('disconnect', () => {
            this.participants.delete(clientSocket);
        });

        clientSocket.emit('status', { message: 'Als Teilnehmer beim Mediator registriert.' });
    }

    /**
     * Der Mediator empfängt die System-Nachricht und entscheidet, wohin sie verteilt wird.
     * Im einfachsten Fall werden alle Teilnehmer benachrichtigt.
     * @param {string} eventName - Der Name des Ereignisses.
     * @param {object} payload - Die zu sendenden Daten.
     */
    distributeMessage(eventName, payload) {
        // Kern der Mediator-Logik: Die zentrale Instanz sendet an alle bekannten Teilnehmer.
        this.participants.forEach(clientSocket => {
            // Optional könnte hier Logik stehen: if (clientSocket.userRole === 'Admin') send;
            clientSocket.emit(eventName, payload); 
        });
    }
}

module.exports = MediatorStrategy;
