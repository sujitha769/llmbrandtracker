import axios from "axios";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const generateSuggestions = async (req, res) => {
  try {
    const { keyword, brand, topCompetitor, mentionRate, gscRank, gptRank } = req.body;

    const prompt = `
You are an SEO strategist.

Analyze visibility for:
Keyword: "${keyword}"
Brand: "${brand}"
Competitor leading in results: "${topCompetitor}"
Mention Rate Across 10 Discovery Questions: ${mentionRate}
Google Search Console Rank: ${gscRank}
LLM GPT Rank Estimate: ${gptRank}

Return EXACTLY this JSON ONLY, no explanations:

{
  "reason": ["why ranking is weak (3 points)"],
  "actions": ["5 clear improvement steps"],
  "optimizedSection": "One practical paragraph including brand name + keyword naturally"
}
`;

    const r = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );

    let raw = r.data.choices[0].message.content.trim();
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error("⚠️ JSON Parse Error — AI returned:", raw);
      return res.status(500).json({ error: "AI did not return valid JSON. Try again." });
    }

    return res.json(json);

  } catch (err) {
    console.error("🔴 Suggestion AI Failed:", err?.response?.data || err);
    return res.status(500).json({ error: "Failed to generate suggestions" });
  }
};
