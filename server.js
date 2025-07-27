import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// 🔒 Force HTTPS middleware
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
});

// Your proxy route
app.get('/api/*', async (req, res) => {
  const origin = 'http://143.44.136.110:6910';
  const path = req.params[0]; // everything after /api/
  const query = req.url.split('?')[1] || '';
  const targetUrl = `${origin}/${path}${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(targetUrl);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
