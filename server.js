import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const path = require('path');

// Middleware for handling raw body (for license requests)
app.use(express.raw({ type: '*/*', limit: '10mb' }));

// CORS middleware — place BEFORE routes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

// Load the custom channel map
const channelMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'channels.json'), 'utf8')
);

// MPD and segment proxy
app.get('/proxy/:group/:stream/:channel/manifest.mpd', async (req, res) => {
  const { group, stream, channel } = req.params;

  // Convert channel name to real ID
  const realChannelId = channelMap[channel.toLowerCase()] || channel;

  const targetUrl = `http://143.44.136.110:6910/${group}/${stream}/${realChannelId}/manifest.mpd?virtualDomain=001.live_hls.zte.com`;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error('MPD fetch failed');

    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/dash+xml');
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
