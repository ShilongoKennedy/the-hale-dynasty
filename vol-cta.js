/**
 * vol-cta.js — The Hale Dynasty
 * Injects an "end of volume" CTA block before the era-seq-nav
 * on all ten era pages.
 */
(function () {
  'use strict';

  var ERA_DATA = {
    'I':   { title: 'The Chronicle of de la Hale', dates: '1066–1121',
              next: 'era-II.html', nextLabel: 'Vol. II · The Black Year' },
    'II':  { title: 'The Black Year',               dates: '1348–1349',
              next: 'era-III.html', nextLabel: 'Vol. III · The House of Hale' },
    'III': { title: 'The House of Hale',             dates: '1350–1500',
              next: 'era-IV.html', nextLabel: 'Vol. IV · The Parliament of Blood' },
    'IV':  { title: 'The Parliament of Blood',       dates: '1620–1660',
              next: 'era-V.html', nextLabel: 'Vol. V · The Comfort of Arrangement' },
    'V':   { title: 'The Comfort of Arrangement',   dates: '1700–1760',
              next: 'era-VI.html', nextLabel: 'Vol. VI · The Unfinished Portrait' },
    'VI':  { title: 'The Unfinished Portrait',       dates: '1800–1840',
              next: 'era-VII.html', nextLabel: 'Vol. VII · The Sealed Document' },
    'VII': { title: 'The Sealed Document',           dates: '1840–1900',
              next: 'era-VIII.html', nextLabel: 'Vol. VIII · The Missing Generation' },
    'VIII':{ title: 'The Missing Generation',        dates: '1914–1919',
              next: 'era-IX.html', nextLabel: 'Vol. IX · What She Did Not Describe' },
    'IX':  { title: 'What She Did Not Describe',     dates: '1939–1945',
              next: 'era-X.html', nextLabel: 'Vol. X · The Open Archive' },
    'X':   { title: 'The Open Archive',              dates: '2024–2025',
              next: null, nextLabel: null },
  };

  function injectCTA() {
    var vol = (document.body.getAttribute('data-vol') || '').trim().toUpperCase();
    var data = ERA_DATA[vol];
    if (!data) return;

    var nav = document.querySelector('nav.era-seq-nav');
    if (!nav) return;

    // Build the CTA element
    var cta = document.createElement('div');
    cta.id = 'hd-vol-cta';

    var isLast = vol === 'X';

    cta.innerHTML =
      '<div class="hd-cta-inner">' +
        '<div class="hd-cta-rule"></div>' +
        '<div class="hd-cta-stamp">End of Volume ' + vol + '</div>' +
        '<div class="hd-cta-title">' + data.title + '</div>' +
        '<div class="hd-cta-dates">' + data.dates + '</div>' +
        '<div class="hd-cta-links">' +
          '<a href="family-tree.html" class="hd-cta-btn">Family Tree</a>' +
          '<a href="persons.html" class="hd-cta-btn">Persons</a>' +
          '<a href="grief.html" class="hd-cta-btn">The Grief Index</a>' +
          '<button class="hd-cta-btn hd-cta-eleanor" type="button">Consult Eleanor</button>' +
        '</div>' +
        (isLast
          ? '<div class="hd-cta-final">You have reached the end of the collection.<br>' +
            '<em>The record is, for now, complete.</em></div>'
          : '<a href="' + data.next + '" class="hd-cta-next-vol">' +
            'Continue to ' + data.nextLabel + ' →</a>'
        ) +
        '<div class="hd-cta-rule"></div>' +
      '</div>';

    // Add styles
    var style = document.createElement('style');
    style.textContent = [
      '#hd-vol-cta {',
      '  padding: 50px 30px 20px;',
      '  text-align: center;',
      '}',
      '.hd-cta-inner {',
      '  max-width: 560px;',
      '  margin: 0 auto;',
      '}',
      '.hd-cta-rule {',
      '  width: 40px; height: 1px;',
      '  background: currentColor;',
      '  opacity: 0.2;',
      '  margin: 0 auto 30px;',
      '}',
      '.hd-cta-stamp {',
      '  font-family: "Courier New", monospace;',
      '  font-size: 0.68em;',
      '  letter-spacing: 0.28em;',
      '  text-transform: uppercase;',
      '  opacity: 0.5;',
      '  margin-bottom: 10px;',
      '}',
      '.hd-cta-title {',
      '  font-style: italic;',
      '  font-size: 1.1em;',
      '  opacity: 0.8;',
      '  margin-bottom: 4px;',
      '}',
      '.hd-cta-dates {',
      '  font-family: "Courier New", monospace;',
      '  font-size: 0.72em;',
      '  letter-spacing: 0.18em;',
      '  opacity: 0.45;',
      '  margin-bottom: 28px;',
      '}',
      '.hd-cta-links {',
      '  display: flex;',
      '  flex-wrap: wrap;',
      '  justify-content: center;',
      '  gap: 10px;',
      '  margin-bottom: 28px;',
      '}',
      '.hd-cta-btn {',
      '  font-family: "Courier New", monospace;',
      '  font-size: 0.7em;',
      '  letter-spacing: 0.16em;',
      '  text-transform: uppercase;',
      '  text-decoration: none;',
      '  padding: 7px 14px;',
      '  border: 1px solid currentColor;',
      '  opacity: 0.5;',
      '  cursor: pointer;',
      '  background: transparent;',
      '  color: inherit;',
      '  transition: opacity 0.2s;',
      '  border-radius: 1px;',
      '}',
      '.hd-cta-btn:hover {',
      '  opacity: 0.9;',
      '}',
      '.hd-cta-next-vol {',
      '  display: inline-block;',
      '  font-family: "Courier New", monospace;',
      '  font-size: 0.75em;',
      '  letter-spacing: 0.14em;',
      '  text-transform: uppercase;',
      '  text-decoration: none;',
      '  color: inherit;',
      '  opacity: 0.65;',
      '  margin-bottom: 34px;',
      '  padding-bottom: 2px;',
      '  border-bottom: 1px solid currentColor;',
      '  transition: opacity 0.2s;',
      '}',
      '.hd-cta-next-vol:hover { opacity: 1; }',
      '.hd-cta-final {',
      '  font-style: italic;',
      '  font-size: 0.9em;',
      '  opacity: 0.6;',
      '  margin-bottom: 34px;',
      '  line-height: 1.7;',
      '}',
      '@media (max-width: 600px) {',
      '  #hd-vol-cta { padding: 36px 16px 14px; }',
      '  .hd-cta-links { gap: 8px; }',
      '}',
    ].join('\n');
    document.head.appendChild(style);

    nav.parentNode.insertBefore(cta, nav);

    // Wire Consult Eleanor button
    cta.querySelector('.hd-cta-eleanor').addEventListener('click', function () {
      var panel = document.getElementById('hd-inq-panel');
      var fab   = document.getElementById('hd-inq-fab');
      var input = document.getElementById('hd-inq-input');
      if (panel && input) {
        panel.classList.add('open');
        if (fab) fab.classList.add('open');
        input.value = 'Place Volume ' + vol + ' in the Hale archive and explain why it matters.';
        input.dispatchEvent(new Event('input'));
        input.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCTA);
  } else {
    injectCTA();
  }

})();
