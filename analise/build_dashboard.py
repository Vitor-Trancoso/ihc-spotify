"""
Gera dashboard.html v2 — interativo:
- Lightbox com zoom (click to enlarge, ESC para fechar, scroll para zoom in/out)
- Painel de explicação ao lado de cada gráfico
- Hover overlay com ícone de lupa
- Paleta Spotify dark
- Single-file (PNGs em base64)
"""
import os, base64, json
import pandas as pd

BASE = '/Users/vitormarconi/Documents/GitHub/ihc-spotify/analise'
FIG  = os.path.join(BASE, 'figuras')
os.chdir(BASE)

def b64(path):
    with open(path,'rb') as f: return base64.b64encode(f.read()).decode()

FIG_NAMES = ['fig1_heatmap_itens','fig2_heatmap_blocos','fig3_net_score',
             'fig4_pareto_qualitativo','fig5_apriori_scatter','fig6_free_vs_premium',
             'fig7_duracao','fig8_item_total','fig9_demografia','fig10_score_blocos']
figs = {n: f'data:image/png;base64,{b64(os.path.join(FIG, n+".png"))}' for n in FIG_NAMES}

# --- Explicações detalhadas por figura ---
EXPL = {
'fig10_score_blocos': {
    'titulo': 'Score Médio por Bloco com IC 95%',
    'como_ler': 'Cada barra é a média dos itens daquele bloco entre os 86 respondentes. A barra de erro fina no topo representa o erro padrão da média (≈IC 68%). Linhas tracejadas marcam neutro (3,0) e ponto "bom" (3,5).',
    'cores': 'Verde = média ≥ 3,5 (bem avaliado) · Âmbar = 3,0 a 3,5 (zona morna) · Vermelho = ≤ 3,0 (problemático).',
    'achado': 'H4 lidera (3,71); H5 é o pior (3,38). Nenhum bloco abaixo de 3,0 — falhas são pontuais, não sistêmicas. Erros padrão pequenos (~0,1) indicam confiança alta nas médias.'
},
'fig3_net_score': {
    'titulo': 'Net Score por Item',
    'como_ler': 'Net Score = (% que avaliou ≥4) − (% que avaliou ≤2). Métrica única que captura polaridade. Positivo = mais gente gosta do que reclama; negativo = o oposto. Itens ordenados do pior ao melhor.',
    'cores': 'Vermelho = Net negativo · Âmbar = 0 a 20 (consenso fraco) · Verde = ≥ 20 (consenso positivo).',
    'achado': 'A3 (Desfazer playlist) é o ÚNICO item negativo: −21,1. E2 (Info visível) é o melhor: +75,6. Os 4 piores itens (A3, E4, E1, D5) formam o coração do problema de UX e devem guiar o redesign.'
},
'fig6_free_vs_premium': {
    'titulo': 'Free vs Premium — Score por Bloco',
    'como_ler': 'Barras pareadas: âmbar (Free, n=17) e verde (Premium, n=69). Linha tracejada cinza marca o neutro (3). Diferença testada via Mann-Whitney U (não-paramétrico, robusto para n pequeno).',
    'cores': 'Âmbar = plano gratuito · Verde = plano pago.',
    'achado': 'Usuários Free percebem o app 0,5–0,8 pontos abaixo em TODOS os 5 blocos (todos com p<0,05). Maior diferença em H3 Controle (+0,77, p=0,002). Não é só "tem propaganda" — é degradação sistêmica. Implica uma estratégia específica de UX para o público Free no protótipo.'
},
'fig2_heatmap_blocos': {
    'titulo': 'Heatmap das Correlações entre Blocos',
    'como_ler': 'Matriz simétrica 5×5 das correlações de Pearson entre os scores dos 5 blocos. Diagonal sempre = 1,00. Cores mais escuras = correlação mais forte.',
    'cores': 'Verde escuro = r próximo de 1 (associação muito forte) · Verde médio = 0,7–0,8 · Verde claro = 0,5–0,7.',
    'achado': 'H7 ↔ H8 = 0,80 (forte) — par mais correlacionado. Significa que estética e eficiência percebida são, na prática, UMA dimensão para o usuário. Cortar poluição visual melhora a percepção de eficiência sem mexer na funcionalidade.'
},
'fig1_heatmap_itens': {
    'titulo': 'Heatmap Item-a-Item (24×24)',
    'como_ler': 'Cada célula é a correlação de Pearson entre dois itens Likert. Anotações em texto aparecem apenas para |r| ≥ 0,5 (correlações relevantes). Cores: do quase preto (r baixo) ao verde Spotify (r alto).',
    'cores': 'Preto-acinzentado = r próximo de 0 · Verde médio = 0,3–0,6 · Verde Spotify = ≥ 0,7.',
    'achado': 'Clusters visíveis cruzam fronteiras de blocos: controle (A) + posicionamento (C2) + telas limpas (D5/E1) formam um grupo. Confirma que o usuário não distingue mentalmente as heurísticas — vê o app como um todo.'
},
'fig5_apriori_scatter': {
    'titulo': 'Regras Apriori — Suporte × Confiança × Lift',
    'como_ler': 'Cada bolha é uma regra "Se X então Y" descoberta no Apriori. Eixo X = suporte (freq. da regra). Eixo Y = confiança (P(Y|X)). Cor e tamanho = lift (quanto a regra "supera o acaso").',
    'cores': 'Verde escuro/grande = lift alto (regra muito informativa) · Quase preto/pequeno = lift baixo.',
    'achado': 'Bolhas no canto superior-direito (alta sup + alta conf) são as regras de alto valor. As de maior lift (5,95): "H4=Baixo ⇒ H7=Baixo" — quando inconsistência é percebida, ineficiência VEM JUNTO em 90% dos casos.'
},
'fig4_pareto_qualitativo': {
    'titulo': 'Pareto dos Temas Qualitativos',
    'como_ler': 'Barras (eixo Y esquerdo): nº de menções por tema nas respostas abertas. Linha verde (eixo Y direito): % acumulado. Linha tracejada laranja marca 80% — princípio de Pareto.',
    'cores': 'Verde = H8 · Roxo = H7 · Azul = H3 · Âmbar = H4 · Vermelho = H5 · Cinza = tema externo (negócio/performance).',
    'achado': 'Top 5 temas concentram ~70% das menções. Propaganda no Free é o tema #1 (não é heurística, é modelo de negócio). Logo depois: poluição visual (H8) e recomendações ruins (H7). Performance (lentidão) merece atenção apesar de fora das 10 heurísticas clássicas.'
},
'fig8_item_total': {
    'titulo': 'Correlação Item-Total (coesão interna)',
    'como_ler': 'Para cada item, mede quanto ele "se parece" com o resto do bloco. r baixo = item não está medindo o mesmo construto que os outros, e está puxando o α de Cronbach para baixo.',
    'cores': 'Vermelho = r < 0,4 (item problemático, considerar remover/reformular) · Âmbar = 0,4–0,5 (limítrofe) · Verde = ≥ 0,5 (bom).',
    'achado': 'C4 (Aviso de perda de dados) tem r=0,24 — totalmente fora do bloco H5. É o único item que se removido AUMENTA o α do bloco. Recomendação: reformular ou mover para H3.'
},
'fig7_duracao': {
    'titulo': 'Distribuição do Tempo de Resposta',
    'como_ler': 'Histograma da duração de cada resposta (em segundos), truncado no percentil 95 para legibilidade. Linha vermelha marca 60s (limiar de suspeita de click-through). Linha âmbar marca a mediana.',
    'cores': 'Verde = frequência · Vermelho tracejado = limiar de qualidade · Âmbar tracejado = mediana.',
    'achado': 'Mediana ~502s (~8min). Apenas 1 respondente (1,2%) ficou abaixo de 2min. Quartis 358–733s. Sem evidência de respondentes "clicando" sem ler. Dados de alta qualidade.'
},
'fig9_demografia': {
    'titulo': 'Perfil Demográfico (4 painéis)',
    'como_ler': 'Cada painel mostra a distribuição de uma variável demográfica. Números absolutos e percentuais ao lado de cada barra.',
    'cores': 'Verde Spotify uniforme.',
    'achado': 'Amostra fortemente enviesada: 66% jovens 18–24, 63% universitários, 74% uso diário, 80% Premium. Resultados são ROBUSTOS para esse perfil; generalizar para idosos ou Free puro exige cautela. Premium dominante explica por que o agregado é positivo (Free é minoria).'
},
}

