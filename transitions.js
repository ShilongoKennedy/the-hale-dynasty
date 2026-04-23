/**
 * transitions.js — legacy transition cleanup
 *
 * The live site no longer uses cinematic page intros or navigation fades.
 * This script now exists only to clean up leftover markup/classes on pages
 * that still include it, especially when restoring from mobile browser cache.
 */
(function () {
  'use strict';

  function resetOverlay(overlay) {
    if (!overlay) return;
    overlay.innerHTML = '';
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'transparent';
    overlay.style.opacity = '0';
    overlay.style.transition = 'none';
    overlay.style.pointerEvents = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }

  function cleanup() {
    var body = document.body;
    if (body) {
      body.classList.remove('hd-preintro-lock');
      body.classList.remove('hd-era-intro-lock');
    }

    document.querySelectorAll('.hd-era-intro').forEach(function (intro) {
      intro.remove();
    });

    document.querySelectorAll('.page-transition-overlay').forEach(function (overlay) {
      resetOverlay(overlay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanup, { once: true });
  } else {
    cleanup();
  }

  window.addEventListener('pageshow', cleanup);
})();
