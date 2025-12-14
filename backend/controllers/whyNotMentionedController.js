import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Explain why a brand is NOT mentioned or ranks low in GPT search results.
 */
export const explainWhyNotMentioned = async (req, res) => {
  try {
    const { 
      keyword, 
      question, 
      brand, 
      companies, 
      competitors = [] 
    } = req.body;

    if (!keyword || !question || !brand || !companies) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const prompt = `
You are an expert SEO + AI ranking analyst.

We asked GPT a discovery question:
"${question}"

GPT returned these ranked companies:
${companies.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Brand we care about: **${brand}**
Competitors: ${competitors.length > 0 ? competitors.join(", ") : "None"}

Explain WHY this brand did NOT appear or ranked very low.

Return STRICT JSON with:

{
  "reason": "Short explanation why brand was not mentioned.",
  "factors": ["List of ranking factors that caused the issue"],
  "competitorComparison": "How competitors are winning against the brand",
  "whatToImprove": ["Improvement steps for the brand"],
  "industryGap": "What industry/category GPT placed this query into"
}

Keep the analysis simple, direct, and helpful.
    `;

    const aiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      },
      {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
      }
    );

    const outputText = aiRes.data.choices[0].message.content;

    let jsonOutput;
    try {
      jsonOutput = JSON.parse(outputText);
    } catch (err) {
      jsonOutput = {
        reason: "AI could not parse explanation.",
        factors: [],
        competitorComparison: "",
        whatToImprove: [],
        industryGap: ""
      };
    }

    return res.json(jsonOutput);

  } catch (err) {
    console.error("❌ explainWhyNotMentioned error:", err);
    return res.status(500).json({ error: "Failed to generate explanation." });
  }
};
