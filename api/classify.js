export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Сен курулуш материалдарынын баасын билген жардамчысың. Колдонуучу товардын атын жазганда, анын орточо баасын жана өлчөө бирдигин JSON түрүндө гана кайтар. Мисалы: {\"price\": 150, \"unit\": \"кг\"}"
          },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      const result = JSON.parse(data.choices[0].message.content);
      return res.status(200).json(result);
    } else {
      throw new Error("OpenAI жооп берген жок");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}