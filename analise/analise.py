"""
Análise de Dados — Avaliação de Usabilidade Spotify Mobile
Equivalente ao exemplo.R (Território n. 04 — Sergio Freitas / IHC)
Pipeline: Descritiva -> Alpha de Cronbach -> Correlação Pearson -> Apriori
"""
import pandas as pd
import numpy as np
from itertools import combinations
from collections import Counter
import json, os

BASE = '/Users/vitormarconi/Documents/GitHub/ihc-spotify/docs/analise'
os.chdir(BASE)

# ============ 1. CARGA ============
df = pd.read_csv('dados.csv', sep=';')
print(f"=== AMOSTRA ===")
print(f"Respondentes válidos: {len(df)}")
print(f"Variáveis no arquivo: {df.shape[1]}\n")

colunas_var = [
    'A1_VoltarTela','A2_ControleRepr','A3_DesfazerPlay','A4_CancelarAcao','A5_RespeitaConfig',
    'B1_SemelhApps','B2_IconesEsperados','B3_LayoutConsist','B4_AcharAposUpd','B5_PrevisivBotoes',
    'C1_SemAcidente','C2_ControlesPos','C3_SugestoesBusca','C4_AvisoPerda','C5_TocaRapido',
    'D1_AcoesRapidas','D2_Recomendacoes','D3_GerirPlaylists','D4_AdaptaUso','D5_TelasLimpas',
    'E1_SemDistracao','E2_InfoVisivel','E3_Estetica','E4_HomeRelevante',
]
blocos = {
    'H3_Controle':       colunas_var[0:5],
    'H4_Consistencia':   colunas_var[5:10],
    'H5_PrevencaoErros': colunas_var[10:15],
    'H7_Flexibilidade':  colunas_var[15:20],
    'H8_Estetica':       colunas_var[20:24],
}
for c in colunas_var:
    df[c] = pd.to_numeric(df[c], errors='coerce')

# ============ 2. DESCRITIVA POR ITEM ============
print("=== DESCRITIVA POR ITEM ===")
desc_rows = []
for bloco, cols in blocos.items():
    for c in cols:
        s = df[c].dropna()
        desc_rows.append({
            'Bloco': bloco, 'Item': c, 'N': len(s),
            'Media': round(s.mean(),2), 'DP': round(s.std(),2),
            'Mediana': s.median(),
            'Pct_Baixo_1_2': round((s<=2).mean()*100,1),
            'Pct_Neutro_3':  round((s==3).mean()*100,1),
            'Pct_Alto_4_5':  round((s>=4).mean()*100,1),
        })
desc = pd.DataFrame(desc_rows)
print(desc.to_string(index=False))
desc.to_csv('saida_descritiva_itens.csv', sep=';', index=False)

# ============ 2b. DESCRITIVA POR BLOCO ============
print("\n=== DESCRITIVA POR BLOCO (score = média dos itens) ===")
bloco_scores = pd.DataFrame({b: df[c].mean(axis=1, skipna=True) for b, c in blocos.items()})
desc_b = pd.DataFrame({
    'Bloco': list(blocos.keys()),
    'Media':   [round(bloco_scores[b].mean(),2)   for b in blocos],
    'DP':      [round(bloco_scores[b].std(),2)    for b in blocos],
    'Mediana': [round(bloco_scores[b].median(),2) for b in blocos],
    'Pct_Baixo_<=2.5': [round((bloco_scores[b]<=2.5).mean()*100,1) for b in blocos],
    'Pct_Alto_>=3.5':  [round((bloco_scores[b]>=3.5).mean()*100,1) for b in blocos],
})
print(desc_b.to_string(index=False))
desc_b.to_csv('saida_descritiva_blocos.csv', sep=';', index=False)

# ============ 3. ALPHA DE CRONBACH ============
def cronbach_alpha(d: pd.DataFrame):
    d = d.dropna(how='any')   # listwise deletion (como `psychometric::alpha`)
    k = d.shape[1]
    if d.shape[0] < 2 or k < 2: return float('nan'), 0
    var_items = d.var(axis=0, ddof=1).sum()
    var_total = d.sum(axis=1).var(ddof=1)
    if var_total == 0: return float('nan'), d.shape[0]
    return (k/(k-1)) * (1 - var_items/var_total), d.shape[0]

