// Generates merchant.xml for Google Merchant Center from data.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataContent = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf-8');

const ctx = { products: [], categories: {}, TELEGRAM_BOT: '', window: { open: () => {} }, console };
vm.createContext(ctx);
vm.runInContext(dataContent, ctx);
const { products } = ctx;

const categoryNames = {
  mtb: 'Тренажери МТБ',
  benches: 'Лавки та гіперекстензії',
  massage: 'Масажні столи та стільці',
  stairs: 'Бруси та сходи',
  accessories: 'Аксесуари до МТБ',
  other: 'Інше реабілітаційне обладнання',
};

// Google product categories (approximate)
const googleCategories = {
  mtb: '990',           // Sporting Goods > Exercise & Fitness
  benches: '990',
  massage: '491',       // Health & Beauty > Health Care > Massage
  stairs: '990',
  accessories: '990',
  other: '990',
};

function esc(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const items = products.map(p => {
  const catName = categoryNames[p.category] || p.category;
  const googleCat = googleCategories[p.category] || '990';
  const specs = (p.specs || []).join('. ');
  const desc = esc(p.description || p.short || p.name) + (specs ? ` ${esc(specs)}` : '');
  const productUrl = `https://kinezis.com.ua/catalog.html`;

  return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${esc(p.image)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${p.price || 0} UAH</g:price>
      <g:brand>Сіверспорт</g:brand>
      <g:product_type>${esc(catName)}</g:product_type>
      <g:google_product_category>${googleCat}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>UA</g:country>
        <g:service>Нова Пошта</g:service>
        <g:price>0 UAH</g:price>
      </g:shipping>
    </item>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Кінезіс — реабілітаційне обладнання</title>
    <link>https://kinezis.com.ua</link>
    <description>Тренажери МТБ, лавки, масажні столи та аксесуари для реабілітації</description>
${items}
  </channel>
</rss>
`;

const outPath = path.join(__dirname, '..', 'merchant.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`Generated merchant.xml — ${products.length} products`);
