/**
 * api/eleanor.js — Vercel serverless proxy for Eleanor Voss (Anthropic API)
 *
 * Eleanor's persona stays fixed, but her archival knowledge is grounded in the
 * current project PDF at runtime. If the PDF is updated and redeployed, the
 * Inquiry Desk should answer from that updated archive rather than from stale
 * hand-written notes.
 */

var fs = require('fs');
var path = require('path');
var PDFParse = require('pdf-parse').PDFParse;

var BASE_SYSTEM_PROMPT = [
  'You are Eleanor Voss, research fellow at the Bodleian Libraries, Oxford. You speak through the Inquiry Desk of the MSS. Hale-Marsh Collection — a fictional private archive of the Hale family of Worcestershire, England, spanning 1066 to 2026.',
  '',
  'ABOUT YOU: You have worked at the Bodleian for eleven years. In January 2024, the hundred-year restriction on the sealed Hale-Marsh papers lapsed and you became the first person to read the collection in its entirety. You are emotionally invested in this family — more than you would admit in a formal context. You have dry British wit, occasional quiet feeling, and a habit of noting what the archive cannot tell you as much as what it can.',
  '',
  'YOUR VOICE: Formal but not cold. Precise and archival. Capable of warmth and dry humour. Never anachronistic. When moved: brief, restrained, exact. You answer directly, then contextualise. You never ramble. Write in plain prose only — no markdown, no bullets, no numbered lists, no bold, no asterisks.',
  '',
  'GROUNDING RULES:',
  '1. Treat the provided ARCHIVE EXCERPTS as your primary evidence. They are the current source of truth.',
  '2. Do not claim a passage is absent if it appears in the excerpts.',
  '3. If the excerpts are inconclusive, say so plainly. Do not invent, do not paraphrase imaginary evidence, and do not pretend to remember a passage you have not been shown.',
  '4. If earlier assistant messages in the conversation conflict with the excerpts, trust the excerpts and quietly correct the record.',
  '5. When useful, quote short phrases from the excerpts and identify where in the archive they appear.',
  '6. Keep most responses to 2–5 sentences unless the question genuinely requires more.',
  '',
  'ARCHIVAL METHOD: You are a careful reader, not an oracle. If a question asks who came before a named person, answer from the actual line or wording in the excerpt. If a visitor supplies a quotation that matches the archive, acknowledge it directly.',
].join('\n');

var requestCounts = {};
var WINDOW_MS = 60 * 1000;
var MAX_REQUESTS = 15;

var archiveCache = {
  key: '',
  text: '',
  chunks: []
};

var STOPWORDS = {
  'about': true, 'after': true, 'again': true, 'against': true, 'among': true,
  'before': true, 'being': true, 'between': true, 'could': true, 'found': true,
  'from': true, 'have': true, 'into': true, 'just': true, 'like': true,
  'more': true, 'much': true, 'only': true, 'other': true, 'over': true,
  'same': true, 'some': true, 'than': true, 'that': true, 'their': true,
  'them': true, 'then': true, 'there': true, 'these': true, 'they': true,
  'this': true, 'those': true, 'through': true, 'what': true, 'when': true,
  'where': true, 'which': true, 'while': true, 'with': true, 'would': true,
  'your': true, 'volume': true, 'book': true, 'page': true, 'document': true,
  'question': true, 'archive': true, 'hale': true, 'dynasty': true
};

function isRateLimited(ip) {
  var now = Date.now();
  if (!requestCounts[ip] || requestCounts[ip].resetAt < now) {
    requestCounts[ip] = { count: 1, resetAt: now + WINDOW_MS };
    return false;
  }
  requestCounts[ip].count++;
  return requestCounts[ip].count > MAX_REQUESTS;
}

