"""
Gera as imagens web dos sabores a partir dos masters e atualiza js/flavor-assets.js.

Entrada:  assets/img/sabores/_masters/<slug>-principal.(jpg|png|tif|webp)
          assets/img/sabores/_masters/<slug>-textura.(jpg|png|tif|webp)
          (recomendado 1600×2000, 4:5 — outras proporções são aceitas)
Saída:    assets/img/sabores/<slug>/<principal|textura>-<largura>.<avif|webp|jpg|png>
          js/flavor-assets.js  (larguras e dimensões reais de cada imagem — lido pelo site)

Uso:      python3 tools/sabores/gerar_imagens.py

Regras:
- A imagem NÃO é recortada, esticada nem filtrada: mantém proporção, cores e pixels do master.
  O enquadramento 4:5 acontece no site (object-fit: cover), com ponto focal definido
  em js/flavors.js → images.<principal|textura>.focal (ex.: '50% 40%').
- Só gera larguras até a largura do master (nunca amplia).
- Masters com transparência (recorte) mantêm a transparência em AVIF/WebP; o fallback vira PNG.
- A pasta _masters não deve ir para o servidor.
Requer Pillow ≥ 11 (AVIF nativo):  pip install "pillow>=11"
"""
import json, pathlib
from PIL import Image, ImageOps, features

ROOT = pathlib.Path(__file__).resolve().parents[2]
MASTERS = ROOT / 'assets/img/sabores/_masters'
OUT = ROOT / 'assets/img/sabores'
MANIFEST = ROOT / 'js/flavor-assets.js'
WIDTHS = [480, 800, 1200, 1600]
QUALITY = {'avif': 60, 'webp': 82, 'jpg': 85}


def has_alpha(im):
    return im.mode in ('RGBA', 'LA', 'PA') and im.getchannel('A').getextrema()[0] < 255


def process(src):
    slug, kind = src.stem.rsplit('-', 1)
    if kind not in ('principal', 'textura'):
        return None
    im = ImageOps.exif_transpose(Image.open(src))
    icc = im.info.get('icc_profile')
    alpha = has_alpha(im)
    im = im.convert('RGBA' if alpha else 'RGB')
    widths = sorted({w for w in WIDTHS if w < im.width} | {min(im.width, WIDTHS[-1])})
    dest = OUT / slug
    dest.mkdir(parents=True, exist_ok=True)
    for old in dest.glob(f'{kind}-*'):
        old.unlink()
    fallback = 'png' if alpha else 'jpg'
    for w in widths:
        h = round(im.height * w / im.width)
        r = im if w == im.width else im.resize((w, h), Image.LANCZOS)
        extra = {'icc_profile': icc} if icc else {}
        if alpha:
            r.save(dest / f'{kind}-{w}.png', 'PNG', optimize=True, **extra)
        else:
            r.save(dest / f'{kind}-{w}.jpg', 'JPEG', quality=QUALITY['jpg'], optimize=True, progressive=True, subsampling=0, **extra)
        r.save(dest / f'{kind}-{w}.webp', 'WEBP', quality=QUALITY['webp'], method=6, **extra)
        if features.check('avif'):
            r.save(dest / f'{kind}-{w}.avif', 'AVIF', quality=QUALITY['avif'], **extra)
    print(f'✓ {slug} / {kind}  {im.width}×{im.height}  {widths}  fallback={fallback}')
    return slug, kind, {'w': im.width, 'h': im.height, 'widths': widths, 'fallback': fallback,
                        'avif': features.check('avif')}


if __name__ == '__main__':
    assets = {}
    for f in sorted(MASTERS.glob('*')):
        if f.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp'):
            continue
        res = process(f)
        if res:
            slug, kind, info = res
            assets.setdefault(slug, {})[kind] = info
    MANIFEST.write_text(
        '/* Gerado por tools/sabores/gerar_imagens.py — não editar à mão. */\n'
        'export const FLAVOR_ASSETS = ' + json.dumps(assets, indent=2, ensure_ascii=False) + ';\n')
    print(f'→ {MANIFEST.relative_to(ROOT)} ({len(assets)} sabores com imagem)')
