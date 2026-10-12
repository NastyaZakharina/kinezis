#!/usr/bin/env node
// Live smoke test of https://kinezis.com.ua — runs daily in GitHub Actions
// (.github/workflows/live-smoke.yml) and can be run locally. No dependencies.
//
// SAFE BY DESIGN: only GET requests. It never opens the order/callback modal and
// never POSTs to the Telegram worker, so it cannot create fake leads.
//
// Checks: (1) key pages return 200, (2) scripts/styles referenced by those
// pages return 200, (3) the real "В кошик" onclick from the LIVE product page
// executes against the LIVE cart.js in a Node vm sandbox and the item lands in
// the (simulated) cart — this catches the escaping bug that once killed the
// button on products with apostrophes in their name.
// Exits non-zero (fails the job, GitHub emails the owner) on any problem.

const vm = require('vm');
const BASE = process.env.SITE_URL || 'https://kinezis.com.ua';
const PAGES = ['/', '/catalog', '/blog', '/faq', '/compare', '/cases', '/contacts',
  '/products/mtb1', '/products/mtb11', '/blog/mtb-for-it', '/sitemap.xml', '/llms.txt'];
const CART_PRODUCTS = ['/products/mtb1', '/products/mtb11'];
const problems = [];

async function get(path) {
  const res = await fetch(BASE + path, { redirect: 'follow', headers: { 'user-agent': 'kinezis-live-smoke/1.0' } });
  return { status: res.status, text: await res.text() };
}
async function retry(path) { // one retry to avoid failing on a transient blip
  try { const r = await get(path); if (r.status === 200) return r; } catch {}
  await new Promise(r => setTimeout(r, 3000));
  try { return await get(path); } catch (e) { return { status: 0, text: '', err: e.message }; }
}
const decode = s => s.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

(async () => {
  const htmlByPage = {};
  for (const p of PAGES) {
    const r = await retry(p);
    if (r.status !== 200) problems.push(`[HTTP] ${p} -> ${r.status}${r.err ? ' ' + r.err : ''}`);
    else htmlByPage[p] = r.text;
  }

  // assets referenced by the pages
  const assets = new Set();
  for (const [p, html] of Object.entries(htmlByPage)) {
    if (p.endsWith('.xml') || p.endsWith('.txt')) continue;
    for (const m of html.matchAll(/<(?:script[^>]+src|link[^>]+href)="([^"]+)"/g)) {
      let u = m[1];
      if (/^(data:|#|mailto:|tel:)/.test(u) || /^https?:/.test(u) && !u.startsWith(BASE)) continue;
      if (u.startsWith(BASE)) u = u.slice(BASE.length);
      if (!u.startsWith('/')) u = (p.startsWith('/products/') || p.startsWith('/blog/') ? '/' : '/') + u.replace(/^\.\.?\//, '');
      assets.add(u);
    }
  }
  for (const a of assets) {
    const r = await retry(a);
    if (r.status !== 200) problems.push(`[asset] ${a} -> ${r.status}`);
  }

  // cart simulation with the live cart.js
  const cartJs = await retry('/cart.js');
  if (cartJs.status !== 200) problems.push(`[HTTP] /cart.js -> ${cartJs.status}`);
  else {
    for (const p of CART_PRODUCTS) {
      const html = htmlByPage[p];
      if (!html) continue;
      // Cloudflare Rocket Loader prefixes handlers with an "unblock" guard, so take the whole attribute.
      const m = html.match(/onclick="([^"]*addToCart\([^"]*)"/);
      if (!m) { problems.push(`[cart] ${p}: no addToCart onclick found`); continue; }
      const call = decode(m[1]);
      const store = new Map();
      const el = () => new Proxy(function () {}, {
        get: (_, k) => k === 'classList' ? { add() {}, remove() {}, toggle() {}, contains() { return false; } }
          : k === 'style' ? {} : (k === 'textContent' || k === 'innerHTML' || k === 'className') ? '' : el(),
        set: () => true, apply: () => el(),
      });
      const sandbox = {
        console, setTimeout: () => 0, clearTimeout() {},
        localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
        document: { querySelector: el, getElementById: el, createElement: el, querySelectorAll: () => [], addEventListener() {}, body: el(), documentElement: el() },
      };
      sandbox.window = sandbox;
      sandbox.__cfRLUnblockHandlers = true;
      vm.createContext(sandbox);
      try {
        vm.runInContext(cartJs.text, sandbox);
        vm.runInContext(`(function(){${call}\n})()`, sandbox); // run like a browser handler body
        const saved = [...store.values()].join('');
        if (!saved || saved === '[]') problems.push(`[cart] ${p}: addToCart ran but cart is empty\n    ${call}`);
      } catch (e) {
        problems.push(`[cart] ${p}: ${e.message}\n    ${call}`);
      }
    }
  }

  console.log(`Checked ${Object.keys(htmlByPage).length}/${PAGES.length} pages, ${assets.size} assets, ${CART_PRODUCTS.length} cart simulations.`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):\n` + problems.map(x => ' - ' + x).join('\n'));
    process.exitCode = 1;
  } else console.log('OK — all live checks passed.');
})();
