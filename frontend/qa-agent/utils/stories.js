'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Utility to load user stories from the stories directory.
 */
function loadStories() {
  const storiesPath = path.join(__dirname, '../stories/equipo-asignado.txt');
  if (!fs.existsSync(storiesPath)) return '';
  return fs.readFileSync(storiesPath, 'utf8').trim();
}

module.exports = { loadStories };
