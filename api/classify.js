export default async function handler(req, res) {
  // CORS жөндөөлөрү
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Методго уруксат жок' });

  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Суроо бош болбошу керек" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125", // JSON режимин жакшы колдогон версия
        messages: [
          {
            role: "system",
            content: "Сен курулуш материалдарынын баасын аныктоочу экспертсиң. Жоопту СӨЗСҮЗ түрдө JSON форматында гана бер. Формат: {\"price\": number, \"unit\": \"string\"}. Эгер баасын билбесең, орточо базар баасын болжолдоп жаз."
          },
          { role: "user", content: `Товар: ${query}` }
        ],
        response_format: { type: "json_object" } 
      }),
    });

    const data = await response.json();

    // OpenAI'ден ката келсе (мисалы, баланс жок болсо)
    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      const result = JSON.parse(content);
      
      // Баасы сан экенин текшерүү (кээде ИИ "500 сом" деп текст жазып жиберет)
      const finalResult = {
        price: Number(result.price) || 0,
        unit: result.unit || 'шт'
      };

      return res.status(200).json(finalResult);
    }

    return res.status(404).json({ error: "ИИ жооп таба алган жок" });

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Серверде ички ката: " + error.message });
  }
}