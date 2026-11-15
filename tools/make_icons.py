from PIL import Image, ImageDraw
import pathlib
out = pathlib.Path(__file__).parent.parent / 'icons'
out.mkdir(parents=True, exist_ok=True)
BG, ACC, DIM, LIGHT = (20, 22, 25), (219, 116, 64), (122, 63, 30), (239, 235, 227)

def draw(size, scale=1.0, rounded=False):
    S = 4 * size
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded: d.rounded_rectangle([0, 0, S, S], radius=int(S * 0.22), fill=BG)
    else: d.rectangle([0, 0, S, S], fill=BG)
    c = S / 2
    u = S * 0.01 * scale  # unitate
    def rr(x0, y0, x1, y1, r, fill): d.rounded_rectangle([c + x0 * u, c + y0 * u, c + x1 * u, c + y1 * u], radius=r * u, fill=fill)
    rr(-37, -3, 37, 3, 3, LIGHT)                    # bara
    for sgn in (-1, 1):
        a, b = sorted((sgn * 15, sgn * 24)); rr(a, -27, b, 27, 4, ACC)   # disc mare
        a, b = sorted((sgn * 26, sgn * 33)); rr(a, -18, b, 18, 3.5, DIM) # disc mic
        a, b = sorted((sgn * 35, sgn * 39)); rr(a, -6, b, 6, 2, LIGHT)   # capăt
    return img.resize((size, size), Image.LANCZOS)

draw(192, 1.0, True).save(out / 'icon-192.png')
draw(512, 1.0, True).save(out / 'icon-512.png')
draw(512, 0.72).convert('RGB').save(out / 'icon-maskable-512.png')
draw(180, 0.92).convert('RGB').save(out / 'apple-touch-icon.png')
print('icons ok')
