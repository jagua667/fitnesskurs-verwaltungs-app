/**
 * @file DistributionStrategy.js
 * @description Abstrakte Basisklasse (Interface) für alle WebSocket-Verteilungsalgorithmen.
 * Sie definiert die gemeinsame Schnittstelle für das Strategy Pattern.
 */

class DistributionStrategy {
    /**
     * Konstruktor der Basisstrategie.
     * @param {object} io - Die Socket.IO Server-Instanz.
     */
    constructor(io) {
        // Die Socket.IO-Server-Instanz ist der zentrale Kommunikationspunkt,
        // den alle Strategien benötigen, um Nachrichten zu senden oder zu empfangen.
        this.io = io; 
    }

    /**
     * Definiert, wie ein neu verbundener Client in die jeweilige Muster-Logik eingebunden wird.
     * Muss von den konkreten Strategien implementiert werden.
     * * Im Observer-Muster: Speichert den Client.
     * Im Pub/Sub-Muster: Lauscht auf 'subscribe' Events vom Client.
     * * @param {object} clientSocket - Die Socket-Instanz des Clients.
     */
    registerClient(clientSocket) {
        throw new Error('Die Methode registerClient(clientSocket) muss in der konkreten Strategie implementiert werden.');
    }

    /**
     * Definiert, wie eine Nachricht im System verteilt wird (der Kernalgorithmus).
     * Diese Methode wird vom Anwendungskontext (dem Controller/Service) aufgerufen.
     * Muss von den konkreten Strategien implementiert werden.
     * * @param {string} eventName - Der Name des Ereignisses (z.B. 'course_updated').
     * @param {object} payload - Die zu sendenden Daten (z.B. das aktualisierte Kursobjekt).
     */
    distributeMessage(eventName, payload) {
        throw new Error('Die Methode distributeMessage(eventName, payload) muss in der konkreten Strategie implementiert werden.');
    }
}

module.exports = DistributionStrategy;