def interp_alpha(a):
    if pd.isna(a): return 'NA'
    if a >= 0.9: return 'EXCELENTE'
    if a >= 0.8: return 'BOM'
    if a >= 0.7: return 'ACEITAVEL'
    if a >= 0.6: return 'QUESTIONAVEL'
    if a >= 0.5: return 'POBRE'
    return 'INACEITAVEL'

print("\n=== ALPHA DE CRONBACH ===")
a_glob, n_glob = cronbach_alpha(df[colunas_var])
print(f"Global (24 itens):       alpha = {a_glob:.3f}  (n={n_glob} listwise)  -> {interp_alpha(a_glob)}")
alpha_blocos = {}
for b, cols in blocos.items():
    a, n = cronbach_alpha(df[cols])
    alpha_blocos[b] = a
    print(f"{b:<22} alpha = {a:.3f}  (n={n})         -> {interp_alpha(a)}")

# ============ 4. CORRELAÇÃO DE PEARSON ============
print("\n=== CORRELACAO DE PEARSON entre BLOCOS ===")
corr_b = bloco_scores.corr(method='pearson')
print(corr_b.round(3).to_string())
corr_b.round(3).to_csv('saida_corr_blocos.csv', sep=';')

def symnum(r):
    a = abs(r)
    if a >= 0.95: return 'B'
    if a >= 0.9:  return '*'
    if a >= 0.8:  return '+'
    if a >= 0.6:  return ','
    if a >= 0.3:  return '.'
    return ' '

print("\nsymnum (limiares: . 0.3 / , 0.6 / + 0.8 / * 0.9 / B 0.95):")
sym = corr_b.applymap(symnum)
print(sym.to_string())

def interp_r(r):
    a = abs(r)
    if a > 0.9: return 'Muito forte'
    if a > 0.7: return 'Forte'
    if a > 0.5: return 'Moderada'
    if a > 0.3: return 'Fraca'
    return 'Desprezivel'

print("\nPares de blocos ordenados por |r|:")
for a,b in sorted(combinations(corr_b.columns,2), key=lambda p: -abs(corr_b.loc[p[0],p[1]])):
    r = corr_b.loc[a,b]
    print(f"  {a:<22} ~ {b:<22} r={r:+.3f}  ({interp_r(r)})")

print("\n=== TOP CORRELACOES ITEM-A-ITEM (|r| >= 0.5) ===")
item_corr = df[colunas_var].corr(method='pearson')
strong = []
for a,b in combinations(colunas_var, 2):
    r = item_corr.loc[a,b]
    if abs(r) >= 0.5: strong.append((a, b, r))
strong.sort(key=lambda x: -abs(x[2]))
for a,b,r in strong[:20]:
    print(f"  {a:<22} ~ {b:<22} r={r:+.3f}")
pd.DataFrame(strong, columns=['Item_A','Item_B','r']).to_csv('saida_corr_fortes.csv', sep=';', index=False)

# ============ 5. APRIORI ============
def discretize(v):
    if pd.isna(v): return None
    if v <= 2: return 'Baixo'
    if v == 3: return 'Neutro'
    return 'Alto'

def apriori(items_per_tx, min_sup, min_conf, max_k=3):
    N = len(items_per_tx)
    def sup_count(itemset):
        return sum(1 for t in items_per_tx if itemset.issubset(t))
    # k=1
    c1 = Counter()
    for t in items_per_tx:
        for x in t: c1[x] += 1
    freq = {frozenset([x]): c/N for x,c in c1.items() if c/N >= min_sup}
    all_freq = dict(freq)
    prev = freq
    for k in range(2, max_k+1):
        items = sorted({i for s in prev for i in s})
        new = {}
        for combo in combinations(items, k):
            fs = frozenset(combo)
            s = sup_count(fs)/N
            if s >= min_sup: new[fs] = s
        all_freq.update(new)
        prev = new
        if not new: break
    rules = []
    for itemset, sup in all_freq.items():
        if len(itemset) < 2: continue
        for r_size in range(1, len(itemset)):
            for rhs_c in combinations(itemset, r_size):
                rhs = frozenset(rhs_c); lhs = itemset - rhs
                if not lhs: continue
                sup_lhs = all_freq.get(lhs); sup_rhs = all_freq.get(rhs)
                if sup_lhs is None or sup_rhs is None: continue
                conf = sup / sup_lhs
                lift = conf / sup_rhs
                if conf >= min_conf:
                    rules.append((tuple(sorted(lhs)), tuple(sorted(rhs)), sup, conf, lift))
    return rules

