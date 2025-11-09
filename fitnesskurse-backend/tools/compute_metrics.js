#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Immer relativ zur Skriptdatei, egal von wo gestartet wird:
const ROOT = path.resolve(__dirname, '..');

const PLATO_JSON = path.join(ROOT, 'plato-report', 'report.json');
const DEP_JSON   = path.join(ROOT, 'depcruise.json');
const SONAR_JSON = path.join(ROOT, 'sonarqube_measures.json');

const FOLDER_BUCKETS = [
  { name: 'notifications', pattern: /src\/services\/notifications\/.*Notifier\.js$/ },
  { name: 'websocket',     pattern: /src\/websocket\/.*\.js$/ }
];

function median(arr){ if(!arr.length) return 0; const s=[...arr].sort((a,b)=>a-b); const m=Math.floor(s.length/2); return s.length%2? s[m] : (s[m-1]+s[m])/2; }
function mean(arr){ if(!arr.length) return 0; return arr.reduce((a,b)=>a+b,0)/arr.length; }
function topN(arr, key, n=3){ return [...arr].sort((a,b)=> (b[key]-a[key])).slice(0,n); }

// ---- Helpers zum Lesen (mit Hinweis, falls Datei fehlt) ----
function safeReadJSON(p) {
  if (!fs.existsSync(p)) { console.warn(`[WARN] Datei fehlt: ${p}`); return null; }
  return JSON.parse(fs.readFileSync(p,'utf8'));
}

// ---- Sonar ----
function readSonarMap() {
  const raw = safeReadJSON(SONAR_JSON) || {};
  const map = new Map();
  (raw.components||[]).forEach(c => {
    const file = (c.path || c.key || '').replace(/\\/g,'/');
    if(!file.endsWith('.js')) return;
    const pick = m => {
      const mm = (c.measures||[]).find(x=>x.metric===m);
      return mm ? Number(mm.value) : 0;
    };
    map.set(file, {
      file,
      ccog: pick('cognitive_complexity'),
      ncloc: pick('ncloc'),
      code_smells: pick('code_smells'),
      bugs: pick('bugs'),
      vulnerabilities: pick('vulnerabilities'),
      dup_density: pick('duplicated_lines_density'),
    });
  });
  return map;
}

// ---- Plato ----
function readPlatoMap() {
  const raw = safeReadJSON(PLATO_JSON) || {};
  // Plato speichert unter raw.files ODER raw.reports (je nach Version)
  const filesArr = raw.files || raw.reports || [];
  const map = new Map();
  filesArr.forEach(f => {
    // fallback auf neues/älteres Feldschema
    const info = f.info || {};
    const comp = f.complexity || {};
    const agg  = comp.methodAggregate || {};
    const file = (info.file || '').replace(/\\/g,'/');
    if (!file) return;
    const cyclomatic = Number(agg.cyclomatic || 0);
    map.set(file, { file, cyclomatic });
  });
  return map;
}

// ---- dependency-cruiser ----
function cohesionProxyForFile(imports){
  if(imports.length === 0) return 0;
  const counts = imports.reduce((m,x)=> (m[x]=(m[x]||0)+1, m), {});
  const shared = Object.values(counts).filter(c => c > 1).length;
  const unique = Object.keys(counts).length;
  const ratio = unique === 0 ? 0 : (1 - (shared / unique));
  return Math.max(0, Math.min(1, ratio));
}
function readDepMap(){
  const raw = safeReadJSON(DEP_JSON) || {};
  const map = new Map();
  (raw.modules||[]).forEach(m => {
    const file = path.normalize(m.source).replace(/\\/g,'/');
    const deps = Array.from(new Set((m.dependencies||[]).map(d => d.resolved))).filter(Boolean);
    map.set(file, { file, deps, cbo: deps.length, cohesion_proxy: cohesionProxyForFile(deps) });
  });
  return map;
}

