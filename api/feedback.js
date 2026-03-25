/* api/feedback.js — short reader feedback for The Hale Dynasty */
/* Uses REDIS_URL env var (set automatically by Vercel Redis integration) */

const { createClient } = require('redis');

const LIST_KEY = 'hd_feedback';
const MAX_ENTRIES = 250;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.REDIS_URL) {
    if (req.method === 'GET') return res.status(200).json({ entries: [] });
    return res.status(503).json({ error: 'Feedback storage not configured.' });
  }

  let client;
  try {
    client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    if (req.method === 'GET') {
      const raw = await client.lRange(LIST_KEY, 0, 99);
      const entries = raw.map(function (e) {
        try { return JSON.parse(e); } catch (_) { return null; }
      }).filter(Boolean);
      return res.status(200).json({ entries: entries });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const clarity = String(body.clarity || '').trim().slice(0, 32);
      const confusion = String(body.confusion || '').trim().slice(0, 700);
      const path = String(body.path || '').trim().slice(0, 120);
      const sessionId = String(body.session_id || '').trim().slice(0, 48);

      if (!clarity) {
        return res.status(400).json({ error: 'Missing clarity.' });
      }

      const entry = JSON.stringify({
        clarity: clarity,
        confusion: confusion,
        path: path,
        session_id: sessionId,
        date: new Date().toISOString()
      });

      await client.lPush(LIST_KEY, entry);
      await client.lTrim(LIST_KEY, 0, MAX_ENTRIES - 1);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Feedback API error:', err.message);
    if (req.method === 'GET') return res.status(200).json({ entries: [] });
    return res.status(500).json({ error: 'Could not save feedback.' });
  } finally {
    if (client) {
      try { await client.disconnect(); } catch (_) {}
    }
  }
};
