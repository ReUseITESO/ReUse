'use strict';

const fs   = require('fs');
const path = require('path');

// ── ANSI Colors ────────────────────────────────────────────────────────────────
const C = {
  reset:   '\x1b[0m',
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  yellow:  '\x1b[33m',
  blue:    '\x1b[34m',
  cyan:    '\x1b[36m',
  magenta: '\x1b[35m',
  white:   '\x1b[37m',
};

const col = (color, text) => `${color}${text}${C.reset}`;
const ts  = () => new Date().toISOString().slice(11, 19); // HH:MM:SS

// ── Reporter ──────────────────────────────────────────────────────────────────

class Reporter {
  constructor(runId) {
    this.runId       = runId;
    this.steps       = [];
    this.errorCount  = 0;
    this.warnCount   = 0;
    this.screenshotDir = path.resolve(__dirname, 'reports', 'screenshots');
    this.reportDir   = path.resolve(__dirname, 'reports');

    fs.mkdirSync(this.screenshotDir, { recursive: true });
    fs.mkdirSync(this.reportDir,     { recursive: true });
  }

  // ── Header ──────────────────────────────────────────────────────────────────

  printHeader(maxSteps) {
    console.log(`\n${col(C.bold + C.magenta, '▓'.repeat(62))}`);
    console.log(`${col(C.bold + C.magenta, '  🤖  ReUse QA Explorer — Agente Autónomo')}`);
    console.log(`${col(C.bold + C.magenta, '▓'.repeat(62))}`);
    console.log(`  Run ID  : ${col(C.cyan, this.runId)}`);
    console.log(`  Modo    : ${col(C.cyan, 'Exploración dinámica (sin escenarios predefinidos)')}`);
    console.log(`  Pasos   : ${col(C.cyan, String(maxSteps))}`);
    console.log(`${col(C.bold + C.magenta, '▓'.repeat(62))}\n`);
  }

  // ── Step logging ─────────────────────────────────────────────────────────────

  stepHeader(stepNum, maxSteps, url) {
    const shortUrl = url.replace(/^https?:\/\/[^/]+/, '') || '/';
    console.log(`\n${col(C.bold, `[${String(stepNum).padStart(2,'0')}/${maxSteps}]`)} ${col(C.blue, shortUrl)}`);
  }

  step(action, detail) {
    console.log(`  ${col(C.blue, '→')} ${col(C.bold, action)}: ${col(C.dim, detail)}`);
  }

  ok(message) {
    console.log(`  ${col(C.green, '✓')} ${message}`);
  }

  warn(message) {
    this.warnCount++;
    console.log(`  ${col(C.yellow, '⚠')} ${message}`);
  }

  error(message) {
    this.errorCount++;
    console.log(`  ${col(C.red, '✗')} ${message}`);
  }

  info(message) {
    console.log(`  ${col(C.magenta, 'ℹ')} ${message}`);
  }

  debug(message) {
    if (process.env.QA_DEBUG === 'true') {
      console.log(`  ${col(C.dim, '·')} ${col(C.dim, message)}`);
    }
  }

  // ── Screenshots ───────────────────────────────────────────────────────────────

  screenshotPath(label) {
    const safe = label.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    return path.join(this.screenshotDir, `${safe}_${Date.now()}.png`);
  }

  async captureScreenshot(page, label) {
    try {
      const p = this.screenshotPath(label);
      await page.screenshot({ path: p, fullPage: false });
      this.info(`📸 Screenshot: ${path.basename(p)}`);
      return p;
    } catch {
      return null;
    }
  }

  // ── Steps recording ───────────────────────────────────────────────────────────

  recordStep(stepData) {
    this.steps.push({ ...stepData, ts: new Date().toISOString() });
  }

  // ── Summary & JSON report ─────────────────────────────────────────────────────

  printSummary(memory) {
    const summary = memory.getSummary();
    const dur     = (summary.durationMs / 1000).toFixed(1);

    console.log(`\n${col(C.bold, '═'.repeat(62))}`);
    console.log(col(C.bold + C.white, '  QA EXPLORER — RESUMEN FINAL'));
    console.log(col(C.bold, '═'.repeat(62)));
    console.log(`  Run ID        : ${col(C.cyan, this.runId)}`);
    console.log(`  Duración      : ${col(C.cyan, `${dur}s`)}`);
    console.log(`  Pasos totales : ${col(C.bold, String(summary.totalSteps))}`);
    console.log(`  URLs visitadas: ${col(C.bold, String(summary.urlsVisited))}`);
    console.log(`  Acciones únicas: ${col(C.bold, String(summary.uniqueActionsExec))}`);
    console.log(`  ⚠ Advertencias : ${col(this.warnCount > 0  ? C.yellow : C.dim, String(this.warnCount))}`);
    console.log(`  ✗ Errores      : ${col(this.errorCount > 0 ? C.red    : C.dim, String(this.errorCount))}`);
    console.log(`  Autenticado   : ${col(summary.isAuthenticated ? C.green : C.dim, String(summary.isAuthenticated))}`);
    console.log(col(C.bold, '═'.repeat(62)));

    if (memory.errors.length > 0) {
      console.log(col(C.red + C.bold, '\n  Errores detectados:'));
      memory.errors.slice(0, 5).forEach(e => {
        console.log(`    • [${e.type}] ${(e.message || e.url || '').slice(0, 80)}`);
      });
    }

    console.log('');
  }

  saveReport(memory) {
    const summary = memory.getSummary();
    const report  = {
      runId:      this.runId,
      mode:       'exploratory',
      generatedAt: new Date().toISOString(),
      summary: {
        ...summary,
        warnings: this.warnCount,
        errors:   this.errorCount,
      },
      urlsVisited: Object.fromEntries(memory.visitedUrls),
      errorsDetected: memory.errors,
      steps: this.steps,
    };

    const filename = `report-${this.runId.replace(/[:.]/g, '-')}.json`;
    const filePath = path.join(this.reportDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');

    console.log(col(C.cyan, `\n  📄 Reporte: ${filePath}`));
    return filePath;
  }
}

module.exports = { Reporter };
