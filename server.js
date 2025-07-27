// server.js
import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/*', async (req, res) => {
  const origin = 'http://143.44.136.110:6910';
  const path = req.path.slice(1); // remove leading /
  const query = req.url.split('?')[1] || '';
  const url = `${origin}/${path}${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    res.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
