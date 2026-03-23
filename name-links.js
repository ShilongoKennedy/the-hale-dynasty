/**
 * name-links.js — The Hale Dynasty
 * Finds first occurrence of key person names in era page prose
 * and wraps them with a styled inline link to persons.html.
 *
 * Only operates within .era-content elements.
 * Skips text inside <a>, headings, .doc-label, .marginal-note.
 */
(function () {
  'use strict';

  // Map: search text → persons.html anchor id
  // Ordered longest-first to avoid partial matches
  var NAMES = [
    { pattern: 'Ranulf de la Hale',   id: 'ranulf'     },
    { pattern: 'Leofric de la Hale',  id: 'leofric'    },
    { pattern: 'Matilda of Halecroft',id: 'matilda'    },
    { pattern: 'Sir Nathaniel Hale',  id: 'nathaniel'  },
    { pattern: 'Thomas Marsh-Hale',   id: 'thomas_mh'  },
    { pattern: 'Edmund Marsh-Hale',   id: 'edmund_mh'  },
    { pattern: 'James Marsh-Hale',    id: 'james'      },
    { pattern: 'Eleanor Voss',        id: 'eleanor'    },
    { pattern: 'Augusta Hale',        id: 'augusta'    },
    { pattern: 'Edmund Hale',         id: 'edmund_vict'},
    { pattern: 'Richard Hale',        id: 'richard'    },
    { pattern: 'Thomas Hale',         id: 'thomas'     },
    { pattern: 'John Hale',           id: 'john_tudor' },
    { pattern: 'William Hale',        id: 'william'    },
    { pattern: 'Margery Hale',        id: 'margery'    },
    { pattern: 'Hannah Voss',         id: 'hannah'     },
    { pattern: 'David Voss',          id: 'david'      },
    { pattern: 'Aelswith',            id: 'aelswith'   },
  ];

  // CSS for inline name links
  var style = document.createElement('style');
  style.textContent = [
    'a.hd-name-link {',
    '  color: inherit;',
    '  border-bottom: 1px solid rgba(139,26,26,0.35);',
    '  text-decoration: none;',
    '  transition: border-color 0.2s, color 0.2s;',
    '  cursor: pointer;',
    '}',
    'a.hd-name-link:hover {',
    '  border-color: rgba(139,26,26,0.75);',
    '  color: inherit;',
    '}',
  ].join('\n');
  document.head.appendChild(style);

  // Tags to skip entirely
  var SKIP_TAGS = new Set(['A', 'H1', 'H2', 'H3', 'H4', 'SCRIPT', 'STYLE']);
  var SKIP_CLASSES = ['doc-label', 'marginal-note', 'era-label', 'era-dates',
                      'hd-xref', 'era-nav', 'era-seq-nav', 'vol-cta'];

  function shouldSkipNode(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    while (el) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.className && typeof el.className === 'string') {
        for (var i = 0; i < SKIP_CLASSES.length; i++) {
          if (el.className.indexOf(SKIP_CLASSES[i]) !== -1) return true;
        }
      }
      el = el.parentElement;
    }
    return false;
  }

  // Collect all text nodes within a container
  function getTextNodes(root) {
    var nodes = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }
    return nodes;
  }

  // Replace first occurrence of a name in text nodes, return true if replaced
  function replaceFirstOccurrence(textNodes, name, id) {
    for (var i = 0; i < textNodes.length; i++) {
      var node = textNodes[i];
      if (shouldSkipNode(node)) continue;

      var text = node.nodeValue;
      var idx  = text.indexOf(name);
      if (idx === -1) continue;

      // Create replacement: [before][link][after]
      var before = text.substring(0, idx);
      var after  = text.substring(idx + name.length);

      var frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));

      var link = document.createElement('a');
      link.className   = 'hd-name-link';
      link.href        = 'persons.html#' + id;
      link.textContent = name;
      link.title       = 'View in Persons register';
      frag.appendChild(link);

      if (after) frag.appendChild(document.createTextNode(after));

      node.parentNode.replaceChild(frag, node);

      // After replacement the old node is gone; update textNodes
      // (We return true to signal success — caller won't retry)
      return true;
    }
    return false;
  }

  function run() {
    var container = document.querySelector('.era-content');
    if (!container) return;

    var textNodes = getTextNodes(container);

    for (var n = 0; n < NAMES.length; n++) {
      var entry = NAMES[n];
      replaceFirstOccurrence(textNodes, entry.pattern, entry.id);
      // Refresh text nodes after DOM change
      textNodes = getTextNodes(container);
    }
  }

  /* ── Ornamental dividers between .document sections ── */
  function injectOrnaments() {
    var docs = document.querySelectorAll('.era-content .document');
    for (var i = 0; i < docs.length - 1; i++) {
      var orn = document.createElement('div');
      orn.className = 'hd-section-ornament';
      orn.setAttribute('aria-hidden', 'true');
      orn.innerHTML = '<span>&#10022;</span>';
      docs[i].insertAdjacentElement('afterend', orn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { run(); injectOrnaments(); });
  } else {
    run();
    injectOrnaments();
  }

})();
