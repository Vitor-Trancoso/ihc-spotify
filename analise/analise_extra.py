"""
Análises adicionais e visualizações — Spotify Mobile IHC
- Item-total correlation (detecção de itens fracos)
- Spearman + correção Bonferroni
- Cross-tab Premium vs Free vs Frequência
- Net Score (% Alto − % Baixo) por item e por bloco
- Duração das respostas (qualidade)
- Pareto qualitativo
- Figuras PNG (paleta Spotify dark) + dashboard HTML
"""
import os, json, re
from itertools import combinations
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib as mpl
from matplotlib.colors import LinearSegmentedColormap
from scipy import stats
import openpyxl

BASE = '/Users/vitormarconi/Documents/GitHub/ihc-spotify/analise'
FIG  = os.path.join(BASE, 'figuras')
os.makedirs(FIG, exist_ok=True)
os.chdir(BASE)

# =================== PALETA SPOTIFY DARK ===================
SPOT = {
    'bg':       '#121212',
    'card':     '#181818',
    'card_hi':  '#282828',
    'border':   '#2A2A2A',
    'text':     '#FFFFFF',
    'text_dim': '#B3B3B3',
    'text_sub': '#7A7A7A',
    'green':    '#1DB954',
    'green_hi': '#1ED760',
    'red':      '#E22134',
    'amber':    '#FFA42B',
    'blue':     '#60A5FA',
}
mpl.rcParams.update({
    'figure.facecolor':    SPOT['bg'],
    'axes.facecolor':      SPOT['card'],
    'axes.edgecolor':      SPOT['border'],
    'axes.labelcolor':     SPOT['text'],
    'axes.titlecolor':     SPOT['text'],
    'xtick.color':         SPOT['text_dim'],
    'ytick.color':         SPOT['text_dim'],
    'text.color':          SPOT['text'],
    'font.family':         'DejaVu Sans',
    'font.size':           11,
    'axes.titleweight':    'bold',
    'axes.grid':           True,
    'grid.color':          SPOT['border'],
    'grid.alpha':          0.6,
    'grid.linestyle':      '-',
    'grid.linewidth':      0.5,
    'savefig.facecolor':   SPOT['bg'],
    'savefig.bbox':        'tight',
    'savefig.dpi':         220,
})

# Colormap divergente: vermelho (baixo) → cinza (neutro) → verde (alto)
CMAP_DIV = LinearSegmentedColormap.from_list(
    'spot_div', [SPOT['red'], '#3A3A3A', SPOT['green']], N=256)
CMAP_HEAT = LinearSegmentedColormap.from_list(
    'spot_heat', ['#1F1F1F', '#0E3F2A', SPOT['green']], N=256)

# =================== CARGA ===================
df = pd.read_csv('dados.csv', sep=';')
COLS = [c for c in df.columns if re.match(r'^[A-E]\d_', c)]
for c in COLS: df[c] = pd.to_numeric(df[c], errors='coerce')

blocos = {
    'H3_Controle':       COLS[0:5],
    'H4_Consistencia':   COLS[5:10],
    'H5_PrevencaoErros': COLS[10:15],
    'H7_Flexibilidade':  COLS[15:20],
    'H8_Estetica':       COLS[20:24],
}
bloco_scores = pd.DataFrame({b: df[c].mean(axis=1, skipna=True) for b, c in blocos.items()})
N = len(df)
print(f"Carregado: n={N} respondentes, {len(COLS)} itens Likert")

# =================== 1. ITEM-TOTAL CORRELATION ===================
print("\n=== ITEM-TOTAL CORRELATION (alpha-if-deleted) ===")
def cronbach(d):
    d = d.dropna(how='any'); k = d.shape[1]
    if d.shape[0] < 2 or k < 2: return float('nan')
    return (k/(k-1))*(1 - d.var(0,ddof=1).sum()/d.sum(1).var(ddof=1))

rows_it = []
for b, cols in blocos.items():
    a_full = cronbach(df[cols])
    for c in cols:
        rest = [x for x in cols if x != c]
        total_rest = df[rest].sum(axis=1)
        valid = df[c].notna() & total_rest.notna()
        r_it = df.loc[valid, c].corr(total_rest[valid])
        a_drop = cronbach(df[rest])
        rows_it.append({'Bloco': b, 'Item': c,
                        'r_item_total': round(r_it, 3),
                        'alpha_bloco': round(a_full, 3),
                        'alpha_sem_item': round(a_drop, 3),
                        'delta': round(a_drop - a_full, 3)})