# --- Tabelas dinâmicas ---
desc_b   = pd.read_csv('saida_descritiva_blocos.csv', sep=';')
mw       = pd.read_csv('saida_mann_whitney_conta.csv', sep=';')
net      = pd.read_csv('saida_net_score.csv', sep=';').sort_values('net')
item_tot = pd.read_csv('saida_item_total.csv', sep=';')
resumo_x = json.load(open('saida_resumo_extra.json'))

ALPHA = {'H3_Controle':0.849,'H4_Consistencia':0.785,'H5_PrevencaoErros':0.672,
         'H7_Flexibilidade':0.736,'H8_Estetica':0.809}

def alpha_badge(a):
    if a >= 0.8: return f'<span class="badge ok">α = {a:.2f}</span>'
    if a >= 0.7: return f'<span class="badge warn">α = {a:.2f}</span>'
    return f'<span class="badge bad">α = {a:.2f}</span>'

bloco_rows = ''
for r in desc_b.itertuples():
    cls = 'ok' if r.Media >= 3.5 else 'warn' if r.Media >= 3 else 'bad'
    bloco_rows += f"""
    <tr><td>{r.Bloco.replace('_',' ')}</td>
        <td class="num {cls}">{r.Media:.2f}</td>
        <td class="num">{r.DP:.2f}</td>
        <td class="num">{r._5}%</td>
        <td class="num">{r._6}%</td>
        <td>{alpha_badge(ALPHA[r.Bloco])}</td></tr>"""

