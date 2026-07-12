// Generates hotline.xml in Hotline.ua proprietary XML format (not YML)
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataContent = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf-8');
const ctx = { TELEGRAM_BOT: '', window: { open: () => {} }, console, __out: {} };
vm.createContext(ctx);
vm.runInContext(dataContent + '\n__out.products = products;\n__out.categories = categories;', ctx);
const { products } = ctx.__out;

const BASE_URL = 'https://kinezis.com.ua';

const categoryIds = {
  mtb: 1,
  benches: 2,
  massage: 3,
  stairs: 4,
  other: 5,
  accessories: 6,
};

const categoryNames = {
  mtb: 'Тренажери МТБ',
  benches: 'Лавки та гіперекстензії',
  massage: 'Масажні столи та стільці',
  stairs: 'Бруси та реабілітаційні сходи',
  other: 'Інше реабілітаційне обладнання',
  accessories: 'Аксесуари до МТБ',
};

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const now = new Date();
const pad = n => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

const catXml = Object.entries(categoryIds)
  .map(([key, id]) => `    <category>\n      <id>${id}</id>\n      <name>${esc(categoryNames[key])}</name>\n    </category>`)
  .join('\n');

const itemsXml = products.map(p => {
  const catId = categoryIds[p.category] || 1;
  const specs = (p.specs || []).join('; ');
  const desc = esc((p.description || p.short || '') + (specs ? ` Характеристики: ${specs}` : ''));
  const imageUrl = p.image ? `${BASE_URL}/${p.image}` : '';
  return `    <item>
      <id>${esc(p.id)}</id>
      <categoryId>${catId}</categoryId>
      <vendor>Кінезіс</vendor>
      <name>${esc(p.name)}</name>
      <description>${desc}</description>
      <url>${BASE_URL}/product.html?id=${esc(p.id)}</url>
      <image>${esc(imageUrl)}</image>
      <priceRUAH>${p.price || 0}</priceRUAH>
      <stock>В наявності</stock>
      <shipping>0</shipping>
      <region>Чернігів</region>
    </item>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<price>
  <date>${dateStr}</date>
  <firmName>Кінезіс</firmName>
  <firmId>43544</firmId>

  <categories>
${catXml}
  </categories>

  <items>
${itemsXml}
  </items>
</price>
`;

const outPath = path.join(__dirname, '..', 'hotline.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`Generated hotline.xml — ${products.length} items, ${dateStr}`);