item_total = pd.DataFrame(rows_it).sort_values(['Bloco','r_item_total'])
print(item_total.to_string(index=False))
item_total.to_csv('saida_item_total.csv', sep=';', index=False)
print("\nItens problemáticos (r_item_total < 0.4 ou delta positivo > 0.02):")
problemas = item_total[(item_total['r_item_total'] < 0.4) | (item_total['delta'] > 0.02)]
print(problemas.to_string(index=False))

# =================== 2. SPEARMAN + BONFERRONI ===================
print("\n=== SPEARMAN + BONFERRONI (entre itens) ===")
def spearman_with_p(a, b):
    mask = a.notna() & b.notna()
    if mask.sum() < 5: return np.nan, np.nan
    rho, p = stats.spearmanr(a[mask], b[mask])
    return rho, p

pairs_sp = []
for a, b in combinations(COLS, 2):
    rho, p = spearman_with_p(df[a], df[b])
    pairs_sp.append({'Item_A': a, 'Item_B': b, 'rho': rho, 'p': p})
sp_df = pd.DataFrame(pairs_sp)
m = len(sp_df)
sp_df['p_bonferroni'] = (sp_df['p'] * m).clip(upper=1.0)
sp_df['sig_001'] = sp_df['p_bonferroni'] < 0.01
sp_df['sig_005'] = sp_df['p_bonferroni'] < 0.05
sp_df_sorted = sp_df.sort_values('rho', key=abs, ascending=False)
n_sig = sp_df['sig_005'].sum()
print(f"{m} pares testados | {n_sig} significativos após Bonferroni (α=0.05)")
print(f"Top 10 |ρ| (todos significativos com Bonferroni):")
print(sp_df_sorted.head(10).to_string(index=False))
sp_df_sorted.to_csv('saida_spearman_bonferroni.csv', sep=';', index=False)

# =================== 3. CROSS-TAB Premium vs Free, Frequência ===================
print("\n=== CROSS-TAB: PREMIUM vs FREE (média do score por bloco) ===")
def norm_conta(s):
    s = str(s).lower()
    if 'free' in s or 'gratuit' in s: return 'Free'
    if 'premium' in s or 'paga' in s: return 'Premium'
    return 'Outro'
df['_conta'] = df['Conta'].apply(norm_conta)
bloco_scores['_conta'] = df['_conta']

ct_conta = bloco_scores.groupby('_conta')[list(blocos)].agg(['mean','std','count']).round(2)
print(ct_conta.to_string())
ct_simple = bloco_scores.groupby('_conta')[list(blocos)].mean().round(2)
ct_simple.to_csv('saida_crosstab_conta.csv', sep=';')

# Teste Mann-Whitney para diferença Premium vs Free
print("\nMann-Whitney U Premium vs Free por bloco:")
mw_rows = []
free  = bloco_scores[bloco_scores['_conta']=='Free']
prem  = bloco_scores[bloco_scores['_conta']=='Premium']
for b in blocos:
    f = free[b].dropna(); p = prem[b].dropna()
    if len(f) < 3 or len(p) < 3: continue
    u, pv = stats.mannwhitneyu(f, p, alternative='two-sided')
    mw_rows.append({'Bloco': b,
                    'Free_n': len(f), 'Free_media': round(f.mean(),2),
                    'Premium_n': len(p), 'Premium_media': round(p.mean(),2),
                    'diff': round(p.mean()-f.mean(),2),
                    'U': u, 'p': round(pv,4),
                    'sig': '***' if pv<.001 else '**' if pv<.01 else '*' if pv<.05 else ''})
mw = pd.DataFrame(mw_rows)
print(mw.to_string(index=False))
mw.to_csv('saida_mann_whitney_conta.csv', sep=';', index=False)

# =================== 4. NET SCORE (% Alto - % Baixo) ===================
print("\n=== NET SCORE por item ===")
net_rows = []
for b, cols in blocos.items():
    for c in cols:
        s = df[c].dropna()
        alto  = (s >= 4).mean() * 100
        baixo = (s <= 2).mean() * 100
        net_rows.append({'Bloco': b, 'Item': c, 'pct_alto': round(alto,1),
                         'pct_baixo': round(baixo,1), 'net': round(alto - baixo,1)})