mw_rows = ''
for r in mw.itertuples():
    star = '<span class="sig">' + r.sig + '</span>' if r.sig else '–'
    mw_rows += f"""
    <tr><td>{r.Bloco.replace('_',' ')}</td>
        <td class="num">{r.Free_media:.2f} <span class="dim">(n={r.Free_n})</span></td>
        <td class="num">{r.Premium_media:.2f} <span class="dim">(n={r.Premium_n})</span></td>
        <td class="num diff">+{r.diff:.2f}</td>
        <td class="num">p={r.p}</td><td>{star}</td></tr>"""

net_rows = ''
for r in net.head(6).itertuples():
    cls = 'bad' if r.net < 0 else 'warn' if r.net < 20 else 'ok'
    net_rows += f'<tr><td>{r.Item}</td><td class="num {cls}">{r.net:+.1f}</td><td class="num">{r.pct_alto}%</td><td class="num">{r.pct_baixo}%</td></tr>'

problems = item_tot[(item_tot['r_item_total']<0.4)|(item_tot['delta']>0.02)]
problem_rows = ''
for r in problems.itertuples():
    problem_rows += f'<tr><td>{r.Item}</td><td>{r.Bloco.replace("_"," ")}</td><td class="num bad">{r.r_item_total:.2f}</td><td class="num">α sem item: {r.alpha_sem_item:.3f}</td></tr>'

dur = resumo_x['duracao_segundos']

def chart_card(fig_id, expl_key, alt, large=False):
    """Render um card de figura com lightbox + painel de explicação."""
    e = EXPL[expl_key]
    cls = ' large' if large else ''
    return f'''
    <div class="chart-block{cls}">
      <figure class="chart-wrap" data-img="{fig_id}" data-title="{e['titulo']}" tabindex="0" role="button" aria-label="Ampliar {e['titulo']}">
        <img class="chart" src="{figs[fig_id]}" alt="{alt}" loading="lazy">
        <div class="zoom-hint"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M8 11h6M11 8v6"/></svg> Clique para ampliar</div>
        <figcaption class="chart-caption">{e['titulo']}</figcaption>
      </figure>
      <aside class="explain">
        <h4>Como ler</h4><p>{e['como_ler']}</p>
        <h4>Cores</h4><p>{e['cores']}</p>
        <div class="finding"><strong>📌 Achado-chave</strong><p>{e['achado']}</p></div>
      </aside>
    </div>'''

# Pré-render dos blocos de gráfico
chart_scores  = chart_card('fig10_score_blocos', 'fig10_score_blocos', 'Score por bloco')
chart_net     = chart_card('fig3_net_score',     'fig3_net_score',     'Net Score', large=True)
chart_free    = chart_card('fig6_free_vs_premium','fig6_free_vs_premium','Free vs Premium')
chart_hb      = chart_card('fig2_heatmap_blocos','fig2_heatmap_blocos','Heatmap blocos')
chart_hi      = chart_card('fig1_heatmap_itens', 'fig1_heatmap_itens', 'Heatmap itens', large=True)
chart_apri    = chart_card('fig5_apriori_scatter','fig5_apriori_scatter','Apriori scatter')
chart_pareto  = chart_card('fig4_pareto_qualitativo','fig4_pareto_qualitativo','Pareto', large=True)
chart_it      = chart_card('fig8_item_total',    'fig8_item_total',    'Item-Total')
chart_dur     = chart_card('fig7_duracao',       'fig7_duracao',       'Duração')
chart_demo    = chart_card('fig9_demografia',    'fig9_demografia',    'Demografia', large=True)

# Lightbox lê do próprio <img> via DOM — não duplicamos os base64 no JS

