#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 results_summary.csv sysmetrics_summary.csv" >&2
  exit 1
fi

RES="$1"
SYS="$2"

[[ -f "$RES" ]] || { echo "Not found: $RES" >&2; exit 1; }
[[ -f "$SYS" ]] || { echo "Not found: $SYS" >&2; exit 1; }

awk -F',' -v OFS=',' '
  NR==FNR {
    # SYS: Header überspringen
    if (FNR==1) next;
    # tag -> pattern,scenario,run (observer_feature_run1)
    split($1, a, "_");
    pattern=a[1]; scen=a[2]; run=a[3];
    sub(/^run/,"",run);
    key = pattern "," scen "," run;
    # Spalten 2..9 übernehmen
    sys[key]=$2 "," $3 "," $4 "," $5 "," $6 "," $7 "," $8 "," $9;
    next;
  }
  FNR==1 {
    # RES-Header + SYS-Spalten anhängen
    print $0, "cpu_us_avg","cpu_sy_avg","cpu_id_avg","cpu_wa_avg","cpu_id_min","mem_free_avg_kB","mem_buff_avg_kB","mem_cache_avg_kB";
    next;
  }
  {
    key = $1 "," $2 "," $3;
    extra = (key in sys) ? sys[key] : ",,,,,,,,";
    print $0, extra;
  }
' "$SYS" "$RES"
