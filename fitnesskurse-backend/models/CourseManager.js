// ./models/CourseManager.js

const pool = require('../src/db'); // Zugriff auf die PostgreSQL-Verbindung
class CourseManager {
    constructor() {
        this.courseData = new Map(); // In-Memory-Cache (Der State)
    }

    // Methode, um alle Kurse beim Start einmalig zu laden
    async loadInitialState() {
        try {
            const result = await pool.query('SELECT id, title, max_capacity, booked_participants FROM courses');
            result.rows.forEach(course => {
                const freeSpots = course.max_capacity - course.booked_participants;
                this.courseData.set(course.id, {
                    ...course,
                    freeSpots: freeSpots
                });
            });
            console.log(`✅ ${this.courseData.size} Kurse in den In-Memory-Cache geladen.`);
        } catch (error) {
            console.error("❌ Fehler beim Laden des initialen Kurs-States:", error);
        }
    }

    // Zentrale Funktion zur Zustandsänderung und Filter-Vorbereitung
    async handleCourseUpdate(courseId, participantsChange) {

        let oldCourse = this.courseData.get(courseId);

        // Fallback: Wenn Kurs nicht im Cache (sollte bei loadInitialState nicht passieren)
        if (!oldCourse) {
            // Lade Kursdaten aus der Datenbank (synchronisiert den Cache)
            const dbResult = await pool.query('SELECT id, title, max_capacity, booked_participants FROM courses WHERE id = $1', [courseId]);
            if (dbResult.rows.length === 0) return null;
            oldCourse = dbResult.rows[0];
            oldCourse.freeSpots = oldCourse.max_capacity - oldCourse.booked_participants;
            this.courseData.set(courseId, oldCourse); // Aktualisiere Cache
        }

        // 1. Speichere den kritischen ALTEN Wert
        const oldSpots = oldCourse.freeSpots;

        // 2. Berechne NEUEN Zustand
        const newBookedParticipants = oldCourse.booked_participants - participantsChange;
        const newSpots = oldCourse.max_capacity - newBookedParticipants;

        const newCourse = {
            ...oldCourse,
            bookedParticipants: newBookedParticipants,
            freeSpots: newSpots
        };

        // 3. Datenbank-Update (Transaktion in der Buchungs-API sichert die atomare Ausführung)
        // HINWEIS: Das DB-Update sollte im bookingController liegen, aber wir simulieren hier die Synchronisation

        // 4. Cache-Update (WICHTIG!)
        this.courseData.set(courseId, newCourse);

        // 5. Rückgabe der Filter-Informationen
        return {
            updatedCourse: newCourse,
            oldSpots: oldSpots,
            newSpots: newSpots
        };
    }
}

// Singleton-Instanz exportieren
const manager = new CourseManager();

// Laden Sie den State, sobald die DB-Verbindung steht (muss im server.js aufgerufen werden)
// manager.loadInitialState(); 

module.exports = manager;