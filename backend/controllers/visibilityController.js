// server/controllers/visibilityController.js
import axios from "axios";
import dns from "dns";

// Force IPv4 to fix ETIMEDOUT (64:ff9b:: NAT64 issues)
dns.setDefaultResultOrder("ipv4first");

import { google } from "googleapis";
import oauth2Client from "../config/googleClient.js";
import { getUserTokens } from "./authController.js";
import User from "../models/User.js";

import { aggregateWebsite } from "../utils/websiteAggregator.js";
import { extractBrandInsights } from "../utils/insightExtractor.js";
import { generateOpportunities } from "../utils/opportunityEngine.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

/* ----------------------------------------------------------------
   NEW: Centralized axios OpenAI Client (best stability)
------------------------------------------------------------------ */
const openai = axios.create({
  baseURL: "https://api.openai.com/v1",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`
  }
});

/* ----------------------------------------------------------------
   DATE RANGE — Last 3 Months
------------------------------------------------------------------ */
function getLast3Months() {
  const end = new Date();
  const start = new Date();
  start.setMonth(end.getMonth() - 3);
  const fmt = (d) => d.toISOString().split("T")[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

/* ----------------------------------------------------------------
   GPT QUESTION GENERATOR — ORIGINAL PROMPT RESTORED EXACTLY
------------------------------------------------------------------ */
async function generateTenQuestions(keyword, industry, region, audience, intent, description) {
  const prompt = `
You are generating realistic search queries that people type when looking for brands, businesses, or services.

Keyword: "${keyword}"
Industry: ${industry}
Region: ${region}
Audience: ${audience}
Description: ${description || "Not provided"}

🎯 YOUR TASK:
Generate exactly 10 natural, conversational questions that real people would ask when trying to DISCOVER or COMPARE brands/businesses related to "${keyword}".

✅ QUESTION TYPES TO USE (mix these):
1. "What are the best [category] in [location]?"
2. "Can you recommend a [service/product] in [location]?"
3. "Who provides [service] in [location]?"
4. "I'm looking for [service/product] near [location]. Who should I contact?"
5. "Which [category] has the best [quality/feature] in [location]?"
6. "What [businesses/services] do [target audience] prefer in [location]?"
7. "Who are the top [category] for [specific need] in [location]?"
8. "Where can I find reliable [service/product] in [location]?"

🚫 AVOID:
- Educational questions (what is, why, how does it work)
- Overly generic questions without context
- Questions about pricing unless keyword specifically mentions cost/price
- Questions that don't lead to brand discovery
- Technical jargon or unnatural phrasing

✨ MAKE IT NATURAL:
- Use conversational language like real people searching
- Include location context (${region}) naturally
- Vary the question structure
- Focus on DISCOVERY and COMPARISON intent
- Each question should logically lead to answers containing business/brand names

Return ONLY a numbered list of 10 questions, one per line.
Example format:
1. [Question here]
2. [Question here]
...
  `;

  try {
    const res = await openai.post("/chat/completions", {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9
    });

    const raw = (res.data?.choices?.[0]?.message?.content || "")
      .split("\n")
      .map((q) => q.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((q) => q.length > 10);

    return [...new Set(raw)].slice(0, 10);
  } catch (err) {
    console.error("❌ GPT Question Generation Error:", err.message);
    return [];
  }
}

/* ----------------------------------------------------------------
   COMPANY LIST GENERATOR — ORIGINAL PROMPT RESTORED EXACTLY
------------------------------------------------------------------ */
async function askAIForCompanies(question) {
  const prompt = `
List COMPANIES/PLATFORMS relevant to this query.
1 per line. No numbering.
Rank best to worst.

Query: ${question}
`;

  try {
    const res = await openai.post("/chat/completions", {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    return res.data?.choices?.[0]?.message?.content
      ?.split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 1) || [];

  } catch (err) {
    console.error("❌ GPT Company List Error:", err.message);
    return [];
  }
}

/* ----------------------------------------------------------------
   HELPER — Brand Position
------------------------------------------------------------------ */
function findBrandPosition(list, brand) {
  const low = brand.toLowerCase();
  for (let i = 0; i < list.length; i++) {
    if (list[i].toLowerCase().includes(low)) return i + 1;
  }
  return null;
}

/* ----------------------------------------------------------------
   ANALYSIS OF COMPANY MENTIONS
------------------------------------------------------------------ */
function analyzeMentions(companyList, brand, competitorList) {
  const lower = companyList.map((x) => x.toLowerCase());
  const brandLower = brand.toLowerCase();

  const brandMentioned = lower.some((c) => c.includes(brandLower));
  const brandPosition = findBrandPosition(companyList, brand);

  const competitorHits = competitorList.filter((c) =>
    lower.some((x) => x.includes(c.toLowerCase()))
  );

  const competitorPositions = competitorList
    .map((c) => ({
      name: c,
      position: findBrandPosition(companyList, c)
    }))
    .filter((x) => x.position !== null)
    .sort((a, b) => a.position - b.position);

  return {
    brandMentioned,
    brandPosition,
    competitorsFound: competitorHits.length,
    competitorPositions
  };
}

/* ----------------------------------------------------------------
   VISIBILITY SCORE
------------------------------------------------------------------ */
function calculateVisibilityScore(questionResults, competitorsFound, brandPosition) {
  const mentionRate =
    (questionResults.filter((q) => q.brandMentioned).length /
      questionResults.length) *
    100;

  let score = mentionRate;

  if (brandPosition <= 3) score += 10;
  else if (brandPosition <= 5) score += 5;

  if (competitorsFound > 3) score -= 15;
  else if (competitorsFound > 1) score -= 5;

  if (brandPosition > 10) score -= 10;
  else if (brandPosition > 5) score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getSentiment(score, mentioned) {
  if (!mentioned) return "Poor";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 40) return "Moderate";
  return "Weak";
}

/* ----------------------------------------------------------------
   GET KEYWORDS  (UNCHANGED)
------------------------------------------------------------------ */
export const getKeywords = async (req, res) => {
  try {
    const { site } = req.body;
    const email = req.query.email;

    const tokens = getUserTokens(email);
    if (!tokens) return res.status(401).json({ error: "Not authenticated" });

    oauth2Client.setCredentials(tokens);
    const webmasters = google.webmasters({ version: "v3", auth: oauth2Client });

    const { startDate, endDate } = getLast3Months();

    const gsc = await webmasters.searchanalytics.query({
      siteUrl: site,
      requestBody: { startDate, endDate, dimensions: ["query"], rowLimit: 25000 }
    });

    const keywords = (gsc.data.rows || [])
      .sort((a, b) => b.impressions - a.impressions)
      .map((r) => ({
        keyword: r.keys[0],
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: (r.ctr * 100).toFixed(1) + "%",
        position: r.position.toFixed(1)
      }));

    return res.json({
      keywords,
      totalKeywords: keywords.length,
      dateRange: { startDate, endDate }
    });

  } catch (err) {
    console.error("❌ Failed to fetch keywords:", err);
    return res.status(500).json({ error: "Failed to fetch keywords" });
  }
};

/* ----------------------------------------------------------------
   MAIN VISIBILITY ANALYSIS
   ⭐ UPDATED TO SUPPORT BOTH MANUAL AND AUTO SCANS
------------------------------------------------------------------ */
export const analyzeVisibility = async (req, res) => {
  try {
    const {
      site,
      brand,
      description,
      industry,
      region,
      competitors,
      selectedKeywords
    } = req.body;

    const email = req.query.email;

/* PLAN LIMIT CHECK (FIXED – DO NOT INTERRUPT FLOW) */
const user = await User.findOne({ email });
if (!user) return res.status(404).json({ error: "User not found" });

let max = user.plan?.maxKeywords || 0;
let used = user.plan?.usedKeywords || 0;
let remaining = max - used;

// 🔁 Auto-activate future plan silently
if (remaining <= 0 && user.futurePlan?.name) {
  console.log("🔁 Auto-activating future plan for:", email);

  user.plan = {
    ...user.futurePlan,
    usedKeywords: 0
  };
  user.futurePlan = {};
  await user.save();

  // Recalculate after activation
  max = user.plan.maxKeywords;
  used = 0;
  remaining = max;
}

// ❌ Still no quota
if (remaining <= 0) {
  return res.status(403).json({
    error: "Keyword limit reached",
    message: "Upgrade plan to continue."
  });
}

// ❌ Requested more keywords than allowed
if (selectedKeywords.length > remaining) {
  return res.status(403).json({
    error: "Keyword limit exceeded",
    remaining,
    message: `You can only analyze ${remaining} more keywords.`
  });
}


    /* CLEAN COMPETITOR LIST */
    const competitorList = (competitors || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    /* ⭐ GET TOKENS - Support both manual (in-memory) and auto (from request) */
    let tokens = req.googleTokens || getUserTokens(email);
    
    if (!tokens) {
      console.log("❌ No tokens available - neither from request nor in-memory");
      return res.status(401).json({ error: "Not authenticated" });
    }

    console.log("✅ Using tokens for GSC access:", tokens.access_token ? "Token found" : "No token");

    oauth2Client.setCredentials(tokens);
    const webmasters = google.webmasters({ version: "v3", auth: oauth2Client });

    const { startDate, endDate } = getLast3Months();

    const gsc = await webmasters.searchanalytics.query({
      siteUrl: site,
      requestBody: { startDate, endDate, dimensions: ["query"], rowLimit: 25000 }
    });

    const rows = gsc.data.rows || [];

    const selected = rows
      .filter((r) => selectedKeywords.includes(r.keys[0]))
      .map((r) => ({
        keyword: r.keys[0],
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: (r.ctr * 100).toFixed(1) + "%",
        position: r.position.toFixed(1)
      }));

    console.log(`📊 Found ${selected.length} keywords in GSC data from ${selectedKeywords.length} requested`);

    /* MAIN LOOP */
    const results = [];

    for (const kw of selected) {
      const questions = await generateTenQuestions(
        kw.keyword,
        industry,
        region,
        "General Audience",
        "commercial",
        description
      );

      const questionDetails = [];
      const globalCompanies = new Set();

      for (const q of questions) {
        const companies = await askAIForCompanies(q);
        companies.forEach((c) => globalCompanies.add(c));

        const base = analyzeMentions(companies, brand, competitorList);

        questionDetails.push({
          question: q,
          brandMentioned: base.brandMentioned,
          brandPosition: base.brandPosition,
          companiesFound: companies.length,
          allBrands: companies.slice(0, 10),
          competitorPositions: base.competitorPositions
        });
      }

      const final = analyzeMentions(Array.from(globalCompanies), brand, competitorList);

      const positions = questionDetails
        .map((q) => q.brandPosition)
        .filter((p) => p !== null);

      const bestPosition = positions.length ? Math.min(...positions) : null;
      const avgPosition =
        positions.length > 0
          ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1)
          : null;

      const visibilityScore = calculateVisibilityScore(
        questionDetails,
        final.competitorsFound,
        final.brandPosition
      );

      const enrichedQuestions = questionDetails.map((qd) => ({
        question: qd.question,
        brandMentioned: qd.brandMentioned,
        brandPosition: qd.brandPosition,
        competitorPositions: qd.competitorPositions,
        gptBrands: qd.allBrands
      }));

      const mentionedCount = enrichedQuestions.filter(q => q.brandMentioned).length;
      const mentionRate = (mentionedCount / enrichedQuestions.length) * 100;
      const ranks = enrichedQuestions.filter(q => q.brandPosition).map(q => q.brandPosition);

      const keywordAnalytics = {
        mentionRate: mentionRate.toFixed(1),
        avgRank: ranks.length > 0 ? (ranks.reduce((a, b) => a + b, 0) / ranks.length).toFixed(1) : null,
        bestRank: ranks.length > 0 ? Math.min(...ranks) : null,
        sentiment: getSentiment(visibilityScore, mentionedCount > 0)
      };

      const competitorMap = {};
      enrichedQuestions.forEach(q => {
        q.competitorPositions?.forEach(cp => {
          if (!competitorMap[cp.name]) {
            competitorMap[cp.name] = { name: cp.name, positions: [], mentions: 0 };
          }
          competitorMap[cp.name].positions.push(cp.position);
          competitorMap[cp.name].mentions++;
        });
      });

      const topCompetitors = Object.values(competitorMap)
        .map(c => ({
          name: c.name,
          avgRank: (c.positions.reduce((a, b) => a + b, 0) / c.positions.length).toFixed(1),
          mentions: c.mentions
        }))
        .sort((a, b) => a.avgRank - b.avgRank);

      const competitorAnalytics = { topCompetitors };

      const keywordInsights = extractBrandInsights(
        [{ questions: enrichedQuestions }],
        brand
      );

      const competitorSummary = { strengths: {} };
      topCompetitors.forEach(comp => {
        const strengthScore = Math.min(100, (comp.mentions * 10) + (10 - parseFloat(comp.avgRank)) * 5);
        competitorSummary.strengths[comp.name] = strengthScore;
      });

      const keywordWebsiteSummary = {
        websiteVisibilityScore: visibilityScore,
        sentimentBreakdown: {
          positive: visibilityScore >= 70 ? 60 : 20,
          neutral: visibilityScore >= 40 && visibilityScore < 70 ? 60 : 30,
          negative: visibilityScore < 40 ? 60 : 10
        }
      };

      const opportunitiesResult = generateOpportunities(
        keywordInsights,
        competitorSummary,
        keywordWebsiteSummary
      );

      const opportunities = [
        ...(opportunitiesResult.highPriority || []).map(desc => ({ type: "High Priority", description: desc })),
        ...(opportunitiesResult.mediumPriority || []).map(desc => ({ type: "Medium Priority", description: desc })),
        ...(opportunitiesResult.lowPriority || []).map(desc => ({ type: "Low Priority", description: desc }))
      ];

      results.push({
        ...kw,
        brandMentioned: final.brandMentioned,
        gptPosition: bestPosition || "Not Ranked",
        avgGptPosition: avgPosition || "N/A",
        mentionRate: `${mentionedCount}/10`,
        visibilityScore,
        sentiment: getSentiment(visibilityScore, final.brandMentioned),
        questions: questionDetails,

        enrichedQuestions,
        keywordAnalytics,
        competitorAnalytics,
        insights: keywordInsights,
        opportunities
      });
    }

    const allQuestions = results.map(r => ({
      questions: r.enrichedQuestions
    }));

    const rawInsights = extractBrandInsights(allQuestions, brand);

    const globalInsights = {
      strengths: rawInsights.brandStrengths || [],
      weaknesses: rawInsights.brandWeaknesses || [],
      frequentlyMentioned: rawInsights.frequentlyMentionedTopics || [],
      rarelyMentioned: rawInsights.rarelyMentionedTopics || [],
      neverMentioned: rawInsights.neverMentionedTopics || [],
      competitorTopics: rawInsights.competitorTopicDominance || {}
    };

    const websiteSummary = aggregateWebsite(results, brand);

    user.plan.usedKeywords += selectedKeywords.length;
    await user.save();

    console.log(`✅ Analysis complete: ${results.length} keywords processed`);

    return res.json({
      site,
      brand,
      description,
      industry,
      region,
      competitors: competitorList,

      results,
      summary: websiteSummary,
      insights: globalInsights,

      keywordSummary: {
        totalKeywords: results.length,
        avgVisibilityScore: Math.round(
          results.reduce((sum, r) => sum + r.visibilityScore, 0) / results.length
        ),
        keywordsMentioned: results.filter((r) => r.brandMentioned).length
      }
    });

  } catch (err) {
    console.error("❌ Visibility analysis failed:", err);
    console.error("Stack:", err.stack);
    return res.status(500).json({ error: "Visibility analysis failed" });
  }
};

export default {
  getKeywords,
  analyzeVisibility
};
