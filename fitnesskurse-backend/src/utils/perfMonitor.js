// src/utils/perfMonitor.js
class PerfMonitor {
  static measure(label, fn) {
    const start = process.hrtime.bigint();
    const result = fn();
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    console.log(`[PERF] ${label}: ${durationMs.toFixed(3)} ms`);
    return { result, durationMs };
  }

  static async measureAsync(label, fn) {
    const start = process.hrtime.bigint();
    const result = await fn();
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    console.log(`[PERF] ${label}: ${durationMs.toFixed(3)} ms`);
    return { result, durationMs };
  }
}

module.exports = PerfMonitor;
