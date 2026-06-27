// Utilitário openModal/closeModal com focus trap, inert no background e restore
(function(){
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  let lastFocus = null;
  let trapHandler = null;
  let escHandler = null;
  let openEl = null;

  function getFocusable(el){
    return Array.from(el.querySelectorAll(FOCUSABLE)).filter(n => !n.hasAttribute('aria-hidden') && n.offsetParent !== null);
  }

  window.openModal = function(el, opts){
    opts = opts || {};
    if (!el) return;
    closeModal(); // fecha qualquer um aberto antes
    lastFocus = document.activeElement;
    openEl = el;
    // Inerte no resto da página
    document.querySelectorAll('main, header, nav, footer').forEach(n => {
      if (!el.contains(n)) n.setAttribute('inert', '');
    });
    document.body.classList.add('modal-open');
    el.removeAttribute('hidden');
    el.classList.add('is-open');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    // Foco no primeiro interativo
    const f = getFocusable(el);
    requestAnimationFrame(() => (f[0] || el).focus());
    // Trap
    trapHandler = (ev) => {
      if (ev.key !== 'Tab') return;
      const items = getFocusable(el);
      if (!items.length) { ev.preventDefault(); return; }
      const first = items[0], last = items[items.length-1];
      if (ev.shiftKey && document.activeElement === first){ ev.preventDefault(); last.focus(); }
      else if (!ev.shiftKey && document.activeElement === last){ ev.preventDefault(); first.focus(); }
    };
    escHandler = (ev) => { if (ev.key === 'Escape') closeModal(); };
    el.addEventListener('keydown', trapHandler);
    document.addEventListener('keydown', escHandler);
    if (opts.onClose) el._onClose = opts.onClose;
  };

  window.closeModal = function(){
    if (!openEl) return;
    const el = openEl;
    if (trapHandler) el.removeEventListener('keydown', trapHandler);
    if (escHandler) document.removeEventListener('keydown', escHandler);
    el.classList.remove('is-open');
    el.setAttribute('aria-modal', 'false');
    document.querySelectorAll('[inert]').forEach(n => n.removeAttribute('inert'));
    document.body.classList.remove('modal-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (el._onClose) try { el._onClose(); } catch(_){}
    openEl = null; trapHandler = null; escHandler = null; lastFocus = null;
  };
})();
