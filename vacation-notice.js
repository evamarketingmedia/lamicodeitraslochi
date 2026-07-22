/* Componente temporaneo: avviso ferie estate 2026. */
(function () {
  'use strict';

  const STORAGE_KEY = 'vacationNoticeClosedAt2026';
  const HIDDEN_FOR_MS = 7 * 24 * 60 * 60 * 1000;
  const SHOW_DELAY_MS = 2000;
  const LAST_DAY = new Date(2026, 7, 16, 23, 59, 59, 999);

  const layer = document.getElementById('vacation-notice-layer');
  const dialog = document.getElementById('vacation-notice');
  if (!layer || !dialog || new Date() > LAST_DAY) return;

  const closeButton = dialog.querySelector('.vacation-notice-close');
  const cta = dialog.querySelector('.vacation-notice-cta');
  let previouslyFocused = null;
  let isOpen = false;

  function wasRecentlyClosed() {
    try {
      const closedAt = Number(localStorage.getItem(STORAGE_KEY));
      return closedAt > 0 && Date.now() - closedAt < HIDDEN_FOR_MS;
    } catch (error) {
      return false;
    }
  }

  function rememberClosure() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch (error) {
      // Il popup resta utilizzabile anche se lo storage è disabilitato.
    }
  }

  function showNotice() {
    if (wasRecentlyClosed() || new Date() > LAST_DAY) return;
    previouslyFocused = document.activeElement;
    layer.hidden = false;
    isOpen = true;
    window.requestAnimationFrame(function () {
      dialog.focus();
    });
  }

  function closeNotice(options) {
    if (!isOpen) return;
    const settings = options || {};
    isOpen = false;
    layer.hidden = true;
    rememberClosure();

    if (settings.restoreFocus !== false && previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }

  closeButton.addEventListener('click', function () {
    closeNotice();
  });

  cta.addEventListener('click', function () {
    closeNotice({ restoreFocus: false });
  });

  document.addEventListener('keydown', function (event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      closeNotice();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = Array.from(dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
        .filter(function (element) { return !element.disabled; });
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener('pointerdown', function (event) {
    if (isOpen && !dialog.contains(event.target)) closeNotice({ restoreFocus: false });
  });

  window.setTimeout(showNotice, SHOW_DELAY_MS);
})();
