#!/usr/bin/env python3
"""Build blog articles and register them on the site (card in blog.html,
sitemap.xml entry, llms.txt line). Usage, from the repo root:

    python3 scripts/new-article/build.py path/to/articles.py

`articles.py` must define ARTICLES = [dict(...)]  (see example_articles.py).
Each dict needs: slug, title, h1, desc, ld, kw, crumb, label, read, answer[],
body[], related[(slug, None)] x2, cta=(title, text), and for registration:
tag, color, card_h, card_p, llms_title.
Helpers available inside the articles file: RF, TEAL, AVOID, NOTE, ANSWER, T, P, F.
"""
import json, re, os, sys, datetime, subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.chdir(ROOT)

UK_MONTHS = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень',
             'Вересень', 'Жовтень', 'Листопад', 'Грудень']
_today = datetime.date.today()
NOW = _today.isoformat()
MONTH = f'{UK_MONTHS[_today.month - 1]} {_today.year}'

skel = open('blog/mtb-for-it.html', encoding='utf-8').read()
head_pre = skel[:skel.index('<title>')]
head_links = skel[skel.index('<link rel="icon"'):skel.index('<script type="application/ld+json">')]
header = skel[skel.index('<header class="header"'):skel.index('</header>') + 9]
footer = skel[skel.index('<footer class="footer">'):]

# ---- helpers exposed to the articles file ----
def T(slug):
    """Real <title> of an existing article (for 'Читайте також' cards). Fails loudly if the slug is wrong."""
    t = open(f'blog/{slug}.html', encoding='utf-8').read()
    return re.search(r'<title>([^<]*)</title>', t).group(1).replace(' — Кінезіс', '').strip()

_data = open('data.js', encoding='utf-8').read()
def P(pid):
    """Current price of a product id from data.js — never type prices by hand."""
    m = re.search(r"id: '%s',.*?\n    price: (\d+)," % re.escape(pid), _data, flags=re.S)
    return int(m.group(1))
def F(n):
    return f'{n:,}'.replace(',', ' ')

def RF(title, items, note=''):
    li = ''.join(f'<li>{i}</li>' for i in items)
    n = f'<p style="margin:8px 0 0;font-size:14px;color:#6b7280">{note}</p>' if note else ''
    return (f'<div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:12px;padding:20px 24px;margin:28px 0">'
            f'<strong style="color:#b91c1c;display:block;margin-bottom:8px">⚠️ {title}</strong>'
            f'<ul style="margin:0;padding-left:20px;line-height:2;color:var(--dark)">{li}</ul>{n}</div>')

def TEAL(title, items):
    li = ''.join(f'<li>{i}</li>' for i in items)
    return (f'<div style="background:var(--teal-light);border-radius:16px;padding:24px 28px;margin:24px 0">'
            f'<strong style="display:block;margin-bottom:14px">{title}</strong>'
            f'<ul style="margin:0;padding-left:20px;line-height:2.4;color:var(--dark)">{li}</ul></div>')

def AVOID(title, items):
    li = ''.join(f'<li>{i}</li>' for i in items)
    return (f'<div style="background:#fef2f2;border-radius:16px;padding:24px 28px;margin:20px 0">'
            f'<strong style="display:block;margin-bottom:14px;color:#b91c1c">{title}</strong>'
            f'<ul style="margin:0;padding-left:20px;line-height:2.2;color:var(--dark)">{li}</ul></div>')

def NOTE(title, text):
    return (f'<div style="background:var(--bg-tint);border-radius:12px;padding:20px 24px;margin:20px 0">'
            f'<strong>{title}</strong><p style="margin:8px 0 0;color:var(--muted);font-size:14px;line-height:1.7">{text}</p></div>')

def ANSWER(*paras):
    return ('<div class="answer-box">\n      <span class="answer-box__label">Коротка відповідь</span>\n      '
            + '\n      '.join(f'<p>{p}</p>' for p in paras) + '\n    </div>')

DISCLAIMER = ('<p style="margin-top:32px;padding-top:16px;border-top:1px solid var(--border);font-size:13px;color:var(--muted);line-height:1.7">'
              'Матеріал має інформаційний характер, ґрунтується на відкритих клінічних джерелах і сучасних рекомендаціях з реабілітації та не замінює '
              'консультації лікаря. Перед початком занять при захворюваннях або після операцій зверніться до фахівця.</p>')

def card(slug, title):
    return (f'<a href="{slug}" style="background:var(--bg-tint);border-radius:12px;padding:20px;text-decoration:none;color:var(--dark);border:1px solid var(--border);display:block">\n'
            f'        <strong>{title}</strong>\n'
            f'        <span style="color:var(--teal);font-size:14px;display:block;margin-top:6px">Читати →</span>\n      </a>')

