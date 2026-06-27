# =============================================================
# Análise de Dados — Avaliação de Usabilidade Spotify Mobile
# Pipeline conforme Território n. 04 (Sergio Freitas) e exemplo.R
# Equipe 01 — IHC 2026/1
# =============================================================

# ---- 0. Setup ----
pkgs <- c("psychometric", "arules")
for (p in pkgs) {
  if (!requireNamespace(p, quietly = TRUE)) {
    install.packages(p, repos = "https://cloud.r-project.org", quiet = TRUE)
  }
}

# Caminho fixo p/ rodar via Rscript
setwd("/Users/vitormarconi/Documents/GitHub/ihc-spotify/docs/analise")

# ---- 1. Carga dos dados (separador ; como no exemplo.R do professor) ----
TodosDados.df <- read.csv2("dados.csv", stringsAsFactors = FALSE)
cat("=== AMOSTRA ===\n")
cat("Respondentes válidos:", nrow(TodosDados.df), "\n")
cat("Variáveis no arquivo:", ncol(TodosDados.df), "\n\n")

# ---- 2. Definição das colunas Likert e dos blocos por heurística ----
colunas.var <- c(
  # Bloco A — H3 Controle e Liberdade
  "A1_VoltarTela","A2_ControleRepr","A3_DesfazerPlay","A4_CancelarAcao","A5_RespeitaConfig",
  # Bloco B — H4 Consistência e Padrões
  "B1_SemelhApps","B2_IconesEsperados","B3_LayoutConsist","B4_AcharAposUpd","B5_PrevisivBotoes",
  # Bloco C — H5 Prevenção de Erros
  "C1_SemAcidente","C2_ControlesPos","C3_SugestoesBusca","C4_AvisoPerda","C5_TocaRapido",
  # Bloco D — H7 Flexibilidade e Eficiência
  "D1_AcoesRapidas","D2_Recomendacoes","D3_GerirPlaylists","D4_AdaptaUso","D5_TelasLimpas",
  # Bloco E — H8 Estética e Design Minimalista
  "E1_SemDistracao","E2_InfoVisivel","E3_Estetica","E4_HomeRelevante"
)

blocos <- list(
  H3_Controle        = colunas.var[1:5],
  H4_Consistencia    = colunas.var[6:10],
  H5_PrevencaoErros  = colunas.var[11:15],
  H7_Flexibilidade   = colunas.var[16:20],
  H8_Estetica        = colunas.var[21:24]
)

# Garantir tipo numérico (Likert 1–5)
for (c in colunas.var) TodosDados.df[[c]] <- as.numeric(TodosDados.df[[c]])

# ---- 3. Estatística descritiva por item ----
cat("=== DESCRITIVA POR ITEM ===\n")
desc.item <- data.frame(
  Item = colunas.var,
  N    = sapply(colunas.var, function(c) sum(!is.na(TodosDados.df[[c]]))),
  Media= round(sapply(colunas.var, function(c) mean(TodosDados.df[[c]], na.rm = TRUE)), 2),
  DP   = round(sapply(colunas.var, function(c) sd(TodosDados.df[[c]],   na.rm = TRUE)), 2),
  Mediana = sapply(colunas.var, function(c) median(TodosDados.df[[c]], na.rm = TRUE)),
  Pct_Baixo_1_2 = round(sapply(colunas.var, function(c) mean(TodosDados.df[[c]] <= 2, na.rm = TRUE)) * 100, 1),
  Pct_Alto_4_5  = round(sapply(colunas.var, function(c) mean(TodosDados.df[[c]] >= 4, na.rm = TRUE)) * 100, 1)
)
print(desc.item, row.names = FALSE)
write.csv2(desc.item, "saida_descritiva_itens.csv", row.names = FALSE)

# ---- 3b. Descritiva por bloco (score = média dos itens do bloco por respondente) ----
cat("\n=== DESCRITIVA POR BLOCO ===\n")
bloco.scores <- as.data.frame(lapply(blocos, function(cols) {
  rowMeans(TodosDados.df[, cols], na.rm = TRUE)
}))
desc.bloco <- data.frame(
  Bloco   = names(bloco.scores),
  Media   = round(sapply(bloco.scores, mean,   na.rm = TRUE), 2),
  DP      = round(sapply(bloco.scores, sd,     na.rm = TRUE), 2),
  Mediana = round(sapply(bloco.scores, median, na.rm = TRUE), 2),
  Min     = round(sapply(bloco.scores, min,    na.rm = TRUE), 2),
  Max     = round(sapply(bloco.scores, max,    na.rm = TRUE), 2),
  Pct_Baixo = round(sapply(bloco.scores, function(x) mean(x <= 2.5, na.rm = TRUE)) * 100, 1),
  Pct_Alto  = round(sapply(bloco.scores, function(x) mean(x >= 3.5, na.rm = TRUE)) * 100, 1)
)
print(desc.bloco, row.names = FALSE)
write.csv2(desc.bloco, "saida_descritiva_blocos.csv", row.names = FALSE)

# ---- 4. Alpha de Cronbach (global e por bloco) ----
cat("\n=== ALPHA DE CRONBACH ===\n")
library(psychometric)

interp_alpha <- function(a) {
  if (is.na(a))     return("NA")
  if (a >= 0.9)     return("EXCELENTE")
  if (a >= 0.8)     return("BOM")
  if (a >= 0.7)     return("ACEITAVEL")
  if (a >= 0.6)     return("QUESTIONAVEL")
  if (a >= 0.5)     return("POBRE")
  return("INACEITAVEL")
}

