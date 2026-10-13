#!/usr/bin/env node
// Static sanity check for the whole site — runs in CI on every push and can
// be run locally with `node scripts/check-site.js`. No dependencies, no
// network calls: it only reads files already in the repo.
//
// Catches, in order:
//  1. Invalid JS inside inline onclick/onsubmit/... handlers — this is what
//     let the "В кошик" button silently die on 5 product pages (an escaping
//     bug produced a SyntaxError the browser only reports at click time).
//  2. Malformed <script type="application/ld+json"> blocks (breaks schema.org
//     rich results / GEO answer boxes for that whole page, not just a widget).
//  3. Internal <a href="..."> / <img src="..."> targets that don't resolve to
//     a real file, a known redirect, or a route the sites' own routing
//     (clean URLs, /category/N/, /page/N/) is known to serve.
//
// Exits non-zero (fails the CI job) if anything is found.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['.git', '.claude', 'node_modules', '.github']);

function listHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      listHtmlFiles(full, out);
    } else if (entry.name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

const files = listHtmlFiles(ROOT);
const relFiles = new Set(files.map(f => path.relative(ROOT, f).replace(/\\/g, '/')));
let errors = [];

// Some pages (admin.html, cabinet.html, product.html) build HTML client-side
// via JS template literals / string concatenation inside <script> blocks —
// text like onclick="...${x}..." there is JS *source*, not a real attribute
// a browser parses, so checks 1 and 3 must ignore it. JSON-LD blocks are kept
// since check 2 needs them. Blanking preserves line numbers.
function stripNonLdScripts(html) {
  return html.replace(/<script(\s[^>]*)?>[\s\S]*?<\/script>/gi, (block, attrs) => {
    if (attrs && /type\s*=\s*["']application\/ld\+json["']/i.test(attrs)) return block;
    return block.replace(/[^\n]/g, ' ');
  });
}

// ---------- 1. inline event-handler JS must parse ----------
const HANDLER_ATTR = /\son(?:click|submit|change|load|error)="((?:[^"\\]|\\.)*)"/g;
for (const file of files) {
  const html = stripNonLdScripts(fs.readFileSync(file, 'utf-8'));
  const rel = path.relative(ROOT, file);
  let m;
  while ((m = HANDLER_ATTR.exec(html))) {
    const js = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
    try {
      new Function(js);
    } catch (e) {
      const line = html.slice(0, m.index).split('\n').length;
      errors.push(`[onclick JS] ${rel}:${line}  ${e.message}\n    ${js.slice(0, 120)}`);
    }
  }
}

// ---------- 2. JSON-LD must parse ----------
const LD_BLOCK = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf-8');
  const rel = path.relative(ROOT, file);
  let m;
  while ((m = LD_BLOCK.exec(html))) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      const line = html.slice(0, m.index).split('\n').length;
      errors.push(`[JSON-LD] ${rel}:${line}  ${e.message}`);
    }
  }
}

// ---------- 3. internal links resolve ----------
// Routes the site itself is known to serve beyond plain files (clean URLs,
// query strings, WordPress-era category/pagination stubs).
const KNOWN_DIRS_WITH_INDEX = ['category', 'page'];
function resolves(targetPath) {
  const p = targetPath.split('#')[0].split('?')[0];
  if (p === '' || p === '/') return true;
  const clean = p.replace(/^\//, '').replace(/\/$/, '');
  if (clean === '') return true;
  for (const seg0 of KNOWN_DIRS_WITH_INDEX) {
    if (clean === seg0 || clean.startsWith(seg0 + '/')) return true; // WP-era stub routes
  }
  return (
    relFiles.has(clean) ||
    relFiles.has(clean + '.html') ||
    relFiles.has(clean + '/index.html') ||
    fs.existsSync(path.join(ROOT, clean))
  );
}

const HREF_SRC = /\s(?:href|src)="([^"]+)"/g;
for (const file of files) {
  const html = stripNonLdScripts(fs.readFileSync(file, 'utf-8'));
  const rel = path.relative(ROOT, file);
  const base = path.dirname(file);
  let m;
  while ((m = HREF_SRC.exec(html))) {
    let h = m[1];
    if (/^(https?:|mailto:|tel:|javascript:|data:|#)/.test(h)) continue;
    if (h.startsWith('//')) continue;
    if (h.includes('kinezis.com.ua')) h = h.replace(/^https?:\/\/kinezis\.com\.ua/, '');
    let target;
    if (h.startsWith('/')) {
      target = h;
    } else {
      target = '/' + path.normalize(path.join(path.relative(ROOT, base), h)).replace(/\\/g, '/');
    }
    if (!resolves(target)) {
      const line = html.slice(0, m.index).split('\n').length;
      errors.push(`[broken link] ${rel}:${line}  -> ${h}`);
    }
  }
}


// ---------- 4. no secrets in the (public) repo ----------
// The Telegram bot token once sat in this public repo and was abused for spam.
// Fails the build if anything that looks like a credential is committed.
// Firebase web apiKey (firebase-config.js) is public by design and allowed.
const { execSync } = require('child_process');
const SECRET_PATTERNS = [
  [/\b\d{8,10}:AA[A-Za-z0-9_-]{30,}\b/, 'Telegram bot token'],
  [/\bghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}/, 'GitHub token'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'API secret key (sk-...)'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/\b(?:PASS|PASSWORD|MGR_PASS|SECRET|TOKEN|API_?KEY)\b["']?\s*[:=]\s*["'][^"'\s$]{6,}["']/i, 'hardcoded password/secret assignment'],
];
const SECRET_ALLOW_FILES = new Set(['scripts/check-site.js', 'firebase-config.js']); // firebase web apiKey is public by design
let tracked = [];
try { tracked = execSync('git ls-files', { cwd: ROOT, encoding: 'utf-8' }).split('\n').filter(Boolean); } catch (e) { /* not a git checkout */ }
for (const rel of tracked) {
  if (SECRET_ALLOW_FILES.has(rel) || /\.(jpe?g|png|webp|gif|ico|pdf|woff2?|mp4|zip|rss)$/i.test(rel)) continue;
  let text;
  try { text = fs.readFileSync(path.join(ROOT, rel), 'utf-8'); } catch { continue; }
  const lines = text.split('\n');
  lines.forEach((ln, i) => {
    if (/type="password"|placeholder|env\.|process\.env|\$env:|os\.environ/.test(ln)) return;
    for (const [re, label] of SECRET_PATTERNS) {
      if (re.test(ln)) errors.push(`[secret] ${rel}:${i + 1}  looks like a ${label} (value hidden)`);
    }
  });
}

// ---------- report ----------
console.log(`Checked ${files.length} HTML files.`);
if (errors.length) {
  console.log(`\n${errors.length} problem(s) found:\n`);
  for (const e of errors) console.log(' - ' + e);
  process.exitCode = 1;
} else {
  console.log('All checks passed: onclick handlers valid, JSON-LD valid, internal links resolve, no secrets found.');
}