net = pd.DataFrame(net_rows).sort_values('net')
print(net.to_string(index=False))
net.to_csv('saida_net_score.csv', sep=';', index=False)

# =================== 5. DURAÇÃO DAS RESPOSTAS ===================
print("\n=== DURAÇÃO DAS RESPOSTAS (qualidade) ===")
wb = openpyxl.load_workbook('/Users/vitormarconi/Documents/GitHub/ihc-spotify/docs/questionario/Questionário de Avaliação de Usabilidade — Spotify Mobile(1-90)-2.xlsx')
ws = wb['Sheet1']
rows = list(ws.iter_rows(values_only=True))
dur = []
for r in rows[1:]:
    consent = str(r[6] or ''); usou = str(r[7] or '')
    if 'Concordo em participar' not in consent: continue
    if not usou.startswith('Sim'): continue
    inicio = r[1]; fim = r[2]
    if inicio and fim:
        secs = (fim - inicio).total_seconds()
        dur.append(secs)
dur = pd.Series(dur)
print(f"n={len(dur)} | min={dur.min():.0f}s | mediana={dur.median():.0f}s | máx={dur.max():.0f}s | média={dur.mean():.0f}s")
print(f"Respondentes < 60s (suspeitos):  {(dur < 60).sum()}  ({(dur<60).mean()*100:.1f}%)")
print(f"Respondentes < 120s (rápidos):   {(dur < 120).sum()}  ({(dur<120).mean()*100:.1f}%)")
print(f"Quartis: q25={dur.quantile(.25):.0f}s | q75={dur.quantile(.75):.0f}s")

# =================== 6. TEMAS QUALITATIVOS (Pareto) ===================
TEMAS = [
    ('Propaganda excessiva (Free)', 14, 'externo'),
    ('H8 — Poluição visual', 13, 'H8'),
    ('H7 — Recomendações inadequadas', 11, 'H7'),
    ('Performance (lentidão, bugs)', 10, 'externo'),
    ('H7 — Gestão de playlists', 9, 'H7'),
    ('Elogios espontâneos', 12, 'positivo'),
    ('H3 — Ações irreversíveis', 5, 'H3'),
    ('H4 — Atualizações desorientam', 4, 'H4'),
    ('Qualidade de áudio', 4, 'externo'),
    ('H7 — Modo aleatório falho', 4, 'H7'),
    ('H5 — Adicionar/curtir confuso', 3, 'H5'),
    ('H7 — Download offline falho', 3, 'H7'),
]

# ====================================================================
# =====================  FIGURAS PNG  ================================
# ====================================================================

# --- FIG 1: Heatmap correlação ITEM-ITEM ---
print("\n[fig] heatmap item-item …")
item_corr = df[COLS].corr(method='pearson')
fig, ax = plt.subplots(figsize=(12, 10))
im = ax.imshow(item_corr, cmap=CMAP_HEAT, vmin=0, vmax=1, aspect='auto')
ax.set_xticks(range(len(COLS))); ax.set_xticklabels(COLS, rotation=90, fontsize=8)
ax.set_yticks(range(len(COLS))); ax.set_yticklabels(COLS, fontsize=8)
ax.set_title('Matriz de Correlação (Pearson) — 24 itens Likert', pad=15, fontsize=14)
# anotações apenas para |r| >= 0.5
for i in range(len(COLS)):
    for j in range(len(COLS)):
        v = item_corr.iloc[i, j]
        if abs(v) >= 0.5 and i != j:
            ax.text(j, i, f'{v:.2f}', ha='center', va='center',
                    color=SPOT['text'] if v >= 0.7 else SPOT['text_dim'], fontsize=6)
cb = plt.colorbar(im, ax=ax, shrink=0.7); cb.ax.tick_params(colors=SPOT['text_dim'])
cb.set_label('Pearson r', color=SPOT['text_dim'])
plt.savefig(os.path.join(FIG,'fig1_heatmap_itens.png')); plt.close()

