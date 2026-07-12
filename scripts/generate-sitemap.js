// Generates sitemap.xml with all site pages
const fs = require('fs');
const path = require('path');

const BASE = 'https://kinezis.com.ua';
const ROOT = path.join(__dirname, '..');
const today = new Date().toISOString().split('T')[0];

const urls = [];

// Static pages
const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/catalog.html', priority: '0.9', changefreq: 'weekly' },
  { loc: '/blog.html', priority: '0.8', changefreq: 'weekly' },
  { loc: '/about.html', priority: '0.6', changefreq: 'monthly' },
  { loc: '/contacts.html', priority: '0.6', changefreq: 'monthly' },
  { loc: '/cases.html', priority: '0.7', changefreq: 'monthly' },
  { loc: '/compare.html', priority: '0.5', changefreq: 'monthly' },
  { loc: '/certificates.html', priority: '0.5', changefreq: 'monthly' },
  { loc: '/return-policy.html', priority: '0.3', changefreq: 'yearly' },
  { loc: '/privacy-policy.html', priority: '0.3', changefreq: 'yearly' },
];
staticPages.forEach(p => urls.push({ ...p, lastmod: today }));

// Product pages
const productsDir = path.join(ROOT, 'products');
fs.readdirSync(productsDir)
  .filter(f => f.endsWith('.html'))
  .sort()
  .forEach(f => {
    urls.push({ loc: `/products/${f}`, priority: '0.9', changefreq: 'monthly', lastmod: today });
  });

// Blog articles
const blogDir = path.join(ROOT, 'blog');
fs.readdirSync(blogDir)
  .filter(f => f.endsWith('.html'))
  .sort()
  .forEach(f => {
    urls.push({ loc: `/blog/${f}`, priority: '0.7', changefreq: 'yearly', lastmod: today });
  });

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
