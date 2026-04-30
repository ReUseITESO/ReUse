#!/usr/bin/env node
'use strict';

/**
 * ReUse QA Explorer — Entry Point
 *
 * Uso:
 *   npm run qa:agent                     # 40 pasos, headed, weighted
 *   npm run qa:agent -- --steps 60       # más pasos
 *   npm run qa:agent -- --headless       # sin browser visible
 *   npm run qa:agent -- --slow 200       # más lento (para ver qué hace)
 *   npm run qa:agent -- --url http://localhost:8000  # apuntar a Django directo
 *   npm run qa:agent -- --debug          # logs detallados del DOM
 */

const { Agent } = require('./agent');

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--headless')              { process.env.QA_HEADLESS = 'true'; }
    if (arg === '--headed')               { process.env.QA_HEADLESS = 'false'; }
    if (arg === '--debug')                { process.env.QA_DEBUG    = 'true'; }
    if (arg === '--steps'   && argv[i+1]) { opts.maxSteps  = parseInt(argv[++i], 10); }
    if (arg === '--slow'    && argv[i+1]) { opts.slowMo    = parseInt(argv[++i], 10); }
    if (arg === '--url'     && argv[i+1]) { opts.baseUrl   = argv[++i]; }
    if (arg === '--focus'   && argv[i+1]) { opts.focusPath = argv[++i]; process.env.QA_FOCUS_PATH = opts.focusPath; }
  }
  return opts;
}

async function main() {
  const opts   = parseArgs(process.argv.slice(2));
  const agent  = new Agent(opts);

  try {
    const result = await agent.run();
    process.exit(result.errors > 0 ? 1 : 0);
  } catch (err) {
    console.error('\n\x1b[31m[FATAL]\x1b[0m', err.message);
    console.error(err.stack);
    process.exit(2);
  }
}

main();
