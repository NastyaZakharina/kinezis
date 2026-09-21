// Generates sitemap.xml with all indexable site pages.
//
// The site is served with clean URLs (no ".html"): /faq.html 301-redirects to /faq,
// and every page's <link rel="canonical"> is the clean form. The sitemap must list
// the canonical (clean) URLs only — listing ".html" variants makes Google crawl a
// redirect for every entry and report them as "Page with redirect" / "Duplicate".
// Pages carrying <meta name="robots" content="...noindex..."> are skipped too.
const fs = require('fs');
const path = require('path');

const BASE = 'https://kinezis.com.ua';
const ROOT = path.join(__dirname, '..');
const today = new Date().toISOString().split('T')[0];

const urls = [];

function isNoindex(file) {
  const html = fs.readFileSync(file, 'utf-8');
  return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

// Static pages: [clean url path, source file, priority, changefreq]
const staticPages = [
  ['/',             'index.html',          '1.0', 'weekly'],
  ['/catalog',      'catalog.html',        '0.9', 'weekly'],
  ['/blog',         'blog.html',           '0.8', 'weekly'],
  ['/faq',          'faq.html',            '0.7', 'monthly'],
  ['/about',        'about.html',          '0.6', 'monthly'],
  ['/contacts',     'contacts.html',       '0.6', 'monthly'],
  ['/cases',        'cases.html',          '0.7', 'monthly'],
  ['/compare',      'compare.html',        '0.5', 'monthly'],
  ['/certificates', 'certificates.html',   '0.5', 'monthly'],
  ['/return-policy','return-policy.html',  '0.3', 'yearly'],
  ['/privacy-policy','privacy-policy.html','0.3', 'yearly'],
];
staticPages.forEach(([loc, file, priority, changefreq]) => {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full) || isNoindex(full)) return;
  urls.push({ loc, priority, changefreq, lastmod: today });
});

function addDir(dir, prefix, priority, changefreq) {
  const abs = path.join(ROOT, dir);
  fs.readdirSync(abs)
    .filter(f => f.endsWith('.html'))
    .sort()
    .forEach(f => {
      if (isNoindex(path.join(abs, f))) return;
      urls.push({ loc: `${prefix}/${f.replace(/\.html$/, '')}`, priority, changefreq, lastmod: today });
    });
}

addDir('products', '/products', '0.9', 'monthly');
addDir('blog', '/blog', '0.7', 'yearly');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf-8');
console.log(`sitemap.xml: ${urls.length} URLs`);
