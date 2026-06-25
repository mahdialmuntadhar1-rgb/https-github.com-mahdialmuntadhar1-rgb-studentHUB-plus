#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LIVE_URL = process.env.TALABA_LIVE_URL || 'https://talaba.kaniq.org/?fresh=20260625';
const API_URL = process.env.TALABA_API_URL || 'https://rafid-api.mahdialmuntadhar1.workers.dev';

const results = [];
const add = (name, ok, detail = '') => results.push({ name, ok, detail });
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');

async function getText(url) {
  const res = await fetch(url, { cache: 'no-store' });
  return { res, text: await res.text() };
}

async function getJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { res, json, text };
}

async function run() {
  // Local source checks: no data writes, no backend mutation.
  try {
    const header = read('src/components/Header.tsx');
    add('Visible login button exists', header.includes('header-login-button'), 'Header has a real text login button.');
    add('Login opens auth modal', header.includes('setShowAuthModal(true)'), 'Header opens AuthModal directly.');
    add('Native language labels', header.includes('العربية') && header.includes('کوردی') && header.includes('English'), 'Arabic, Kurdish and English are visible in their native labels.');
  } catch (error) {
    add('Header source readable', false, error.message);
  }

  try {
    const auth = read('src/components/AuthModal.tsx');
    add('Login endpoint wired', auth.includes('/api/auth/login'), 'Frontend posts login to backend auth endpoint.');
    add('Registration endpoint wired', auth.includes('/api/auth/register'), 'Frontend posts registration to backend auth endpoint.');
    add('Reset-password endpoint wired', auth.includes('/api/auth/forgot-password'), 'Frontend posts reset request to backend auth endpoint.');
    add('Registration requires privacy consent', auth.includes('privacy_consent') && auth.includes('privacyConsent'), 'Registration has consent guard.');
  } catch (error) {
    add('Auth source readable', false, error.message);
  }

  try {
    const redirects = read('public/_redirects');
    add('SPA fallback configured', redirects.includes('/* /index.html 200'), 'Deep links return the app shell.');
  } catch (error) {
    add('SPA fallback configured', false, error.message);
  }

  try {
    const headers = read('public/_headers');
    add('No-cache app shell configured', headers.includes('Cache-Control: no-store'), 'Index and service worker are not cached as a stale frozen shell.');
  } catch (error) {
    add('No-cache app shell configured', false, error.message);
  }

  // Live checks: GET only. Safe for production.
  try {
    const { res, text } = await getText(LIVE_URL);
    add('Live site HTTP 200', res.ok, `${res.status} ${res.statusText}`);
    add('Production build is deployed', !text.includes('/src/main.tsx'), text.includes('/src/main.tsx') ? 'Live site is serving raw source index instead of built assets.' : 'Live index does not point at raw TSX source.');
  } catch (error) {
    add('Live site reachable', false, error.message);
  }

  try {
    const { res } = await getText(`${new URL(LIVE_URL).origin}/service-worker.js?fresh=${Date.now()}`);
    add('Service worker reachable', res.ok, `${res.status} ${res.statusText}`);
  } catch (error) {
    add('Service worker reachable', false, error.message);
  }

  try {
    const { res, json } = await getJson(`${API_URL}/api/institutions?limit=1&offset=0`);
    add('Institutions API JSON', res.ok && json !== null, `${res.status} ${res.statusText}`);
  } catch (error) {
    add('Institutions API JSON', false, error.message);
  }

  try {
    const { res, json } = await getJson(`${API_URL}/api/opportunities?limit=5&offset=0`);
    add('Opportunities API JSON', res.ok && json !== null, `${res.status} ${res.statusText}`);
  } catch (error) {
    add('Opportunities API JSON', false, error.message);
  }

  const pass = results.filter(r => r.ok).length;
  const fail = results.length - pass;
  console.log('\nTalaba release preflight\n');
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? ` - ${r.detail}` : ''}`);
  }
  console.log(`\nResult: ${pass} passed, ${fail} failed.\n`);

  if (fail > 0) process.exit(1);
}

run().catch((error) => {
  console.error('Preflight crashed:', error);
  process.exit(1);
});
