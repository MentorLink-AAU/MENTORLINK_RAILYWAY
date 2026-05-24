#!/usr/bin/env node
/**
 * Pre-deploy checks for Railway/Railpack (run via npm run check:deploy).
 */
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

function ok(msg) {
  console.log(`  OK  ${msg}`);
}

function fail(msg) {
  console.error(`  FAIL  ${msg}`);
  failed += 1;
}

function mustExist(rel, label) {
  if (!existsSync(join(root, rel))) {
    fail(`${label} missing: ${rel}`);
    return false;
  }
  ok(`${label}: ${rel}`);
  return true;
}

console.log('Railway / Railpack configuration checks\n');

mustExist('backend/railway.toml', 'Backend railway.toml');
mustExist('backend/railpack.json', 'Backend railpack.json');
mustExist('backend/pom.xml', 'Backend pom.xml');
mustExist('frontend/railway.toml', 'Frontend railway.toml');
mustExist('frontend/railpack.json', 'Frontend railpack.json');
mustExist('frontend/package-lock.json', 'Frontend package-lock');
mustExist('backend/nlp-summarization/railway.toml', 'NLP railway.toml');
mustExist('backend/nlp-summarization/Dockerfile', 'NLP Dockerfile');
mustExist('railway.env.example', 'Env template');
mustExist('railway.toml', 'Root railway.toml (backend from repo root)');
mustExist('Dockerfile', 'Root Dockerfile (backend from repo root)');

const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
if (rootPkg.scripts?.start) {
  fail('Root package.json must not define "start" (use start:dev).');
} else {
  ok('Root package.json has no "start" script');
}

const gitignore = readFileSync(join(root, '.gitignore'), 'utf8');
if (!gitignore.includes('node_modules')) {
  fail('.gitignore must list node_modules/');
} else {
  ok('.gitignore excludes node_modules/');
}

console.log('');
if (failed > 0) {
  console.error(`${failed} check(s) failed.`);
  process.exit(1);
}
console.log('All deploy config checks passed.');
console.log('Railway: set Root Directory + config file per RAILWAY_SETUP.md');
