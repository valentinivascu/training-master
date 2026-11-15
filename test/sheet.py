"""Planșă de control: fiecare animație la start, la jumătate și la capăt."""
import asyncio, pathlib, sys
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).parent.parent
ids = sys.argv[1].split(',') if len(sys.argv) > 1 else None
src = (ROOT/'src/data.js').read_text() + '\n' + (ROOT/'src/anim.js').read_text()
W = 250 if not ids else 290
html = """<!doctype html><html><head><meta charset=utf-8><style>
:root{--accent:#DB7440;--accent-dim:#7A3F1E;--anim-outline:#0D0F12;--anim-pad:#2B3037;--anim-padhi:#4B535E;--anim-metal:#6E7682;--anim-metal2:#3B4149;--anim-steel:#A9B0BA;--anim-floor:#191C20;--anim-body:#E6E0D6;--anim-body2:#7D838D;--anim-hair:#2B2420;--anim-mp:#E8763E;--anim-ms:rgba(232,118,62,.45)}
body{margin:0;background:#141619;color:#EFEBE3;font:12px sans-serif}
.row{display:flex;align-items:center;gap:6px;padding:4px 8px;border-bottom:1px solid #333}
.row b{width:120px} svg{width:SVGW;height:SVGH;background:#1D2025;border-radius:6px}
</style></head><body><div id=g></div><script>""" + src + """
const ids = IDS || Object.keys(ANIM.D);
document.getElementById('g').innerHTML = ids.map(id => '<div class=row><b>'+id+'<br>'+(EX[id]?EX[id].n:'?')+'</b>' +
  [0, 0.31, 0.5].map(p => '<svg viewBox="'+ANIM.VB+'">'+ANIM.svgInner(id,p)+'</svg>').join('') + '</div>').join('');
</script></body></html>""".replace('SVGW', f'{W}px').replace('SVGH', f'{int(W*118/160)}px').replace('IDS', 'null' if not ids else repr(ids))
async def main():
    async with async_playwright() as p:
        try:
            br = await p.chromium.launch(channel='chrome', args=['--no-sandbox'])
        except Exception:
            br = await p.chromium.launch(args=['--no-sandbox'])
        pg = await br.new_page(viewport={'width': 920, 'height': 800})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.set_content(html)
        rows = await pg.locator('.row').count()
        out = ROOT/'test/shots'; out.mkdir(exist_ok=True)
        for f in out.glob('sheet-*.png'): f.unlink()
        for i in range(0, rows, 6):
            await pg.evaluate('([a,b]) => document.querySelectorAll(".row").forEach((r,k) => r.style.display = (k>=a && k<b) ? "flex" : "none")', [i, i + 6])
            await pg.locator('#g').screenshot(path=str(out/f'sheet-{i//6:02d}.png'))
        print('rows', rows, 'errors', errs)
        await br.close()
asyncio.run(main())
