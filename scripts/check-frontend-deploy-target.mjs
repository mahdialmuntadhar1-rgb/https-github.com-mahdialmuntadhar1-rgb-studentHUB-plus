import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rootConfigPath = path.join(root, 'wrangler.jsonc');

function readJsonLike(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(
    raw
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1')
  );
}

function assertOfficialTarget(label, config) {
  const deprecatedTarget = ['studenthub', 'plus'].join('-');

  if (config.name === deprecatedTarget || config.topLevelName === deprecatedTarget) {
    throw new Error(`${label} points to deprecated frontend target ${deprecatedTarget}. Use https-github.`);
  }

  if (config.name && config.name !== 'https-github') {
    throw new Error(`${label} points to ${config.name}. Official frontend target is https-github.`);
  }
}

assertOfficialTarget('wrangler.jsonc', readJsonLike(rootConfigPath));

console.log('Deploying official frontend to https-github');
