/**
 * @file InterestFilterStrategy.js
 * @description Konkrete Strategie zur Implementierung des Schwellenwert-Filters
 * (0 freie Plätze auf >=1 freie Plätze) innerhalb der Rolle 'kunde_interesse'.
 */

const DistributionStrategy = require('./DistributionStrategy');

class InterestFilterStrategy extends DistributionStrategy {
    constructor(io) {
        super(io);
        console.log('[WS:FILTER] InterestFilter Strategy geladen.');
    }

    /**
     * Registriert einen Client. 
     * HINWEIS: clientSocket.role muss hier oder in der Authentifizierungs-Middleware 
     * auf 'admin', 'trainer' oder 'kunde_interesse' gesetzt werden.
     */
    registerClient(clientSocket) {
        // Beispiel: clientSocket.role = 'kunde_interesse'; // FÜR TESTS
        
        clientSocket.on('disconnect', () => {
            // Logik zum Aufräumen, falls benötigt
        });
        
        clientSocket.emit('status', { message: 'Als gefilterter Teilnehmer registriert.' });
    }

    /**
     * Die zentrale Methode für die rollenbasierte Zustandsfilterung.
     * @param {object} filterData - Enthält { updatedCourse, oldSpots, newSpots }
     */
    notifyCourseUpdate(filterData) {
        const { updatedCourse, oldSpots, newSpots } = filterData;
        
        const payload = {
            event: 'course_updated',
            data: updatedCourse,
        };

        this.io.sockets.sockets.forEach((clientSocket) => {
            const role = clientSocket.role; 

            // --- 🔥 Die Rollen- und Zustands-Filterlogik 🔥 ---
            
            // Regel 1: Admins (und Trainer) erhalten immer alle Updates
            if (role === 'admin' || role === 'trainer') {
                clientSocket.emit('course_updated', payload);
                return;
            }

            // Regel 2: Kunde 'Interesse' erhält nur Updates bei Schwellenwertwechsel (Optimierung)
            if (role === 'kunde_interesse') { // ⬅️ KONSISTENTE KLEINSCHREIBUNG
                // Bedingung: Senden nur, wenn ein Platz frei wird UND der Kurs vorher ausgebucht war (0 -> >=1).
                const thresholdCrossed = (oldSpots === 0 && newSpots >= 1);
                
                if (thresholdCrossed) {
                    clientSocket.emit('course_updated', payload); 
                }
                return;
            }
            
            // Andere Rollen werden ignoriert.
        });
    }

    /**
     * Fallback-Methode für ungefilterten Broadcast (wird von bookingController.js nicht mehr verwendet).
     */
    distributeMessage(eventName, payload) {
        this.io.emit(eventName, payload);
    }
}

module.exports = InterestFilterStrategy;