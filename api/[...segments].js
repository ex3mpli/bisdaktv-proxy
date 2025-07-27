export default function handler(req, res) {
  const { segments } = req.query;
  res.status(200).json({
    message: "This is working!",
    segments,
    fullUrl: req.url
  });
}
