import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for handling raw body (for license requests)
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// CORS middleware — place BEFORE routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// MPD and segment proxy
app.get('/proxy/*', async (req, res) => {
  const path = req.params[0];
  const origin = 'http://143.44.136.110:6910';
  const targetUrl = `${origin}/${path}?virtualDomain=001.live_hls.zte.com`;

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
  try {
    const licenseServer = `http://143.44.136.74:9443/widevine/?${new URLSearchParams(req.query)}`;

    const response = await fetch(licenseServer, {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'],
      },
      body: req,
    });

    res.status(response.status);
    response.body.pipe(res); // Forward raw binary response
  } catch (err) {
    res.status(500).json({ error: 'License proxy failed', message: err.message });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Proxy running on http://localhost:${PORT}`);
});
