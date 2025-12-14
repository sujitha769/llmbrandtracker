/**
 * STAGE 8 — Opportunity Engine (SAFE VERSION)
 *
 * This version avoids all undefined crashes:
 *  - websiteSummary.websiteVisibilityScore may not exist
 *  - brandInsights may not contain topics
 *  - competitorSummary may not contain strengths
 */

export function generateOpportunities(
  brandInsights = {},
  competitorSummary = {},
  websiteSummary = {}
) {
  const opportunities = {
    high: [],
    medium: [],
    low: []
  };

  // 🔒 SAFE defaults
  const visibility = websiteSummary.websiteVisibilityScore || 0;
  const neverTopics = brandInsights.neverMentionedTopics || [];
  const rarelyTopics = brandInsights.rarelyMentionedTopics || [];
  const freqTopics = brandInsights.frequentlyMentionedTopics || [];
  const weaknesses = brandInsights.brandWeaknesses || [];
  const strengths = competitorSummary.strengths || {};
  const sentiment = websiteSummary.sentimentBreakdown || {};

  /* -----------------------------------------------------
     1️⃣ HIGH PRIORITY
  ----------------------------------------------------- */

  // Low visibility → biggest opportunity
  if (visibility < 50) {
    opportunities.high.push(
      "Your brand visibility is low. Create search-focused content and ensure brand mentions across key pages."
    );
  }

  // Topics GPT NEVER links to your brand
  neverTopics.forEach(topic => {
    opportunities.high.push(
      `Create strong, authoritative content on '${topic}' — GPT never associates your brand with this key topic.`
    );
  });

  // Weaknesses extracted from AI insights
  weaknesses.forEach(w => {
    opportunities.high.push(`Fix critical weakness: ${w}`);
  });

  // Competitor dominance signals missing content gaps
  Object.entries(strengths).forEach(([comp, score]) => {
    if (score > 70) {
      opportunities.high.push(
        `Competitor ${comp} dominates this niche. Analyze their landing pages and replicate/improve their content depth.`
      );
    }
  });

  /* -----------------------------------------------------
     2️⃣ MEDIUM PRIORITY
  ----------------------------------------------------- */

  rarelyTopics.forEach(topic => {
    opportunities.medium.push(
      `Increase content coverage around '${topic}' — GPT only rarely associates your brand with this topic.`
    );
  });

  if (sentiment.neutral > 50) {
    opportunities.medium.push(
      "Your brand perception is mostly neutral. Add testimonials, reviews, and case studies to increase trust."
    );
  }

  opportunities.medium.push(
    "Create comparison articles vs top competitors to win commercial-intent search queries."
  );

  /* -----------------------------------------------------
     3️⃣ LOW PRIORITY
  ----------------------------------------------------- */

  if (freqTopics.length > 0) {
    opportunities.low.push(
      `Maintain strong coverage on: ${freqTopics.join(", ")}`
    );
  }

  opportunities.low.push("Add FAQ content for long-tail discovery queries.");
  opportunities.low.push("Implement structured data to enhance search visibility.");

  /* -----------------------------------------------------
     RETURN FINAL UNIQUE LISTS
  ----------------------------------------------------- */
  return {
    highPriority: [...new Set(opportunities.high)],
    mediumPriority: [...new Set(opportunities.medium)],
    lowPriority: [...new Set(opportunities.low)]
  };
}