# --- FIG 2: Heatmap correlação BLOCO-BLOCO ---
print("[fig] heatmap blocos …")
bc = bloco_scores[list(blocos)].corr(method='pearson')
fig, ax = plt.subplots(figsize=(7, 6))
im = ax.imshow(bc, cmap=CMAP_HEAT, vmin=0.5, vmax=1)
labels = [b.replace('_',' ').replace('Prevencao','Prev.') for b in bc.columns]
ax.set_xticks(range(len(labels))); ax.set_xticklabels(labels, rotation=30, ha='right', fontsize=10)
ax.set_yticks(range(len(labels))); ax.set_yticklabels(labels, fontsize=10)
for i in range(len(labels)):
    for j in range(len(labels)):
        v = bc.iloc[i,j]
        ax.text(j,i,f'{v:.2f}', ha='center', va='center',
                color=SPOT['bg'] if v >= 0.85 else SPOT['text'], fontweight='bold')
ax.set_title('Correlação de Pearson entre Blocos (Heurísticas)', pad=15, fontsize=13)
cb = plt.colorbar(im, ax=ax, shrink=0.8); cb.ax.tick_params(colors=SPOT['text_dim'])
plt.savefig(os.path.join(FIG,'fig2_heatmap_blocos.png')); plt.close()

# --- FIG 3: Net Score divergente ---
print("[fig] net score divergente …")
net_sorted = net.sort_values('net')
fig, ax = plt.subplots(figsize=(10, 9))
colors = [SPOT['red'] if v < 0 else SPOT['amber'] if v < 20 else SPOT['green'] for v in net_sorted['net']]
bars = ax.barh(net_sorted['Item'], net_sorted['net'], color=colors, edgecolor=SPOT['border'])
ax.axvline(0, color=SPOT['text_sub'], lw=1)
ax.set_xlabel('Net Score (% Alto − % Baixo)')
ax.set_title('Net Score por Item (positivo = bem avaliado)', pad=12, fontsize=13)
for bar, v in zip(bars, net_sorted['net']):
    x = v + (1.5 if v >= 0 else -1.5)
    ax.text(x, bar.get_y()+bar.get_height()/2, f'{v:+.0f}',
            va='center', ha='left' if v>=0 else 'right',
            color=SPOT['text'], fontsize=9, fontweight='bold')
ax.set_xlim(net_sorted['net'].min()-15, net_sorted['net'].max()+15)
plt.savefig(os.path.join(FIG,'fig3_net_score.png')); plt.close()

# --- FIG 4: Pareto temas qualitativos ---
print("[fig] pareto qualitativo …")
tdf = pd.DataFrame(TEMAS, columns=['tema','n','cat']).sort_values('n', ascending=False)
total = tdf['n'].sum()
tdf['pct_cum'] = tdf['n'].cumsum() / total * 100
cat_color = {'H3':SPOT['blue'],'H4':SPOT['amber'],'H5':SPOT['red'],
             'H7':'#A855F7','H8':SPOT['green'],'externo':SPOT['text_sub'],'positivo':SPOT['green_hi']}
fig, ax1 = plt.subplots(figsize=(11, 6))
bars = ax1.bar(range(len(tdf)), tdf['n'], color=[cat_color[c] for c in tdf['cat']],
               edgecolor=SPOT['border'])
ax1.set_xticks(range(len(tdf))); ax1.set_xticklabels(tdf['tema'], rotation=35, ha='right', fontsize=9)
ax1.set_ylabel('Menções')
ax1.set_title('Pareto dos Temas Qualitativos (n=86)', pad=12, fontsize=13)
ax2 = ax1.twinx()
ax2.plot(range(len(tdf)), tdf['pct_cum'], color=SPOT['green_hi'], marker='o', lw=2)
ax2.axhline(80, color=SPOT['amber'], lw=1, ls='--', alpha=0.6)
ax2.set_ylabel('% acumulado', color=SPOT['green_hi'])
ax2.set_ylim(0, 105); ax2.grid(False)
ax2.tick_params(colors=SPOT['text_dim'])
for bar, n in zip(bars, tdf['n']):
    ax1.text(bar.get_x()+bar.get_width()/2, n+0.3, str(n), ha='center', color=SPOT['text'], fontsize=9)
plt.savefig(os.path.join(FIG,'fig4_pareto_qualitativo.png')); plt.close()

