// Adds a "Recommended products" block to all blog articles before <footer>
const fs = require('fs');
const path = require('path');

const BASE = '..';

// Product info for the block
const PRODUCTS = {
  mtb1:       { name: 'Тренажер МТБ-1', price: 'від 44 500 грн', url: '../products/mtb1.html', img: '../images/towari/mtb_1-scaled.jpeg' },
  mtb2:       { name: 'Тренажер МТБ-2', price: 'від 57 500 грн', url: '../products/mtb2.html', img: '../images/towari/mtb-2-prof80.jpeg' },
  mtb4:       { name: 'Тренажер МТБ-4', price: 'від 126 600 грн', url: '../products/mtb4.html', img: '../images/towari/mtb-4-prof80.jpeg' },
  bench1:     { name: 'Лавка горизонтальна', price: 'від 8 400 грн', url: '../products/bench1.html', img: '../images/towari/lavka-gorizontalna.jpg' },
  hyperext1:  { name: 'Гіперекстензія', price: 'від 9 600 грн', url: '../products/hyperext1.html', img: '../images/towari/giperekstenzija.jpg' },
  massage1:   { name: 'Масажний стіл', price: 'від 7 200 грн', url: '../products/massage1.html', img: '../images/towari/massazhnyi-stil.jpg' },
  stairs1:    { name: 'Реабілітаційні сходи', price: 'від 6 500 грн', url: '../products/stairs1.html', img: '../images/towari/reabilitacijni-shody.jpg' },
  mtv070:     { name: 'МТВ-070', price: 'від 18 900 грн', url: '../products/mtv070.html', img: '../images/towari/mtv-070.jpeg' },
};