a.global <- alpha(TodosDados.df[colunas.var])
cat(sprintf("Global (24 itens):       alpha = %.3f  -> %s\n",
            a.global, interp_alpha(a.global)))

alpha.blocos <- sapply(blocos, function(cols) alpha(TodosDados.df[cols]))
for (b in names(alpha.blocos)) {
  cat(sprintf("%-22s alpha = %.3f  -> %s\n", b, alpha.blocos[b], interp_alpha(alpha.blocos[b])))
}

# ---- 5. Correlação de Pearson (entre blocos) ----
cat("\n=== CORRELACAO DE PEARSON (entre BLOCOS) ===\n")
V_Cor.bloco <- cor(bloco.scores, use = "pairwise.complete.obs", method = "pearson")
print(round(V_Cor.bloco, 3))
cat("\nsymnum (limiares 0.3/0.6/0.8/0.9/0.95):\n")
print(symnum(V_Cor.bloco))
write.csv2(round(V_Cor.bloco, 3), "saida_corr_blocos.csv")

interp_r <- function(r) {
  a <- abs(r)
  if (a > 0.9) return("Muito forte")
  if (a > 0.7) return("Forte")
  if (a > 0.5) return("Moderada")
  if (a > 0.3) return("Fraca")
  return("Desprezivel")
}
cat("\nPares de blocos ordenados por |r|:\n")
pares <- data.frame()
nm <- colnames(V_Cor.bloco)
for (i in 1:(length(nm)-1)) for (j in (i+1):length(nm)) {
  r <- V_Cor.bloco[i,j]
  pares <- rbind(pares, data.frame(A=nm[i], B=nm[j], r=round(r,3), interpretacao=interp_r(r)))
}
pares <- pares[order(-abs(pares$r)), ]
print(pares, row.names = FALSE)

# ---- 5b. Correlação Pearson item-a-item ----
cat("\n=== CORRELACOES FORTES ENTRE ITENS (|r| >= 0.5) ===\n")
V_Cor.item <- cor(TodosDados.df[colunas.var], use = "pairwise.complete.obs", method = "pearson")
fortes <- data.frame()
for (i in 1:(length(colunas.var)-1)) for (j in (i+1):length(colunas.var)) {
  r <- V_Cor.item[i,j]
  if (!is.na(r) && abs(r) >= 0.5) {
    fortes <- rbind(fortes,
      data.frame(Item_A = colunas.var[i], Item_B = colunas.var[j], r = round(r,3)))
  }
}
fortes <- fortes[order(-abs(fortes$r)), ]
print(head(fortes, 20), row.names = FALSE)
write.csv2(V_Cor.item, "saida_corr_itens.csv")
write.csv2(fortes, "saida_corr_fortes.csv", row.names = FALSE)

# ---- 6. Apriori — regras de associação ----
cat("\n=== APRIORI — REGRAS DE ASSOCIACAO ===\n")
library(arules)

# Discretiza Likert: 1-2=Baixo / 3=Neutro / 4-5=Alto (preserva NA)
discretiza <- function(v) {
  out <- rep(NA_character_, length(v))
  out[v <= 2 & !is.na(v)] <- "Baixo"
  out[v == 3 & !is.na(v)] <- "Neutro"
  out[v >= 4 & !is.na(v)] <- "Alto"
  factor(out, levels = c("Baixo","Neutro","Alto"))
}

# Versão 1: regras sobre os 5 BLOCOS (mais interpretável)
bloco.disc <- as.data.frame(lapply(bloco.scores, function(x) discretiza(round(x))))
g.bloco <- as(bloco.disc, "transactions")
r.bloco <- apriori(g.bloco,
                   parameter = list(supp = 0.10, conf = 0.60, minlen = 2, maxlen = 4),
                   control = list(verbose = FALSE))
cat(sprintf("Regras (blocos): %d  | supp >= 0.10, conf >= 0.60\n", length(r.bloco)))
r.bloco.sorted <- sort(r.bloco, by = "lift", decreasing = TRUE)
cat("\nTop 15 regras entre BLOCOS por LIFT:\n")
inspect(head(r.bloco.sorted, 15))
write(r.bloco.sorted, file = "saida_apriori_blocos.csv", sep = ";", quote = TRUE, row.names = FALSE)

# Versão 2: regras sobre ITENS (granularidade fina) — exigência maior de suporte
itens.disc <- as.data.frame(lapply(TodosDados.df[colunas.var], discretiza))
g.item <- as(itens.disc, "transactions")
r.item <- apriori(g.item,
                  parameter = list(supp = 0.20, conf = 0.80, minlen = 2, maxlen = 3),
                  control = list(verbose = FALSE))
cat(sprintf("\nRegras (itens): %d  | supp >= 0.20, conf >= 0.80\n", length(r.item)))
r.item.sorted <- sort(r.item, by = "lift", decreasing = TRUE)
cat("\nTop 20 regras entre ITENS por LIFT:\n")
inspect(head(r.item.sorted, 20))
write(r.item.sorted, file = "saida_apriori_itens.csv", sep = ";", quote = TRUE, row.names = FALSE)

# ---- 7. Demografia ----
cat("\n=== DEMOGRAFIA DA AMOSTRA VALIDA ===\n")
for (col in c("Idade","Escolaridade","Frequencia","Horas","Conta")) {
  cat("\n--", col, "--\n")
  tb <- sort(table(TodosDados.df[[col]], useNA = "ifany"), decreasing = TRUE)
  pct <- round(prop.table(tb) * 100, 1)
  print(data.frame(N = as.integer(tb), Pct = as.numeric(pct)))
}

cat("\n[ok] Análise concluída. Arquivos saida_*.csv gravados em ", getwd(), "\n", sep="")
