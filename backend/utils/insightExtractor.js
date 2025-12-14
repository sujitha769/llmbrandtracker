/**
 * ADVANCED INSIGHT ENGINE (v2)
 *
 * Works even if:
 * - Brand is never mentioned
 * - Keywords do not contain topicMap words
 * - Competitors dominate the rankings
 *
 * Outputs:
 *  - brandStrengths
 *  - brandWeaknesses
 *  - rankingPatterns
 *  - brandOpportunities
 *  - competitiveThreats
 *  - visibilityGaps
 */

export function extractBrandInsights(keywordResults, brand) {
  const brandLower = brand.toLowerCase();

  let totalQuestions = 0;
  let totalBrandMentions = 0;
  let totalCompetitorMentions = 0;

  const competitorMentionMap = {};
  const brandRankList = [];
  const competitorRankList = [];

  /* -----------------------------------------
      1️⃣ Scan ALL enrichedQuestions
  ------------------------------------------ */
  keywordResults.forEach(kw => {
    if (!kw.questions) return;

    kw.questions.forEach(q => {
      totalQuestions++;

      /* BRAND MENTION */
      if (q.brandMentioned) {
        totalBrandMentions++;
        if (q.brandPosition) brandRankList.push(q.brandPosition);
      }

      /* COMPETITOR MENTION */
      if (Array.isArray(q.competitorPositions)) {
        q.competitorPositions.forEach(cp => {
          totalCompetitorMentions++;

          if (!competitorMentionMap[cp.name]) {
            competitorMentionMap[cp.name] = { mentions: 0, ranks: [] };
          }

          competitorMentionMap[cp.name].mentions++;
          competitorMentionMap[cp.name].ranks.push(cp.position);
        });
      }
    });
  });

  /* -----------------------------------------
      2️⃣ Build Strengths & Weaknesses
  ------------------------------------------ */

  const brandStrengths = [];
  const brandWeaknesses = [];

  // Strength: Brand appears
  if (totalBrandMentions > 0) {
    brandStrengths.push("Your brand is being recognized in AI-generated discovery queries.");
  }

  // Weakness: Zero brand visibility
  if (totalBrandMentions === 0) {
    brandWeaknesses.push("Your brand is not appearing in AI discovery queries for relevant customer searches.");
  }

  // Strength: Brand ranks well
  if (brandRankList.length > 0) {
    const avgRank =
      brandRankList.reduce((a, b) => a + b, 0) / brandRankList.length;

    if (avgRank <= 5) {
      brandStrengths.push("Your brand ranks competitively compared to others.");
    } else {
      brandWeaknesses.push("Your brand appears but ranks lower than competitor alternatives.");
    }
  }

  // Weakness: Many competitors ranked but not your brand
  if (totalCompetitorMentions > totalBrandMentions * 3) {
    brandWeaknesses.push("Competitors dominate discovery queries more frequently than your brand.");
  }

  /* -----------------------------------------
      3️⃣ Ranking Pattern Insights
  ------------------------------------------ */
  const rankingPatterns = [];

  if (brandRankList.length > 0) {
    const best = Math.min(...brandRankList);
    const worst = Math.max(...brandRankList);

    rankingPatterns.push(`Best observed AI rank: #${best}`);
    rankingPatterns.push(`Worst observed AI rank: #${worst}`);
    rankingPatterns.push(
      `Average brand rank: #${(
        brandRankList.reduce((a, b) => a + b, 0) / brandRankList.length
      ).toFixed(1)}`
    );
  } else {
    rankingPatterns.push("Your brand never ranked for any analyzed questions.");
  }

  /* -----------------------------------------
      4️⃣ Opportunity Insights
  ------------------------------------------ */

  const brandOpportunities = [];

  // If the brand was never mentioned
  if (totalBrandMentions === 0) {
    brandOpportunities.push(
      "Increase topical relevance through SEO content targeting what customers actually search."
    );
    brandOpportunities.push(
      "Improve brand coverage in comparison lists, marketplaces, and directories."
    );
  }

  // Competitors appear often → brand gap
  if (Object.keys(competitorMentionMap).length > 0) {
    brandOpportunities.push(
      "Create content comparing your brand to top competitor alternatives."
    );
  }

  // No strong ranking
  if (brandRankList.every((r) => r > 5)) {
    brandOpportunities.push(
      "Strengthen authority signals to improve your ranking in AI-generated recommendations."
    );
  }

  /* -----------------------------------------
      5️⃣ Competitive Threats
  ------------------------------------------ */

  const competitiveThreats = [];

  Object.entries(competitorMentionMap).forEach(([name, info]) => {
    const avgRank =
      info.ranks.reduce((a, b) => a + b, 0) / info.ranks.length;

    if (avgRank < 5) {
      competitiveThreats.push(
        `${name} appears frequently in discovery queries and ranks high (avg rank #${avgRank.toFixed(
          1
        )}).`
      );
    } else {
      competitiveThreats.push(
        `${name} is visible in customer searches but not ranked aggressively.`
      );
    }
  });

  /* -----------------------------------------
      6️⃣ Visibility Gaps
  ------------------------------------------ */

  const visibilityGaps = [];

  if (totalBrandMentions === 0) {
    visibilityGaps.push("Your brand has 0% mention rate in all customer discovery queries.");
  }

  if (Object.keys(competitorMentionMap).length > 0) {
    visibilityGaps.push(
      "Competitors appear for keywords where your brand is completely absent."
    );
  }

  return {
    brandStrengths,
    brandWeaknesses,
    rankingPatterns,
    brandOpportunities,
    competitiveThreats,
    visibilityGaps
  };
}
