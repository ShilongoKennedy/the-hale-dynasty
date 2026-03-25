(function () {
  'use strict';

  var PAGE_PATH = window.location.pathname || '/';
  var SCROLL_MARKS = [25, 50, 75, 90];
  var TIME_MARKS = [15, 45, 120];
  var sentScroll = {};
  var sentTime = {};
  var queue = [];
  var startTs = Date.now();

  function shortPath(path) {
    if (!path) return '/';
    return path.replace(/^\/+/, '') || '/';
  }

  function getSessionId() {
    var key = 'hd_session_id';
    var existing = '';
    try {
      existing = sessionStorage.getItem(key) || '';
      if (existing) return existing;
      var next = 's_' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(key, next);
      return next;
    } catch (e) {
      return 's_anon';
    }
  }

  function debugStore(eventName, data) {
    try {
      var key = 'hd_analytics_debug';
      var list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push({
        event: eventName,
        data: data,
        t: new Date().toISOString()
      });
      if (list.length > 200) list = list.slice(list.length - 200);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  }

  function sendToVercel(eventName, data) {
    if (typeof window.va !== 'function') return false;

    try {
      window.va('event', { name: eventName, data: data });
      return true;
    } catch (e) {}

    try {
      window.va(eventName, data);
      return true;
    } catch (e) {}

    return false;
  }

  function flushQueue() {
    if (typeof window.va !== 'function' || queue.length === 0) return;

    var pending = queue.slice();
    queue = [];
    pending.forEach(function (item) {
      if (!sendToVercel(item.name, item.data)) {
        queue.push(item);
      }
    });
  }

  function track(eventName, payload) {
    var data = {
      path: PAGE_PATH,
      session_id: getSessionId()
    };

    if (payload && typeof payload === 'object') {
      Object.keys(payload).forEach(function (k) {
        data[k] = payload[k];
      });
    }

    debugStore(eventName, data);

    if (!sendToVercel(eventName, data)) {
      queue.push({ name: eventName, data: data });
    }
  }

  function initLinkTracking() {
    document.addEventListener('click', function (e) {
      var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!link) return;

      var href = link.getAttribute('href') || '';
      if (!href || href.indexOf('javascript:') === 0) return;

      var explicitEvent = link.getAttribute('data-track');
      var label = link.getAttribute('data-track-label') || shortPath(href);

      if (explicitEvent) {
        track(explicitEvent, { label: label, href: href });
        return;
      }

      var isHash = href.charAt(0) === '#';
      if (isHash) return;

      var isExternal = /^(https?:)?\/\//i.test(href) && href.indexOf(window.location.host) === -1;

      if (isExternal) {
        track('outbound_click', { href: href, label: label });
      } else {
        track('internal_navigation_click', { href: href, label: label });
      }
    }, true);
  }

  function initScrollDepth() {
    function onScroll() {
      var total = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      var current = window.scrollY || document.documentElement.scrollTop || 0;
      var pct = total > 0 ? (current / total) * 100 : 100;

      SCROLL_MARKS.forEach(function (mark) {
        if (!sentScroll[mark] && pct >= mark) {
          sentScroll[mark] = true;
          track('scroll_depth_reached', { depth_pct: mark });
        }
      });

      if (!sentScroll.era70 && document.querySelector('.era-content') && pct >= 70) {
        sentScroll.era70 = true;
        track('era_deep_read', { depth_pct: 70 });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initTimeTracking() {
    TIME_MARKS.forEach(function (sec) {
      window.setTimeout(function () {
        if (sentTime[sec]) return;
        sentTime[sec] = true;
        track('time_on_page', { seconds: sec });
      }, sec * 1000);
    });
  }

  function initFeedbackForm() {
    var form = document.getElementById('archiveFeedbackForm');
    if (!form) return;

    var statusEl = document.getElementById('feedbackStatus');
    var textEl = document.getElementById('feedbackConfusion');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var clarity = 'clear';
      var checked = form.querySelector('input[name="feedback_clarity"]:checked');
      if (checked) clarity = checked.value;

      var confusion = textEl ? (textEl.value || '').trim() : '';
      var payload = {
        clarity: clarity,
        has_comment: confusion.length > 0,
        chars: confusion.length,
        words: confusion ? confusion.split(/\s+/).length : 0
      };

      track('feedback_submit', payload);

      try {
        var key = 'hd_feedback_submissions';
        var list = JSON.parse(localStorage.getItem(key) || '[]');
        list.push({
          clarity: clarity,
          confusion: confusion,
          created_at: new Date().toISOString(),
          path: PAGE_PATH
        });
        if (list.length > 100) list = list.slice(list.length - 100);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (err) {}

      if (statusEl) statusEl.textContent = 'Saving...';

      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clarity: clarity,
          confusion: confusion,
          path: PAGE_PATH,
          session_id: getSessionId()
        })
      }).then(function (res) {
        if (statusEl) {
          statusEl.textContent = res.ok ? 'Thanks. Feedback sent.' : 'Saved locally. Server unavailable.';
        }
      }).catch(function () {
        if (statusEl) statusEl.textContent = 'Saved locally. Server unavailable.';
      });

      form.reset();
      var defaultChoice = form.querySelector('input[name="feedback_clarity"][value="clear"]');
      if (defaultChoice) defaultChoice.checked = true;

      window.setTimeout(function () {
        if (statusEl) statusEl.textContent = '';
      }, 4500);
    });
  }

  function initPageOpen() {
    var ref = document.referrer || '';
    var refHost = '';
    if (ref) {
      try {
        refHost = new URL(ref).hostname || '';
      } catch (e) {
        refHost = '';
      }
    }

    track('page_open', {
      title: document.title || '',
      referrer_host: refHost || 'direct'
    });
  }

  function initUnloadSignal() {
    window.addEventListener('beforeunload', function () {
      var seconds = Math.max(1, Math.round((Date.now() - startTs) / 1000));
      track('session_exit', { engaged_seconds: seconds });
      flushQueue();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        var seconds = Math.max(1, Math.round((Date.now() - startTs) / 1000));
        track('visibility_hidden', { engaged_seconds: seconds });
        flushQueue();
      }
    });
  }

  function init() {
    initPageOpen();
    initLinkTracking();
    initScrollDepth();
    initTimeTracking();
    initFeedbackForm();
    initUnloadSignal();

    var retryCount = 0;
    var timer = window.setInterval(function () {
      flushQueue();
      retryCount += 1;
      if (retryCount >= 20 || (queue.length === 0 && typeof window.va === 'function')) {
        window.clearInterval(timer);
      }
    }, 800);

    window.hdTrack = track;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