function whichBucket(file){
  const unix = file.replace(/\\/g,'/');
  return FOLDER_BUCKETS.find(b => b.pattern.test(unix))?.name || null;
}

// ---- Merge ----
const sonar = readSonarMap();
const plato = readPlatoMap();
const dep   = readDepMap();

const files = new Set([...sonar.keys(), ...plato.keys(), ...dep.keys()]);
const rows = [];
files.forEach(file => {
  const bucket = whichBucket(file);
  if(!bucket) return;
  const s = sonar.get(file) || {};
  const p = plato.get(file) || {};
  const d = dep.get(file)   || { cbo:0, cohesion_proxy:0 };
  rows.push({
    bucket,
    file,
    cyclomatic: Number(p.cyclomatic || 0),
    cognitive_complexity: Number(s.ccog || 0),
    ncloc: Number(s.ncloc || 0),
    code_smells: Number(s.code_smells || 0),
    bugs: Number(s.bugs || 0),
    vulnerabilities: Number(s.vulnerabilities || 0),
    duplicated_lines_density: Number(s.dup_density || 0),
    cbo: Number(d.cbo || 0),
    cohesion_proxy: Number(d.cohesion_proxy || 0),
  });
});

// ---- Aggregation ----
const buckets = {};
for (const r of rows){
  (buckets[r.bucket] ||= { items: [] }).items.push(r);
}
const summary = [];
for (const [bucket, data] of Object.entries(buckets)){
  const cc      = data.items.map(x=>x.cyclomatic);
  const ccog    = data.items.map(x=>x.cognitive_complexity);
  const cbo     = data.items.map(x=>x.cbo);
  const lcomP   = data.items.map(x=>x.cohesion_proxy);
  const smells  = data.items.map(x=>x.code_smells);
  const ncloc   = data.items.map(x=>x.ncloc);

  summary.push({
    bucket,
    cyclomatic_mean: mean(cc),
    cyclomatic_median: median(cc),
    cyclomatic_top3_files: topN(data.items,'cyclomatic').map(x=>({file:x.file, cyclomatic:x.cyclomatic})),
    ccog_mean: mean(ccog),
    ccog_median: median(ccog),
    ccog_top3_files: topN(data.items,'cognitive_complexity').map(x=>({file:x.file, ccog:x.cognitive_complexity})),
    cbo_mean: mean(cbo),
    cbo_median: median(cbo),
    cbo_top3_files: topN(data.items,'cbo').map(x=>({file:x.file, cbo:x.cbo})),
    cohesion_proxy_top_outliers: topN(data.items,'cohesion_proxy').map(x=>({file:x.file, cohesion_proxy:x.cohesion_proxy})),
    smells_total: smells.reduce((a,b)=>a+b,0),
    ncloc_total: ncloc.reduce((a,b)=>a+b,0),
    smells_per_kloc: (ncloc.reduce((a,b)=>a+b,0) ? (smells.reduce((a,b)=>a+b,0) / (ncloc.reduce((a,b)=>a+b,0)) * 1000) : 0)
  });
}

// ---- Ausgabe ----
const out = { generatedAt: new Date().toISOString(), rows, summary };
fs.writeFileSync(path.join(ROOT, 'metrics.json'), JSON.stringify(out, null, 2));

const csvHeader = [
  'bucket','file','cyclomatic','cognitive_complexity','ncloc','code_smells',
  'bugs','vulnerabilities','duplicated_lines_density','cbo','cohesion_proxy'
].join(',') + '\n';
const csvRows = rows.map(r => [
  r.bucket, r.file, r.cyclomatic, r.cognitive_complexity, r.ncloc, r.code_smells,
  r.bugs, r.vulnerabilities, r.duplicated_lines_density, r.cbo, r.cohesion_proxy
].map(x => `"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');

fs.writeFileSync(path.join(ROOT, 'metrics.csv'), csvHeader + csvRows);

console.log('OK -> metrics.json, metrics.csv geschrieben.');
