// aggregate_sysmetrics.js
// Liest sysmetrics/<tag>_vmstat.csv und fasst CPU/RAM-Metriken je tag zusammen.

const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'sysmetrics');

function listVmstatFiles() {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR)
    .filter(f => f.endsWith('_vmstat.csv'))
    .map(f => path.join(DIR, f));
}

function parseCsvLine(line) {
  // keine komplizierten Quotes im vmstat-CSV => simples Split ausreichend
  return line.split(',').map(s => s.trim());
}

function aggregateFile(fp) {
  const tag = path.basename(fp).replace(/_vmstat\.csv$/, ''); // z.B. observer_feature_run1
  const lines = fs.readFileSync(fp, 'utf8').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;

  const header = parseCsvLine(lines[0]);
  // Indexe suchen (aus deinem Logger-Header)
  const idx = Object.fromEntries([
    'free','buff','cache','us','sy','id','wa'
  ].map(k => [k, header.indexOf(k)]));

  // Sicherheitscheck
  for (const k of Object.keys(idx)) {
    if (idx[k] === -1) {
      // Unerwartetes Format – Datei überspringen
      return null;
    }
  }

  let n = 0;
  let sum = { us:0, sy:0, id:0, wa:0, free:0, buff:0, cache:0 };
  let minId = +Infinity;

  for (let i = 1; i < lines.length; i++) {
    const parts = parseCsvLine(lines[i]);
    // Einige Logger haben in Zeile 2 eine „Sonderzeile“. Unser Logger skippt die schon,
    // aber wir checken vorsichtshalber auf numerische Felder:
    const us = Number(parts[idx.us]); if (!Number.isFinite(us)) continue;
    const sy = Number(parts[idx.sy]); if (!Number.isFinite(sy)) continue;
    const id = Number(parts[idx.id]); if (!Number.isFinite(id)) continue;
    const wa = Number(parts[idx.wa]); if (!Number.isFinite(wa)) continue;

    const free = Number(parts[idx.free]); if (!Number.isFinite(free)) continue;
    const buff = Number(parts[idx.buff]); if (!Number.isFinite(buff)) continue;
    const cache = Number(parts[idx.cache]); if (!Number.isFinite(cache)) continue;

    sum.us += us; sum.sy += sy; sum.id += id; sum.wa += wa;
    sum.free += free; sum.buff += buff; sum.cache += cache;
    if (id < minId) minId = id;
    n++;
  }

  if (n === 0 || !Number.isFinite(minId)) return null;

  const avg = o => (o / n).toFixed(1);
  return {
    tag,
    cpu_us_avg: avg(sum.us),
    cpu_sy_avg: avg(sum.sy),
    cpu_id_avg: avg(sum.id),
    cpu_wa_avg: avg(sum.wa),
    cpu_id_min: minId.toFixed(1),
    mem_free_avg_kB: Math.round(sum.free / n),
    mem_buff_avg_kB: Math.round(sum.buff / n),
    mem_cache_avg_kB: Math.round(sum.cache / n),
  };
}

function main() {
  const files = listVmstatFiles();
  console.log([
    'tag',
    'cpu_us_avg','cpu_sy_avg','cpu_id_avg','cpu_wa_avg','cpu_id_min',
    'mem_free_avg_kB','mem_buff_avg_kB','mem_cache_avg_kB'
  ].join(','));

  for (const fp of files) {
    const row = aggregateFile(fp);
    if (!row) continue;
    console.log([
      row.tag,
      row.cpu_us_avg, row.cpu_sy_avg, row.cpu_id_avg, row.cpu_wa_avg, row.cpu_id_min,
      row.mem_free_avg_kB, row.mem_buff_avg_kB, row.mem_cache_avg_kB
    ].join(','));
  }
}

main();
