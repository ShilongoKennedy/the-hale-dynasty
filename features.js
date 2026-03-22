/* THE HALE DYNASTY — features.js v4
   Combined: visual effects (candle/quill/particles/cipher)
           + interactive system (visit tracking/layer2/objects/transitions)
═══════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   PART A — VISIT TRACKING · LAYER 2 UNLOCK · INTERACTIVE OBJECTS
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var ALL_VOLS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

  function getVisited() {
    try { return JSON.parse(localStorage.getItem('hale_visited') || '[]'); }
    catch(e) { return []; }
  }

  function markVisited(vol) {
    var v = getVisited();
    if (v.indexOf(vol) === -1) { v.push(vol); }
    try { localStorage.setItem('hale_visited', JSON.stringify(v)); } catch(e){}
    checkComplete(v);
  }

  function isComplete() {
    try { return localStorage.getItem('hale_complete') === 'true'; }
    catch(e) { return false; }
  }

  function checkComplete(visited) {
    if (isComplete()) return;
    var done = ALL_VOLS.every(function(v){ return visited.indexOf(v) !== -1; });
    if (done) {
      try { localStorage.setItem('hale_complete', 'true'); } catch(e){}
      activateLayer2();
    }
  }

  function activateLayer2() {
    document.querySelectorAll('.obj-layer2').forEach(function(el){
      el.classList.add('obj-layer2-active');
    });
    var secretLink = document.getElementById('secret-nav-link');
    if (secretLink) secretLink.style.display = 'inline';
  }

  function getObjState(vol) {
    try { return localStorage.getItem('hale_obj_' + vol + '_open') === 'true'; }
    catch(e) { return false; }
  }

  function setObjState(vol, open) {
    try { localStorage.setItem('hale_obj_' + vol + '_open', open ? 'true' : 'false'); } catch(e){}
  }

  window.toggleObj = function(vol) {
    var content  = document.getElementById('obj-content-' + vol);
    var chevron  = document.getElementById('obj-chevron-' + vol);
    var lid      = document.getElementById('obj-lid-' + vol);
    if (!content) return;
    var isOpen = content.classList.contains('obj-open');
    var nowOpen = !isOpen;
    content.classList.toggle('obj-open', nowOpen);
    if (chevron) chevron.style.transform = nowOpen ? 'rotate(180deg)' : '';
    if (lid)     lid.classList.toggle('obj-lid-opened', nowOpen);
    setObjState(vol, nowOpen);
  };

  document.addEventListener('DOMContentLoaded', function() {
    var vol = document.body.getAttribute('data-vol');
    if (vol) markVisited(vol);
    if (isComplete()) activateLayer2();
    ALL_VOLS.forEach(function(v) {
      if (getObjState(v)) {
        var content = document.getElementById('obj-content-' + v);
        var chevron = document.getElementById('obj-chevron-' + v);
        var lid     = document.getElementById('obj-lid-' + v);
        if (content) content.classList.add('obj-open');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        if (lid)     lid.classList.add('obj-lid-opened');
      }
    });
  });
  /* Note: page overlay transitions are handled by transitions.js — do not touch #pageOverlay here. */

})();


/* ═══════════════════════════════════════════════════════════════════
   PART B — VISUAL EFFECTS (candle · quill · particles · cipher)
═══════════════════════════════════════════════════════════════════ */
(function(){'use strict';

/* ─── GLOBAL EFFECTS TOGGLE ─────────────────────────────────────────
   Reads/writes localStorage key 'hd_fx'. Off = '0', On = '1' (default on).
   Toggle button only appears on the home page (splash present). */
var fxOn = localStorage.getItem('hd_fx') !== '0';
var isDarkPage = !!document.getElementById('splash');

function applyFxState(){
  /* Candle effect always on — toggle button removed */
  var c = document.getElementById('hd-candle');
  /* Particles canvas — always on */
  var cv = document.getElementById('hd-atmos');
}
applyFxState();


/* ╔═══════════════════════════════════════════════════════════════════╗
   ║  1. CANDLELIGHT CURSOR  (dark pages only: home)                  ║
   ╚═══════════════════════════════════════════════════════════════════╝ */
var hasFinePonter = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if(isDarkPage && hasFinePonter){
  var candle = document.createElement('div');
  candle.id = 'hd-candle';
  candle.style.cssText = [
    'position:fixed;inset:0;',
    'pointer-events:none;',
    'z-index:9989;',
    'opacity:0;',
    'transition:opacity 0.5s;',
    'will-change:background;'
  ].join('');
  document.body.appendChild(candle);

  var mx = window.innerWidth/2, my = window.innerHeight/2, cr = 210;

  function paintCandle(){
    if(!fxOn){ candle.style.setProperty('opacity','0','important'); return; }
    candle.style.background = [
      'radial-gradient(circle ',cr,'px at ',mx,'px ',my,'px,',
      'transparent 0%,',
      'rgba(0,0,0,0.18) 42%,',
      'rgba(0,0,0,0.90) 100%)'
    ].join('');
  }

  /* Subtle flicker */
  setInterval(function(){
    cr = 210 + (Math.random()-0.5)*20;
    paintCandle();
  }, 100);

  document.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    paintCandle();
    if(fxOn) candle.style.opacity = '1';
  });
  document.addEventListener('mouseleave', function(){
    candle.style.opacity = '0';
  });

  paintCandle();
}


/* ╔═══════════════════════════════════════════════════════════════════╗
   ║  2. QUILL WRITING REVEAL                                         ║
   ╚═══════════════════════════════════════════════════════════════════╝ */
var qEls = document.querySelectorAll('.hd-quill');
if(qEls.length){
  var qCSS = document.createElement('style');
  qCSS.textContent = [
    '.hd-qcur{',
      'display:inline-block;',
      'width:1.5px;height:1em;',
      'background:linear-gradient(to bottom,rgba(80,40,10,0.9),rgba(50,20,5,0.4));',
      'margin-left:1px;vertical-align:text-bottom;',
      'animation:hdQb 0.55s step-end infinite',
    '}',
    '@keyframes hdQb{50%{opacity:0}}'
  ].join('');
  document.head.appendChild(qCSS);

  qEls.forEach(function(el){
    el.dataset.qt = el.textContent;
    el.textContent = '';
  });

  var qObs = new IntersectionObserver(function(ens){
    ens.forEach(function(en){
      if(en.isIntersecting && !en.target.dataset.qd){
        en.target.dataset.qd = '1';
        var el = en.target, txt = el.dataset.qt, i = 0;
        var cur = document.createElement('span');
        cur.className = 'hd-qcur';
        el.appendChild(cur);
        var iv = setInterval(function(){
          if(i >= txt.length){ clearInterval(iv); cur.remove(); return; }
          el.insertBefore(document.createTextNode(txt[i]), cur);
          i++;
        }, 22);
      }
    });
  }, {threshold: 0.3});

  qEls.forEach(function(el){ qObs.observe(el); });
}


