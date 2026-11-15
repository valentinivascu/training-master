#!/usr/bin/env python3
"""Asamblează aplicația din src/ în fișierele publicate din rădăcina repository-ului:
index.html (CSS + JS incluse), sw.js, manifest.webmanifest, fonts/. Iconițele vin din tools/make_icons.py."""
import pathlib, shutil
root = pathlib.Path(__file__).parent
src = root / 'src'
js = '\n'.join((src / f).read_text(encoding='utf8') for f in ('data.js', 'core.js', 'anim.js', 'app.js'))
css = (src / 'styles.css').read_text(encoding='utf8')
assert '</script>' not in js and '</style>' not in css
html = (src / 'template.html').read_text(encoding='utf8').replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
(root / 'index.html').write_text(html, encoding='utf8')
for f in ('manifest.webmanifest', 'sw.js'):
    shutil.copy(src / f, root / f)
shutil.copytree(src / 'fonts', root / 'fonts', dirs_exist_ok=True)
print('index.html:', round(len(html.encode('utf8')) / 1024), 'KB')