HTML = f"""<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Spotify Mobile — Análise de Usabilidade</title>
<style>
:root {{
  --bg:#121212; --card:#181818; --card-hi:#202020; --card-hi2:#282828; --border:#2A2A2A;
  --text:#FFFFFF; --text-dim:#B3B3B3; --text-sub:#7A7A7A;
  --green:#1DB954; --green-hi:#1ED760; --red:#E22134; --amber:#FFA42B; --blue:#60A5FA; --purple:#A855F7;
}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}}
.container{{max-width:1400px;margin:0 auto;padding:32px}}
header{{display:flex;align-items:center;gap:16px;margin-bottom:28px;padding-bottom:24px;border-bottom:1px solid var(--border);position:relative}}
.logo{{width:52px;height:52px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-weight:900;color:var(--bg);font-size:26px;box-shadow:0 4px 16px rgba(29,185,84,0.3)}}
h1{{font-size:30px;font-weight:800;letter-spacing:-0.5px}}
.subtitle{{color:var(--text-dim);font-size:14px;margin-top:6px}}
.toc{{position:absolute;top:0;right:0;display:flex;gap:6px;flex-wrap:wrap;max-width:55%;justify-content:flex-end}}
.toc a{{font-size:11px;padding:5px 10px;border-radius:99px;background:rgba(255,255,255,0.05);color:var(--text-dim);text-decoration:none;transition:all .15s;border:1px solid transparent}}
.toc a:hover{{background:rgba(29,185,84,0.15);color:var(--green-hi);border-color:rgba(29,185,84,0.3)}}

h2{{font-size:22px;font-weight:700;margin:40px 0 16px;letter-spacing:-0.3px;color:var(--text);scroll-margin-top:16px}}
h2::before{{content:"";display:inline-block;width:4px;height:20px;background:var(--green);margin-right:12px;vertical-align:-3px;border-radius:2px}}

.row{{display:grid;gap:16px;margin-bottom:16px}}
.row-2{{grid-template-columns:1fr 1fr}}
.row-3{{grid-template-columns:repeat(3,1fr)}}
.row-4{{grid-template-columns:repeat(4,1fr)}}
@media (max-width:980px){{.row-2,.row-3,.row-4{{grid-template-columns:1fr 1fr}}}}
@media (max-width:600px){{.row-2,.row-3,.row-4{{grid-template-columns:1fr}}}}

.card{{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;transition:background .15s,transform .15s,border-color .15s}}
.card:hover{{background:var(--card-hi)}}

/* KPIs */
.kpi .label{{color:var(--text-dim);font-size:11px;text-transform:uppercase;letter-spacing:0.6px;font-weight:600}}
.kpi .value{{font-size:36px;font-weight:800;margin-top:6px;color:var(--green);font-variant-numeric:tabular-nums;letter-spacing:-1px}}
.kpi .hint{{color:var(--text-sub);font-size:12px;margin-top:4px}}
.kpi.warn .value{{color:var(--amber)}}
.kpi.bad .value{{color:var(--red)}}

/* Chart blocks com explicação ao lado */
.chart-block{{display:grid;grid-template-columns:2fr 1fr;gap:0;background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:16px;transition:border-color .15s}}
.chart-block:hover{{border-color:#3a3a3a}}
.chart-block.large{{grid-template-columns:3fr 1fr}}
@media (max-width:900px){{.chart-block,.chart-block.large{{grid-template-columns:1fr}}}}

.chart-wrap{{position:relative;cursor:zoom-in;background:var(--bg);padding:14px;display:flex;flex-direction:column;align-items:center;outline:none}}
.chart-wrap:focus-visible{{box-shadow:inset 0 0 0 2px var(--green)}}
img.chart{{width:100%;height:auto;border-radius:8px;display:block;transition:transform .25s ease}}
.chart-wrap:hover img.chart{{transform:scale(1.012)}}
.zoom-hint{{position:absolute;top:22px;right:22px;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);color:var(--text);padding:6px 12px;border-radius:99px;font-size:11px;font-weight:600;display:flex;align-items:center;gap:6px;opacity:0;transform:translateY(-4px);transition:all .2s;pointer-events:none;border:1px solid rgba(255,255,255,0.1)}}
.chart-wrap:hover .zoom-hint{{opacity:1;transform:translateY(0)}}
.chart-caption{{margin-top:10px;font-size:12px;color:var(--text-sub);font-style:italic;text-align:center}}

.explain{{padding:22px;background:var(--card-hi);border-left:1px solid var(--border);overflow-y:auto;max-height:600px}}
.explain h4{{font-size:11px;color:var(--green);text-transform:uppercase;letter-spacing:0.6px;font-weight:700;margin-top:16px;margin-bottom:6px}}
.explain h4:first-child{{margin-top:0}}
.explain p{{font-size:13px;color:var(--text-dim);line-height:1.55}}
.finding{{margin-top:18px;padding:14px;background:rgba(29,185,84,0.06);border-left:3px solid var(--green);border-radius:6px}}
.finding strong{{font-size:11px;color:var(--green-hi);text-transform:uppercase;letter-spacing:0.6px;display:block;margin-bottom:6px}}
.finding p{{color:var(--text);font-size:13px;font-weight:500}}

/* Tabelas */
table{{width:100%;border-collapse:collapse;font-size:13px}}
th{{text-align:left;padding:10px 12px;color:var(--text-dim);font-weight:600;border-bottom:1px solid var(--border);text-transform:uppercase;font-size:11px;letter-spacing:0.5px}}
td{{padding:10px 12px;border-bottom:1px solid var(--border)}}
tr:last-child td{{border-bottom:none}}
.num{{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}}
.ok{{color:var(--green-hi)}} .warn{{color:var(--amber)}} .bad{{color:var(--red)}}
.dim{{color:var(--text-sub);font-weight:400;font-size:11px}}
.diff{{color:var(--green-hi)}}
.sig{{color:var(--green-hi);font-weight:700}}

.badge{{display:inline-block;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:0.3px}}
.badge.ok{{background:rgba(29,185,84,0.15);color:var(--green-hi)}}
.badge.warn{{background:rgba(255,164,43,0.15);color:var(--amber)}}
.badge.bad{{background:rgba(226,33,52,0.15);color:var(--red)}}

.callout{{border-left:3px solid var(--green);padding:14px 18px;background:rgba(29,185,84,0.06);border-radius:8px;margin:12px 0;font-size:13px;color:var(--text-dim);line-height:1.55}}
.callout strong{{color:var(--text)}}
.callout.warn{{border-left-color:var(--amber);background:rgba(255,164,43,0.06)}}
.callout.bad{{border-left-color:var(--red);background:rgba(226,33,52,0.06)}}

.tag{{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:rgba(255,255,255,0.06);color:var(--text-dim);margin-right:6px}}

/* Recomendações */
ul.rec{{list-style:none;padding:0;margin:0}}
ul.rec li{{padding:16px 0;border-bottom:1px solid var(--border);display:flex;gap:16px;align-items:flex-start}}
ul.rec li:last-child{{border:none}}
ul.rec .n{{width:32px;height:32px;border-radius:50%;background:var(--green);color:var(--bg);font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px}}
ul.rec strong{{display:block;color:var(--text);margin-bottom:4px;font-size:14px}}
ul.rec .why{{color:var(--text-sub);font-size:12px;line-height:1.55}}

blockquote{{border-left:2px solid var(--green);padding:8px 14px;margin:10px 0;color:var(--text-dim);font-style:italic;font-size:13px;line-height:1.6}}

footer{{margin-top:56px;padding-top:24px;border-top:1px solid var(--border);color:var(--text-sub);font-size:12px;text-align:center}}
code{{background:var(--card-hi2);padding:2px 6px;border-radius:4px;font-size:11px;color:var(--green-hi)}}

/* === LIGHTBOX === */
.lightbox{{position:fixed;inset:0;background:rgba(0,0,0,0.92);backdrop-filter:blur(8px);z-index:9999;display:none;align-items:center;justify-content:center;padding:40px;animation:fade .2s}}
.lightbox.active{{display:flex}}
@keyframes fade{{from{{opacity:0}}to{{opacity:1}}}}
.lb-content{{position:relative;max-width:96vw;max-height:92vh;display:flex;flex-direction:column;gap:10px}}
.lb-header{{display:flex;justify-content:space-between;align-items:center;gap:24px;color:var(--text);font-size:14px;padding:0 8px}}
.lb-title{{font-size:16px;font-weight:700}}
.lb-controls{{display:flex;gap:6px;align-items:center}}
.lb-btn{{background:rgba(255,255,255,0.08);color:var(--text);border:1px solid var(--border);width:36px;height:36px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;font-size:16px;font-weight:600}}
.lb-btn:hover{{background:rgba(29,185,84,0.2);border-color:var(--green);color:var(--green-hi)}}
.lb-zoom{{font-variant-numeric:tabular-nums;font-size:12px;color:var(--text-dim);padding:0 8px;min-width:54px;text-align:center}}
.lb-stage{{flex:1;overflow:auto;background:var(--card);border-radius:12px;border:1px solid var(--border);display:flex;align-items:center;justify-content:center;min-height:300px;cursor:grab;position:relative}}
.lb-stage:active{{cursor:grabbing}}
.lb-stage img{{max-width:100%;max-height:84vh;display:block;transform-origin:center center;transition:transform .15s ease-out;user-select:none;-webkit-user-drag:none}}
.lb-stage img.zoomed{{max-width:none;max-height:none;cursor:inherit}}
.lb-footer{{color:var(--text-sub);font-size:11px;padding:0 8px;text-align:center}}
kbd{{background:var(--card-hi2);border:1px solid var(--border);padding:2px 6px;border-radius:4px;font-size:10px;color:var(--text-dim);font-family:monospace}}
</style></head><body>

<div class="container">

<header>
  <div class="logo">♫</div>
  <div>
    <h1>Spotify Mobile — Análise de Usabilidade</h1>
    <div class="subtitle">IHC 2026/1 · Equipe 01 · n=86 respondentes · 24 itens Likert · 5 Heurísticas de Nielsen</div>
  </div>
  <nav class="toc">
    <a href="#kpis">KPIs</a>
    <a href="#blocos">Blocos</a>
    <a href="#netscore">Net Score</a>
    <a href="#freeprem">Free×Premium</a>
    <a href="#correl">Correlações</a>
    <a href="#cronbach">Itens fracos</a>
    <a href="#apriori">Apriori</a>
    <a href="#qual">Qualitativo</a>
    <a href="#proto">Protótipo</a>
  </nav>
</header>

<h2 id="kpis">Indicadores-Chave</h2>
<div class="row row-4">
  <div class="card kpi"><div class="label">Respondentes válidos</div><div class="value">86</div><div class="hint">de 90 brutos (4 descartados)</div></div>
  <div class="card kpi"><div class="label">Alpha global</div><div class="value">0,961</div><div class="hint">Excelente · instrumento confiável</div></div>
  <div class="card kpi"><div class="label">Maior correlação</div><div class="value">0,80</div><div class="hint">H7 Flexibilidade ↔ H8 Estética</div></div>
  <div class="card kpi bad"><div class="label">Pior item (Net Score)</div><div class="value">−21,1</div><div class="hint">A3 — Desfazer playlist</div></div>
</div>
<div class="row row-4">
  <div class="card kpi"><div class="label">Significância Bonferroni</div><div class="value">88/276</div><div class="hint">pares Spearman p&lt;0,05 corrigido</div></div>
  <div class="card kpi warn"><div class="label">Free × Premium</div><div class="value">5/5</div><div class="hint">blocos com diferença significativa</div></div>
  <div class="card kpi"><div class="label">Mediana de resposta</div><div class="value">{int(dur['mediana'])}s</div><div class="hint">{dur['pct_menos_60s']:.0f}% &lt;60s · qualidade alta</div></div>
  <div class="card kpi"><div class="label">Regras Apriori</div><div class="value">1.030</div><div class="hint">itens · 90 entre blocos</div></div>
</div>

<h2 id="blocos">Score por Bloco (Heurística)</h2>
{chart_scores}
<div class="card">
  <table>
    <thead><tr><th>Bloco</th><th>Média</th><th>DP</th><th>%≤2.5</th><th>%≥3.5</th><th>Cronbach</th></tr></thead>
    <tbody>{bloco_rows}</tbody>
  </table>
  <div class="callout warn"><strong>H5 com α=0,67 (questionável):</strong> sugere reescrever itens C2/C4/C5 em iteração futura. C5 provavelmente pertence a H7.</div>
</div>

<h2 id="netscore">Net Score por Item — onde estão as falhas</h2>
{chart_net}
<div class="card">
  <table>
    <thead><tr><th>Item (pior)</th><th>Net</th><th>% Alto</th><th>% Baixo</th></tr></thead>
    <tbody>{net_rows}</tbody>
  </table>
</div>

<h2 id="freeprem">Premium vs Free — diferença estatisticamente significativa em todos os blocos</h2>
{chart_free}
<div class="card">
  <table>
    <thead><tr><th>Bloco</th><th>Free</th><th>Premium</th><th>Δ</th><th>Mann-Whitney</th><th>Sig.</th></tr></thead>
    <tbody>{mw_rows}</tbody>
  </table>
</div>

<h2 id="correl">Correlações</h2>
{chart_hb}
{chart_hi}

<h2 id="cronbach">Confiabilidade dos Itens (Item-Total Correlation)</h2>
{chart_it}
<div class="card">
  <table>
    <thead><tr><th>Item</th><th>Bloco</th><th>r item-total</th><th>α sem item</th></tr></thead>
    <tbody>{problem_rows}</tbody>
  </table>
</div>

<h2 id="apriori">Regras de Associação (Apriori)</h2>
{chart_apri}
<div class="card">
  <h3 style="margin-bottom:12px;font-size:15px">Regras mais informativas (top por lift)</h3>
  <div style="font-family:'SF Mono',Menlo,Monaco,monospace;font-size:12px;line-height:1.7">
    <div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge bad">lift 5.95</span> H4=Baixo ⇒ H7=Baixo <span class="dim">(conf 0.90)</span></div>
    <div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge warn">lift 3.89</span> H7=Baixo ⇒ H8=Baixo <span class="dim">(conf 0.77)</span></div>
    <div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge ok">lift 2.52</span> D5=Baixo ⇒ E1=Baixo <span class="dim">(conf 0.91)</span></div>
    <div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="badge ok">lift 2.23</span> B3=Baixo ⇒ A3=Baixo <span class="dim">(conf 0.86)</span></div>
    <div style="padding:8px 0"><span class="badge ok">lift 1.70</span> H5=Alto ∧ H8=Alto ⇒ H7=Alto <span class="dim">(conf 0.91)</span></div>
  </div>
</div>

<h2 id="qual">Análise Qualitativa (perguntas abertas)</h2>
{chart_pareto}
<div class="card">
  <h3 style="margin-bottom:12px;font-size:15px">Citações representativas</h3>
  <blockquote style="border-left-color:var(--blue)">"Já limpei sem querer a barra de pesquisa e não consegui reverter." <span class="dim">— E51 (H3)</span></blockquote>
  <blockquote style="border-left-color:var(--amber)">"Confusão principalmente quando o aplicativo muda o layout ou algumas funções de lugar." <span class="dim">— E59 (H4)</span></blockquote>
  <blockquote style="border-left-color:var(--purple)">"Não ter como transferir músicas de uma playlist para a outra facilmente, tem q fazer uma a uma." <span class="dim">— E03 (H7)</span></blockquote>
  <blockquote style="border-left-color:var(--green)">"Deixaria o Spotify mais limpo. São muitas informações desnecessárias." <span class="dim">— E19 (H8)</span></blockquote>
</div>

<h2>Qualidade dos Dados &amp; Perfil</h2>
{chart_dur}
{chart_demo}

<h2 id="proto">Recomendações para o Protótipo (priorizadas por evidência)</h2>
<div class="card">
<ul class="rec">
<li><div class="n">1</div><div><strong>Snackbar "Desfazer" persistente em ações de playlist</strong><div class="why">A3 Net Score = −21,1 (único item negativo); 46,5% baixo; relatos E51, E83. <span class="tag">H3</span> <span class="tag">esforço baixo</span></div></div></li>
<li><div class="n">2</div><div><strong>Modo "Home minimalista" (ocultar promoções/podcasts pré-instalados)</strong><div class="why">E4 Net +1,2 / E1 Net +5,8; 13 menções qualitativas; regra D5=Baixo ⇒ E4=Baixo lift 2,01. <span class="tag">H8</span> <span class="tag">esforço médio</span></div></div></li>
<li><div class="n">3</div><div><strong>Separar visualmente "Curtir" de "Adicionar a playlist"</strong><div class="why">H5 com α=0,67; relatos E08, E13. <span class="tag">H5</span> <span class="tag">esforço baixo</span></div></div></li>
<li><div class="n">4</div><div><strong>Seleção múltipla em playlists (mover/remover em lote)</strong><div class="why">H7 com 9 menções; E03, E51, E86. <span class="tag">H7</span> <span class="tag">esforço médio</span></div></div></li>
<li><div class="n">5</div><div><strong>Migração progressiva em redesigns (coach marks, "manter layout antigo" por 30 dias)</strong><div class="why">H4=Baixo ⇒ H7=Baixo lift 5,95; E02, E20, E59. <span class="tag">H4→H7</span> <span class="tag">esforço alto</span></div></div></li>
<li><div class="n">6</div><div><strong>Indicação visual de configurações persistentes (shuffle desativado fica desativado)</strong><div class="why">A5 = 3,79 mas itens H5 fracos; relato E35. <span class="tag">H5/H3</span> <span class="tag">esforço baixo</span></div></div></li>
<li><div class="n">7</div><div><strong>Repensar onboarding e UX do plano Free</strong><div class="why">Free 0,5–0,8 pontos abaixo em <em>todos</em> os blocos (Mann-Whitney p&lt;0,05 em 5/5); 14 menções a propaganda. <span class="tag">cross-plan</span> <span class="tag">esforço estratégico</span></div></div></li>
</ul>
</div>

<footer>
Gerado por <code>analise.py</code> + <code>analise_extra.py</code> + <code>build_dashboard.py</code> · figuras a 220 DPI.<br>
Metodologia: Território n. 04 (Sergio Freitas) · IHC 2026/1.<br>
<span class="dim">Atalhos: <kbd>Click</kbd> para ampliar · <kbd>Scroll</kbd>/<kbd>+</kbd>/<kbd>−</kbd> para zoom · <kbd>0</kbd> reset · <kbd>Esc</kbd> fechar · <kbd>←/→</kbd> navegar.</span>
</footer>

</div>

<!-- LIGHTBOX -->
<div class="lightbox" id="lb" role="dialog" aria-modal="true" aria-labelledby="lb-title">
  <div class="lb-content">
    <div class="lb-header">
      <div class="lb-title" id="lb-title">—</div>
      <div class="lb-controls">
        <button class="lb-btn" id="lb-prev" aria-label="Anterior">‹</button>
        <button class="lb-btn" id="lb-zoom-out" aria-label="Diminuir zoom">−</button>
        <span class="lb-zoom" id="lb-zoom-val">100%</span>
        <button class="lb-btn" id="lb-zoom-in" aria-label="Aumentar zoom">+</button>
        <button class="lb-btn" id="lb-reset" aria-label="Resetar zoom">⟳</button>
        <button class="lb-btn" id="lb-next" aria-label="Próximo">›</button>
        <button class="lb-btn" id="lb-close" aria-label="Fechar" title="Esc">✕</button>
      </div>
    </div>
    <div class="lb-stage" id="lb-stage">
      <img id="lb-img" src="" alt="">
    </div>
    <div class="lb-footer">
      <kbd>Scroll</kbd> ou <kbd>+/−</kbd> zoom · <kbd>0</kbd> reset · <kbd>←/→</kbd> navegar · <kbd>Esc</kbd> fechar · arraste para pan
    </div>
  </div>
</div>

<script>
// Coleta os blocos de gráfico do DOM (sem duplicar base64)
const WRAPS = Array.from(document.querySelectorAll('.chart-wrap'));
const ORDER = WRAPS.map(w => w.dataset.img);
let lbIdx = 0, zoom = 1, panX = 0, panY = 0, dragging = false, dragStart = null;

const lb       = document.getElementById('lb');
const lbImg    = document.getElementById('lb-img');
const lbTitle  = document.getElementById('lb-title');
const lbStage  = document.getElementById('lb-stage');
const lbZoomVal= document.getElementById('lb-zoom-val');

function applyTransform() {{
  lbImg.style.transform = `translate(${{panX}}px, ${{panY}}px) scale(${{zoom}})`;
  lbZoomVal.textContent = Math.round(zoom * 100) + '%';
  lbImg.classList.toggle('zoomed', zoom > 1.001);
}}
function setZoom(z, cx=null, cy=null) {{
  z = Math.max(0.5, Math.min(z, 6));
  if (cx !== null && cy !== null) {{
    // zoom toward cursor
    const r = lbStage.getBoundingClientRect();
    const ox = cx - r.left - r.width/2 - panX;
    const oy = cy - r.top  - r.height/2 - panY;
    const ratio = z / zoom;
    panX -= ox * (ratio - 1);
    panY -= oy * (ratio - 1);
  }}
  zoom = z; applyTransform();
}}
function resetZoom() {{ zoom = 1; panX = 0; panY = 0; applyTransform(); }}

function openLb(idx) {{
  lbIdx = (idx + WRAPS.length) % WRAPS.length;
  const wrap = WRAPS[lbIdx];
  lbImg.src = wrap.querySelector('img').src;
  lbTitle.textContent = wrap.dataset.title || wrap.dataset.img;
  resetZoom();
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}}
function closeLb() {{ lb.classList.remove('active'); document.body.style.overflow = ''; }}

WRAPS.forEach((el, idx) => {{
  el.addEventListener('click', () => openLb(idx));
  el.addEventListener('keydown', e => {{
    if (e.key === 'Enter' || e.key === ' ') {{ e.preventDefault(); openLb(idx); }}
  }});
}});

document.getElementById('lb-close').onclick    = closeLb;
document.getElementById('lb-prev').onclick     = () => openLb(lbIdx - 1);
document.getElementById('lb-next').onclick     = () => openLb(lbIdx + 1);
document.getElementById('lb-zoom-in').onclick  = () => setZoom(zoom * 1.25);
document.getElementById('lb-zoom-out').onclick = () => setZoom(zoom / 1.25);
document.getElementById('lb-reset').onclick    = resetZoom;

lb.addEventListener('click', e => {{ if (e.target === lb) closeLb(); }});

// Wheel zoom
lbStage.addEventListener('wheel', e => {{
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.15 : 1/1.15;
  setZoom(zoom * factor, e.clientX, e.clientY);
}}, {{ passive: false }});

// Pan
lbStage.addEventListener('mousedown', e => {{
  if (zoom <= 1.001) return;
  dragging = true; dragStart = {{ x: e.clientX - panX, y: e.clientY - panY }};
  e.preventDefault();
}});
window.addEventListener('mousemove', e => {{
  if (!dragging) return;
  panX = e.clientX - dragStart.x; panY = e.clientY - dragStart.y;
  applyTransform();
}});
window.addEventListener('mouseup', () => dragging = false);

// Double-click zoom toggle
lbImg.addEventListener('dblclick', e => {{
  e.preventDefault();
  if (zoom > 1.5) resetZoom(); else setZoom(2.5, e.clientX, e.clientY);
}});

// Keyboard
document.addEventListener('keydown', e => {{
  if (!lb.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLb();
  else if (e.key === 'ArrowLeft')   openLb(lbIdx - 1);
  else if (e.key === 'ArrowRight')  openLb(lbIdx + 1);
  else if (e.key === '+' || e.key === '=') setZoom(zoom * 1.25);
  else if (e.key === '-')      setZoom(zoom / 1.25);
  else if (e.key === '0')      resetZoom();
}});

// Smooth scroll TOC
document.querySelectorAll('.toc a').forEach(a => {{
  a.addEventListener('click', e => {{
    e.preventDefault();
    document.querySelector(a.getAttribute('href')).scrollIntoView({{ behavior: 'smooth', block: 'start' }});
  }});
}});
</script>

</body></html>
"""

with open('dashboard.html','w',encoding='utf-8') as f:
    f.write(HTML)
print(f"[ok] dashboard.html v2 gerado ({os.path.getsize('dashboard.html')/1024:.0f} KB)")
print(f"     - lightbox com zoom (scroll/+/−/dbl-click/teclado)")
print(f"     - explicações por gráfico (como ler · cores · achado)")
print(f"     - TOC com smooth-scroll")
print(f"     - 10 figuras a 220 DPI")
