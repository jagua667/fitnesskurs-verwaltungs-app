const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Fitnesskurs-API',
        version: '1.0.0',
        description: `
Webanwendung zur Verwaltung von Fitnesskursen.

Die API unterstützt:
- Benutzerregistrierung und -anmeldung mit Rollen (Admin, Trainer, Kunde)
- Kursverwaltung (Erstellen, Bearbeiten, Löschen)
- Buchung und Stornierung von Kursen
- Kalenderansicht für Kunden und Trainer
- Kurs-Suche nach Zeit, Ort und Trainer
- Bewertungssystem (1-5 Sterne)
- CSV-Export von Kursen und Bewertungen
- Automatisierte E-Mail-Benachrichtigungen
- Dashboard mit Statistiken für Trainer und Admins
- Sicherheitsfunktionen wie Passwortverschlüsselung und Validierung

Technologien: React, Express, Node.js, PostgreSQL
        `,
    },
    servers: [
        {
            url: 'http://localhost:5000/api',
            description: 'Lokaler Entwicklungsserver',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            Trainer: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 3 },
                    name: { type: 'string', example: "Max Mustermann" },
                },
            },
            Course: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    title: { type: 'string', example: 'Yoga für Anfänger' },
                    description: { type: 'string', example: 'Ein Kurs für Einsteiger' },
                    start_time: { type: 'string', format: 'date-time', example: '2025-07-01T09:00:00Z' },
                    end_time: { type: 'string', format: 'date-time', example: '2025-07-01T10:30:00Z' },
                    trainer_id: { type: 'integer', example: 3 },
                },
            },
        },
    },
    security: [{ bearerAuth: [] }],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js'], // Swagger-Kommentare aus allen Routen einlesen
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
