/**
 * @file PubSubStrategy.js
 * @description Konkrete Strategie für das Publisher-Subscriber Pattern.
 * Nutzt Socket.IO Rooms als Topics/Channels zur Entkopplung.
 */

const DistributionStrategy = require('./DistributionStrategy');

// Definiere den zentralen Channel für alle Kurs-Updates
const COURSE_UPDATE_TOPIC = 'course_updates';

class PubSubStrategy extends DistributionStrategy {
    constructor(io) {
        super(io);
        console.log('[WS:PUBSUB] Pub/Sub Strategy geladen. Topic:', COURSE_UPDATE_TOPIC);
    }

    /**
     * Der Client registriert sich NICHT direkt, sondern muss einen Topic abonnieren.
     * Wir lauschen auf das Event 'subscribe' vom Client.
     * @param {object} clientSocket - Die Socket-Instanz des Clients.
     */
    registerClient(clientSocket) {
        // Lausche auf ein explizites 'subscribe'-Event vom Client
        clientSocket.on('subscribe', (topic) => {
            if (topic === COURSE_UPDATE_TOPIC) {
                // Der Kern der Pub/Sub Logik: Füge den Client zum Socket.IO Room hinzu.
                clientSocket.join(COURSE_UPDATE_TOPIC); 
                // console.log(`[WS:PUBSUB] Client ${clientSocket.id} abonniert Topic ${topic}.`);
                clientSocket.emit('status', { message: `Topic ${topic} abonniert.` });
            }
        });
        
        // Sende nur eine Basis-Statusmeldung (er muss noch abonnieren!)
        clientSocket.emit('status', { message: 'Verbindung hergestellt. Bitte Topic abonnieren.' });
    }

    /**
     * Die Nachricht wird direkt an den Topic gesendet, ohne Wissen, wer abonniert hat.
     * @param {string} eventName - Der Name des Ereignisses.
     * @param {object} payload - Die zu sendenden Daten.
     */
    distributeMessage(eventName, payload) {
        // WICHTIG: Socket.IO's 'to()' oder 'in()' Methode wird verwendet, um an einen Room zu senden.
        // Dies ist die entkoppelte Pub/Sub-Verteilung.
        this.io.to(COURSE_UPDATE_TOPIC).emit(eventName, payload);

        // console.log(`[WS:PUBSUB] Publiziert Event '${eventName}' auf Topic '${COURSE_UPDATE_TOPIC}'.`);
    }
}

module.exports = PubSubStrategy;
