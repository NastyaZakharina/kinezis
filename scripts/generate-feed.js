// Reads data.js and generates hotline.xml (Hotline.ua / Prom.ua YML feed)
const fs = require('fs');
const path = require('path');

const dataContent = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf-8');

// Evaluate data.js in a sandboxed context with stubs for browser globals
const vm = require('vm');
const ctx = {
  products: [],
  categories: {},
  TELEGRAM_BOT: '',
  window: { open: () => {} },
  console,
};
vm.createContext(ctx);
vm.runInContext(dataContent, ctx);

const { products } = ctx;

const categoryIds = {
  mtb: 1,
  benches: 2,
  massage: 3,
  stairs: 4,
  accessories: 5,
  other: 6,
};

const categoryNames = {
  mtb: 'Тренажери МТБ',
  benches: 'Лавки та гіперекстензії',
  massage: 'Масажні столи та стільці',
  stairs: 'Бруси та сходи',
  accessories: 'Аксесуари до МТБ',
  other: 'Інше реабілітаційне обладнання',
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
const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

const catXml = Object.entries(categoryIds)
  .map(([key, id]) => `      <category id="${id}">${esc(categoryNames[key])}</category>`)
  .join('\n');

const offersXml = products.map(p => {
  const catId = categoryIds[p.category] || 1;
  const specs = (p.specs || []).join('; ');
  const desc = esc((p.description || p.short || '') + (specs ? ` Характеристики: ${specs}` : ''));
  return `      <offer id="${esc(p.id)}" available="true">
        <url>https://kinezis.com.ua/catalog.html</url>
        <price>${p.price || 0}</price>
        <currencyId>UAH</currencyId>
        <categoryId>${catId}</categoryId>
        <picture>${esc(p.image)}</picture>
        <vendor>Сіверспорт</vendor>
        <name>${esc(p.name)}</name>
        <description>${desc}</description>
      </offer>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE yml_catalog SYSTEM "shops.dtd">
<yml_catalog date="${dateStr}">
  <shop>
    <name>Кінезіс</name>
    <company>Кінезіс</company>
    <url>https://kinezis.com.ua</url>
    <phone>+380992662688</phone>
    <currencies>
      <currency id="UAH" rate="1"/>
    </currencies>
    <categories>
${catXml}
    </categories>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>
`;

const outPath = path.join(__dirname, '..', 'hotline.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`Generated hotline.xml — ${products.length} products, ${dateStr}`);
