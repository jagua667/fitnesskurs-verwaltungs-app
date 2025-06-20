// src/api/axios.js

/**
 * Axios-Instanz zur Kommunikation mit dem Backend-API.
 * 
 * - Basis-URL auf das Backend-API gesetzt (localhost:5000/api).
 * - Standard-Header: Content-Type auf application/json.
 * - Request-Interceptor: Falls ein JWT-Token im localStorage vorhanden ist,
 *   wird es als Bearer-Token im Authorization-Header jedes Requests hinzugefügt.
 * 
 * So müssen Token nicht manuell bei jedem Request mitgegeben werden.
 */
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:5000/api', // Passe das an dein Backend an
    headers: {
        "Content-Type": "application/json",
      },
});

// Interceptor: Token bei jedem Request anhängen
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
    (error) => Promise.reject(error)
);

export default instance;
