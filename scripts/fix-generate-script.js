const fs = require('fs');
let content = fs.readFileSync('scripts/generate-product-pages.js', 'utf8');
let updated = content;

// Remove .html from internal href attributes (not external URLs)
updated = updated.replace(/(href|action)="([^"]*\.html)"/g, (m, attr, val) => {
  if (val.startsWith('http') || val.startsWith('mailto:') || val.startsWith('tel:')) return m;
  return `${attr}="${val.replace(/\.html$/, '')}"`;
});

// Remove .html from absolute kinezis.com.ua URLs in template strings
updated = updated.replace(/https:\/\/kinezis\.com\.ua\/([^"'\s,)<]+)\.html/g,
  (m, p) => `https://kinezis.com.ua/${p}`);

// Fix canonicalUrl — product page canonical should not have .html
// The template has: `${BASE}/products/${p.id}.html`
updated = updated.replace(/\/products\/\$\{p\.id\}\.html/g, '/products/${p.id}');

fs.writeFileSync('scripts/generate-product-pages.js', updated);
console.log(content === updated ? 'no change' : 'updated generate script');
