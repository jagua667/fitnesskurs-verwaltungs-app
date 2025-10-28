#!/bin/bash
echo "🚀 Starte vollständige lokale Testpipeline..."
export NODE_ENV=test

# 1️⃣ Stub-Server starten (im Hintergrund)
echo "🧩 Starte Stub-Server..."
node test/stubServer.js &
STUB_PID=$!
sleep 2

# 2️⃣ Unit-Tests mit Coverage
echo "🧪 Starte Unit-Tests mit Coverage..."
./run_unit_tests.sh

# 3️⃣ Artillery-Tests (Buchungsstorno)
echo "⚙️  Starte Artillery-Tests (Cancel Booking Notifications)..."
artillery run test/load/artillery-cancel-booking-notifications.yml

# 4️⃣ Artillery-Tests (Kurslöschung)
echo "⚙️  Starte Artillery-Tests (Delete Course Notifications)..."
artillery run test/load/artillery-delete-course-notifications.yml

# 5️⃣ Stub-Server beenden
echo "🧹 Beende Stub-Server..."
kill $STUB_PID

echo ""
echo "✅ Alle Tests abgeschlossen."