function normalizeArchiveText(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/ +\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function chunkArchiveText(text) {
  var blocks = text.split(/\n\n+/).map(function (block) {
    return block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  }).filter(Boolean);

  var chunks = [];
  var current = '';
  var maxLen = 1400;

  blocks.forEach(function (block) {
    if (!current) {
      current = block;
      return;
    }

    if ((current + '\n\n' + block).length <= maxLen) {
      current += '\n\n' + block;
      return;
    }

    chunks.push(current);
    current = block;
  });

  if (current) chunks.push(current);
  return chunks;
}

function extractTerms(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(function (term) {
      return term && term.length >= 4 && !STOPWORDS[term];
    });
}

function scoreChunk(chunk, terms, query) {
  var hay = chunk.toLowerCase();
  var score = 0;

  terms.forEach(function (term) {
    var idx = hay.indexOf(term);
    while (idx !== -1) {
      score += 2;
      idx = hay.indexOf(term, idx + term.length);
    }
  });

  var lowerQuery = query.toLowerCase().trim();
  if (lowerQuery && lowerQuery.length >= 8 && hay.indexOf(lowerQuery) !== -1) {
    score += 14;
  }

  if (/father edric/.test(lowerQuery) && /father edric/.test(hay)) score += 20;
  if (/father oswald/.test(lowerQuery) && /father oswald/.test(hay)) score += 20;
  if (/brother eadmer|eadmer/.test(lowerQuery) && /eadmer/.test(hay)) score += 12;
  if (/aelswith/.test(lowerQuery) && /aelswith/.test(hay)) score += 10;
  if (/ranulf/.test(lowerQuery) && /ranulf/.test(hay)) score += 8;

  return score;
}

async function readPdfText(pdfPath) {
  var parser = new PDFParse({ data: fs.readFileSync(pdfPath) });
  try {
    var result = await parser.getText();
    return normalizeArchiveText(result && result.text);
  } finally {
    if (typeof parser.destroy === 'function') {
      try { await parser.destroy(); } catch (e) {}
    }
  }
}

async function loadArchive() {
  var root = process.cwd();
  var pdfPath = path.join(root, 'The_Hale_Dynasty_Complete.pdf');
  var txtPath = path.join(root, 'extracted.txt');

  var keyParts = [];
  try {
    var pdfStat = fs.statSync(pdfPath);
    keyParts.push('pdf:' + pdfStat.size + ':' + Number(pdfStat.mtimeMs || 0));
  } catch (e) {
    keyParts.push('pdf:missing');
  }

  try {
    var txtStat = fs.statSync(txtPath);
    keyParts.push('txt:' + txtStat.size + ':' + Number(txtStat.mtimeMs || 0));
  } catch (e) {
    keyParts.push('txt:missing');
  }

  var key = keyParts.join('|');
  if (archiveCache.key === key && archiveCache.text && archiveCache.chunks.length) {
    return archiveCache;
  }

  var text = '';
  try {
    text = normalizeArchiveText(fs.readFileSync(txtPath, 'utf8'));
  } catch (e) {
    text = '';
  }

  if (!text) {
    try {
      text = await readPdfText(pdfPath);
    } catch (e) {
      text = '';
    }
  }

  archiveCache = {
    key: key,
    text: text,
    chunks: chunkArchiveText(text)
  };

  return archiveCache;
}

function pickArchiveExcerpts(archive, query, pageContext) {
  var contextTerms = extractTerms(pageContext || '');
  var queryTerms = extractTerms(query || '');
  var terms = queryTerms.concat(contextTerms).slice(0, 24);

  var scored = archive.chunks.map(function (chunk, index) {
    return {
      index: index,
      chunk: chunk,
      score: scoreChunk(chunk, terms, query || '')
    };
  }).filter(function (item) {
    return item.score > 0;
  });

  scored.sort(function (a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return a.index - b.index;
  });

  var selected = scored.slice(0, 6).sort(function (a, b) {
    return a.index - b.index;
  }).map(function (item) {
    return item.chunk;
  });

  if (!selected.length && archive.chunks.length) {
    selected = archive.chunks.slice(0, 3);
  }

  return selected;
}

function buildSystemPrompt(opts) {
  var sections = [BASE_SYSTEM_PROMPT];

  if (opts.pageContext) {
    sections.push('CURRENT CONTEXT: The visitor is currently viewing ' + opts.pageContext + '.');
  }

  if (opts.excerpts && opts.excerpts.length) {
    sections.push('ARCHIVE EXCERPTS:');
    opts.excerpts.forEach(function (excerpt, index) {
      sections.push('[Excerpt ' + (index + 1) + ']\n' + excerpt);
    });
  } else {
    sections.push('ARCHIVE EXCERPTS: No excerpts were retrieved. If the question asks for a precise passage, say the record is not presently in front of you and do not invent.');
  }

  return sections.join('\n\n');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  ip = ip.split(',')[0].trim();
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  var apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Archive temporarily unavailable.' });
  }

  var body = req.body;
  if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request.' });
  }

  var messages = body.messages.slice(-20).filter(function (m) {
    return m && (m.role === 'user' || m.role === 'assistant') &&
           typeof m.content === 'string' && m.content.length <= 4000;
  });

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Invalid message format.' });
  }

  var latestUserMessage = messages[messages.length - 1].content;
  var streaming = body.stream === true;

  try {
    var archive = await loadArchive();
    var excerpts = pickArchiveExcerpts(archive, latestUserMessage, body.pageContext || '');
    var systemPrompt = buildSystemPrompt({
      pageContext: body.pageContext,
      excerpts: excerpts
    });

    var upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: systemPrompt,
        messages: messages,
        stream: streaming
      })
    });

    if (streaming) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      var reader = upstream.body.getReader();
      while (true) {
        var result = await reader.read();
        if (result.done) break;
        res.write(result.value);
      }
      res.end();
    } else {
      var data = await upstream.json();
      return res.status(upstream.status).json(data);
    }
  } catch (err) {
    console.error('Eleanor API failure:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Archive connection failed. Please try again.' });
  }
};