# --- FIG 5: Apriori scatter sup x conf x lift ---
print("[fig] apriori scatter …")
apri = pd.read_csv('saida_apriori_itens.csv', sep=';')
apri = apri.dropna(subset=['sup','conf','lift'])
fig, ax = plt.subplots(figsize=(10, 6.5))
sizes = (apri['lift'] - apri['lift'].min())*150 + 20
sc = ax.scatter(apri['sup'], apri['conf'], c=apri['lift'], s=sizes,
                cmap=CMAP_HEAT, alpha=0.65, edgecolors=SPOT['border'], linewidths=0.4)
ax.set_xlabel('Suporte'); ax.set_ylabel('Confiança')
ax.set_title(f'Regras Apriori (n={len(apri)}) — cor e tamanho = lift', pad=12, fontsize=13)
cb = plt.colorbar(sc, ax=ax); cb.set_label('Lift', color=SPOT['text_dim'])
cb.ax.tick_params(colors=SPOT['text_dim'])
plt.savefig(os.path.join(FIG,'fig5_apriori_scatter.png')); plt.close()

# --- FIG 6: Cross-tab Free vs Premium ---
print("[fig] free vs premium …")
fig, ax = plt.subplots(figsize=(10, 5.5))
groups = ['Free', 'Premium']
x = np.arange(len(blocos)); w = 0.35
for i, g in enumerate(groups):
    vals = [bloco_scores.loc[bloco_scores['_conta']==g, b].mean() for b in blocos]
    color = SPOT['amber'] if g=='Free' else SPOT['green']
    bars = ax.bar(x + (i-0.5)*w, vals, w, label=f'{g} (n={(bloco_scores["_conta"]==g).sum()})',
                  color=color, edgecolor=SPOT['border'])
    for bar, v in zip(bars, vals):
        ax.text(bar.get_x()+w/2, v+0.05, f'{v:.2f}', ha='center', fontsize=9, color=SPOT['text'])
ax.set_xticks(x); ax.set_xticklabels([b.replace('_',' ') for b in blocos], rotation=15, ha='right')
ax.set_ylabel('Score médio (1-5)'); ax.set_ylim(0, 5)
ax.axhline(3, color=SPOT['text_sub'], lw=0.7, ls='--')
ax.legend(facecolor=SPOT['card'], edgecolor=SPOT['border'], labelcolor=SPOT['text'])
ax.set_title('Score Médio por Bloco: Free vs Premium', pad=12, fontsize=13)
plt.savefig(os.path.join(FIG,'fig6_free_vs_premium.png')); plt.close()

# --- FIG 7: Distribuição de duração ---
print("[fig] duração …")
fig, ax = plt.subplots(figsize=(10, 4.5))
clipped = dur.clip(upper=dur.quantile(0.95))
ax.hist(clipped, bins=30, color=SPOT['green'], edgecolor=SPOT['border'])
ax.axvline(60, color=SPOT['red'], lw=1.5, ls='--', label='60s (suspeito)')
ax.axvline(dur.median(), color=SPOT['amber'], lw=1.5, ls='--', label=f'mediana = {dur.median():.0f}s')
ax.set_xlabel('Duração da resposta (s, truncado em p95)')
ax.set_ylabel('Frequência')
ax.set_title('Distribuição da Duração das Respostas', pad=12, fontsize=13)
ax.legend(facecolor=SPOT['card'], edgecolor=SPOT['border'], labelcolor=SPOT['text'])
plt.savefig(os.path.join(FIG,'fig7_duracao.png')); plt.close()

# --- FIG 8: Item-total correlation por bloco ---
print("[fig] item-total …")
fig, ax = plt.subplots(figsize=(10, 7))
itl = item_total.sort_values(['Bloco','r_item_total'])
colors_it = [SPOT['red'] if r < 0.4 else SPOT['amber'] if r < 0.5 else SPOT['green']
             for r in itl['r_item_total']]
bars = ax.barh(itl['Item'], itl['r_item_total'], color=colors_it, edgecolor=SPOT['border'])
ax.axvline(0.4, color=SPOT['red'], lw=0.8, ls='--', alpha=0.5, label='Limiar 0.4 (problema)')
ax.axvline(0.5, color=SPOT['amber'], lw=0.8, ls='--', alpha=0.5)
ax.set_xlabel('Correlação item-total (no bloco)')
ax.set_title('Item-Total Correlation — itens que sustentam o construto', pad=12, fontsize=13)
ax.legend(facecolor=SPOT['card'], edgecolor=SPOT['border'], labelcolor=SPOT['text'])
for bar, v in zip(bars, itl['r_item_total']):
    ax.text(v+0.01, bar.get_y()+bar.get_height()/2, f'{v:.2f}',
            va='center', color=SPOT['text'], fontsize=8)
