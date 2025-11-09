#!/usr/bin/env node
/**
 * Liest results/*.json (Artillery) und schreibt CSV nach stdout.
 * Erwartetes Dateischema: results/<pattern>_<env>_run<nr>.json
 * Ignoriert offensichtliche Smoke-/Test-Dateien.
 */
const fs = require('fs');
const path = require('path');

const RESULTS_DIR = path.resolve(__dirname, 'results');

// CSV-Header
const cols = [
  'pattern','scenario','run',
  'requests','throughput_req_s',
  'p95_ms','p99_ms',
  'http_2xx','http_4xx','http_404',
  'errors_total','err_ETIMEDOUT','err_URL_missing',
  'vusers_failed'
];
console.log(cols.join(','));

const files = fs.readdirSync(RESULTS_DIR)
  .filter(f => f.endsWith('.json'))
  // Smoke/Probe/Guarded etc. konsequent ausfiltern
  .filter(f => !/smoke|probe|test|guarded/i.test(f));

for (const file of files) {
  const m = file.match(/^([a-z0-9_-]+)_(feature|fehlerfall|peak)_run(\d+)\.json$/i);
  if (!m) continue; // nur saubere Namen
  const [, pattern, scenario, runStr] = m;
  const run = Number(runStr);

  const full = path.join(RESULTS_DIR, file);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(full, 'utf8'));
  } catch {
    continue;
  }

  const agg = data.aggregate || {};
  const ctr = agg.counters || {};
  const rates = agg.rates || {};
  const sums = (agg.summaries || {})['http.response_time'] || {};

  const requests = Number(ctr['http.requests'] || 0);
  const throughput = Number(rates['http.request_rate'] || 0);

  const p95 = Number(sums['p95'] || 0);
  const p99 = Number(sums['p99'] || 0);

  const http2xx = Number(ctr['http.codes.200'] || 0) + Number(ctr['http.codes.201'] || 0) + Number(ctr['http.codes.204'] || 0);
  const http4xx = Object.entries(ctr).reduce((acc,[k,v]) => k.startsWith('http.codes.4') ? acc + Number(v) : acc, 0);
  const http404 = Number(ctr['http.codes.404'] || 0);

  // Fehler summieren: alle counters, die mit 'errors.' beginnen
  const errorsTotal = Object.entries(ctr).reduce((acc,[k,v]) => k.startsWith('errors.') ? acc + Number(v) : acc, 0);
  const errETIMEDOUT = Number(ctr['errors.ETIMEDOUT'] || 0);
  // Artillery schreibt bei dir „errors.an URL must be specified“
  const errUrlMissing = Number(ctr['errors.an URL must be specified'] || 0);

  const vusersFailed = Number(ctr['vusers.failed'] || 0);

  const row = [
    pattern, scenario, run,
    requests, throughput.toFixed(0),
    toFixedNum(p95), toFixedNum(p99),
    http2xx, http4xx, http404,
    errorsTotal, errETIMEDOUT, errUrlMissing,
    vusersFailed
  ];
  console.log(row.join(','));
}

function toFixedNum(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n.toString() : '0';
}
