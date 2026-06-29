#!/usr/bin/env python3
"""Gera um único HTML autocontido (abre por duplo-clique, sem servidor)."""
import base64, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
OUT  = ROOT / "IHC-Spotify-Apresentacao-final.html"

SLIDES = [
    '01-capa','02-tema','03-problema','04-jornada','05-heuristicas',
    '06-amostra','07-confiabilidade','08-dores','09-free-premium','10-caminho-c',
    '11-shapes','12-inovacoes','13-demo','14-cobertura','15-entrevistas-metodo',
    '16-citacoes','17-insights','18-conclusoes','19-obrigado','20-backup',
]

MIME = {'.png':'image/png','.gif':'image/gif','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp'}

def data_uri(relpath: str):
    """relpath relativo à pasta apresentacao/ -> data URI, ou None."""
    p = (ROOT / relpath).resolve()
    if not p.is_file() or p.stat().st_size == 0:
        return None
    ext = p.suffix.lower()
    if ext not in MIME:
        return None
    b64 = base64.b64encode(p.read_bytes()).decode('ascii')
    return f"data:{MIME[ext]};base64,{b64}"

def embed_images(html: str) -> str:
    """Troca refs locais assets/*.png|gif|... por data URIs."""
    def repl(m):
        ref = m.group(0)
        uri = data_uri(ref)
        return uri if uri else ref
    return re.sub(r'assets/[A-Za-z0-9_./-]+\.(?:png|gif|jpg|jpeg|svg|webp)', repl, html)

# ---- Slide 13: troca iframe ao vivo por screenshots embutidas ----
SHOTS = {
    '../../telas/t2.html': 'assets/screenshots/t2-redesign.png',
    '../../telas/t3.html': 'assets/screenshots/t3-redesign.png',
    '../../telas/t5.html': 'assets/screenshots/t5-redesign.png',
    '../../telas/ma.html': 'assets/screenshots/ma-snackbar.png',
}

def transform_demo(html: str) -> str:
    # CSS: aplica regra de iframe também a img + object-fit
    html = html.replace(
        '.device-frame iframe {\n    width: 100%;\n    height: 100%;\n    border: 0;\n    background: #121212;\n    display: block;\n  }',
        '.device-frame iframe, .device-frame img {\n    width: 100%;\n    height: 100%;\n    border: 0;\n    background: #121212;\n    display: block;\n    object-fit: cover;\n    object-position: top center;\n  }'
    )
    # iframe -> img
    iframe_re = re.compile(r'<iframe\s+id="demoFrame".*?</iframe>', re.S)
    t2 = data_uri(SHOTS['../../telas/t2.html'])
    html = iframe_re.sub(f'<img id="demoFrame" src="{t2}" alt="Prototipo - tela ativa" />', html)
    # abas: data-src telas -> data-src screenshots
    for path, shot in SHOTS.items():
        uri = data_uri(shot)
        if uri:
            html = html.replace(f'data-src="{path}"', f'data-src="{uri}"')
    # pílula AO VIVO -> PROTÓTIPO (não é mais live)
    html = html.replace('>AO VIVO<', '>PROTÓTIPO<')
    return html

# ---- Coleta slides ----
slides_map = {}
for name in SLIDES:
    raw = (ROOT / 'slides' / f'{name}.html').read_text(encoding='utf-8')
    if name == '13-demo':
        raw = transform_demo(raw)
    raw = embed_images(raw)
    slides_map[name] = raw

# ---- CSS combinado ----
css_files = ['css/tokens.css','css/base.css','css/components.css','css/animacoes.css']
css = "\n".join((ROOT / f).read_text(encoding='utf-8') for f in css_files)
css = embed_images(css)  # caso algum url() aponte para asset local

# ---- JS combinado + patch do loader ----
js_anim = (ROOT / 'js/animacoes.js').read_text(encoding='utf-8')
js_apre = (ROOT / 'js/apresentador.js').read_text(encoding='utf-8')
js_nav  = (ROOT / 'js/nav.js').read_text(encoding='utf-8')

# patch 1: fetch -> __SLIDES__
fetch_block = """    const url = 'slides/' + file + '.html';
    let html = '';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      html = await res.text();
    } catch (err) {
      html = '<div class="slide__content"><h1>Erro ao carregar slide ' + n + '</h1><p>' + (err && err.message) + '</p></div>';
    }"""
assert fetch_block in js_nav, "bloco fetch nao encontrado em nav.js"
js_nav = js_nav.replace(fetch_block,
    "    let html = (window.__SLIDES__ && window.__SLIDES__[file]) || '<div class=\"slide__content\"><h1>Slide ' + n + ' indisponivel</h1></div>';")

# patch 2: re-executar <script> dos slides (innerHTML nao executa)
append_block = """    section.innerHTML = html;
    stage.appendChild(section);"""
assert append_block in js_nav, "bloco appendChild nao encontrado em nav.js"
js_nav = js_nav.replace(append_block,
    """    section.innerHTML = html;
    stage.appendChild(section);
    section.querySelectorAll('script').forEach(function(old){var s=document.createElement('script');for(var i=0;i<old.attributes.length;i++){s.setAttribute(old.attributes[i].name, old.attributes[i].value);}if(!old.src){s.textContent=old.textContent;}old.parentNode.replaceChild(s,old);});""")

slides_json = json.dumps(slides_map, ensure_ascii=False)

# ---- Monta index.html ----
index = (ROOT / 'index.html').read_text(encoding='utf-8')
# remove os <link> de CSS locais
for f in css_files:
    index = re.sub(r'\s*<link rel="stylesheet" href="' + re.escape(f) + r'" />', '', index)
# injeta <style> no lugar do </head>
index = index.replace('</head>', f'  <style>\n{css}\n  </style>\n</head>')
# remove os <script src="js/..."> locais
index = re.sub(r'\s*<script src="js/[^"]+" defer></script>', '', index)
# injeta JS + dados antes de </body>
bundle = (
    f'  <script>window.__SLIDES__ = {slides_json};</script>\n'
    f'  <script>\n{js_anim}\n</script>\n'
    f'  <script>\n{js_apre}\n</script>\n'
    f'  <script>\n{js_nav}\n</script>\n'
)
index = index.replace('</body>', bundle + '</body>')

OUT.write_text(index, encoding='utf-8')
kb = OUT.stat().st_size / 1024
print(f"OK -> {OUT.name}  ({kb:.0f} KB)")
