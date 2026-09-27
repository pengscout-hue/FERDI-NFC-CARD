const { Redis } = require('@upstash/redis');
const crypto = require('crypto');

const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
});

function hashPin(pin) {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

module.exports = async (req, res) => {
  const code = String(req.query.code || (req.body && req.body.code) || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Kode kartu wajib diisi.' });
  const key = `card:${code}`;

  if (req.method === 'GET') {
    const data = await kv.get(key);
    if (!data) return res.status(200).json({ activated: false });
    return res.status(200).json({
      activated: true,
      businessName: data.businessName,
      reviewLink: data.reviewLink
    });
  }

  if (req.method === 'POST') {
    const { businessName, reviewLink, pin } = req.body || {};
    if (!businessName || !reviewLink || !/^\d{4}$/.test(pin || '')) {
      return res.status(400).json({ error: 'Data tidak lengkap.' });
    }
    const existing = await kv.get(key);
    if (existing) return res.status(409).json({ error: 'Kartu ini sudah diaktifkan.' });
    await kv.set(key, {
      businessName: String(businessName).slice(0, 120),
      reviewLink: String(reviewLink).slice(0, 500),
      pinHash: hashPin(pin),
      createdAt: Date.now()
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'PUT') {
    const { businessName, reviewLink, pin } = req.body || {};
    const existing = await kv.get(key);
    if (!existing) return res.status(404).json({ error: 'Kartu belum diaktifkan.' });
    if (hashPin(pin || '') !== existing.pinHash) {
      return res.status(403).json({ error: 'PIN salah.' });
    }
    await kv.set(key, {
      ...existing,
      businessName: businessName ? String(businessName).slice(0, 120) : existing.businessName,
      reviewLink: reviewLink ? String(reviewLink).slice(0, 500) : existing.reviewLink
    });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST, PUT');
  return res.status(405).json({ error: 'Method tidak didukung.' });
};
