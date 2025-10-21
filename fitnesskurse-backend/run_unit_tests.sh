#!/bin/bash
echo "🧪 Starte alle Unit-Tests mit Coverage..."
export NODE_ENV=test

# Alte Coverage löschen
rm -rf coverage

# Tests mit Coverage
npx jest --coverage --runInBand

echo ""
echo "✅ Tests abgeschlossen."
echo "📊 HTML-Bericht unter: coverage/lcov-report/index.html"
