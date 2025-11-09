#!/usr/bin/env bash
set -euo pipefail

# -----------------------------
# Einstellungen
# -----------------------------
YML="artillery_fixed.yml"
RESULT_DIR="results"
SYSMETRICS_DIR="sysmetrics"
RUNS=3

# Welche Patterns & Environments fahren wir?
PATTERNS=("observer" "mediator" "pubsub")
ENVS=("feature" "fehlerfall" "peak")

# Mapping: Environment -> Szenario-Name in der YAML
# (muss exakt zu 'scenarios[].name' passen)
declare -A SCEN_BY_ENV=(
  ["feature"]="Feature-Flow"
  ["fehlerfall"]="Fehlerfall"
  ["peak"]="Peak"
)

# Optional: wenn du CPU/RAM für den Stub-Server-Prozess separat loggen willst,
# trage hier seine PID ein (z.B. export STUB_PID=12345 vorm Start dieses Skripts).
STUB_PID="${STUB_PID:-}"

mkdir -p "$RESULT_DIR" "$SYSMETRICS_DIR"

# -----------------------------
# Helfer: Systemmetriken starten/stoppen
# -----------------------------
start_sysmon() {
  local tag="$1"   # z.B. observer_feature_run1
  # vmstat: systemweite CPU/RAM-Metriken
  # Schreibe Zeitstempel + vmstat Kopf einmalig; danach rohe Werte mit Zeitstempel
  {
    echo "timestamp, r, b, swpd, free, buff, cache, si, so, bi, bo, in, cs, us, sy, id, wa, st"
    vmstat 1 | awk -v OFS=',' -v cmd="vmstat" '
      NR==2 { next }                  # Überschrift (Felder) auslassen
      NR==3 { next }                  # erste Messzeile oft Sonderfall -> skip
      {
        # ISO-Zeitstempel voranstellen
        cmd="date -Is"
        cmd | getline now
        close(cmd)
        print now, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      }'
  } > "${SYSMETRICS_DIR}/${tag}_vmstat.csv" &
  SYSMON_VMSTAT_PID=$!

  # pidstat: pro-Prozess (nur wenn STUB_PID gesetzt)
  if [[ -n "$STUB_PID" ]]; then
    pidstat -hurd -p "$STUB_PID" 1 > "${SYSMETRICS_DIR}/${tag}_pidstat.txt" &
    SYSMON_PIDSTAT_PID=$!
  else
    SYSMON_PIDSTAT_PID=""
  fi
}

stop_sysmon() {
  # kill -0 prüft, ob Prozess noch lebt
  if [[ -n "${SYSMON_VMSTAT_PID:-}" ]] && kill -0 "$SYSMON_VMSTAT_PID" 2>/dev/null; then
    kill "$SYSMON_VMSTAT_PID" || true
    wait "$SYSMON_VMSTAT_PID" 2>/dev/null || true
  fi
  if [[ -n "${SYSMON_PIDSTAT_PID:-}" ]] && kill -0 "$SYSMON_PIDSTAT_PID" 2>/dev/null; then
    kill "$SYSMON_PIDSTAT_PID" || true
    wait "$SYSMON_PIDSTAT_PID" 2>/dev/null || true
  fi
}

# Aufräumen bei Abbruch
trap 'stop_sysmon' EXIT

# -----------------------------
# Läufe
# -----------------------------
for pattern in "${PATTERNS[@]}"; do
  for env in "${ENVS[@]}"; do
    scen="${SCEN_BY_ENV[$env]}"

    for run in $(seq 1 "$RUNS"); do
      tag="${pattern}_${env}_run${run}"
      out_json="${RESULT_DIR}/${tag}.json"

      echo
      echo "==== Starte: pattern=${pattern} | env=${env} | scenario=${scen} | run=${run} ===="

      # Systemmetriken starten
      start_sysmon "$tag"

      # Artillery-Lauf (immer @latest benutzen, damit --scenario-name zuverlässig vorhanden ist)
      npx --yes artillery@latest run "$YML" \
        -e "$env" \
        --scenario-name "$scen" \
        --overrides "{ \"variables\": { \"pattern\": \"${pattern}\" } }" \
        --output "$out_json"

      # Systemmetriken stoppen
      stop_sysmon

      echo "---- Fertig: ${out_json}"
    done
  done
done

echo
echo "Alle Läufe beendet. Ergebnisse in ${RESULT_DIR}/, Systemmetriken in ${SYSMETRICS_DIR}/."
