/**
 * @file strategies.config.js
 * @description Konfigurationsdatei zur Definition und Auswahl der aktiven Verteilungsstrategie.
 */

// Importiere die konkreten Strategie-Implementierungen
// Diese werden später ergänzt, aber wir definieren sie schon jetzt für das Mapping.
const ObserverStrategy = require('./ObserverStrategy');
const MediatorStrategy = require('./MediatorStrategy');
const PubSubStrategy = require('./PubSubStrategy');

// Definiere alle verfügbaren Strategien für das Mapping.
// Die Schlüssel werden zur Auswahl über Umgebungsvariablen verwendet.
const STRATEGIES = {
    'OBSERVER': ObserverStrategy,
    'MEDIATOR': MediatorStrategy,
    'PUBSUB': PubSubStrategy,
};

// Hole den Namen der aktiven Strategie aus den Umgebungsvariablen.
// Standardwert (Fallback) ist 'OBSERVER', falls keine Variable gesetzt ist.
// Dies ist gut für den Start (Baseline-Implementierung).
const ACTIVE_STRATEGY_KEY = process.env.WS_STRATEGY || 'OBSERVER';

// Überprüfe, ob die gewählte Strategie existiert
if (!STRATEGIES[ACTIVE_STRATEGY_KEY]) {
    console.warn(`[WARN] Die Strategie '${ACTIVE_STRATEGY_KEY}' ist unbekannt. Fällt auf 'OBSERVER' zurück.`);
    // Setze den Schlüssel auf den Fallback-Wert, falls ein ungültiger Wert übergeben wurde
    process.env.WS_STRATEGY = 'OBSERVER'; 
}

/**
 * Gibt die Klasse der aktuell ausgewählten Verteilungsstrategie zurück.
 * @returns {DistributionStrategy} Die Klasse der aktiven Strategie.
 */
function getActiveStrategyClass() {
    return STRATEGIES[process.env.WS_STRATEGY];
}

module.exports = {
    getActiveStrategyClass,
    ACTIVE_STRATEGY_KEY: process.env.WS_STRATEGY,
};
