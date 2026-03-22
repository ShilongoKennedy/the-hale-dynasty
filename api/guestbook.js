/* api/guestbook.js — The Hale Dynasty visitor log */
/* Uses REDIS_URL env var (set automatically by Vercel Redis integration) */

const { createClient } = require('redis');

const LIST_KEY = 'hd_guestbook';
const MAX_ENTRIES = 100;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Graceful fallback if Redis not configured
  if (!process.env.REDIS_URL) {
    if (req.method === 'GET') return res.status(200).json({ entries: [] });
    return res.status(503).json({ error: 'Visitor log not yet configured.' });
  }

  let client;
  try {
    client = createClient({ url: process.env.REDIS_URL });
    await client.connect();

    if (req.method === 'GET') {
      const raw = await client.lRange(LIST_KEY, 0, 49);
      const entries = raw.map(e => {
        try { return JSON.parse(e); } catch (_) { return null; }
      }).filter(Boolean);
      return res.status(200).json({ entries });
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body || typeof body.name !== 'string' || typeof body.note !== 'string') {
        return res.status(400).json({ error: 'Invalid.' });
      }
      const name     = body.name.trim().slice(0, 60);
      const note     = body.note.trim().slice(0, 280);
      const location = (body.location || '').trim().slice(0, 60);
      if (!name || !note) return res.status(400).json({ error: 'Name and note required.' });

      const entry = JSON.stringify({
        name, note, location,
        date: new Date().toISOString().slice(0, 10)
      });

      await client.lPush(LIST_KEY, entry);
      await client.lTrim(LIST_KEY, 0, MAX_ENTRIES - 1);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Guestbook error:', err.message);
    if (req.method === 'GET') return res.status(200).json({ entries: [] });
    return res.status(500).json({ error: 'Could not save entry.' });
  } finally {
    if (client) {
      try { await client.disconnect(); } catch (_) {}
    }
  }
};