plt.savefig(os.path.join(FIG,'fig8_item_total.png')); plt.close()

# --- FIG 9: Demografia (4-panel) ---
print("[fig] demografia …")
fig, axes = plt.subplots(2, 2, figsize=(12, 7))
for ax, (col, title) in zip(axes.flat, [
    ('Idade','Faixa Etária'),('Conta','Tipo de Conta'),
    ('Frequencia','Frequência de Uso'),('Horas','Horas por Semana')]):
    vc = df[col].value_counts()
    ax.barh(range(len(vc)), vc.values, color=SPOT['green'], edgecolor=SPOT['border'])
    ax.set_yticks(range(len(vc)))
    ax.set_yticklabels([str(x)[:35] for x in vc.index], fontsize=9)
    ax.set_title(title, fontsize=11)
    ax.invert_yaxis()
    for i, v in enumerate(vc.values):
        ax.text(v+0.5, i, f'{v} ({v/N*100:.0f}%)', va='center', fontsize=8, color=SPOT['text'])
plt.suptitle(f'Perfil Demográfico (n={N})', fontsize=14, color=SPOT['text'])
plt.tight_layout()
plt.savefig(os.path.join(FIG,'fig9_demografia.png')); plt.close()

# --- FIG 10: Score por bloco com barras de erro ---
print("[fig] score por bloco …")
fig, ax = plt.subplots(figsize=(10, 5))
means = [bloco_scores[b].mean() for b in blocos]
stds  = [bloco_scores[b].std()/np.sqrt(bloco_scores[b].count()) for b in blocos]
colors_b = [SPOT['green'] if m > 3.5 else SPOT['amber'] if m > 3 else SPOT['red'] for m in means]
bars = ax.bar([b.replace('_',' ') for b in blocos], means, yerr=stds,
              color=colors_b, edgecolor=SPOT['border'], capsize=5,
              error_kw={'ecolor': SPOT['text_dim']})
ax.axhline(3, color=SPOT['text_sub'], lw=0.7, ls='--', label='Neutro')
ax.axhline(3.5, color=SPOT['green'], lw=0.7, ls=':', alpha=0.5)
ax.set_ylim(0, 5); ax.set_ylabel('Score médio (1-5)')
ax.set_title('Score Médio por Bloco com IC 95% (erro padrão)', pad=12, fontsize=13)
for bar, v in zip(bars, means):
    ax.text(bar.get_x()+bar.get_width()/2, v+0.1, f'{v:.2f}',
            ha='center', fontsize=10, fontweight='bold', color=SPOT['text'])
ax.legend(facecolor=SPOT['card'], edgecolor=SPOT['border'], labelcolor=SPOT['text'])
plt.xticks(rotation=15)
plt.savefig(os.path.join(FIG,'fig10_score_blocos.png')); plt.close()

# =================== SAVE NUMERIC SUMMARY ===================
resumo_extra = {
    'item_total': item_total.to_dict(orient='records'),
    'spearman_top10': sp_df_sorted.head(10).to_dict(orient='records'),
    'spearman_sig_count_005': int(n_sig),
    'crosstab_conta': ct_simple.to_dict(),
    'mann_whitney_conta': mw.to_dict(orient='records'),
    'net_score': net.to_dict(orient='records'),
    'duracao_segundos': {
        'n': len(dur), 'min': float(dur.min()), 'q25': float(dur.quantile(.25)),
        'mediana': float(dur.median()), 'q75': float(dur.quantile(.75)),
        'max': float(dur.max()), 'media': float(dur.mean()),
        'pct_menos_60s': float((dur<60).mean()*100),
    },
    'temas_qualitativos': [{'tema':t,'n':n,'cat':c} for t,n,c in TEMAS],
}
with open('saida_resumo_extra.json','w') as f:
    json.dump(resumo_extra, f, ensure_ascii=False, indent=2, default=str)
print(f"\n[ok] 10 figuras salvas em {FIG}/")
print(f"[ok] resumo numérico em saida_resumo_extra.json")
