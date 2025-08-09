export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { text, input, voice = 'alloy', format = 'mp3', sample_rate = 24000, model = 'gpt-4o-mini-tts' } = req.body || {};
    const content = text || input;
    if (!content) {
      res.status(400).json({ error: 'text or input is required' });
      return;
    }

    const r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: content,
        voice,
        format,
        sample_rate,
      }),
    });

    if (!r.ok) {
      const errTxt = await r.text();
      res.status(r.status).send(errTxt);
      return;
    }

    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).send(String(e?.message || e));
  }
}
