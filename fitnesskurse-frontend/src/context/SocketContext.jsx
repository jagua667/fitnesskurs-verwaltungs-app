// client/src/context/SocketContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client'; 

// Definiere die URL des Backends
const SOCKET_SERVER_URL = 'http://localhost:5000';

// 1. Context erstellen
const SocketContext = createContext();

// Hook zur einfachen Nutzung des Sockets
export const useSocket = () => {
  return useContext(SocketContext);
};

// 2. Provider-Komponente (Kontext)
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  // Lese die aktive Strategie aus den Umgebungsvariablen des Frontends (für Pub/Sub)
  // Dies ist keine Standardisierung, sondern notwendig für die Pub/Sub Logik
  const activeStrategy = import.meta.env.VITE_WS_STRATEGY || 'OBSERVER'; 

  useEffect(() => {
    // 3. Verbindung herstellen
    const newSocket = io(SOCKET_SERVER_URL, {
      // Optional: Füge hier Header oder Auth-Token hinzu, falls nötig
      transports: ['websocket', 'polling'],
      // Optional: Gib die aktive Strategie an den Client weiter (hilfreich für Debugging/Registrierung)
      query: { strategy: activeStrategy },
    });

    setSocket(newSocket);
    
    // Optional: Logge den Verbindungsstatus
    newSocket.on('connect', () => {
      console.log(`[WS] Verbunden. Strategie: ${activeStrategy}`);
    });
    newSocket.on('disconnect', () => {
      console.log('[WS] Verbindung getrennt.');
    });

    // Cleanup-Funktion beim Unmount
    return () => {
      newSocket.disconnect();
    };
  }, [activeStrategy]);

  return (
    <SocketContext.Provider value={{ socket, activeStrategy }}>
      {children}
    </SocketContext.Provider>
  );
};
