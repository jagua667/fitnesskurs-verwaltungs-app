/**
 * @file WebSocketContext.js
 * @description Der Kontext des Strategy Patterns. Initialisiert den Socket.IO-Server,
 * lädt die aktive Verteilungsstrategie und leitet Client-Verbindungen und
 * ausgehende Nachrichten an diese Strategie weiter.
 */

const { Server } = require('socket.io');
const { getActiveStrategyClass, ACTIVE_STRATEGY_KEY } = require('./strategies.config');

class WebSocketContext {
    // Statische Property, um die Singleton-Instanz zu halten
    static instance = null;

    /**
     * Privater Konstruktor für das Singleton-Muster.
     */
    constructor() {
        if (WebSocketContext.instance) {
            return WebSocketContext.instance;
        }

        // Allgemeine Socket.IO-Instanz
        this.io = null;
        // Die aktuell aktive Strategie-Instanz (z.B. ObserverStrategy)
        this.activeStrategy = null;

        WebSocketContext.instance = this;
    }

    /**
     * Initialisiert den Socket.IO-Server und lädt die Strategie.
     * Muss beim Start des HTTP-Servers aufgerufen werden.
     * @param {object} httpServer - Die Instanz des HTTP-Servers (von Express).
     */
    init(httpServer) {
        if (this.io) {
            console.warn('WebSocketContext wurde bereits initialisiert.');
            return;
        }

        // 1. Socket.IO Server initialisieren
        this.io = new Server(httpServer, {
            // CORS-Einstellungen sind wichtig, da Front- und Backend oft auf verschiedenen Ports laufen
            cors: {
                origin: "*", // Ersetzen Sie dies später durch die tatsächliche URL Ihres Frontends!
                methods: ["GET", "POST"]
            },
            // Optionale weitere Konfiguration (z.B. Timeout, Pfad etc.)
        });

        // 2. Aktive Strategieklasse laden und instanziieren
        const StrategyClass = getActiveStrategyClass();
        this.activeStrategy = new StrategyClass(this.io);

        console.log(`[WS] WebSocketContext gestartet mit Strategie: ${ACTIVE_STRATEGY_KEY}`);

        // 3. Verbindungshandling definieren
        this.io.on('connection', (clientSocket) => {
            console.log(`[WS] Neuer Client verbunden. ID: ${clientSocket.id}`);

            // Registriere den neuen Client bei der aktiven Strategie (Strategy-Muster-Aufruf)
            // wenn Client userId via handshake.auth übergibt (z.B. client.connect({ auth: { userId } }))
            if (clientSocket.handshake && clientSocket.handshake.auth && clientSocket.handshake.auth.userId) {
                clientSocket.userId = clientSocket.handshake.auth.userId;
            }
            this.activeStrategy.registerClient(clientSocket);

            // Optional: Client-Disconnect-Handling
            clientSocket.on('disconnect', () => {
                console.log(`[WS] Client getrennt. ID: ${clientSocket.id}`);
                // Hinweis: Strategien müssen das Unregister-Handling in 'registerClient' 
                // oder einer separaten Methode selbst implementieren, falls nötig.
            });
        });
    }

    /**
     * Methode, die spezifisch für Kurs-Updates mit Zustandsinformationen aufgerufen wird.
     * Diese Methode wird vom bookingController aufgerufen.
     * Leitet die Benachrichtigung an die aktive Strategie weiter, die die rollenbasierte Filterung übernimmt.
     * @param {object} filterData - Enthält { updatedCourse, oldSpots, newSpots }
     */
    notifyCourseUpdate(filterData) {
        if (!this.activeStrategy) {
            console.error('[WS ERROR] notifyCourseUpdate aufgerufen, bevor die Strategie initialisiert wurde.');
            return;
        }

        // REVIEW:ENTRY – Kursstatus-Nachricht aus Domäne empfangen; Delegation an aktive StrategyI
        if (typeof this.activeStrategy.notifyCourseUpdate === 'function') {
            this.activeStrategy.notifyCourseUpdate(filterData);
        } else {
            // Führe das Mapping hier durch, falls die Strategie die neue Methode nicht implementiert.
            console.warn('[WS WARN] Die aktive Strategie implementiert notifyCourseUpdate nicht. Nachrichten werden ungefiltert gesendet!');

            // Mappe die Manager-Daten ({updatedCourse: {title, ...}, newSpots}) in das Client-Format ({courseTitle, seatsAvailable}).
            const clientPayload = {
                courseTitle: filterData.updatedCourse.title,
                seatsAvailable: filterData.newSpots,
                courseId: filterData.updatedCourse.id // Füge die ID hinzu, falls sie im Client benötigt wird
            };

            // REVIEW:ENTRY – Fallback: direkte Delegation auf generische Verteilung
            this.activeStrategy.distributeMessage('course_updated', clientPayload);
        }
    }

    /**
     * Methode, die von der Geschäftslogik (z.B. CourseController) aufgerufen wird, 
     * um eine Nachricht zu verteilen.
     * @param {string} eventName - Der Name des Ereignisses (z.B. 'course_updated').
     * @param {object} payload - Die zu sendenden Daten.
     */
    distributeMessage(eventName, payload) {
        if (!this.activeStrategy) {
            console.error('[WS ERROR] distributeMessage aufgerufen, bevor die Strategie initialisiert wurde.');
            return;
        }

        // REVIEW:ENTRY – generischer Nachrichteneingang; Delegation an aktuelle Strategy
        this.activeStrategy.distributeMessage(eventName, payload);
    }

    /**
     * Gibt die Singleton-Instanz zurück.
     */
    static getInstance() {
        if (!WebSocketContext.instance) {
            return new WebSocketContext();
        }
        return WebSocketContext.instance;
    }

    /**
     * Gibt die aktive Strategie-Instanz zurück (z.B. nützlich für Unit Tests).
     */
    getActiveStrategy() {
        return this.activeStrategy;
    }

    /**
     * Gibt alle aktiven Benutzer-IDs zurück (z. B. für Benachrichtigungen über verfügbare Kurse)
     */
    getActiveUserIds() {
        if (!this.io) {
            console.warn('[WS WARN] getActiveUserIds aufgerufen, aber io ist nicht initialisiert.');
            return [];
        }

        // Zugriff auf alle verbundenen Sockets
        const connectedSockets = Array.from(this.io.sockets.sockets.values());

        // Falls du bei der Verbindung die userId mitgibst (z. B. clientSocket.userId)
        const userIds = connectedSockets
            .map(socket => socket.userId)
            .filter(Boolean); // Nur echte IDs

        return userIds;
    }

}

// Exportiere die Singleton-Instanz
module.exports = WebSocketContext.getInstance();
