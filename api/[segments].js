export default async function handler(req, res) {
  const { segments = [] } = req.query;
  const query = req.url.split('?')[1] || '';
  const url = `http://143.44.136.110:6910/${segments.join('/')}${query ? '?' + query : ''}`;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'application/octet-stream');

    const body = await response.arrayBuffer();
    res.status(200).send(Buffer.from(body));
  } catch (err) {
    res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
}
