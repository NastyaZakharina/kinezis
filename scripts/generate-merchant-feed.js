// Generates merchant.xml for Google Merchant Center from data.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataContent = fs.readFileSync(path.join(__dirname, '..', 'data.js'), 'utf-8');

const ctx = { TELEGRAM_BOT: '', window: { open: () => {} }, console, __out: {} };
vm.createContext(ctx);
vm.runInContext(dataContent + '\n__out.products = products;\n__out.categories = categories;', ctx);
const { products } = ctx.__out;

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

// Additional images per product (different angles/versions)
const additionalImages = {
  'mtb1':          ['images/towari/mtb-1-prof80.jpg'],
  'mtb1-prof':     ['images/towari/mtb_1-scaled.jpeg'],
  'mtb1-shvedska': ['images/towari/mtb_1-scaled.jpeg'],
  'mtb2':          ['images/towari/mtb-2-reg80-1.jpeg'],
  'mtv2-reg':      ['images/products/mtb-2-prof80.jpg'],
  'mtb2-40':       ['images/towari/mtv-1-profil-40_40.jpg'],
  'mtb4':          ['images/towari/mtb-4-reg-scaled.jpeg'],
  'mtb4-reg':      ['images/towari/mtb-4-prof80.jpeg'],
  'bench1':        ['images/towari/mtb-30v2.jpg'],
  'bench-mtb30':   ['images/towari/mtb-31v2.jpg'],
  'stairs1':       ['images/towari/mtb-028.jpeg'],
  'stairs-mtb028': ['images/towari/mtb-029.jpeg'],
  'massage1':      ['images/towari/mtb-050.jpg'],
  'massage2':      ['images/towari/mtb-051.jpg'],
  'bars1':         ['images/towari/mtb-018.jpeg'],
  'bars-mtb018':   ['images/towari/mtb-016.jpeg'],
  'mtv070':        ['images/towari/kzs013shl_mtb-3-scaled.jpeg'],
  'mtv070-1':      ['images/towari/mtv-070.jpeg'],
  'bench-roman':   ['images/towari/svs-113-scaled.jpeg'],
  'bench-svs113':  ['images/towari/svs-112-scaled.jpeg'],
  'hyperext1':     ['images/towari/sw300.jpeg'],
  'bench-sw300':   ['images/towari/sw301.jpeg'],
};

const BASE_URL = 'https://kinezis.com.ua';

const items = products.map(p => {
  const catName = categoryNames[p.category] || p.category;
  const googleCat = googleCategories[p.category] || '990';
  const specs = (p.specs || []).join('. ');
  const desc = esc(p.description || p.short || p.name) + (specs ? ` ${esc(specs)}` : '');
  const productUrl = `${BASE_URL}/products/${p.id}.html`;
  const imageUrl = p.image ? `${BASE_URL}/${p.image}` : '';
  const extraImgs = (additionalImages[p.id] || [])
    .filter(img => img !== p.image)
    .map(img => `      <g:additional_image_link>${esc(BASE_URL + '/' + img)}</g:additional_image_link>`)
    .join('\n');

  return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${esc(imageUrl)}</g:image_link>
${extraImgs ? extraImgs + '\n' : ''}      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${p.price || 0} UAH</g:price>
      <g:brand>Кінезіс</g:brand>
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
