#!/usr/bin/env bash
set -euo pipefail

IN="results_summary.csv"
OUT="grouped_summary.csv"

command -v gawk >/dev/null || { echo "Bitte 'gawk' installieren (GNU awk)."; exit 1; }
[[ -f "$IN" ]] || { echo "Eingabedatei nicht gefunden: $IN"; exit 1; }

gawk -F',' '
BEGIN{
  OFS=","
}
NR==1{
  # Header merken: Pattern,Scenario,Run,Requests,Throughput_req_s,p95_ms,p99_ms,ErrorsTotal,Err_ETIMEDOUT,Err_URL_missing,VUs_failed
  next
}
{
  key=$1 FS $2  # Pattern,Szenario

  n[key]++

  # Summen
  req_sum[key]+=$4
  thr_sum[key]+=$5
  err_sum[key]+=$8
  vuf_sum[key]+=$11

  # Werte-Listen für Median/Std
  thr_vals[key,n_thr[key]++]=$5+0
  p95_vals[key,n_p95[key]++]=$6+0
  p99_vals[key,n_p99[key]++]=$7+0
}
END{
  print "Pattern","Scenario","runs",
        "Requests_sum",
        "Throughput_mean","Throughput_std","Throughput_median",
        "p95_median","p95_mean",
        "p99_median","p99_mean",
        "Errors_sum","VUs_failed_sum"

  # Hilfsarrays zum Sortieren
  PROCINFO["sorted_in"] = "@ind_str_asc"
  for (k in n) {
    # Key zerlegen
    split(k,ks,FS); pattern=ks[1]; scenario=ks[2]

    # Mittelwerte
    runs = n[k]
    thr_mean = (runs? thr_sum[k]/runs : 0)

    # Median & Stddev für Throughput
    m = n_thr[k]
    delete tmp
    for (i=0;i<m;i++) tmp[i+1] = thr_vals[k,i]
    asort(tmp)                 # 1..m aufsteigend
    thr_median = (m%2 ? tmp[(m+1)/2] : (tmp[m/2]+tmp[m/2+1])/2)

    # Stddev
    sumsq=0
    for (i=1;i<=m;i++) { d = (tmp[i]-thr_mean); sumsq += d*d }
    thr_std = (m>1 ? sqrt(sumsq/(m-1)) : 0)

    # p95
    m95 = n_p95[k]
    delete p95
    for (i=0;i<m95;i++) p95[i+1] = p95_vals[k,i]
    asort(p95)
    p95_median = (m95%2 ? p95[(m95+1)/2] : (p95[m95/2]+p95[m95/2+1])/2)
    p95_mean = (m95? avg(p95,m95) : 0)

    # p99
    m99 = n_p99[k]
    delete p99
    for (i=0;i<m99;i++) p99[i+1] = p99_vals[k,i]
    asort(p99)
    p99_median = (m99%2 ? p99[(m99+1)/2] : (p99[m99/2]+p99[m99/2+1])/2)
    p99_mean = (m99? avg(p99,m99) : 0)

    # Ausgabe
    print pattern,scenario,runs,
          int(req_sum[k]),
          round(thr_mean,2),round(thr_std,2),round(thr_median,2),
          round(p95_median,1),round(p95_mean,1),
          round(p99_median,1),round(p99_mean,1),
          int(err_sum[k]),int(vuf_sum[k])
  }
}
function avg(a, n,    s,i){ s=0; for(i=1;i<=n;i++) s+=a[i]; return (n?s/n:0) }
function round(x, p,  s){ s=10^p; return (p? int(x*s+0.5)/s : int(x+0.5)) }
' "$IN" > "$OUT"

echo "OK: $OUT erzeugt."
