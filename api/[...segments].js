export default async function handler(req, res) {
  const { segments } = req.query;
  const query = req.url.split('?')[1] || '';
  const origin = 'http://143.44.136.110:6910';
  const url = `${origin}/${(segments || []).join('/')}${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(url);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false
  }
};
