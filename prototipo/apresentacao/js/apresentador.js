/* ============================================================
   APRESENTAÇÃO — MODO APRESENTADOR (notas + timer)
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'apr-state-v1';

  const notesPanel = document.getElementById('apr-notes-panel');
  const timerEl    = document.getElementById('apr-timer');

  let timerState = loadState().timer || { running: false, mode: 'down', remaining: 20 * 60, elapsed: 0 };
  let tickId = null;

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  }
  function saveState(patch) {
    const cur = loadState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign(cur, patch)));
  }

  function fmt(secs) {
    secs = Math.max(0, Math.floor(secs));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  function renderTimer() {
    if (!timerEl) return;
    const v = timerState.mode === 'down' ? timerState.remaining : timerState.elapsed;
    timerEl.textContent = fmt(v);
    if (timerState.mode === 'down' && timerState.remaining <= 60) {
      timerEl.style.color = 'var(--apr-red)';
    } else {
      timerEl.style.color = 'var(--apr-green-br)';
    }
  }

  function tick() {
    if (timerState.mode === 'down') {
      timerState.remaining = Math.max(0, timerState.remaining - 1);
      if (timerState.remaining === 0) stopTimer();
    } else {
      timerState.elapsed += 1;
    }
    saveState({ timer: timerState });
    renderTimer();
  }

  function startTimer() {
    if (tickId) return;
    timerState.running = true;
    tickId = setInterval(tick, 1000);
    saveState({ timer: timerState });
  }
  function stopTimer() {
    timerState.running = false;
    if (tickId) { clearInterval(tickId); tickId = null; }
    saveState({ timer: timerState });
  }

  function toggleTimer() {
    if (!timerEl) return;
    if (timerEl.hidden) {
      timerEl.hidden = false;
      renderTimer();
      startTimer();
    } else {
      if (timerState.running) {
        stopTimer();
      } else {
        // hidden again — reset
        timerEl.hidden = true;
        stopTimer();
      }
    }
  }

  function renderNotes() {
    if (!notesPanel) return;
    const active = document.querySelector('.slide.is-active');
    const notes = active ? active.querySelector('.apr-notes') : null;
    const id    = active ? (active.dataset.slideId || active.id || '?') : '?';
    notesPanel.innerHTML = `<h4>Notas — slide ${id}</h4>` +
      (notes ? notes.innerHTML : '<p style="color:var(--apr-text-mute)">Sem notas para este slide.</p>');
  }

  function toggleNotes() {
    if (!notesPanel) return;
    notesPanel.hidden = !notesPanel.hidden;
    if (!notesPanel.hidden) renderNotes();
  }

  document.addEventListener('slide-enter', () => {
    if (notesPanel && !notesPanel.hidden) renderNotes();
  });

  document.addEventListener('keydown', (e) => {
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key === 'p' || e.key === 'P') { toggleNotes(); e.preventDefault(); }
    if (e.key === 't' || e.key === 'T') { toggleTimer(); e.preventDefault(); }
    if (e.key === 'r' || e.key === 'R') {
      // reset timer
      timerState = { running: false, mode: 'down', remaining: 20 * 60, elapsed: 0 };
      saveState({ timer: timerState });
      renderTimer();
    }
  });

  window.AprPres = { toggleNotes, toggleTimer };
})();
