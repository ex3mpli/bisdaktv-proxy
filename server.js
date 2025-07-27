import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for handling raw body (for license requests)
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// CORS middleware — place BEFORE routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace * with your domain in production
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

// MPD and segment proxy
app.get('/proxy/*', async (req, res) => {
  const path = req.params[0];
  const query = req.url.split('?')[1] || '';
  const origin = 'http://143.44.136.110:6910';
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

// Widevine license proxy
app.post('/license', async (req, res) => {
  const deviceId = req.query.deviceId || '02:00:00:00:00:00';
  const licenseUrl = `http://143.44.136.74:9443/widevine/?deviceId=${deviceId}`;

  try {
    const licenseRes = await fetch(licenseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'],
      },
      body: req.body,
    });

    const licenseBuffer = Buffer.from(await licenseRes.arrayBuffer());
    res.setHeader('Content-Type', licenseRes.headers.get('content-type') || 'application/octet-stream');
    res.status(200).send(licenseBuffer);
  } catch (err) {
    res.status(500).json({ error: 'License proxy failed', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy running on http://localhost:${PORT}`);
});
