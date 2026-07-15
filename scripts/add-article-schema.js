// Adds Article/BlogPosting JSON-LD schema to all blog articles
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

const AUTHOR = {
  '@type': 'Person',
  name: 'Анастасія Захаріна',
  url: 'https://kinezis.com.ua/about.html',
  jobTitle: 'Спеціаліст з реабілітаційного обладнання',
};

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Кінезіс',
  url: 'https://kinezis.com.ua',
  logo: { '@type': 'ImageObject', url: 'https://kinezis.com.ua/logo.png' },
};

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');

  // Skip if Article schema already present
  if (html.includes('"BlogPosting"') || html.includes('"Article"')) { skipped++; return; }

  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1].replace(' — Кінезіс', '').trim() : file.replace('.html', '');

  // Extract description
  const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
  const description = descMatch ? descMatch[1] : title;

  // Extract canonical URL
  const canonMatch = html.match(/<link rel="canonical" href="([^"]+)"/);
  const url = canonMatch ? canonMatch[1] : `https://kinezis.com.ua/blog/${file}`;

  // Extract og:image if present
  const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
  const image = imgMatch ? imgMatch[1] : 'https://kinezis.com.ua/logo.png';

  // Determine datePublished from month mentioned in article or default
  const dateMatch = html.match(/Липень 2026|July 2026/i);
  const datePublished = dateMatch ? '2026-07-15' : '2026-06-01';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: image,
    datePublished: datePublished,
    dateModified: '2026-07-15',
    author: AUTHOR,
    publisher: PUBLISHER,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'uk-UA',
    isPartOf: { '@type': 'Blog', name: 'Блог Кінезіс', url: 'https://kinezis.com.ua/blog.html' },
  };

  const schemaTag = `\n<script type="application/ld+json">${JSON.stringify(schema)}</script>`;

  // Insert before closing </head>
  html = html.replace('</head>', schemaTag + '\n</head>');

  // Also add og:site_name and twitter:card if missing
  if (!html.includes('og:site_name')) {
    const ogExtra = `<meta property="og:site_name" content="Кінезіс"/>\n<meta property="og:locale" content="uk_UA"/>\n<meta name="twitter:card" content="summary_large_image"/>\n`;
    html = html.replace('<meta property="og:type"', ogExtra + '<meta property="og:type"');
  }

  fs.writeFileSync(filePath, html, 'utf-8');
  updated++;
});

console.log(`Article schema added: ${updated}, skipped: ${skipped}`);