/* ╔═══════════════════════════════════════════════════════════════════╗
   ║  3. ERA ATMOSPHERE PARTICLES                                     ║
   ║     Soft radial-gradient wisps — no hard bubble edges            ║
   ╚═══════════════════════════════════════════════════════════════════╝ */
var era = document.body.dataset.era;
if(era){
  var cv = document.createElement('canvas');
  cv.id = 'hd-atmos';
  cv.style.cssText = [
    'position:fixed;inset:0;',
    'pointer-events:none;',
    'z-index:0;',
    'opacity:', fxOn ? '0.72' : '0', ';',
    'transition:opacity 0.6s;'
  ].join('');
  document.body.insertBefore(cv, document.body.firstChild);
  cv.width = window.innerWidth;
  cv.height = window.innerHeight;
  var cx = cv.getContext('2d');
  window.addEventListener('resize', function(){
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  });

  function rw(){ return Math.random() * cv.width; }
  function rr(a,b){ return a + Math.random() * (b - a); }
  function rv(s){ return (Math.random() - 0.5) * 2 * s; }

  function mkSnow(){
    return {x:rw(),y:-8,vx:rv(0.4),vy:rr(0.2,0.45),r:rr(1.2,3.5),a:rr(0.18,0.38),c:'220,210,185'};
  }
  function mkMist(){
    return {x:rw(),y:cv.height+20,vx:rv(0.22),vy:-rr(0.06,0.2),r:rr(30,60),a:rr(0.06,0.14),c:'12,6,2'};
  }
  function mkSmoke(){
    return {x:rw(),y:cv.height+10,vx:rv(0.38),vy:-rr(0.12,0.4),r:rr(12,30),a:rr(0.06,0.14),c:'55,45,35'};
  }
  function mkPetal(){
    return {x:rw(),y:-8,vx:rv(0.5),vy:rr(0.1,0.35),r:rr(2,5),a:rr(0.1,0.3),c:'205,185,160'};
  }
  function mkSoot(){
    return {x:rw(),y:-5,vx:rv(0.22),vy:rr(0.16,0.42),r:rr(0.6,2.2),a:rr(0.12,0.32),c:'25,15,10'};
  }
  function mkEmber(){
    var g = 80 + Math.floor(Math.random()*80);
    return {x:rw(),y:-5,vx:rv(0.65),vy:rr(0.22,0.7),r:rr(0.8,2.2),a:rr(0.25,0.6),c:'255,'+g+',15',glow:1};
  }
  function mkDust(){
    return {x:rw(),y:rr(0,cv.height),vx:rv(0.18),vy:rv(0.12),r:rr(0.8,2.5),a:rr(0.05,0.16),c:'200,180,140'};
  }

  var ERA_FN = {i:mkSnow,ii:mkMist,iv:mkSmoke,vi:mkPetal,vii:mkSoot,ix:mkEmber};
  var fn = ERA_FN[era] || mkDust;
  var N = (era==='ii') ? 16 : (era==='iv') ? 22 : 28;
  var pts = [];
  for(var k=0; k<N; k++){
    var p = fn();
    p.y = Math.random() * cv.height;
    pts.push(p);
  }

  function drawParticle(p){
    var grd = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    grd.addColorStop(0,   'rgba('+p.c+','+p.a+')');
    grd.addColorStop(0.5, 'rgba('+p.c+','+(p.a*0.45)+')');
    grd.addColorStop(1,   'rgba('+p.c+',0)');
    if(p.glow){
      cx.shadowBlur = 8;
      cx.shadowColor = 'rgba('+p.c+',0.8)';
    }
    cx.beginPath();
    cx.arc(p.x, p.y, p.r, 0, 6.28);
    cx.fillStyle = grd;
    cx.fill();
    if(p.glow) cx.shadowBlur = 0;
  }

  /* WWII searchlight */
  var slAng = 0;
  function drawSearchlight(){
    slAng += 0.0022;
    var sx = cv.width/2 + Math.sin(slAng) * cv.width * 0.55;
    var g = cx.createLinearGradient(sx, cv.height, sx, 0);
    g.addColorStop(0,    'rgba(195,205,180,0)');
    g.addColorStop(0.45, 'rgba(195,205,180,0.038)');
    g.addColorStop(1,    'rgba(195,205,180,0)');
    cx.save();
    cx.beginPath();
    cx.moveTo(sx, cv.height);
    cx.lineTo(sx-46, 0);
    cx.lineTo(sx+46, 0);
    cx.closePath();
    cx.fillStyle = g;
    cx.fill();
    cx.restore();
  }

  function loop(){
    cx.clearRect(0, 0, cv.width, cv.height);
    if(era === 'ix') drawSearchlight();
    pts.forEach(function(p, i){
      p.x += p.vx;
      p.y += p.vy;
      p.vx += rv(0.01);
      var oob = (p.vy>0 && p.y > cv.height+50) ||
                (p.vy<0 && p.y < -50) ||
                (p.x < -50 || p.x > cv.width+50);
      if(oob){ var np = fn(); pts[i] = np; }
      drawParticle(p);
    });
    requestAnimationFrame(loop);
  }
  loop();
}


/* ╔═══════════════════════════════════════════════════════════════════╗
   ║  4. HIDDEN CIPHER SYSTEM                                         ║
   ║  Ten volumes · Ten letters · Decode: PER SAECULA                 ║
   ╚═══════════════════════════════════════════════════════════════════╝ */
var cspans = document.querySelectorAll('.hd-cipher');
if(cspans.length){
  var cCSS = document.createElement('style');
  cCSS.textContent = [
    '.hd-cipher{',
      'display:inline-block;opacity:0.04;cursor:crosshair;',
      'transition:opacity 0.5s,text-shadow 0.5s,transform 0.3s;',
      'font-weight:700;font-family:Cinzel,serif;font-size:1.1em;vertical-align:middle;',
    '}',
    '.hd-cipher:hover{opacity:0.2;}',
    '.hd-cipher.hd-found{',
      'opacity:1!important;color:#8B1A1A!important;',
      'text-shadow:0 0 12px rgba(139,26,26,0.45)!important;',
      'animation:cRev 0.5s ease-out;',
    '}',
    '@keyframes cRev{0%{transform:scale(2);opacity:0;}100%{transform:scale(1);opacity:1;}}',
    '#hd-cmsg{',
      'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);',
      'background:rgba(8,5,2,0.97);color:#C8A83C;',
      'font-family:Cinzel,serif;padding:15px 28px;letter-spacing:.2em;',
      'z-index:9999;border:1px solid rgba(200,168,60,0.35);',
      'font-size:.78em;text-align:center;pointer-events:none;',
      'opacity:0;transition:opacity 0.5s;white-space:nowrap;',
    '}',
  ].join('');
  document.head.appendChild(cCSS);

  var cfound = 0, ctotal = cspans.length;
  cspans.forEach(function(sp){
    sp.addEventListener('click', function(){
      if(sp.classList.contains('hd-found')) return;
      sp.classList.add('hd-found');
      cfound++;
      if(cfound >= ctotal){
        setTimeout(function(){
          var msg = document.createElement('div');
          msg.id = 'hd-cmsg';
          msg.innerHTML = '\u201cPer Saecula Manimus\u201d &mdash; <em>decoded across all ten volumes</em>';
          document.body.appendChild(msg);
          setTimeout(function(){ msg.style.opacity='1'; }, 80);
          setTimeout(function(){
            msg.style.opacity='0';
            setTimeout(function(){ msg.remove(); }, 550);
          }, 8000);
        }, 500);
      }
    });
  });
}


