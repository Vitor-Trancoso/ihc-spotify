/* ============================================================
   APP — roteador hash-based + iframe loader
   Rotas: #/t1 #/t2 #/t3 #/t4 #/t5
          #/controle/t1 ... #/controle/t5
          #/ma (snackbar demo) #/index (home)
   ============================================================ */

const ROTAS = {
  "t1": { src: "telas/t1.html",          titulo: "T1 — Home (redesign)" },
  "t2": { src: "telas/t2.html",          titulo: "T2 — Player (redesign)" },
  "t3": { src: "telas/t3.html",          titulo: "T3 — Biblioteca (redesign)" },
  "t4": { src: "telas/t4.html",          titulo: "T4 — Menu da música (redesign)" },
  "t5": { src: "telas/t5.html",          titulo: "T5 — Configurações (redesign)" },
  "ma": { src: "telas/ma.html",          titulo: "MA — Snackbar Desfazer" },
  "controle/t1": { src: "telas/controle/t1-atual.html", titulo: "T1 — Home (Spotify atual)" },
  "controle/t2": { src: "telas/controle/t2-atual.html", titulo: "T2 — Player (Spotify atual)" },
  "controle/t3": { src: "telas/controle/t3-atual.html", titulo: "T3 — Biblioteca (Spotify atual)" },
  "controle/t4": { src: "telas/controle/t4-atual.html", titulo: "T4 — Menu da música (Spotify atual)" },
  "controle/t5": { src: "telas/controle/t5-atual.html", titulo: "T5 — Configurações (Spotify atual)" }
};

function parseHash() {
  const h = (location.hash || "").replace(/^#\/?/, "").trim();
  return h;
}

function navegar(rota) {
  const stage   = document.getElementById("stage");
  const galeria = document.getElementById("galeria");
  const frame   = document.getElementById("stage-frame");
  const titulo  = document.getElementById("stage-titulo");
  const back    = document.getElementById("stage-back");

  if (!rota || rota === "index" || rota === "") {
    if (stage)   stage.hidden = true;
    if (galeria) galeria.hidden = false;
    if (back)    back.hidden = true;
    document.title = "Protótipo Spotify IHC";
    return;
  }

  const r = ROTAS[rota];
  if (!r) {
    location.hash = "";
    return;
  }
  if (stage)   stage.hidden = false;
  if (galeria) galeria.hidden = true;
  if (back)    back.hidden = false;
  if (titulo)  titulo.textContent = r.titulo;
  if (frame)   frame.src = r.src;
  document.title = `${r.titulo} — Protótipo Spotify IHC`;
}

function voltar() {
  location.hash = "";
}

window.addEventListener("hashchange", () => navegar(parseHash()));
window.addEventListener("DOMContentLoaded", () => {
  const back = document.getElementById("stage-back");
  if (back) back.addEventListener("click", voltar);
  navegar(parseHash());
});

window.APP = { navegar, voltar, ROTAS };
