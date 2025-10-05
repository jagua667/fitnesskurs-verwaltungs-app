import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

// Das Topic, das in der PubSubStrategy.js definiert ist
const COURSE_UPDATE_TOPIC = 'course_updates'; 

const CourseUpdateListener = () => {
  const { socket, activeStrategy } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // 1. Patternspezifische Registrierung (nur für Pub/Sub nötig)
    if (activeStrategy === 'PUBSUB') {
      console.log(`[WS:Client] Abonniere Topic: ${COURSE_UPDATE_TOPIC}`);
      socket.emit('subscribe', COURSE_UPDATE_TOPIC); 
    }
    
    // 2. Listener für alle Strategien identisch (Standardisierung der Payload!)
    const updateListener = (data) => {
      // Hier findet der Client-seitige Messpunkt statt (Endpunkt der Latenz)
      console.log(`[WS:Client] Echtzeit-Update erhalten (Strategie: ${activeStrategy}):`, data);
      
      // Beispiel für UI-Update-Logik:
      // Führe hier die Logik aus, um die UI zu aktualisieren,
      // z.B. Redux-Action dispatch oder Zustand im Context ändern.
      alert(`Kurs-Update: ${data.courseTitle} hat jetzt ${data.seatsAvailable} freie Plätze.`);
    };

    socket.on('course_updated', updateListener);

    // 3. Cleanup-Logik
    return () => {
      socket.off('course_updated', updateListener);
      // Optional: Explizites Unsubscribe für Pub/Sub, falls benötigt
      // if (activeStrategy === 'PUBSUB') { socket.emit('unsubscribe', COURSE_UPDATE_TOPIC); }
    };
  }, [socket, activeStrategy]);

  return null; // Diese Komponente dient nur dem Lauschen, nicht der Anzeige
};

export default CourseUpdateListener;
