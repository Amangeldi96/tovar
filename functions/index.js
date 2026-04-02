const functions = require("firebase-functions");
const OpenAI = require("openai");
const cors = require("cors")({ origin: true }); // CORS китепканасын чакыруу

const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

exports.detectCategory = functions.https.onRequest((req, res) => {
  // CORS уруксатын иштетүү
  return cors(req, res, async () => {
    try {
      // POST сурамы экенин текшерүү
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
      }

      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ error: "No product name" });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Сен строй маркеттин AI ассистентисиң. Категориялар: Строй материал, Сантехника, Электроника. Жоопту ТЕК категория атын бер."
          },
          { role: "user", content: name }
        ],
        temperature: 0
      });

      const category = completion.choices[0].message.content.trim();
      
      // Жоопту жөнөтүү
      return res.status(200).json({ category });

    } catch (error) {
      console.error("AI Error:", error);
      return res.status(500).json({ error: "AI error" });
    }
  });
});