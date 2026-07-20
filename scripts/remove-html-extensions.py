#!/usr/bin/env python3
"""Remove .html from all internal links, canonicals, OG tags, schema, and sitemap."""
import re, os, glob

BASE = 'https://kinezis.com.ua'

def clean_internal_href(content):
    """Remove .html from href/action attributes that are internal (not http/mailto/tel)."""
    def replacer(m):
        full = m.group(0)
        attr, val = m.group(1), m.group(2)
        # Skip external URLs
        if val.startswith('http') or val.startswith('mailto:') or val.startswith('tel:'):
            return full
        # Remove .html extension
        new_val = re.sub(r'\.html$', '', val)
        return f'{attr}="{new_val}"'
    return re.sub(r'(href|action)="([^"]*\.html)"', replacer, content)

def clean_absolute_urls(content):
    """Remove .html from absolute kinezis.com.ua URLs in any attribute or JSON."""
    return re.sub(
        r'(https://kinezis\.com\.ua/[^"\'>\s,)]+)\.html',
        lambda m: m.group(1),
        content
    )

def process_file(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        original = f.read()
    updated = clean_internal_href(original)
    updated = clean_absolute_urls(updated)
    if updated != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(updated)
        return True
    return False

changed = 0

# Root HTML files
for p in glob.glob('*.html'):
    if process_file(p): changed += 1

# Blog
for p in glob.glob('blog/*.html'):
    if process_file(p): changed += 1

# Products
for p in glob.glob('products/*.html'):
    if process_file(p): changed += 1

# Sitemap
if process_file('sitemap.xml'): changed += 1

# JS files with internal links
for p in ['cart.js', 'main.js', 'auth.js']:
    if os.path.exists(p) and process_file(p): changed += 1

print(f'Updated {changed} files')
