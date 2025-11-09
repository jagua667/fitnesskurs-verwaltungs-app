sonar.projectKey=fitnesskurse-backend-patterns
sonar.projectName=fitnesskurse-backend-patterns
sonar.sourceEncoding=UTF-8
sonar.host.url=http://localhost:9000
# Token erst beim Aufruf übergeben (empfohlen) – nicht hier rein.

# Nur die gewünschten Pattern-Pfade einbeziehen:
sonar.sources=src
sonar.inclusions=src/services/notifications/*Notifier.js,src/websocket/*.js

# Für JS/TS
sonar.javascript.lcov.reportPaths=coverage/lcov.info