/* ╔═══════════════════════════════════════════════════════════════════╗
   ║  KONAMI CODE EASTER EGG  (any page)                              ║
   ╚═══════════════════════════════════════════════════════════════════╝ */
(function(){
  var seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
             'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
             'b','a'];
  var pos = 0;

  document.addEventListener('keydown', function(e){
    if(e.key === seq[pos]){ pos++; } else { pos = (e.key === seq[0]) ? 1 : 0; }
    if(pos === seq.length){
      pos = 0;
      // Inject a brief "no cheat codes" message styled to match the archive
      var d = document.createElement('div');
      d.style.cssText = [
        'position:fixed;top:50%;left:50%;',
        'transform:translate(-50%,-50%);',
        'z-index:99999;text-align:center;pointer-events:none;',
        'font-family:"Courier New",monospace;font-size:0.7em;',
        'letter-spacing:0.22em;text-transform:uppercase;',
        'color:rgba(200,168,60,0.88);',
        'padding:30px 40px;',
        'border:1px solid rgba(200,168,60,0.25);',
        'background:rgba(0,0,0,0.94);',
        'line-height:2;',
        'opacity:0;transition:opacity 0.5s;',
        'max-width:460px;width:90%;'
      ].join('');
      d.innerHTML =
        'There are no cheat codes in this archive.<br>' +
        '<span style="opacity:0.45;">There is only the keeping.</span>';
      document.body.appendChild(d);
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){ d.style.opacity = '1'; });
      });
      setTimeout(function(){
        d.style.opacity = '0';
        setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); }, 600);
      }, 4000);
    }
  });
})();

})();


/* ═══════════════════════════════════════════════════════════════════
   PART C — PORTRAIT LIGHTBOX · PROGRESS TRACKER · KEYBOARD NAV
   ─────────────────────────────────────────────────────────────────
   No changes to individual era pages required.
   All driven by data-vol on <body> and shared CSS in features.css.
═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── PORTRAIT LIGHTBOX ─────────────────────────────────────────
     Maps each volume to its large Character_Images portrait.
     Triggered by clicking the small portrait in the era header.
  ─────────────────────────────────────────────────────────────── */
  var LARGE_PORTRAITS = {
    'I'   : 'Character_Images/RANULF DE LA HALE \u2014 Era I, 1066.png',
    'II'  : 'Character_Images/MATILDA HALE \u2014 Era II, 1348.png',
    'VI'  : 'Character_Images/AUGUSTA HALE \u2014 Era VI, 1815.png',
    'VII' : 'Character_Images/EDMUND HALE \u2014 Era VII, 1880s.png',
    'VIII': 'Character_Images/THOMAS HALE \u2014 Era VIII, 1916.png',
    'X'   : 'Character_Images/ELEANOR HALE \u2014 Era X, 2024.png'
  };

  document.addEventListener('DOMContentLoaded', function () {
    var vol = document.body.getAttribute('data-vol');
    if (!vol || !LARGE_PORTRAITS[vol]) return;

    var portraitImg = document.querySelector('.portrait-frame img');
    if (!portraitImg) return;

    var largeSrc = LARGE_PORTRAITS[vol];
    portraitImg.classList.add('hd-portrait-zoomable');
    portraitImg.title = 'Click to view full portrait';

    var lb = null;

    function buildLightbox() {
      lb = document.createElement('div');
      lb.id = 'hd-portrait-lb';

      var closeBtn = document.createElement('button');
      closeBtn.id = 'hd-portrait-lb-close';
      closeBtn.innerHTML = '&#x2715;';
      closeBtn.title = 'Close (Esc)';
      closeBtn.setAttribute('aria-label', 'Close portrait');

      var img = document.createElement('img');
      img.src = largeSrc;
      img.alt = portraitImg.alt || '';
      img.id = 'hd-portrait-lb-img';

      var caption = document.createElement('div');
      caption.id = 'hd-portrait-lb-caption';
      caption.textContent = portraitImg.alt || '';

      var hint = document.createElement('div');
      hint.id = 'hd-portrait-lb-hint';
      hint.textContent = 'Imagined from the record · Press Esc to close';

      lb.appendChild(closeBtn);
      lb.appendChild(img);
      lb.appendChild(caption);
      lb.appendChild(hint);
      document.body.appendChild(lb);

      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLb();
      });
      lb.addEventListener('click', function (e) {
        if (e.target === lb) closeLb();
      });
    }

    function openLb() {
      if (!lb) buildLightbox();
      requestAnimationFrame(function () {
        lb.classList.add('hd-lb-open');
      });
      document.body.style.overflow = 'hidden';
    }

    function closeLb() {
      if (lb) lb.classList.remove('hd-lb-open');
      document.body.style.overflow = '';
    }

    portraitImg.addEventListener('click', openLb);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb && lb.classList.contains('hd-lb-open')) {
        closeLb();
      }
    });
  });


  /* ── PROGRESS TRACKER (index page only) ────────────────────────
     Shows a row of pip dots and a "X of 10 volumes opened" line
     beneath the "Or enter by era" instruction on the home page.
     Also marks visited archive boxes with a subtle tick.
  ─────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var isIndex = !document.body.getAttribute('data-vol') &&
                  !!document.querySelector('.archive-grid');
    if (!isIndex) return;

    var ALL_VOLS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
    var VOL_HREF = {
      'I':'era-I.html','II':'era-II.html','III':'era-III.html',
      'IV':'era-IV.html','V':'era-V.html','VI':'era-VI.html',
      'VII':'era-VII.html','VIII':'era-VIII.html','IX':'era-IX.html',
      'X':'era-X.html'
    };

    function getVisited() {
      try { return JSON.parse(localStorage.getItem('hale_visited') || '[]'); }
      catch (e) { return []; }
    }

    var visited = getVisited();
    var count   = visited.length;
    var complete = localStorage.getItem('hale_complete') === 'true';

    /* Only show counter once at least one volume has been opened */
    if (count > 0) {
      var instruction = document.querySelector('.archive-instruction');
      if (instruction) {
        var counter = document.createElement('div');
        counter.id = 'hd-progress';

        var label = document.createElement('span');
        label.className = 'hd-prog-label';
        label.textContent = complete
          ? 'Archive complete \u2014 all ten volumes opened'
          : count + ' of 10 volumes opened';

        var pips = document.createElement('span');
        pips.className = 'hd-prog-pips';
        for (var i = 0; i < 10; i++) {
          var pip = document.createElement('span');
          pip.className = 'hd-pip' + (i < count ? ' hd-pip-on' : '');
          pips.appendChild(pip);
        }

        counter.appendChild(label);
        counter.appendChild(pips);
        instruction.insertAdjacentElement('afterend', counter);
      }
    }

    /* Mark visited era boxes */
    var boxes = document.querySelectorAll('.archive-box');
    boxes.forEach(function (box) {
      var href = (box.getAttribute('href') || '').replace(/^.*\//, '');
      ALL_VOLS.forEach(function (v) {
        if (VOL_HREF[v] === href && visited.indexOf(v) !== -1) {
          box.classList.add('hd-box-visited');
        }
      });
    });
  });


  /* ── KEYBOARD ERA NAVIGATION ────────────────────────────────────
     Left / Right arrow keys step between era pages.
     Ignored when typing in a form field.
     A brief hint appears on first keydown, then fades.
  ─────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var ORDER = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
    var PAGES = {
      'I':'era-I.html','II':'era-II.html','III':'era-III.html',
      'IV':'era-IV.html','V':'era-V.html','VI':'era-VI.html',
      'VII':'era-VII.html','VIII':'era-VIII.html','IX':'era-IX.html',
      'X':'era-X.html'
    };

    var vol = document.body.getAttribute('data-vol');
    if (!vol) return;

    var idx = ORDER.indexOf(vol);
    if (idx === -1) return;

    var prevVol = idx > 0 ? ORDER[idx - 1] : null;
    var nextVol = idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

    /* Hint shown once per era page */
    var hintShown = false;
    function showHint() {
      if (hintShown) return;
      hintShown = true;
      var parts = [];
      if (prevVol) parts.push('\u2190 Vol. ' + prevVol);
      if (nextVol) parts.push('Vol. ' + nextVol + ' \u2192');
      if (!parts.length) return;
      var hint = document.createElement('div');
      hint.id = 'hd-keynav-hint';
      hint.textContent = parts.join('   ');
      document.body.appendChild(hint);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { hint.classList.add('hd-kn-visible'); });
      });
      setTimeout(function () {
        hint.classList.remove('hd-kn-visible');
        setTimeout(function () { if (hint.parentNode) hint.parentNode.removeChild(hint); }, 1100);
      }, 2800);
    }

    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft' && prevVol) {
        window.location.href = PAGES[prevVol];
      } else if (e.key === 'ArrowRight' && nextVol) {
        window.location.href = PAGES[nextVol];
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !hintShown) {
        showHint();
      }
    });

    /* Show hint briefly on first scroll on mobile */
    var scrolled = false;
    window.addEventListener('scroll', function () {
      if (scrolled) return;
      scrolled = true;
      setTimeout(showHint, 1200);
    }, { passive: true });
  });

})();

