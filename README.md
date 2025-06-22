Fitnesskurs Verwaltungs-App

 1. Projektbeschreibung

Diese Webanwendung dient zur Verwaltung von Fitnesskursen. 
Technologien: React (Frontend), Express & Node.js (Backend), PostgreSQL (Datenbank).

---

 2. Ordnerstruktur (Auszug)

Das Projekt ist in zwei Hauptteile aufgeteilt: Backend und Frontend.

```plaintext
BPP_Fitnesskurse/
├── fitnesskurse-backend/      Backend mit Node.js & Express
│   ├── src/                   Quellcode Backend (Routes, Controller, Models)
│   ├── models/                Datenbankmodelle
│   ├── node_modules/          Abhängigkeiten
│   ├── package.json           Backend-Paketdefinition
│   ├── .env.example           Beispiel für Umgebungsvariablen Backend
│   └── ...
├── fitnesskurse-frontend/     Frontend mit React
│   ├── src/                   React-Komponenten, Seiten
│   ├── public/                Öffentliche Dateien (z.B. index.html)
│   ├── node_modules/          Abhängigkeiten
│   ├── package.json           Frontend-Paketdefinition
│   └── ...
├── docs/                      Dokumentation und Dumpdateien
│   └── dump.sql               Datenbank-Dump zum Importieren
├── README.md                  Diese Haupt-README-Datei
└── ...
````

---

 3. Installation und Setup

 3.1 Repository klonen

```bash
git clone https://github.com/jagua667/fitnesskurs-verwaltungs-app.git
cd fitnesskurs-verwaltungs-app
```

 3.2 Backend Setup

1. `.env` Datei anlegen
   Kopiere die `.env.example` im Backend-Ordner und passe die Zugangsdaten an:

```bash
cp fitnesskurse-backend/.env.example fitnesskurse-backend/.env
 Danach die .env mit deinen Zugangsdaten bearbeiten
```

2. PostgreSQL starten (je nach Betriebssystem unterschiedlich):

```bash
sudo systemctl start postgresql
```

3. Datenbank anlegen:

```bash
createdb -U postgres fitnesskurse_db
```

4. Datenbank-Dump importieren:

```bash
psql -U postgres -d fitnesskurse_db -f dump.sql
```

5. Abhängigkeiten installieren:

```bash
cd fitnesskurse-backend
npm install
```

6. Backend starten:

```bash
node src/server.js
```

 3.3 Frontend Setup

1. Abhängigkeiten installieren:

```bash
cd ../fitnesskurse-frontend
npm install
```

2. Frontend starten:

```bash
npm run dev
```

---

 4. Konfiguration (.env)

Alle sensiblen Daten wie Datenbankpasswort, JWT-Secret und E-Mail-Zugangsdaten werden in der `.env` Datei gespeichert und nicht ins Git hochgeladen (siehe `.gitignore`).
Bitte die Datei `.env.example` im Backend-Ordner als Vorlage verwenden und mit eigenen Daten füllen.

---

 5. Test-Benutzerdaten

| Rolle   | Benutzername / E-Mail                                       | Passwort |
| ------- | ----------------------------------------------------------- | -------- |
| Admin   | Admin User / [admin@example.com](mailto:admin@example.com)  | 123456   |
| Trainer | Vincent Kompany / [vincent@test.de](mailto:vincent@test.de) | 123456   |
| Kunde   | Max / [max@test.com](mailto:max@test.com)                   | 123456   |

Diese Benutzer sind im Datenbank-Dump enthalten und können für die Anmeldung genutzt werden.

---

 6. Funktionen

* Benutzerregistrierung und Anmeldung mit unterschiedlichen Rollen (Admin, Trainer, Kunde)
* Verwaltung von Fitnesskursen (Erstellen, Bearbeiten, Löschen)
* Buchung und Stornierung von Kursen durch Kunden
* Kalenderansicht für Kunden und Trainer
* Suchfunktion für Kurse (Zeit, Ort, Trainer)
* Bewertungssystem (1-5 Sterne)
* Export von Kursen und Bewertungen im CSV-Format
* Automatisierte E-Mail-Benachrichtigungen bei Buchungen und Stornierungen
* Dashboard für Trainer und Admins mit Statistiken
* Sicherheit: Passwortverschlüsselung und Eingabevalidierung

---

 7. API-Dokumentation

Die API ist mit Swagger dokumentiert und erreichbar unter:
[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Die Rohdaten sind auch unter [http://localhost:5000/swagger.json](http://localhost:5000/swagger.json) verfügbar.

---

 8. Authentifizierung

Viele Endpunkte erfordern ein JWT-Token, das im HTTP Header gesendet wird:

```
Authorization: Bearer <JWT-Token>
```

---

 9. Verwendete Technologien

* Frontend: React
* Backend: Node.js, Express
* Datenbank: PostgreSQL
* E-Mail: Nodemailer
* Authentifizierung: JWT
* API-Dokumentation: Swagger (OpenAPI)

---

 10. Nützliche Links

* [React](https://react.dev/)
* [Express](https://expressjs.com/)
* [Node.js](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/)

---

 11. Kontakt

Bei Fragen oder Problemen kannst du dich gerne melden:
[claudia.niederhofer1804@gmail.com](mailto:claudia.niederhofer1804@gmail.com)

---

Viel Erfolg beim Testen der Anwendung!

```


