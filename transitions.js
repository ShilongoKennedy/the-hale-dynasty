/**
 * transitions.js — Cinematic page transitions for The Hale Dynasty
 *
 * Timing per navigation:
 *   0ms        — click; current page fades to black (400ms)
 *   420ms      — navigate from clean black screen
 *
 * Page load:
 *   - If splash screen present (home page): overlay stays transparent immediately
 *     so the splash handles its own intro cleanly, no double-overlay conflict.
 *   - All other pages: page fades IN from black (0.7s).
 */
(function () {
  'use strict';

  // ── ERA DATA ───────────────────────────────────────────────────────────────
  var ERA_DATA = {
    'era-I.html': {
      vol: 'VOL. I OF X', title: 'The Chronicle of de la Hale',
      dates: '1066 — 1121', sub: 'Norman England',
      color: '#C8A83C', crest: 'crests/EraI.png',
      quote: '"In the spring of 1068 Ranulf de la Hale married\nAelswith of Halecroft."',
      introKicker: 'Worcester Cathedral Priory · Reading Room Extract',
      introDeck: 'Here the line enters England under conquest and learns to call the land by name.',
      introBegin: 'Begin the chronicle'
    },
    'era-II.html': {
      vol: 'VOL. II OF X', title: 'The House of Hale',
      dates: '1121 — 1400', sub: 'The Plague Years',
      color: '#C8684A', crest: 'crests/EraII.png',
      quote: '"When thou dost not know what else to do:\nsee to the pig." — Thomas Hale, 1382',
      introKicker: 'Hale Court Cartulary · Domestic Copy',
      introDeck: 'The conquest settles into household, custom, plague, and the discipline of staying alive.',
      introBegin: 'Open the house'
    },
    'era-III.html': {
      vol: 'VOL. III OF X', title: 'The Hale Inheritance',
      dates: '1485 — 1560', sub: 'Early Tudor England',
      color: '#C8A050', crest: 'crests/EraIII.png',
      quote: '"If the justices have a question as to whether he is\ncompetent and willing to hold it, that question is answered."',
      introKicker: 'Chancery Copy · Hale Family Settlement',
      introDeck: 'The line hardens into law, and inheritance begins to sound like judgment.',
      introBegin: 'Enter the inheritance'
    },
    'era-IV.html': {
      vol: 'VOL. IV OF X', title: 'The Divided House',
      dates: '1620 — 1665', sub: 'Civil War England',
      color: '#8090B0', crest: 'crests/EraIV.png',
      quote: '"I would be grateful if you would revise the figure accordingly."\n— Eleanor Hale, to the Parliamentary committee, 1650',
      introKicker: 'Parliamentary Era Papers · Private Copy',
      introDeck: 'The house splits, the kingdom burns, and survival becomes a matter of language as much as allegiance.',
      introBegin: 'Enter the divided house'
    },
    'era-V.html': {
      vol: 'VOL. V OF X', title: 'The Memoirs of Sir Nathaniel Hale',
      dates: '1671 — 1744', sub: 'Early Georgian',
      color: '#C0A048', crest: 'crests/EraV.png',
      quote: '"Your obedient brother, R." — Richard Hale, closing\nevery letter to his brother Charles.',
      introKicker: 'Baronetcy Papers · Memoir Copy',
      introDeck: 'The name grows polished, titled, and brittle, while money and temper begin to speak more plainly.',
      introBegin: 'Open the memoirs'
    },
    'era-VI.html': {
      vol: 'VOL. VI OF X', title: 'The Hale Entail',
      dates: '1795 — 1835', sub: 'The Regency',
      color: '#C08090', crest: 'crests/EraVI.png',
      quote: '"The wood is worth more standing." — Augusta Hale, 1839.\nShe was right. It is still standing.',
      introKicker: 'Estate Office Copy · Settlement Years',
      introDeck: 'Accounts, timber, and restraint govern this volume: the arithmetic of keeping the house from collapse.',
      introBegin: 'Enter the entail'
    },
    'era-VII.html': {
      vol: 'VOL. VII OF X', title: 'The Correspondence of Mr Edmund Hale',
      dates: '1868 — 1882', sub: 'High Victorian',
      color: '#A09870', crest: 'crests/EraVII.png',
      quote: '"I am not what anyone thinks I am. I have not been,\nfor a very long time." — Edmund Hale, c.1882',
      introKicker: 'Private Correspondence · Restricted Viewing',
      introDeck: 'Performance, secrecy, and confession gather in the locked rooms of late-Victorian respectability.',
      introBegin: 'Read the correspondence'
    },
    'era-VIII.html': {
      vol: 'VOL. VIII OF X', title: 'Thomas',
      dates: '1873 — 1919', sub: 'Late Victorian into War',
      color: '#B0A078', crest: 'crests/EraVIII.png',
      quote: '"Henry liked runner beans." — Dorothy Marsh,\nletter to her sister, September 1916',
      introKicker: 'Marsh-Hale Papers · War Years Copy',
      introDeck: 'An illegitimate line, a hidden branch, and the ordinary details that survive even the approach of war.',
      introBegin: 'Open Thomas'
    },
    'era-IX.html': {
      vol: 'VOL. IX OF X', title: 'The Name',
      dates: '1933 — 1960', sub: 'The Second World War',
      color: '#8098B8', crest: 'crests/EraIX.png',
      quote: '"There was a cat. George. He was ginger.\nI never got another one." — Violet Marsh, 1978',
      introKicker: 'Mid-Century Papers · New Town Copy',
      introDeck: 'Bombing, renaming, and grief reduce the archive to what can still be carried forward.',
      introBegin: 'Open the name'
    },
    'era-X.html': {
      vol: 'VOL. X OF X', title: 'The Archive in Full',
      dates: '1979 — 2026', sub: 'The Present',
      color: '#90B0C8', crest: 'crests/EraX.png',
      quote: '"If you find this, please know that\nit was not all unhappiness."',
      introKicker: 'Bodleian Release · Final Volume',
      introDeck: 'The papers return, the letter is read in full, and the archive finally understands what it has been holding.',
      introBegin: 'Open the archive in full'
    },
    'index.html': {
      vol: '', title: 'The Hale Dynasty Archive',
      dates: '1066 — 2026', sub: 'Nine centuries. One line.',
      color: '#C8A83C', crest: 'crests/main_family_crest.png',
      quote: ''
    },
    'family-tree.html': {
      vol: 'FAMILY TREE', title: 'The Hale Dynasty',
      dates: '1066 — 2026', sub: 'Nine generations unbroken',
      color: '#C8A83C', crest: 'crests/main_family_crest.png',
      quote: ''
    },
    'read-all.html': {
      vol: 'THE COMPLETE ARCHIVE', title: 'The Hale Dynasty',
      dates: '1066 — 2026', sub: 'All ten volumes',
      color: '#C8A83C', crest: 'crests/main_family_crest.png',
      quote: '"Ten volumes. Nine hundred and fifty-eight years. One family."'
    },
    'map.html': {
      vol: 'MAP OF ENGLAND', title: 'The Hale Lands',
      dates: '1066 — 2026', sub: 'Worcestershire & beyond',
      color: '#6A9858', crest: 'crests/main_family_crest.png',
      quote: ''
    },
    'gazette.html': {
      vol: 'GAZETTE', title: 'The Hale Family Gazette',
      dates: '1066 — 2026', sub: 'First Edition',
      color: '#C8A83C', crest: 'crests/main_family_crest.png',
      quote: ''
    },
    'timeline.html': {
      vol: 'TIMELINE', title: 'A Chronology of the Hale Family',
      dates: '1066 — 2026', sub: 'Nine centuries',
      color: '#C8A83C', crest: 'crests/main_family_crest.png',
      quote: ''
    }
  };

  // ── CSS INJECTION ─────────────────────────────────────────────────────────
  var css = [
    /* ── Era interstitial ── */
    '.hd-era-intro {',
    '  position: fixed;',
    '  inset: 0;',
    '  z-index: 10020;',
    '  pointer-events: none;',
    '  opacity: 0;',
    '  transition: opacity 0.85s ease;',
    '  background:',
    '    radial-gradient(circle at 50% 24%, rgba(200,168,60,0.14), transparent 18%),',
    '    linear-gradient(180deg, rgba(8,5,2,0.98), rgba(13,9,6,0.96) 46%, rgba(18,12,8,0.92));',
    '  overflow: hidden;',
    '}',
    '.hd-era-intro.hd-era-intro-active { opacity: 1; pointer-events: all; }',
    '.hd-era-intro.hd-era-intro-out { opacity: 0; pointer-events: none; }',
    '.hd-era-intro::before {',
    '  content: "";',
    '  position: absolute;',
    '  inset: 4vh 4vw;',
    '  border: 1px solid rgba(200,168,60,0.08);',
    '  box-shadow: inset 0 0 0 1px rgba(200,168,60,0.03);',
    '}',
    '.hd-era-intro::after {',
    '  content: "";',
    '  position: absolute;',
    '  left: 50%;',
    '  top: 9vh;',
    '  width: min(76vw, 940px);',
    '  height: min(88vh, 920px);',
    '  transform: translateX(-50%);',
    '  border: 1px solid rgba(200,168,60,0.11);',
    '  clip-path: polygon(50% 0%, 73% 13%, 82% 34%, 82% 100%, 18% 100%, 18% 34%, 27% 13%);',
    '  opacity: 0.9;',
    '}',
    '.hd-era-intro-pillars::before,',
    '.hd-era-intro-pillars::after {',
    '  content: "";',
    '  position: absolute;',
    '  top: 12vh;',
    '  bottom: 9vh;',
    '  width: 12vw;',
    '  max-width: 170px;',
    '  min-width: 82px;',
    '  background:',
    '    linear-gradient(180deg, rgba(200,168,60,0.05), rgba(200,168,60,0.015)),',
    '    repeating-linear-gradient(to right, transparent 0 18px, rgba(200,168,60,0.08) 18px 19px, transparent 19px 37px);',
    '  opacity: 0.85;',
    '}',
    '.hd-era-intro-pillars::before { left: 5vw; }',
    '.hd-era-intro-pillars::after { right: 5vw; }',
    '.hd-era-intro-stage {',
    '  position: relative;',
    '  min-height: 100vh;',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  justify-content: center;',
    '  padding: 11vh 24px 16vh;',
    '  text-align: center;',
    '  z-index: 2;',
    '}',
    '.hd-era-intro-kicker, .hd-era-intro-vol, .hd-era-intro-sub, .hd-era-intro-begin {',
    '  font-family: "Courier New", monospace;',
    '  text-transform: uppercase;',
    '}',
    '.hd-era-intro-kicker {',
    '  font-size: 0.64em;',
    '  letter-spacing: 0.36em;',
    '  color: rgba(200,168,60,0.56);',
    '  margin-bottom: 14px;',
    '}',
    '.hd-era-intro-vol {',
    '  font-size: 0.8em;',
    '  letter-spacing: 0.48em;',
    '  color: rgba(214,190,138,0.78);',
    '  margin-bottom: 16px;',
    '}',
    '.hd-era-intro-title {',
    '  margin: 0;',
    '  font-family: "Cinzel", Georgia, serif;',
    '  font-size: clamp(2.8em, 8vw, 6.6em);',
    '  line-height: 0.94;',
    '  letter-spacing: 0.14em;',
    '  text-transform: uppercase;',
    '  color: #E4C56A;',
    '  text-shadow: 0 0 26px rgba(200,168,60,0.08), 0 18px 36px rgba(0,0,0,0.64);',
    '}',
    '.hd-era-intro-rule {',
    '  width: min(340px, 56vw);',
    '  height: 2px;',
    '  margin: 28px auto 24px;',
    '  background: linear-gradient(90deg, transparent, rgba(200,168,60,0.9), transparent);',
    '  opacity: 0.92;',
    '}',
    '.hd-era-intro-sub {',
    '  font-size: 0.76em;',
    '  letter-spacing: 0.3em;',
    '  color: rgba(214,190,138,0.62);',
    '  margin-bottom: 18px;',
    '}',
    '.hd-era-intro-deck {',
    '  max-width: 20ch;',
    '  margin: 0 auto;',
    '  font-family: "Cormorant Garamond", Georgia, serif;',
    '  font-size: clamp(1.35em, 2.7vw, 2.15em);',
    '  line-height: 1.16;',
    '  color: rgba(240,228,201,0.9);',
    '  text-wrap: balance;',
    '}',
    '.hd-era-intro-begin {',
    '  margin-top: 22px;',
    '  font-size: 0.68em;',
    '  letter-spacing: 0.38em;',
    '  color: rgba(139,26,26,0.98);',
    '}',
    '.hd-era-intro-skip {',
    '  position: absolute;',
    '  right: 26px;',
    '  bottom: max(22px, calc(22px + env(safe-area-inset-bottom)));',
    '  border: 1px solid rgba(200,168,60,0.24);',
    '  background: rgba(18,12,8,0.72);',
    '  color: rgba(216,192,136,0.62);',
    '  font-family: "Courier New", monospace;',
    '  font-size: 0.62em;',
    '  letter-spacing: 0.2em;',
    '  text-transform: uppercase;',
    '  padding: 12px 14px;',
    '  cursor: pointer;',
    '}',
    '@media (max-width: 680px) {',
    '  .hd-era-intro::before { inset: 3vh 4vw; }',
    '  .hd-era-intro::after { top: 11vh; width: 90vw; height: 82vh; }',
    '  .hd-era-intro-pillars::before, .hd-era-intro-pillars::after { width: 16vw; min-width: 46px; top: 15vh; bottom: 11vh; }',
    '  .hd-era-intro-stage { padding: 14vh 18px 19vh; }',
    '  .hd-era-intro-kicker { font-size: 0.54em; letter-spacing: 0.24em; line-height: 1.7; max-width: 28ch; }',
    '  .hd-era-intro-vol { font-size: 0.62em; letter-spacing: 0.28em; }',
    '  .hd-era-intro-title { font-size: clamp(2.3em, 13vw, 4.5em); letter-spacing: 0.1em; }',
    '  .hd-era-intro-deck { font-size: 1.08em; max-width: 18ch; }',
    '  .hd-era-intro-sub, .hd-era-intro-begin { font-size: 0.62em; letter-spacing: 0.22em; }',
    '  .hd-era-intro-skip { right: 18px; bottom: max(18px, calc(18px + env(safe-area-inset-bottom))); font-size: 0.58em; }',
    '}',
    'body.hd-preintro-lock, body.hd-era-intro-lock { overflow: hidden; }',
    'body.hd-preintro-lock > *:not(.hd-era-intro):not(script):not(style),',
    'body.hd-era-intro-lock > *:not(.hd-era-intro):not(script):not(style) { visibility: hidden !important; }',

    /* ── Compact page header after interstitial ── */
    'body[data-vol] .era-header {',
    '  padding-bottom: 24px !important;',
    '}',
    'body[data-vol] .era-orientation,',
    'body[data-vol] .era-reading-guide,',
    'body[data-vol] .hd-quill {',
    '  display: none !important;',
    '}',
    'body[data-vol] .era-dates {',
    '  margin-top: 10px !important;',
    '}',
    'body[data-vol] .era-subtitle {',
    '  margin-bottom: 0 !important;',
    '}',
    '@media (max-width: 680px) {',
    '  body[data-vol] .era-header { padding: 28px 18px 18px !important; }',
    '}',
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  (document.head || document.documentElement).appendChild(styleEl);

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function getEraInfo(href) {
    var file = href.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    return ERA_DATA[file] || {
      vol: '', title: 'The Hale Dynasty', dates: '1066 — 2026',
      sub: 'Nine centuries', color: '#C8A83C',
      crest: 'crests/main_family_crest.png', quote: ''
    };
  }

  function isEraFile(file) {
    return /^era-[A-Za-z0-9-]+\.html$/.test(file || '');
  }

  function createEraIntro(file, eraInfo) {
    if (!isEraFile(file)) return null;
    if (!eraInfo || !eraInfo.title) return null;

    var intro = document.createElement('div');
    intro.className = 'hd-era-intro';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML =
      '<div class="hd-era-intro-pillars" aria-hidden="true"></div>' +
      '<div class="hd-era-intro-stage">' +
        '<div class="hd-era-intro-kicker">' + (eraInfo.introKicker || 'Archive Volume') + '</div>' +
        '<div class="hd-era-intro-vol">' + (eraInfo.vol || '') + ' · ' + (eraInfo.dates || '') + '</div>' +
        '<h1 class="hd-era-intro-title">' + eraInfo.title + '</h1>' +
        '<div class="hd-era-intro-rule"></div>' +
        '<div class="hd-era-intro-sub">' + (eraInfo.sub || '') + '</div>' +
        '<div class="hd-era-intro-deck">' + (eraInfo.introDeck || '') + '</div>' +
        '<div class="hd-era-intro-begin">' + (eraInfo.introBegin || 'Enter the volume') + '</div>' +
      '</div>' +
      '<button class="hd-era-intro-skip" type="button">Skip</button>';

    function dismiss() {
      if (intro.classList.contains('hd-era-intro-out')) return;
      intro.classList.add('hd-era-intro-out');
      document.body.classList.remove('hd-era-intro-lock');
      document.body.classList.remove('hd-preintro-lock');
      setTimeout(function () {
        if (intro.parentNode) intro.parentNode.removeChild(intro);
      }, 850);
    }

    intro.addEventListener('click', dismiss);
    intro.querySelector('.hd-era-intro-skip').addEventListener('click', function (e) {
      e.stopPropagation();
      dismiss();
    });

    return {
      el: intro,
      show: function () {
        document.body.classList.add('hd-era-intro-lock');
        document.body.appendChild(intro);
        setTimeout(function () {
          intro.classList.add('hd-era-intro-active');
          intro.setAttribute('aria-hidden', 'false');
        }, 40);
        setTimeout(dismiss, 3200);
      }
    };
  }

  // ── MAIN TRANSITION LOGIC ─────────────────────────────────────────────────
  var overlay = document.getElementById('pageOverlay');
  if (!overlay) return;
  var currentFile = window.location.pathname.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
  var currentEraInfo = getEraInfo(currentFile);

  // Ensure the overlay has all necessary base styles regardless of page CSS
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = '#000';
  overlay.style.zIndex = '9999';
  overlay.style.pointerEvents = 'none';

  function resetOverlay() {
    overlay.innerHTML = '';
    overlay.style.transition = 'none';
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  }

  // Safari/iOS can restore pages from the back-forward cache with the
  // transition overlay still visible. Reset aggressively on restore.
  window.addEventListener('pageshow', function () {
    resetOverlay();
    requestAnimationFrame(function () {
      overlay.style.transition = 'opacity 0.7s ease';
    });
  });

  // PAGE-LOAD FADE-IN
  var splashEl = document.getElementById('splash');
  if (splashEl) {
    var fromNav = sessionStorage.getItem('hd_from_nav');
    sessionStorage.removeItem('hd_from_nav');
    if (fromNav) {
      splashEl.style.display = 'none';
      overlay.style.opacity = '1';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.style.transition = 'opacity 0.7s ease';
          overlay.style.opacity = '0';
        });
      });
    } else {
      overlay.style.opacity = '0';
    }
  } else {
    overlay.style.opacity = '1';
    overlay.style.transition = 'none';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.style.transition = 'opacity 0.7s ease';
        overlay.style.opacity = '0';
      });
    });
  }

  var eraIntro = createEraIntro(currentFile, currentEraInfo);
  if (eraIntro) {
    eraIntro.show();
  }

  // CLICK INTERCEPT — cinematic transition on every internal link click
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || a.target === '_blank') return;

    e.preventDefault();

    sessionStorage.setItem('hd_from_nav', '1');

    // Fade current page to solid black, then navigate cleanly.
    overlay.innerHTML = '';
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';

    setTimeout(function () {
      window.location.href = href;
    }, 420);
  });

})();