/* ═══════════════════════════════════════════════════════════════
   PART D — CANDLELIGHT MODE · BODLEIAN HEADER · PRINT BUTTON
   MARGINALIA MODE · PIG TRAIL
   ═══════════════════════════════════════════════════════════════ */
(function () {

  // ── CANDLELIGHT MODE ──────────────────────────────────────────
  var CANDLE_KEY = 'hd_candlelight';
  var candleOn = false;
  try { candleOn = localStorage.getItem(CANDLE_KEY) === 'on'; } catch(e){}

  function applyCandlelight(on) {
    if (on) {
      document.documentElement.style.cssText = [
        'filter: sepia(45%) brightness(0.72) saturate(1.15) hue-rotate(-8deg)',
        '-webkit-filter: sepia(45%) brightness(0.72) saturate(1.15) hue-rotate(-8deg)'
      ].join(';');
    } else {
      document.documentElement.style.removeProperty('filter');
      document.documentElement.style.removeProperty('-webkit-filter');
    }
  }

  if (candleOn) applyCandlelight(true);

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.createElement('button');
    btn.id = 'hd-candle-mode-btn';
    btn.title = candleOn ? 'Restore full light' : 'Candlelight mode';
    btn.setAttribute('aria-label', btn.title);
    btn.textContent = candleOn ? '☀' : '🕯';
    btn.addEventListener('click', function () {
      candleOn = !candleOn;
      try { localStorage.setItem(CANDLE_KEY, candleOn ? 'on' : 'off'); } catch(e){}
      applyCandlelight(candleOn);
      btn.textContent = candleOn ? '☀' : '🕯';
      btn.title = candleOn ? 'Restore full light' : 'Candlelight mode';
    });
    document.body.appendChild(btn);
  });

  // ── LIGHT BACKGROUND DETECTION ────────────────────────────────
  // era-I has a light parchment background; add class so features.css
  // can invert panel colour schemes for readability on light pages.
  document.addEventListener('DOMContentLoaded', function () {
    var vol = document.body.getAttribute('data-vol');
    if (vol === 'I') {
      document.body.classList.add('hd-bg-light');
    }
  });

  // ── MARGINALIA MODE ───────────────────────────────────────────
  var MARG_KEY = 'hd_marginalia';
  var margOn = false;
  try { margOn = localStorage.getItem(MARG_KEY) === 'on'; } catch(e){}

  function applyMarginalia(on) {
    document.querySelectorAll('.hd-marginal').forEach(function(el) {
      el.style.display = on ? '' : 'none';
    });
    document.body.classList.toggle('hd-marg-on', on);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var marginals = document.querySelectorAll('.hd-marginal');
    if (!marginals.length) return; // no marginalia on this page

    applyMarginalia(margOn);

    var btn = document.createElement('button');
    btn.id = 'hd-marg-btn';
    btn.title = margOn ? 'Hide annotations' : 'Show editorial annotations';
    btn.setAttribute('aria-label', btn.title);
    btn.textContent = margOn ? '✎·' : '✎';
    btn.addEventListener('click', function () {
      margOn = !margOn;
      try { localStorage.setItem(MARG_KEY, margOn ? 'on' : 'off'); } catch(e){}
      applyMarginalia(margOn);
      btn.textContent = margOn ? '✎·' : '✎';
      btn.title = margOn ? 'Hide annotations' : 'Show editorial annotations';
    });
    document.body.appendChild(btn);
  });

  // ── PRINT BUTTON ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var vol = (document.body.getAttribute('data-vol') || '').trim();
    if (!vol) return; // only on era pages
    var btn = document.createElement('button');
    btn.id = 'hd-print-btn';
    btn.title = 'Print this volume';
    btn.setAttribute('aria-label', 'Print this volume');
    btn.textContent = '⎙';
    btn.addEventListener('click', function () { window.print(); });
    document.body.appendChild(btn);
  });

  // ── PIG TRAIL ─────────────────────────────────────────────────
  var PIG_KEY = 'hd_pigs_found';
  function getPigsFound() {
    try { return JSON.parse(localStorage.getItem(PIG_KEY) || '[]'); } catch(e){ return []; }
  }
  function savePigsFound(arr) {
    try { localStorage.setItem(PIG_KEY, JSON.stringify(arr)); } catch(e){}
  }

  document.addEventListener('DOMContentLoaded', function () {
    var pig = document.querySelector('.hd-pig');
    if (!pig) return;
    var era = pig.dataset.era;
    var found = getPigsFound();
    if (found.indexOf(era) !== -1) {
      pig.classList.add('hd-pig-found');
    }
    pig.addEventListener('click', function () {
      var found = getPigsFound();
      if (found.indexOf(era) === -1) {
        found.push(era);
        savePigsFound(found);
      }
      pig.classList.add('hd-pig-found');
      // Ripple flash
      pig.style.transform = 'scale(1.6)';
      pig.style.opacity = '1';
      setTimeout(function(){ pig.style.transform = ''; }, 300);
      // If all 10 found, reveal link
      if (found.length >= 10) {
        var msg = document.createElement('div');
        msg.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(8,6,4,0.96);border:1px solid rgba(200,168,60,0.3);padding:12px 22px;font-family:"Courier New",monospace;font-size:0.68em;letter-spacing:0.14em;text-transform:uppercase;color:#C8A83C;z-index:500;text-align:center;';
        msg.innerHTML = 'All ten pigs found. <a href="the-pig.html" style="color:#F0C840;text-decoration:underline;">Read the record →</a>';
        document.body.appendChild(msg);
        setTimeout(function(){ if(msg.parentNode) msg.parentNode.removeChild(msg); }, 8000);
      }
    });
  });

  // ── BODLEIAN HEADER (era pages only) ─────────────────────────
  var BODLEIAN_REFS = {
    'I':   { ref:'MSS. Hale-Marsh 1',  acquired:'Deposited 1858', conserved:'Conserved 1923, 1984' },
    'II':  { ref:'MSS. Hale-Marsh 2',  acquired:'Deposited 1858', conserved:'Multispectral imaging 2024' },
    'III': { ref:'MSS. Hale-Marsh 3',  acquired:'Deposited 1858', conserved:'Conserved 1901, 1984' },
    'IV':  { ref:'MSS. Hale-Marsh 4',  acquired:'Deposited 1858', conserved:'Conserved 1907' },
    'V':   { ref:'MSS. Hale-Marsh 5',  acquired:'Deposited 1858', conserved:'Rebound 1958' },
    'VI':  { ref:'MSS. Hale-Marsh 6',  acquired:'Deposited 1858', conserved:'Acid-free rehousing 1984' },
    'VII': { ref:'MSS. Hale-Marsh 7',  acquired:'Deposited 1884', conserved:'Conserved 1950, 1984' },
    'VIII':{ ref:'MSS. Hale-Marsh 8',  acquired:'Deposited 1951', conserved:'Catalogued 1984' },
    'IX':  { ref:'MSS. Hale-Marsh 9',  acquired:'Deposited 1978', conserved:'Catalogued 1984' },
    'X':   { ref:'MSS. Hale-Marsh 10', acquired:'Deposited 2024', conserved:'In process of arrangement' },
  };

  document.addEventListener('DOMContentLoaded', function () {
    var vol = (document.body.getAttribute('data-vol') || '').trim();
    var info = BODLEIAN_REFS[vol];
    if (!info) return;
    var bar = document.createElement('div');
    bar.id = 'hd-bodleian-bar';
    bar.innerHTML =
      '<span class="hdb-ref">' + info.ref + '</span>' +
      '<span class="hdb-sep">·</span>' +
      '<span class="hdb-label">Bodleian Library, University of Oxford</span>' +
      '<span class="hdb-sep">·</span>' +
      '<span class="hdb-acquired">' + info.acquired + '</span>' +
      '<span class="hdb-sep">·</span>' +
      '<span class="hdb-conserved">' + info.conserved + '</span>';
    document.body.insertBefore(bar, document.body.firstChild);
  });

  // ── ERA PAGE PROGRESS RING ────────────────────────────────────
  // Shows a circular progress ring as reader scrolls. At 70%+ scroll,
  // marks the volume "read" in localStorage and shows a toast.
  (function () {
    var vol = (document.body.getAttribute('data-vol') || '').trim();
    if (!vol) return; // era pages only

    var READ_KEY = 'hd_volumes_read';
    function getRead() { try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch(e) { return []; } }
    function markRead(v) {
      var r = getRead();
      if (r.indexOf(v) === -1) { r.push(v); try { localStorage.setItem(READ_KEY, JSON.stringify(r)); } catch(e){} }
    }
    function isRead(v) { return getRead().indexOf(v) !== -1; }

    // Build SVG ring
    var R = 14, CIRC = 2 * Math.PI * R;
    var ring = document.createElement('div');
    ring.id = 'hd-progress-ring';
    ring.setAttribute('title', 'Reading progress — Vol. ' + vol);
    ring.innerHTML = '<svg viewBox="0 0 36 36" width="36" height="36">' +
      '<circle class="ring-track" cx="18" cy="18" r="' + R + '"/>' +
      '<circle class="ring-fill" id="hd-ring-fill" cx="18" cy="18" r="' + R + '" stroke-dasharray="' + CIRC.toFixed(2) + '" stroke-dashoffset="' + CIRC.toFixed(2) + '"/>' +
      '<text class="ring-label" id="hd-ring-label" x="18" y="18">0%</text>' +
      '</svg>';
    document.body.appendChild(ring);

    var fill = document.getElementById('hd-ring-fill');
    var label = document.getElementById('hd-ring-label');
    var alreadyRead = isRead(vol);
    var toastShown = alreadyRead;

    if (alreadyRead) {
      ring.classList.add('visible', 'ring-complete');
      fill.style.strokeDashoffset = '0';
      label.textContent = '✓';
    }

    // Toast element
    var toast = document.createElement('div');
    toast.id = 'hd-vol-toast';
    document.body.appendChild(toast);

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(function () { toast.classList.remove('show'); }, 3500);
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var scrolled = window.scrollY;
          var docH = document.documentElement.scrollHeight - window.innerHeight;
          var pct = docH > 0 ? Math.min(100, Math.round((scrolled / docH) * 100)) : 0;
          ring.classList.add('visible');
          fill.style.strokeDashoffset = (CIRC * (1 - pct / 100)).toFixed(2);
          label.textContent = alreadyRead ? '✓' : pct + '%';
          if (pct >= 70 && !alreadyRead) {
            alreadyRead = true;
            markRead(vol);
            ring.classList.add('ring-complete');
            label.textContent = '✓';
            if (!toastShown) {
              toastShown = true;
              var volNames = { 'I':'Norman','II':'Pestilence','III':'Tudor','IV':'Civil War','V':'Georgian','VI':'Regency','VII':'Victorian','VIII':'War Correspondent','IX':'Engineer','X':'Discovery' };
              showToast('Volume ' + vol + ' · ' + (volNames[vol]||'') + ' · Read');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  })();

  // ── WANDERING BEE (era-II only — Matilda's bees) ─────────────
  document.addEventListener('DOMContentLoaded', function () {
    var vol = (document.body.getAttribute('data-vol') || '').trim();
    if (vol !== 'II') return;
    var bee = document.createElement('div');
    bee.setAttribute('aria-hidden', 'true');
    bee.style.cssText = 'position:fixed;font-size:1em;pointer-events:none;z-index:50;opacity:0.45;transition:opacity 1s;transform-origin:center;';
    bee.textContent = '🐝';
    document.body.appendChild(bee);
    var vw = window.innerWidth, vh = window.innerHeight;
    var x = Math.random() * (vw * 0.5) + vw * 0.1;
    var y = Math.random() * (vh * 0.4) + vh * 0.2;
    var tx = x, ty = y, vx = 0, vy = 0;
    function newTarget() { tx = Math.random()*(vw-80)+40; ty = Math.random()*(vh-120)+60; }
    newTarget();
    function tick() {
      var dx = tx-x, dy = ty-y;
      if (Math.sqrt(dx*dx+dy*dy) < 25) newTarget();
      vx += dx*0.005; vy += dy*0.005; vx *= 0.93; vy *= 0.93;
      x += vx; y += vy;
      bee.style.left = x+'px'; bee.style.top = y+'px';
      bee.style.transform = 'scaleX('+(vx < 0 ? -1 : 1)+')';
      requestAnimationFrame(tick);
    }
    bee.style.left = x+'px'; bee.style.top = y+'px';
    setTimeout(tick, 1200);
    window.addEventListener('resize', function() { vw=window.innerWidth; vh=window.innerHeight; });
  });

})();

