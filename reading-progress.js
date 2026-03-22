/**
 * reading-progress.js — The Hale Dynasty
 * Injects a scroll progress bar at the top of the viewport
 * and a reading-time estimate into the era header.
 */
(function () {
  'use strict';

  /* ── 1. SCROLL PROGRESS BAR ──────────────────────────────────── */

  var bar = document.createElement('div');
  bar.id = 'hd-progress-bar';
  bar.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'height:2px',
    'width:0%',
    'background:linear-gradient(90deg,#9A7A28,#C8A83C,#E8C84C)',
    'z-index:9999',
    'transition:width 0.1s linear',
    'pointer-events:none',
    'border-radius:0 1px 1px 0',
  ].join(';');

  document.body.insertBefore(bar, document.body.firstChild);

  function updateBar() {
    var scrollTop  = window.scrollY || document.documentElement.scrollTop;
    var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    var pct        = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateBar, { passive: true });
  updateBar();


  /* ── 2. READING TIME ESTIMATE ────────────────────────────────── */

  function calcReadingTime() {
    var content = document.querySelector('.era-content');
    if (!content) return null;

    var text  = content.innerText || content.textContent || '';
    var words = text.trim().split(/\s+/).length;
    var mins  = Math.round(words / 220);   // archival prose ~220 wpm
    if (mins < 1) mins = 1;
    return mins;
  }

  function injectReadingTime() {
    var mins = calcReadingTime();
    if (!mins) return;

    // Find the era header date line to insert after it
    var datesEl = document.querySelector('.era-dates');
    if (!datesEl) return;

    var stamp = document.createElement('div');
    stamp.id  = 'hd-reading-time';
    stamp.style.cssText = [
      'font-family:"Courier New",monospace',
      'font-size:0.68em',
      'letter-spacing:0.2em',
      'text-transform:uppercase',
      'opacity:0.5',
      'margin-top:10px',
      'color:inherit',
    ].join(';');
    stamp.textContent = 'Est. reading time — ' + mins + (mins === 1 ? ' min' : ' mins');

    datesEl.parentNode.insertBefore(stamp, datesEl.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectReadingTime);
  } else {
    injectReadingTime();
  }

})();
