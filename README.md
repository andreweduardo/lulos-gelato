# Lulo’s Gelato — site

Site estático em **HTML, CSS e JavaScript puro** (módulos ES nativos).
Não usa React, Vite, Next.js, npm nem nenhum passo de build: os arquivos desta pasta
são exatamente o que vai para o ar.

## Estrutura

```
index.html                    Home
sabor.html                    Página de cada sabor (sabor.html?s=puro-pistache)
politica-de-privacidade/      /politica-de-privacidade
termos-de-uso/                /termos-de-uso
404.html                      Página de erro (também redireciona /sabores/<slug> → sabor.html?s=<slug>)
css/                          tokens, base, componentes, seções, sabor, páginas legais
js/                           main.js (Home), flavor.js (sabor), page.js (páginas legais), módulos
  config.js                   ⚑ URL do iFood, Instagram, crédito Vier e rotas — editar aqui
  flavors.js                  ⚑ cadastro dos sabores
  flavor-assets.js            gerado pelo pipeline de imagens (não editar à mão)
assets/fonts                  Marcione, Futura LT Pro, Decofast (woff2)
assets/img                    fotos, sabores, interface
vendor/lenis.mjs              rolagem suave
tools/                        scripts de manutenção (não são usados pelo site no ar)
.nojekyll                     faz o GitHub Pages publicar os arquivos como estão
_redirects / .htaccess        regras para outras hospedagens (Netlify / Apache) — ignorados no GitHub Pages
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `lulos-gelato`).
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório, incluindo os arquivos
   que começam com ponto (`.nojekyll`, `.gitignore`).
3. No repositório: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** · pasta **/ (root)** → **Save**
4. Em 1–2 minutos o site fica em `https://<seu-usuario>.github.io/lulos-gelato/`.

Não há comando de build. Para atualizar, basta enviar os arquivos alterados.

### Testar localmente

```bash
cd lulos-gelato
python3 -m http.server 8080
# abra http://localhost:8080
```
(Os módulos JavaScript não funcionam abrindo o `index.html` direto do disco — precisa de um servidor.)

## Manutenção

- **Link do iFood / Instagram:** `js/config.js` → `ORDER_URL` e `LINKS`.
- **Sabores:** `js/flavors.js`.
- **Fotos dos sabores:** coloque os masters em `assets/img/sabores/_masters/<slug>-principal.png|jpg`
  e `<slug>-textura.jpg` e rode `python3 tools/sabores/gerar_imagens.py` (requer Python + Pillow ≥ 11).
- **Header/rodapé das outras páginas:** são copiados do `index.html`. Depois de mudar header ou rodapé
  da Home, rode `python3 tools/build_pages.py` para atualizar `sabor.html` e as páginas legais.