/* ═══════════════════════════════════════════════════════════════════
   ARCHIVIST'S COMMENTARY — Eleanor Voss's marginalia side-panel
   Auto-injects on all era pages (body[data-vol])
═══════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var commentary = {
    'I': [
      { label: 'On the Domesday entry', note: 'The Domesday record spells the name as "Hale" — a clearing, or a nook of land. The same word appears in dozens of English place-names. It is not an aristocratic name. It is a description of a place. The family took their name from the land, which means they understood themselves through it. That has not changed in nine hundred years.' },
      { label: 'On the priory at Halecroft', note: 'There was no priory. The cell attached to St. Wulfstan\'s was a dependency of Worcester, and it housed two monks at most. I think the family remembered it as larger than it was, which is what families do with the things they\'ve lost.' },
      { label: 'On Aldric', note: 'Aldric is described in the record as holding the land "as he did in the time of King Edward." This phrase appears in many Domesday entries. It is the Norman administration acknowledging that whoever held the land before the Conquest had a legitimate claim. They acknowledged it and then largely ignored it. But they wrote it down.' }
    ],
    'II': [
      { label: 'On the death register', note: 'Thomas kept a book. He was eleven years old, alone, and he kept a book of the dead. The spelling is imperfect but the intention is not. I have read it three times. Each time I find a name I missed. I think that is not accidental — Thomas was writing as fast as he could, and the names kept coming.' },
      { label: 'On Brother Anselm', note: 'Brother Anselm does not appear in the Worcester Priory records after 1354. He may have died in a second outbreak; he may have simply stayed in Halecroft and lived out his life there, which would mean he is buried in the churchyard he helped to fill. I prefer this second possibility, though I cannot verify it.' },
      { label: 'On the pig', note: '"See to the pig." Thomas Hale wrote this in 1382, when he was forty-four years old and had had thirty-three years to think about what kept him alive in 1349. He concluded it was the pig. I think he was right, and I think he also meant something larger by it, and I think the two meanings are the same thing.' }
    ],
    'III': [
      { label: 'On the 1521 rebuilding', note: 'William Hale spent more than he intended, as he notes in the accounts. The excess was approximately eighteen pounds — a significant sum in 1521. He paid it without apparently borrowing, which suggests the family was more prosperous than the records make visible. Prosperity tends to leave fewer records than difficulty.' },
      { label: 'On the dissolution letters', note: 'The two letters concerning the dissolution of the monasteries are the most politically dangerous documents in the collection. The family kept them. I think they kept them as a reminder of how close they came to a decision they did not make. That is speculation, but it is the kind I find defensible.' },
      { label: 'On the steward', note: 'The accounts from this period are kept in two hands — a formal Latin hand for official entries, and a smaller English hand in the margins that I believe is the steward\'s running commentary. The steward thought the harvest of 1538 was "middling, God being somewhat inattentive this year." A reasonable assessment of 1538 generally.' }
    ],
    'IV': [
      { label: 'On Eleanor Hale', note: 'Eleanor Hale ran this estate alone for fourteen years. She is mentioned in the family papers almost exclusively in the context of transactions — letters sent, fines paid, agreements made. The letters themselves survive. They are the sharpest prose in the entire collection. She had no patience for ambiguity, which was the correct response to the sixteen-forties.' },
      { label: 'On the sequestration fine', note: 'The Parliamentary sequestration was a legal mechanism that worked by placing the estate into receivership and charging the owner a fine to buy it back. Eleanor Hale paid the fine. She corrected the calculation first. She then paid the revised figure. This is a complete portrait of her character.' },
      { label: 'On the cracked seal', note: 'Thomas Hale\'s seal — used on his last letter home — was found in two pieces in the deed-box. I believe Eleanor broke it when she received the letter telling her he was dead. I believe she then kept both pieces. I have no evidence for either belief. I include it here because I am fairly certain I am right.' }
    ],
    'V': [
      { label: 'On Richard Hale', note: 'Richard Hale managed his brother\'s estate for twenty-one years without title or salary. His letters are models of a particular English mode: the communication of frustration through scrupulous politeness. He signs every letter to his brother: "Your obedient brother, R." The word "obedient" does a great deal of work in that sentence.' },
      { label: 'On Charles', note: 'Charles Hale inherited the estate in 1741 and visited it, as far as I can determine, approximately four times in the twenty years of his ownership. He was not cruel. He was simply absent, which in the context of an estate that required constant attention was a form of slow damage.' },
      { label: 'On the harpsichord', note: 'The inventory of 1741 lists "one harpsichord, in need of tuning." It does not appear in subsequent inventories, which means it was either tuned and lasted, or disposed of. Given the general trajectory of Charles\'s management, I suspect the latter. Richard does not mention it in his letters, which may mean it was already gone.' }
    ],
    'VI': [
      { label: 'On Augusta\'s accounts', note: 'Augusta kept her accounts in double-entry bookkeeping, which she taught herself from a published manual. The handwriting in the accounts is noticeably different from her letters — smaller, more controlled. She understood the accounts were a different kind of document. She was right about that. She was right about most things, which did not always make her life easier.' },
      { label: 'On the note about James', note: '"He was the only one I could talk to." Augusta wrote this about her brother James, who died of typhoid in 1821. She kept the letter about his death. She folded the note inside it. She never referred to it again, anywhere in the surviving papers. This is one of the most private things in the archive.' },
      { label: 'On the Halecroft damson', note: 'Augusta sold Halecroft damson to a Pershore preserve-maker for three shillings the bushel from 1831 onwards. The preserve-maker\'s records survive in the Worcestershire Record Office. They continue to list "Halecroft damson" as a supplier until 1871, nine years after Augusta\'s death. Someone kept the trees going. I do not know who.' }
    ],
    'VII': [
      { label: 'On Edmund\'s seal', note: 'Edmund Hale chose a plain seal — just the letter E. No heraldic device. Every previous generation had maintained the family\'s armorial claim. Edmund abandoned it without apparent comment. I find this significant. I do not know what it signifies.' },
      { label: 'On the sealed letters', note: 'He sealed the letters with a plain wafer and no imprint — pressing the wax closed with his thumb, which left a faint oval mark. He sealed them. He kept them. He left no instructions about them. Ruth Hale-Marsh, who knew they existed, restricted them for one hundred years. I opened them in January 2024. The wax was intact.' },
      { label: 'On Thomas Marsh', note: 'Thomas Marsh, son of Clara, seamstress, of Brixton. Born approximately 1873. Edmund knew about him. What became of Thomas is not known. I have searched. The name is too common, and the records are incomplete. I have not given up. I want it on the record that someone is looking.' }
    ],
    'VIII': [
      { label: 'On Henry', note: 'Henry Marsh-Hale was twenty-three years old and had been in France for eleven weeks when he died at the Somme in July 1916. His commanding officer wrote that he had shown great bravery. This is what such letters say. I do not know if it was true. I know that eleven weeks is not very long.' },
      { label: 'On Dorothy\'s letters', note: 'Dorothy Marsh\'s letters from 1916 and 1917 are among the most restrained documents in the entire archive. She is writing about the garden, and the runner beans, and whether Arthur is all right. She knows he is not all right. She says she doesn\'t know what to do about Arthur. Neither do I.' },
      { label: 'On Arthur', note: 'Arthur Marsh appears in the 1939 register as living in lodgings in Leamington Spa, occupation: clerk. He does not appear after that date in the family record. I have tried to find out what happened to him. I have not been able to. There are a great many men who disappear from the record after 1939.' }
    ],
    'IX': [
      { label: 'On Violet', note: 'Violet Marsh stood at the end of her street in October 1940 and understood what she was looking at. She described the house in Harlow as "perfectly adequate," which is the most complete sentence in the oral history. She said it twice. I think she meant it, and I think she meant something else by it as well.' },
      { label: 'On the cat', note: '"There was a cat. George. He was ginger. I never got another one." This is from Violet\'s 1978 interview. The interviewer does not follow up on the cat. I think about this.' },
      { label: 'On Harlow', note: 'Harlow New Town was designed in the late 1940s by Frederick Gibberd, intended as a model of planned community living. Violet Marsh lived there for the rest of her life. She said it was perfectly adequate. This is not a criticism of Harlow. It is an accurate description of the distance between "adequate" and "home."' }
    ],
    'X': [
      { label: 'On the deed-box', note: 'The deed-box was smaller than I expected. Inside it were forty-seven items. The last thing I found, at the very bottom, was a slip of paper that read: "If you find this, please know that it was not all unhappiness." It is not signed. I sat with it for a long time before I wrote anything in my notes.' },
      { label: 'On nine hundred and fifty-eight years', note: 'The span of the archive: 1066 to 2024. Nine hundred and fifty-eight years. One family. Incomplete. I have tried to be honest about what the record does not show, which is considerably more than what it does. The gaps are part of the document. I have tried to treat them as such.' },
      { label: 'On Thomas Marsh — still looking', note: 'I have found three Thomas Marshes born in Brixton in the 1870s and cannot determine which, if any, is the right one. One emigrated to Australia in 1898. One died in 1895. One disappears from the record in 1901. I do not know which of these, if any, is the child Edmund Hale knew about and could not bring himself to meet. I will keep looking.' }
    ]
  };

  document.addEventListener('DOMContentLoaded', function() {
    var vol = (document.body.getAttribute('data-vol') || '').trim();
    if (!vol || !commentary[vol]) return;

    var notes = commentary[vol];

    // Inject CSS
    var s = document.createElement('style');
    s.textContent = '.hd-archivist-toggle{'
      + 'position:fixed;right:0;top:50%;transform:translateY(-50%);'
      + 'background:#1A1008;border:1px solid rgba(200,168,40,0.3);border-right:none;'
      + 'color:#8B6820;font-family:"Courier New",monospace;'
      + 'font-size:0.62em;letter-spacing:0.18em;text-transform:uppercase;'
      + 'padding:16px 8px;cursor:pointer;z-index:800;'
      + 'writing-mode:vertical-rl;text-orientation:mixed;transition:all 0.25s;}'
      + '.hd-archivist-toggle:hover{color:#C8A830;background:rgba(26,16,8,0.97);}'
      + '.hd-archivist-panel{'
      + 'position:fixed;right:-380px;top:0;bottom:0;width:360px;'
      + 'background:#100A04;border-left:1px solid rgba(200,168,40,0.2);'
      + 'z-index:900;overflow-y:auto;transition:right 0.35s ease;'
      + 'padding:50px 28px 60px;'
      + 'font-family:"Libre Baskerville",Georgia,serif;}'
      + '.hd-archivist-panel.open{right:0;}'
      + '.hd-archivist-toggle.open{right:360px;}'
      + '.hd-ap-header{font-family:"Courier New",monospace;font-size:0.65em;'
      + 'letter-spacing:0.25em;text-transform:uppercase;color:#5A4820;'
      + 'margin-bottom:28px;border-bottom:1px solid rgba(200,168,40,0.15);'
      + 'padding-bottom:14px;line-height:1.8;}'
      + '.hd-ap-vol{color:#8B6820;display:block;font-size:1.05em;margin-bottom:4px;}'
      + '.hd-ap-close{float:right;background:none;border:none;color:#5A4820;'
      + 'cursor:pointer;font-size:1.2em;line-height:1;padding:0 0 4px 4px;'
      + 'font-family:"Courier New",monospace;}'
      + '.hd-ap-close:hover{color:#C8A830;}'
      + '.hd-ap-note{margin-bottom:28px;padding-bottom:28px;border-bottom:1px solid rgba(200,168,40,0.08);}'
      + '.hd-ap-note:last-child{border-bottom:none;}'
      + '.hd-ap-label{font-family:"Courier New",monospace;font-size:0.68em;'
      + 'letter-spacing:0.15em;text-transform:uppercase;color:#8B6820;margin-bottom:8px;}'
      + '.hd-ap-text{font-size:0.82em;color:#A09070;line-height:1.85;font-style:italic;}'
      + '.hd-ap-sig{margin-top:32px;padding-top:16px;'
      + 'border-top:1px solid rgba(200,168,40,0.15);'
      + 'font-family:"Courier New",monospace;font-size:0.62em;'
      + 'letter-spacing:0.14em;text-transform:uppercase;color:#4A3820;text-align:right;}';
    document.head.appendChild(s);

    // Build panel
    var panel = document.createElement('div');
    panel.className = 'hd-archivist-panel';
    panel.id = 'hd-ap-panel';

    var header = document.createElement('div');
    header.className = 'hd-ap-header';
    header.innerHTML = '<button class="hd-ap-close" id="hd-ap-close-btn" aria-label="Close">\u2715</button>'
      + '<span class="hd-ap-vol">Vol. ' + vol + ' \u2014 Archivist\u2019s Commentary</span>'
      + 'Eleanor Voss \u00b7 Bodleian Libraries \u00b7 2024';
    panel.appendChild(header);

    notes.forEach(function(n) {
      var d = document.createElement('div');
      d.className = 'hd-ap-note';
      d.innerHTML = '<div class="hd-ap-label">' + n.label + '</div>'
        + '<div class="hd-ap-text">' + n.note + '</div>';
      panel.appendChild(d);
    });

    var sig = document.createElement('div');
    sig.className = 'hd-ap-sig';
    sig.textContent = '\u2014 E.V. \u00b7 Research Fellow \u00b7 Bodleian Libraries';
    panel.appendChild(sig);

    document.body.appendChild(panel);

    // Toggle button
    var toggle = document.createElement('button');
    toggle.className = 'hd-archivist-toggle';
    toggle.id = 'hd-ap-toggle';
    toggle.setAttribute('aria-label', 'Open Archivist\'s Commentary');
    toggle.textContent = '\u270e Archivist';
    document.body.appendChild(toggle);

    function apOpen() {
      panel.classList.add('open');
      toggle.classList.add('open');
    }
    function apClose() {
      panel.classList.remove('open');
      toggle.classList.remove('open');
    }

    toggle.addEventListener('click', function() {
      if (panel.classList.contains('open')) { apClose(); } else { apOpen(); }
    });
    document.getElementById('hd-ap-close-btn').addEventListener('click', apClose);
  });
})();

/* ═══════════════════════════════════════════════════════════════════
   SOUND AUTO-FADE — fades era ambient audio at 20% scroll depth
   Works with any era page that has eraAudio / normanAudio / etc.
═══════════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  var fadeTicking = false;
  var TARGET_VOLUME = 0.35;
  var lastFadeState = null; // 'full' | 'faded'

  function getEraAudio() {
    // Try known variable names across era pages
    if (typeof eraAudio !== 'undefined' && eraAudio) return eraAudio;
    if (typeof normanAudio !== 'undefined' && normanAudio) return normanAudio;
    return null;
  }

  function getScrollPct() {
    var el = document.documentElement;
    var scrolled = window.scrollY || el.scrollTop;
    var total = el.scrollHeight - el.clientHeight;
    return total > 0 ? scrolled / total : 0;
  }

  window.addEventListener('scroll', function() {
    if (fadeTicking) return;
    requestAnimationFrame(function() {
      var pct = getScrollPct();
      var audio = getEraAudio();
      if (audio && !audio.paused) {
        if (pct >= 0.20 && lastFadeState !== 'faded') {
          // Smooth fade to 10%
          var fadeInterval = setInterval(function() {
            if (!audio || audio.paused) { clearInterval(fadeInterval); return; }
            if (audio.volume > 0.10) {
              audio.volume = Math.max(0.10, audio.volume - 0.02);
            } else {
              clearInterval(fadeInterval);
            }
          }, 60);
          lastFadeState = 'faded';
        } else if (pct < 0.20 && lastFadeState !== 'full') {
          // Restore to full volume
          var restoreInterval = setInterval(function() {
            if (!audio || audio.paused) { clearInterval(restoreInterval); return; }
            if (audio.volume < TARGET_VOLUME) {
              audio.volume = Math.min(TARGET_VOLUME, audio.volume + 0.02);
            } else {
              clearInterval(restoreInterval);
            }
          }, 60);
          lastFadeState = 'full';
        }
      }
      fadeTicking = false;
    });
    fadeTicking = true;
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════════════
   ERA HEADER DESCRIPTOR
   Injects a brief archival overview line below the date range in each
   era-header, filling the visual gap and giving readers context before
   the documents begin. Reads body[data-vol] set on all era pages.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  var DESCRIPTORS = {
    'I':    '4 documents · Worcestershire 1066–1121 · The Domesday entry, Brother Eadmer\'s Chronicle, the tithe survey of Halecroft fields, and the first manorial roll.',
    'II':   '7 documents · The Plague Years 1121–1400 · Death registers, sworn inquest depositions, Matilda\'s letter, Thomas Hale\'s 1382 Remembrance.',
    'III':  '5 documents · Tudor England 1485–1560 · Land grants, legal writs, the dissolution correspondence with Worcester Priory.',
    'IV':   '6 documents · Civil War 1620–1665 · Estate inventories, the Parliamentary sequestration letters, Eleanor Hale\'s correspondence, the broken seal.',
    'V':    '4 documents · Early Georgian 1671–1744 · Sir Nathaniel Hale\'s memoirs, the brothers\' correspondence, household accounts.',
    'VI':   '5 documents · The Regency 1795–1835 · Augusta Hale\'s household accounts, personal letters, the entail papers, the orchard record.',
    'VII':  '6 documents · High Victorian 1868–1882 · Edmund Hale\'s correspondence, the declassified passages. The unsent letters are held as a separate supplement.',
    'VIII': '5 documents · 1873–1919 · Thomas Marsh-Hale\'s service record and letters. Dorothy Marsh\'s wartime correspondence. The casualty notifications.',
    'IX':   '4 documents · 1933–1960 · The Blitz, the evacuation, Violet Marsh\'s oral history recorded on cassette in 1978.',
    'X':    '7 documents · 1979–2026 · Eleanor Voss\'s research journal, the deed-box opening, and the unsigned slip found at the bottom of the collection.'
  };

  document.addEventListener('DOMContentLoaded', function () {
    var vol = document.body.getAttribute('data-vol');
    if (!vol) return;
    var desc = DESCRIPTORS[vol];
    if (!desc) return;
    var datesEl = document.querySelector('.era-dates');
    if (!datesEl) return;

    var div = document.createElement('div');
    div.style.cssText = [
      'font-family:"Courier New",monospace;',
      'font-size:0.68em;',
      'letter-spacing:0.11em;',
      'color:rgba(139,26,26,0.42);',
      'margin-top:14px;',
      'line-height:1.75;',
      'max-width:540px;',
      'margin-left:auto;',
      'margin-right:auto;',
      'text-align:center;'
    ].join('');
    div.textContent = desc;
    datesEl.parentNode.insertBefore(div, datesEl.nextSibling);
  });
})();