// Mapping: blog filename → product IDs (2-3 most relevant)
const mapping = {
  'achilles-rehab':        ['mtb1', 'mtb2', 'stairs1'],
  'acl-rehab':             ['mtb1', 'mtb2', 'bench1'],
  'active-aging':          ['mtb1', 'mtb2', 'stairs1'],
  'amputation-rehab':      ['mtb2', 'mtb4', 'stairs1'],
  'ankle-rehab':           ['mtb1', 'stairs1', 'bench1'],
  'aquired-disability':    ['mtb2', 'mtb4', 'stairs1'],
  'arthritis-exercises':   ['mtb1', 'mtb2', 'bench1'],
  'back-pain':             ['mtb1', 'mtb2', 'hyperext1'],
  'balance-elderly':       ['mtb1', 'stairs1', 'mtv070'],
  'blast-injury':          ['mtb2', 'mtb4', 'stairs1'],
  'breathing-exercises':   ['mtb1', 'massage1', 'bench1'],
  'buy-mtb-ukraine':       ['mtb1', 'mtb2', 'mtb4'],
  'cancer-rehab':          ['mtb1', 'mtb2', 'massage1'],
  'cardiac-rehab':         ['mtb1', 'mtb2', 'bench1'],
  'carpal-tunnel':         ['mtb1', 'bench1', 'massage1'],
  'case-home-gym':         ['mtb1', 'mtb2', 'hyperext1'],
  'case-nezlami':          ['mtb2', 'mtb4', 'stairs1'],
  'cerebral-palsy':        ['mtb1', 'mtb2', 'stairs1'],
  'cervical-stenosis':     ['mtb1', 'mtb2', 'massage1'],
  'children-posture':      ['mtb1', 'hyperext1', 'stairs1'],
  'chondromalacia':        ['mtb1', 'mtb2', 'bench1'],
  'chronic-fatigue':       ['mtb1', 'massage1', 'bench1'],
  'chronic-pain':          ['mtb1', 'mtb2', 'massage1'],
  'copd-rehab':            ['mtb1', 'mtb2', 'bench1'],
  'dementia-prevention':   ['mtb1', 'mtb2', 'stairs1'],
  'diabetes-rehab':        ['mtb1', 'mtb2', 'bench1'],
  'diastasis-recti':       ['mtb1', 'hyperext1', 'bench1'],
  'elbow-epicondylitis':   ['mtb1', 'bench1', 'massage1'],
  'fall-prevention':       ['mtb1', 'stairs1', 'mtv070'],
  'fibromyalgia':          ['mtb1', 'massage1', 'bench1'],
  'flat-feet':             ['mtb1', 'stairs1', 'bench1'],
  'frozen-shoulder':       ['mtb1', 'mtb2', 'bench1'],
  'golfer-elbow':          ['mtb1', 'bench1', 'massage1'],
  'herniated-disc':        ['mtb1', 'mtb2', 'hyperext1'],
  'hip-bursitis':          ['mtb1', 'mtb2', 'bench1'],
  'hip-fracture':          ['mtb2', 'stairs1', 'bench1'],
  'hip-replacement':       ['mtb1', 'mtb2', 'stairs1'],
  'home-gym':              ['mtb1', 'mtb2', 'hyperext1'],
  'home-rehabilitation-setup': ['mtb1', 'mtb2', 'hyperext1'],
  'how-to-choose-mtb':     ['mtb1', 'mtb2', 'mtb4'],
  'hydrotherapy':          ['massage1', 'mtb1', 'bench1'],
  'hypermobility':         ['mtb1', 'bench1', 'massage1'],
  'hypertension-exercise': ['mtb1', 'mtb2', 'bench1'],
  'immobilization':        ['mtb1', 'mtb2', 'bench1'],
  'infarction-rehab':      ['mtb1', 'mtb2', 'bench1'],
  'it-band-syndrome':      ['mtb1', 'mtb2', 'bench1'],
  'kinesiotherapy-principles': ['mtb1', 'mtb2', 'mtb4'],
  'kinesiotherapy':        ['mtb1', 'mtb2', 'mtb4'],
  'knee-osteoarthritis':   ['mtb1', 'mtb2', 'bench1'],
  'knee-rehab':            ['mtb1', 'mtb2', 'bench1'],
  'knee-replacement':      ['mtb1', 'mtb2', 'stairs1'],
  'ligament-sprain':       ['mtb1', 'stairs1', 'bench1'],
  'lumbalgia':             ['mtb1', 'mtb2', 'hyperext1'],
  'lumbar-stenosis':       ['mtb1', 'mtb2', 'hyperext1'],
  'lymphedema':            ['massage1', 'mtb1', 'bench1'],
  'massage-table':         ['massage1', 'massage2', 'bench1'],
  'meniscus-rehab':        ['mtb1', 'mtb2', 'bench1'],
  'motivation-rehab':      ['mtb1', 'mtb2', 'mtb4'],
  'mtb-after-60':          ['mtb1', 'mtb2', 'stairs1'],
  'mtb-exercises':         ['mtb1', 'mtb2', 'mtb4'],
  'mtb-for-beginners':     ['mtb1', 'mtb2', 'bench1'],
  'mtb-for-stroke':        ['mtb1', 'mtb2', 'stairs1'],
  'mtb-vs-others':         ['mtb1', 'mtb2', 'mtb4'],
  'multiple-sclerosis':    ['mtb1', 'mtb2', 'stairs1'],
  'myofascial-pain':       ['massage1', 'mtb1', 'bench1'],
  'neck-pain':             ['mtb1', 'mtb2', 'massage1'],
  'neuropathy':            ['mtb1', 'mtb2', 'stairs1'],
  'office-syndrome':       ['mtb1', 'bench1', 'massage1'],
  'osteochondrosis':       ['mtb1', 'mtb2', 'hyperext1'],
  'osteoporosis':          ['mtb1', 'mtb2', 'stairs1'],
  'parkinson':             ['mtb1', 'mtb2', 'stairs1'],
  'patella-tendinitis':    ['mtb1', 'mtb2', 'bench1'],
  'pelvic-floor':          ['mtb1', 'bench1', 'hyperext1'],
  'piriformis-syndrome':   ['mtb1', 'hyperext1', 'bench1'],
  'plantar-fasciitis':     ['mtb1', 'stairs1', 'bench1'],
  'post-covid':            ['mtb1', 'mtb2', 'bench1'],
  'post-fracture-rehab':   ['mtb1', 'mtb2', 'stairs1'],
  'postpartum':            ['mtb1', 'hyperext1', 'bench1'],
  'posture-correction':    ['mtb1', 'hyperext1', 'bench1'],
  'pregnancy-exercise':    ['mtb1', 'bench1', 'massage1'],
  'protein-recovery':      ['mtb1', 'mtb2', 'bench1'],
  'ptsd-movement':         ['mtb1', 'mtb2', 'massage1'],
  'rheumatoid-arthritis':  ['mtb1', 'mtb2', 'massage1'],
  'rib-fracture':          ['mtb1', 'bench1', 'massage1'],
  'rotator-cuff':          ['mtb1', 'mtb2', 'bench1'],
  'sacroiliac-pain':       ['mtb1', 'hyperext1', 'bench1'],
  'sarcopenia':            ['mtb1', 'mtb2', 'bench1'],
  'scoliosis':             ['mtb1', 'hyperext1', 'stairs1'],
  'shoulder-impingement':  ['mtb1', 'mtb2', 'bench1'],
  'shoulder-rehab':        ['mtb1', 'mtb2', 'bench1'],
  'sleep-and-recovery':    ['massage1', 'mtb1', 'bench1'],
  'spinal-cord-injury':    ['mtb2', 'mtb4', 'stairs1'],
  'spine-fracture':        ['mtb1', 'mtb2', 'hyperext1'],
  'spine-surgery':         ['mtb1', 'mtb2', 'hyperext1'],
  'spondylolisthesis':     ['mtb1', 'hyperext1', 'bench1'],
  'sports-injury':         ['mtb1', 'mtb2', 'bench1'],
  'sports-prevention':     ['mtb1', 'mtb2', 'bench1'],
  'stroke-rehab':          ['mtb1', 'mtb2', 'stairs1'],
  'tbi-rehab':             ['mtb1', 'mtb2', 'stairs1'],
  'tendinitis':            ['mtb1', 'bench1', 'massage1'],
  'thoracic-outlet':       ['mtb1', 'bench1', 'massage1'],
  'trigger-finger':        ['bench1', 'massage1', 'mtb1'],
  'varicosis':             ['mtb1', 'bench1', 'massage1'],
  'veterans-home-rehab':   ['mtb1', 'mtb2', 'stairs1'],
  'war-rehab':             ['mtb2', 'mtb4', 'stairs1'],
  'weight-rehab':          ['mtb1', 'mtb2', 'hyperext1'],
  'wrist-rehab':           ['mtb1', 'bench1', 'massage1'],
};