print("\n=== APRIORI — REGRAS DE ASSOCIACAO (BLOCOS) ===")
tx_bloco = []
for _, row in bloco_scores.iterrows():
    items = set()
    for b in bloco_scores.columns:
        v = row[b]
        if pd.isna(v): continue
        d = discretize(round(v))
        if d: items.add(f"{b}={d}")
    if items: tx_bloco.append(items)

rules_b = apriori(tx_bloco, min_sup=0.10, min_conf=0.60, max_k=3)
print(f"Transações: {len(tx_bloco)} | min_sup=0.10, min_conf=0.60 | regras: {len(rules_b)}")
print("\nTop 20 regras (blocos) por LIFT:")
for l, r, s, c, lf in sorted(rules_b, key=lambda x: -x[4])[:20]:
    print(f"  {{{', '.join(l)}}} => {{{', '.join(r)}}}  sup={s:.2f} conf={c:.2f} lift={lf:.2f}")
pd.DataFrame([{'se':' & '.join(l),'entao':' & '.join(r),'sup':round(s,3),'conf':round(c,3),'lift':round(lf,3)}
              for l,r,s,c,lf in sorted(rules_b, key=lambda x:-x[4])]).to_csv('saida_apriori_blocos.csv', sep=';', index=False)

print("\n=== APRIORI — REGRAS DE ASSOCIACAO (ITENS) ===")
tx_item = []
for _, row in df[colunas_var].iterrows():
    items = set()
    for c in colunas_var:
        d = discretize(row[c])
        if d: items.add(f"{c}={d}")
    if items: tx_item.append(items)

rules_i = apriori(tx_item, min_sup=0.20, min_conf=0.80, max_k=3)
print(f"Transações: {len(tx_item)} | min_sup=0.20, min_conf=0.80 | regras: {len(rules_i)}")
print("\nTop 25 regras (itens) por LIFT:")
for l, r, s, c, lf in sorted(rules_i, key=lambda x: -x[4])[:25]:
    print(f"  {{{', '.join(l)}}} => {{{', '.join(r)}}}  sup={s:.2f} conf={c:.2f} lift={lf:.2f}")
pd.DataFrame([{'se':' & '.join(l),'entao':' & '.join(r),'sup':round(s,3),'conf':round(c,3),'lift':round(lf,3)}
              for l,r,s,c,lf in sorted(rules_i, key=lambda x:-x[4])]).to_csv('saida_apriori_itens.csv', sep=';', index=False)

# ============ 6. DEMOGRAFIA ============
print("\n=== PERFIL DEMOGRAFICO ===")
for col, name in [('Idade','Faixa etária'),('Escolaridade','Escolaridade'),
                  ('Frequencia','Frequência de uso'),('Horas','Horas por semana'),('Conta','Tipo de conta')]:
    print(f"\n-- {name} --")
    vc = df[col].value_counts(dropna=False)
    for k,v in vc.items():
        print(f"  {str(k)[:55]:<57} N={v:>3}  ({v/len(df)*100:5.1f}%)")

# ============ SALVAR JSON RESUMO ============
resumo = {
    'n_validos': int(len(df)),
    'alpha_global': round(a_glob,3),
    'alpha_blocos': {k: round(v,3) for k,v in alpha_blocos.items()},
    'desc_blocos':  desc_b.to_dict(orient='records'),
    'corr_blocos':  corr_b.round(3).to_dict(),
    'top_regras_blocos': [
        {'se':list(l),'entao':list(r),'sup':round(s,3),'conf':round(c,3),'lift':round(lf,3)}
        for l,r,s,c,lf in sorted(rules_b, key=lambda x:-x[4])[:15]],
    'top_regras_itens': [
        {'se':list(l),'entao':list(r),'sup':round(s,3),'conf':round(c,3),'lift':round(lf,3)}
        for l,r,s,c,lf in sorted(rules_i, key=lambda x:-x[4])[:15]],
}
with open('saida_resumo.json','w') as f:
    json.dump(resumo, f, ensure_ascii=False, indent=2, default=str)
print(f"\n[ok] Resultados salvos em {BASE}/saida_*.csv|json")
