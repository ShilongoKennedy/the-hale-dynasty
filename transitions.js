/**
 * transitions.js — Cinematic page transitions for The Hale Dynasty
 *
 * Timing per navigation:
 *   0ms        — click; current page fades to black (400ms)
 *   420ms      — title card injected; elements fade IN (staggered over ~1.0s)
 *   1900ms     — title card elements fade OUT simultaneously (400ms)
 *   2500ms     — navigate from clean black screen
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
      quote: '"Aldric of the Hale. He held this land before the Conquest,\nand he held it after."'
    },
    'era-II.html': {
      vol: 'VOL. II OF X', title: 'The House of Hale',
      dates: '1121 — 1400', sub: 'The Plague Years',
      color: '#C8684A', crest: 'crests/EraII.png',
      quote: '"When thou dost not know what else to do:\nsee to the pig." — Thomas Hale, 1382'
    },
    'era-III.html': {
      vol: 'VOL. III OF X', title: 'The Hale Inheritance',
      dates: '1485 — 1560', sub: 'Early Tudor England',
      color: '#C8A050', crest: 'crests/EraIII.png',
      quote: '"If the justices have a question as to whether he is\ncompetent and willing to hold it, that question is answered."'
    },
    'era-IV.html': {
      vol: 'VOL. IV OF X', title: 'The Divided House',
      dates: '1620 — 1665', sub: 'Civil War England',
      color: '#8090B0', crest: 'crests/EraIV.png',
      quote: '"I would be grateful if you would revise the figure accordingly."\n— Eleanor Hale, to the Parliamentary committee, 1650'
    },
    'era-V.html': {
      vol: 'VOL. V OF X', title: 'The Memoirs of Sir Nathaniel Hale',
      dates: '1671 — 1744', sub: 'Early Georgian',
      color: '#C0A048', crest: 'crests/EraV.png',
      quote: '"Your obedient brother, R." — Richard Hale, closing\nevery letter to his brother Charles.'
    },
    'era-VI.html': {
      vol: 'VOL. VI OF X', title: 'The Hale Entail',
      dates: '1795 — 1835', sub: 'The Regency',
      color: '#C08090', crest: 'crests/EraVI.png',
      quote: '"The wood is worth more standing." — Augusta Hale, 1839.\nShe was right. It is still standing.'
    },
    'era-VII.html': {
      vol: 'VOL. VII OF X', title: 'The Correspondence of Mr Edmund Hale',
      dates: '1868 — 1882', sub: 'High Victorian',
      color: '#A09870', crest: 'crests/EraVII.png',
      quote: '"I am not what anyone thinks I am. I have not been,\nfor a very long time." — Edmund Hale, c.1882'
    },
    'era-VIII.html': {
      vol: 'VOL. VIII OF X', title: 'Thomas',
      dates: '1873 — 1919', sub: 'Late Victorian into War',
      color: '#B0A078', crest: 'crests/EraVIII.png',
      quote: '"Henry liked runner beans." — Dorothy Marsh,\nletter to her sister, September 1916'
    },
    'era-IX.html': {
      vol: 'VOL. IX OF X', title: 'The Name',
      dates: '1933 — 1960', sub: 'The Second World War',
      color: '#8098B8', crest: 'crests/EraIX.png',
      quote: '"There was a cat. George. He was ginger.\nI never got another one." — Violet Marsh, 1978'
    },
    'era-X.html': {
      vol: 'VOL. X OF X', title: 'The Archive in Full',
      dates: '1979 — 2026', sub: 'The Present',
      color: '#90B0C8', crest: 'crests/EraX.png',
      quote: '"If you find this, please know that\nit was not all unhappiness."'
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
    /* ── Overlay layout ── */
    '#pageOverlay {',
    '  display: flex;',
    '  flex-direction: column;',
    '  align-items: center;',
    '  justify-content: center;',
    '  padding: 40px 24px;',
    '  text-align: center;',
    '}',

    /* ── Top accent bar ── */
    '.pto-bar {',
    '  position: absolute;',
    '  top: 0; left: 0; right: 0;',
    '  height: 3px;',
    '  opacity: 0;',
    '  transition: opacity 0.4s ease;',
    '}',
    '#pageOverlay.pto-active .pto-bar { opacity: 1; }',

    /* ── Crest image ── */
    '.pto-crest {',
    '  opacity: 0;',
    '  transition: opacity 0.5s ease;',
    '  margin-bottom: 20px;',
    '  width: auto;',
    '  max-height: 110px;',
    '  filter: drop-shadow(0 0 18px rgba(0,0,0,0.8));',
    '}',
    '#pageOverlay.pto-active .pto-crest { opacity: 1; }',

    /* ── Volume label ── */
    '.pto-vol {',
    '  opacity: 0;',
    '  transition: opacity 0.45s ease 0.15s;',
    '  font-family: "Courier New", monospace;',
    '  font-size: clamp(0.48em, 1.3vw, 0.62em);',
    '  letter-spacing: 0.35em;',
    '  text-transform: uppercase;',
    '  margin-bottom: 10px;',
    '}',
    '#pageOverlay.pto-active .pto-vol { opacity: 1; }',

    /* ── Horizontal rule ── */
    '.pto-line {',
    '  width: 0;',
    '  height: 1px;',
    '  background: linear-gradient(to right, transparent, var(--pto-color, #C8A83C), transparent);',
    '  transition: width 0.5s ease 0.25s, opacity 0.45s ease 0.25s;',
    '  margin-bottom: 18px;',
    '  opacity: 0;',
    '}',
    '#pageOverlay.pto-active .pto-line { width: 200px; opacity: 0.5; }',

    /* ── Era title ── */
    '.pto-title {',
    '  opacity: 0;',
    '  transition: opacity 0.5s ease 0.35s;',
    '  font-family: "Cinzel", Georgia, serif;',
    '  font-size: clamp(1.1em, 3.2vw, 2em);',
    '  font-weight: 600;',
    '  letter-spacing: 0.06em;',
    '  text-align: center;',
    '  max-width: 560px;',
    '  line-height: 1.3;',
    '  margin-bottom: 12px;',
    '}',
    '#pageOverlay.pto-active .pto-title { opacity: 1; }',

    /* ── Dates ── */
    '.pto-dates {',
    '  opacity: 0;',
    '  transition: opacity 0.45s ease 0.5s;',
    '  font-family: "Courier New", monospace;',
    '  font-size: clamp(0.52em, 1.4vw, 0.68em);',
    '  letter-spacing: 0.3em;',
    '  margin-bottom: 6px;',
    '}',
    '#pageOverlay.pto-active .pto-dates { opacity: 1; }',

    /* ── Sub-title ── */
    '.pto-sub {',
    '  opacity: 0;',
    '  transition: opacity 0.4s ease 0.6s;',
    '  font-family: Georgia, serif;',
    '  font-size: clamp(0.58em, 1.5vw, 0.74em);',
    '  font-style: italic;',
    '  letter-spacing: 0.05em;',
    '  margin-bottom: 22px;',
    '}',
    '#pageOverlay.pto-active .pto-sub { opacity: 1; }',

    /* ── Era quote ── */
    '.pto-quote {',
    '  opacity: 0;',
    '  transition: opacity 0.5s ease 0.72s;',
    '  font-family: "Libre Baskerville", Georgia, serif;',
    '  font-size: clamp(0.6em, 1.6vw, 0.78em);',
    '  font-style: italic;',
    '  line-height: 1.8;',
    '  max-width: 460px;',
    '  white-space: pre-line;',
    '  padding: 12px 20px;',
    '  border-left: 2px solid var(--pto-color, #C8A83C);',
    '  text-align: left;',
    '}',
    '#pageOverlay.pto-active .pto-quote { opacity: 1; }',

    /* ── FADE-OUT phase: all elements dissolve simultaneously ── */
    '#pageOverlay.pto-out .pto-bar,',
    '#pageOverlay.pto-out .pto-crest,',
    '#pageOverlay.pto-out .pto-vol,',
    '#pageOverlay.pto-out .pto-title,',
    '#pageOverlay.pto-out .pto-dates,',
    '#pageOverlay.pto-out .pto-sub,',
    '#pageOverlay.pto-out .pto-quote {',
    '  opacity: 0 !important;',
    '  transition: opacity 0.4s ease !important;',
    '}',
    '#pageOverlay.pto-out .pto-line {',
    '  opacity: 0 !important;',
    '  width: 0 !important;',
    '  transition: opacity 0.4s ease, width 0.4s ease !important;',
    '}',
  ].join('\n');

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  (document.head || document.documentElement).appendChild(styleEl);

  // ── BUILD TITLE CARD CONTENT ───────────────────────────────────────────────
  function showTitleCard(overlay, eraInfo) {
    var c = eraInfo.color || '#C8A83C';
    var rgb = hexToRgb(c);

    overlay.style.setProperty('--pto-color', c);

    var html = '';

    // Top accent bar
    html += '<div class="pto-bar" style="background:linear-gradient(to right,' + c + ',transparent);opacity:0;"></div>';

    // Crest image (real PNG if available, otherwise skip)
    if (eraInfo.crest) {
      html += '<img class="pto-crest" src="' + eraInfo.crest + '" alt="" aria-hidden="true">';
    }

    // Volume label
    if (eraInfo.vol) {
      html += '<div class="pto-vol" style="color:rgba(' + rgb + ',0.7);">' + eraInfo.vol + '</div>';
    }

    // Horizontal rule
    html += '<div class="pto-line"></div>';

    // Era title
    html += '<div class="pto-title" style="color:' + c + ';">' + eraInfo.title + '</div>';

    // Dates
    if (eraInfo.dates) {
      html += '<div class="pto-dates" style="color:rgba(' + rgb + ',0.65);">' + eraInfo.dates + '</div>';
    }

    // Sub
    if (eraInfo.sub) {
      html += '<div class="pto-sub" style="color:rgba(' + rgb + ',0.45);">' + eraInfo.sub + '</div>';
    }

    // Quote
    if (eraInfo.quote) {
      html += '<div class="pto-quote" style="color:rgba(' + rgb + ',0.55);border-color:rgba(' + rgb + ',0.35);">' + eraInfo.quote + '</div>';
    }

    overlay.innerHTML = html;
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function hexToRgb(hex) {
    return (
      parseInt(hex.slice(1, 3), 16) + ',' +
      parseInt(hex.slice(3, 5), 16) + ',' +
      parseInt(hex.slice(5, 7), 16)
    );
  }

  function getEraInfo(href) {
    var file = href.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
    return ERA_DATA[file] || {
      vol: '', title: 'The Hale Dynasty', dates: '1066 — 2026',
      sub: 'Nine centuries', color: '#C8A83C',
      crest: 'crests/main_family_crest.png', quote: ''
    };
  }

  // ── MAIN TRANSITION LOGIC ─────────────────────────────────────────────────
  var overlay = document.getElementById('pageOverlay');
  if (!overlay) return;

  // Ensure the overlay has all necessary base styles regardless of page CSS
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = '#000';
  overlay.style.zIndex = '9999';
  overlay.style.pointerEvents = 'none';

  function resetOverlay() {
    overlay.classList.remove('pto-active', 'pto-out', 'fade-out');
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

  // CLICK INTERCEPT — cinematic transition on every internal link click
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto') || a.target === '_blank') return;

    e.preventDefault();

    var eraInfo = getEraInfo(href);
    sessionStorage.setItem('hd_from_nav', '1');

    // — STEP 1: Fade current page to solid black (400ms) —
    overlay.innerHTML = '';
    overlay.classList.remove('pto-active', 'pto-out');
    overlay.style.transition = 'opacity 0.4s ease';
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';

    // — STEP 2: Once black, inject and fade IN the title card —
    setTimeout(function () {
      showTitleCard(overlay, eraInfo);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          overlay.classList.add('pto-active');
        });
      });
    }, 420);

    // — STEP 3: Fade OUT the title card content (overlay stays black) —
    setTimeout(function () {
      overlay.classList.add('pto-out');
    }, 1900);

    // — STEP 4: Navigate from clean black screen —
    setTimeout(function () {
      window.location.href = href;
    }, 2500);
  });

})();
