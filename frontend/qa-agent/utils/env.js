'use strict';

const fs = require('fs');
const path = require('path');

function loadEnvFile(filename) {
  const envPath = path.resolve(__dirname, '../../', filename);
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sep = line.indexOf('=');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const value = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile('.env.playwright');

module.exports = {
  BASE_URL:    process.env.QA_BASE_URL   || 'http://localhost:3000',
  EMAIL:       process.env.PLAYWRIGHT_TEST_EMAIL    || '',
  PASSWORD:    process.env.PLAYWRIGHT_TEST_PASSWORD || '',
  HEADLESS:    process.env.QA_HEADLESS === 'true',
  SLOW_MO:     parseInt(process.env.QA_SLOW_MO    || '80', 10),
  MAX_STEPS:   parseInt(process.env.QA_MAX_STEPS  || '40', 10),
  TIMEOUT:     parseInt(process.env.QA_TIMEOUT    || '8000', 10),
  FOCUS_PATH:  process.env.QA_FOCUS_PATH || '',   // ej: '/products' para limitar al marketplace
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
};
