"""
Gera sabor.html (template único da página de sabor) e as páginas informativas
(/politica-de-privacidade, /termos-de-uso, /historia, /contato — conteúdo em tools/pages/*.html) a partir do index.html,
reaproveitando <head>, ícones, header e footer — assim qualquer mudança no header/footer
da Home chega à página do sabor rodando:  python3 tools/build_pages.py
"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parents[1]
src = (root / 'index.html').read_text()

head = re.search(r'<head>(.*?)</head>', src, re.S).group(1)
sprite = re.search(r'(<svg class="sr-only".*?</svg>)', src, re.S).group(1)
header = re.search(r'(<header class="nav".*?</header>)', src, re.S).group(1)
footer = re.search(r'(  <!-- =+ FOOTER -->.*?</footer>)', src, re.S).group(1)

# links that point to Home sections must work from another page
def home_links(html):
    html = re.sub(r'href="#(sobre|sabores|faq|universo|privacy)"', r'href="./#\1"', html)
    return html.replace('href="#top" aria-label', 'href="./" aria-label')
header, footer = home_links(header), home_links(footer)

# <base> for pretty URLs (/sabores/<slug>) so relative assets keep resolving from the site root
base = """<script>document.documentElement.classList.add('flavor-pending');setTimeout(function(){document.documentElement.classList.remove('flavor-pending')},3000);</script>\n<script>if(/\\/sabores\\/[^/]+\\/?$/.test(location.pathname))document.write('<base href="/">');</script>\n"""
base_head = head
head = re.sub(r'(<meta name="viewport"[^>]*>\n)', r'\1' + base, head, count=1)
head = re.sub(r"<title>.*?</title>", "<title>Sabor — Lulo’s Gelato</title>", head)
head = re.sub(r'(<link rel="stylesheet" href="css/sections\.css[^"]*">)', r'\1\n<link rel="stylesheet" href="css/flavor.css">', head)
head = re.sub(r'<link rel="preload"[^>]*futura[^>]*>\n', '', head)

page = f"""<!doctype html>
<html lang="pt-BR">
<head>{head}</head>
<body>
{sprite}

{header}

<div class="page" id="top">
  <div class="page__bg" aria-hidden="true"><img src="assets/img/ui/page-bg.svg" alt=""></div>

  <!-- Conteúdo montado por js/flavor.js a partir de js/flavors.js -->
  <main class="flavor" data-flavor-page></main>

{footer}
</div>

<script type="module" src="js/flavor.js"></script>
</body>
</html>
"""
(root / 'sabor.html').write_text(page)
print('sabor.html gerado')

# ---- páginas informativas: /<slug>/index.html, com <base href="../"> (assets e links a partir da raiz)
LEGAL = [
    # slug, título, descrição, css da página, classe do <main>
    ('politica-de-privacidade', 'Política de Privacidade', 'Como o site da Lulo’s Gelato trata as informações de quem o visita.', 'legal', 'legal-page'),
    ('termos-de-uso', 'Termos de Uso', 'Condições de uso do site da Lulo’s Gelato.', 'legal', 'legal-page'),
    ('historia', 'A história', 'Prazer, sou o Lulo — o chef por trás da Lulo’s Gelato.', 'about', 'about-page'),
    ('contato', 'Contato & Carreiras', 'Fale com a Lulo’s ou deixe seu contato para futuras oportunidades.', 'contact', 'contact-page', 'contact'),
]
for slug, title, desc, css, main_cls, *rest in LEGAL:
    script = rest[0] if rest else 'page'
    h = re.sub(r'(<meta name="viewport"[^>]*>\n)', r'\1<base href="../">\n', base_head, count=1)
    h = re.sub(r"<title>.*?</title>", f"<title>{title} — Lulo’s Gelato</title>", h)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', h)
    h = re.sub(r'(<link rel="stylesheet" href="css/sections\.css[^"]*">)', lambda m: m.group(1) + f'\n<link rel="stylesheet" href="css/{css}.css">', h)
    h = re.sub(r'<link rel="preload"[^>]*futura[^>]*>\n', '', h)
    body = (root / 'tools/pages' / f'{slug}.html').read_text()
    out = f"""<!doctype html>
<html lang="pt-BR">
<head>{h}</head>
<body>
{sprite}

{header}

<div class="page" id="top">
  <div class="page__bg" aria-hidden="true"><img src="assets/img/ui/page-bg.svg" alt=""></div>
  <main class="{main_cls}">
{body}
  </main>

{footer}
</div>

<script type="module" src="js/{script}.js"></script>
</body>
</html>
"""
    d = root / slug
    d.mkdir(exist_ok=True)
    (d / 'index.html').write_text(out)
    print(f'{slug}/index.html gerado')
