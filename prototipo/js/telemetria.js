/* ============================================================
   TELEMETRIA — registra eventos em localStorage (CSV export)
   Uso: Telemetria.log("t2", "shuffle_toggle", { novoEstado: true })
        Telemetria.downloadCSV()
        Telemetria.clear()
   ============================================================ */

const NS = "ihc.telemetria.v1";
const SESSION_KEY = "ihc.session.id";

function uid() {
  return "s_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function sessionId() {
  let s = sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = uid();
    sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

function carregar() {
  try {
    return JSON.parse(localStorage.getItem(NS) || "[]");
  } catch (e) {
    return [];
  }
}

function salvar(arr) {
  try {
    localStorage.setItem(NS, JSON.stringify(arr));
  } catch (e) {
    /* quota — ignora */
  }
}

function log(tela, alvo, meta) {
  const evento = {
    ts: new Date().toISOString(),
    session: sessionId(),
    tela: tela || "?",
    alvo: alvo || "?",
    meta: meta ? JSON.stringify(meta) : ""
  };
  const arr = carregar();
  arr.push(evento);
  salvar(arr);
  if (window.console) console.debug("[telemetria]", evento);
  return evento;
}

function logEvent(tela, alvo, meta) { return log(tela, alvo, meta); }

function listar() { return carregar(); }

function clear() { localStorage.removeItem(NS); }

function toCSV() {
  const arr = carregar();
  const header = "timestamp,session,tela,alvo,meta\n";
  const linhas = arr.map(e => {
    const m = (e.meta || "").replace(/"/g, '""');
    return `"${e.ts}","${e.session}","${e.tela}","${e.alvo}","${m}"`;
  });
  return header + linhas.join("\n");
}

function downloadCSV(filename) {
  const csv = toCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `telemetria-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadLogs(filename) { return downloadCSV(filename); }

window.Telemetria = { log, logEvent, listar, clear, toCSV, downloadCSV, downloadLogs, sessionId };