function productCard(id) {
  const p = PRODUCTS[id];
  if (!p) return '';
  return `<a href="${p.url}" class="blog-product-card" style="display:flex;flex-direction:column;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;text-decoration:none;color:inherit;transition:box-shadow .2s;flex:1;min-width:180px;max-width:240px">
      <img src="${p.img}" alt="${p.name}" style="width:100%;height:140px;object-fit:cover" loading="lazy" onerror="this.style.display='none'"/>
      <div style="padding:12px 14px;display:flex;flex-direction:column;gap:4px;flex:1">
        <div style="font-weight:600;font-size:14px;line-height:1.3">${p.name}</div>
        <div style="color:#16a34a;font-weight:700;font-size:13px;margin-top:auto;padding-top:8px">${p.price}</div>
      </div>
    </a>`;
}

function buildBlock(productIds) {
  const cards = productIds.map(id => productCard(id)).filter(Boolean).join('\n    ');
  return `
<section style="background:#f8fafc;padding:40px 0;margin-top:48px">
  <div class="container">
    <h2 style="font-size:20px;font-weight:700;margin:0 0 24px;font-family:'Unbounded',sans-serif">Обладнання для реабілітації</h2>
    <div style="display:flex;gap:16px;flex-wrap:wrap">
    ${cards}
    </div>
    <div style="margin-top:24px">
      <a href="../catalog.html" style="color:#2563eb;font-weight:600;text-decoration:none;font-size:14px">Переглянути весь каталог →</a>
    </div>
  </div>
</section>`;
}

const blogDir = path.join(__dirname, '..', 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const slug = file.replace('.html', '');
  const productIds = mapping[slug];
  if (!productIds) { skipped++; return; }

  const filePath = path.join(blogDir, file);
  let html = fs.readFileSync(filePath, 'utf-8');

  if (html.includes('blog-product-card')) { skipped++; return; } // already has block

  const block = buildBlock(productIds);
  html = html.replace('<footer class="footer">', block + '\n<footer class="footer">');
  fs.writeFileSync(filePath, html, 'utf-8');
  updated++;
});

console.log(`Updated: ${updated}, Skipped: ${skipped}`);