def build(a):
    url = f'https://kinezis.com.ua/blog/{a["slug"]}'
    ld = json.dumps({
        "@context": "https://schema.org", "@type": "BlogPosting", "headline": a['h1'], "description": a['ld'],
        "image": "https://kinezis.com.ua/logo.png", "datePublished": NOW, "dateModified": NOW,
        "author": {"@type": "Person", "name": "Анастасія Захаріна", "url": "https://kinezis.com.ua/about"},
        "publisher": {"@type": "Organization", "name": "Кінезіс", "url": "https://kinezis.com.ua",
                      "logo": {"@type": "ImageObject", "url": "https://kinezis.com.ua/logo.png"}},
        "mainEntityOfPage": {"@type": "WebPage", "@id": url}, "inLanguage": "uk-UA"}, ensure_ascii=False, separators=(',', ':'))
    body = '\n\n    '.join([ANSWER(*a['answer'])] + a['body'] + [DISCLAIMER])
    html = f'''{head_pre}<title>{a['title']} — Кінезіс</title>
<meta name="description" content="{a['desc']}"/>
<meta name="keywords" content="{a['kw']}"/>
<meta name="robots" content="index, follow"/>
<link rel="canonical" href="{url}"/>
{head_links}<script type="application/ld+json">{ld}</script>
</head>
<body>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MN3MS74H" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
{header}

<div class="container" style="max-width:780px;padding-top:40px;padding-bottom:80px">
  <div class="breadcrumb" style="margin-bottom:32px">
    <a href="/">Головна</a><span>/</span><a href="../blog">Блог</a><span>/</span>
    <span>{a['crumb']}</span>
  </div>

  <span class="section__label">{a['label']}</span>
  <h1 style="font-size:clamp(24px,4vw,38px);font-weight:700;line-height:1.25;margin:12px 0 24px;color:var(--dark)">
    {a['h1']}
  </h1>

  <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;color:var(--muted);font-size:14px">
    <img src="../images/anastasia-zakharina.jpg" alt="Анастасія Захаріна" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0"/>
    <span style="color:var(--dark);font-weight:600">Анастасія Захаріна</span><span>·</span><span>{MONTH}</span><span>·</span><span>{a['read']} хв читання</span>
  </div>

  <div class="article-body">

    {body}

  </div>

  <div style="border-top:1px solid var(--border);margin-top:48px;padding-top:32px">
    <h3 style="margin-bottom:16px">Читайте також</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      {card(*a['related'][0])}
      {card(*a['related'][1])}
    </div>
  </div>
</div>

<section class="cta-banner">
  <div class="container cta-banner__inner">
    <div class="cta-banner__text">
      <h2>{a['cta'][0]}</h2>
      <p>{a['cta'][1]}</p>
    </div>
    <a href="https://t.me/Kineziss_bot" target="_blank" rel="noopener" class="btn btn--white btn--lg">Написати в Telegram</a>
  </div>
</section>

{footer}'''
    open(f'blog/{a["slug"]}.html', 'w', encoding='utf-8').write(html)
    print('wrote', a['slug'], len(html))

def register(a):
    """Blog card (top of grid), sitemap entry, llms.txt line — idempotent."""
    slug = a['slug']
    s = open('blog.html', encoding='utf-8').read()
    if f'href="blog/{slug}"' not in s:
        card_html = (f'    <a href="blog/{slug}" class="blog-card" data-cat="metodyka">\n'
                     f'      <div class="blog-card__body">\n'
                     f'        <span class="blog-tag" style="--tag:{a["color"]}">{a["tag"]}</span>\n'
                     f'        <h2>{a["card_h"]}</h2>\n        <p>{a["card_p"]}</p>\n'
                     f'        <span class="blog-card__read">Читати ></span>\n      </div>\n    </a>\n\n')
        key = 'id="blog-grid">\n\n'
        assert s.count(key) == 1, 'blog grid anchor not found'
        open('blog.html', 'w', encoding='utf-8').write(s.replace(key, key + card_html))
    sm = open('sitemap.xml', encoding='utf-8').read()
    if f'/blog/{slug}<' not in sm:
        entry = (f'  <url>\n    <loc>https://kinezis.com.ua/blog/{slug}</loc>\n    <lastmod>{NOW}</lastmod>\n'
                 f'    <changefreq>yearly</changefreq>\n    <priority>0.8</priority>\n  </url>\n')
        open('sitemap.xml', 'w', encoding='utf-8').write(sm.replace('</urlset>', entry + '</urlset>'))
    l = open('llms.txt', encoding='utf-8').read()
    if f'/blog/{slug})' not in l:
        line = f'\n- [{a["llms_title"]}](https://kinezis.com.ua/blog/{slug})'
        i = l.index('\n\n## Примітка')
        l = l[:i] + line + l[i:]
    n = len(re.findall(r'class="blog-card"', open('blog.html', encoding='utf-8').read()))
    l = re.sub(r'(Блог про реабілітацію\]\([^)]*\) — )~?\d+\+? статей', lambda m: f'{m.group(1)}{n // 10 * 10}+ статей', l)
    open('llms.txt', 'w', encoding='utf-8').write(l)
    print('registered', slug, '| cards in blog.html:', n)

if __name__ == '__main__':
    ns = {k: v for k, v in globals().items() if not k.startswith('__')}
    exec(open(sys.argv[1], encoding='utf-8').read(), ns)
    for a in ns['ARTICLES']:
        a['related'] = [(s, t or T(s)) for s, t in a['related']]
        build(a)
        register(a)
    r = subprocess.run(['node', 'scripts/check-site.js'], capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr)
    sys.exit(r.returncode)
