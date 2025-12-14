// backend/utils/websiteAggregator.js

/**
 * ============================================================
 *  SIMPLIFIED WEBSITE-LEVEL AGGREGATION
 *  Input : results[] (keyword analysis results from backend)
 *  Output: Executive-level website metrics
 * ============================================================
 */

export function aggregateWebsite(results = [], brand) {
  if (!results || results.length === 0) {
    return {
      websiteVisibilityScore: 0,
      shareOfRecommendation: 0,
      topCompetitors: [],
      regionVisibilityScore: 0,
      totalKeywordsAnalyzed: 0,
      avgBrandMentionRate: 0
    };
  }

  /* ------------------------------------------------------
     1️⃣ WEBSITE VISIBILITY SCORE
     Average visibility across all keywords
     ------------------------------------------------------ */
  const websiteVisibilityScore = Math.round(
    results.reduce((sum, r) => sum + (r.visibilityScore || 0), 0) / results.length
  );

  /* ------------------------------------------------------
     2️⃣ SHARE OF RECOMMENDATION
     Brand mentions vs total questions asked
     ------------------------------------------------------ */
  let brandMentions = 0;
  let totalQuestions = 0;

  results.forEach((r) => {
    // mentionRate format: "7/10"
    const parts = (r.mentionRate || "0/0").split("/");
    brandMentions += parseInt(parts[0], 10) || 0;
    totalQuestions += parseInt(parts[1], 10) || 0;
  });

  const shareOfRecommendation = totalQuestions === 0 
    ? 0 
    : Math.round((brandMentions / totalQuestions) * 100);

  const avgBrandMentionRate = totalQuestions === 0
    ? 0
    : ((brandMentions / totalQuestions) * 100).toFixed(1);

  /* ------------------------------------------------------
     3️⃣ TOP COMPETITORS AGGREGATION
     Combine competitor data from all keywords
     ------------------------------------------------------ */
  const competitorMap = {};

  results.forEach((r) => {
    const competitors = r.competitorAnalytics?.topCompetitors || [];
    
    competitors.forEach(comp => {
      if (!competitorMap[comp.name]) {
        competitorMap[comp.name] = {
          name: comp.name,
          totalMentions: 0,
          ranks: [],
          keywordsAppeared: 0
        };
      }
      
      competitorMap[comp.name].totalMentions += comp.mentions || 0;
      competitorMap[comp.name].ranks.push(parseFloat(comp.avgRank));
      competitorMap[comp.name].keywordsAppeared += 1;
    });
  });

  // Calculate final competitor stats
  const topCompetitors = Object.values(competitorMap)
    .map(comp => ({
      name: comp.name,
      strength: comp.totalMentions,
      avgRank: comp.ranks.length > 0 
        ? (comp.ranks.reduce((a, b) => a + b, 0) / comp.ranks.length).toFixed(1) 
        : "N/A",
      appearsInKeywords: comp.keywordsAppeared,
      keywordCoverage: ((comp.keywordsAppeared / results.length) * 100).toFixed(1) + "%"
    }))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 10); // Top 10 competitors

  /* ------------------------------------------------------
     4️⃣ REGION VISIBILITY SCORE
     Weighted formula combining visibility and share
     ------------------------------------------------------ */
  const regionVisibilityScore = Math.round(
    websiteVisibilityScore * 0.7 + shareOfRecommendation * 0.3
  );

  /* ------------------------------------------------------
     5️⃣ ADDITIONAL METRICS
     ------------------------------------------------------ */
  
  // Count keywords where brand is mentioned at least once
  const keywordsWithBrandMention = results.filter(r => {
    const parts = (r.mentionRate || "0/0").split("/");
    return parseInt(parts[0], 10) > 0;
  }).length;

  // Average brand position when mentioned
  const brandPositions = results
    .map(r => r.gptPosition)
    .filter(pos => pos !== "Not Ranked" && pos !== null && pos !== undefined)
    .map(pos => parseInt(pos, 10));

  const avgBrandPosition = brandPositions.length > 0
    ? (brandPositions.reduce((a, b) => a + b, 0) / brandPositions.length).toFixed(1)
    : null;

  // Best and worst performing keywords - NO OVERLAP
  const sortedByVisibility = [...results].sort((a, b) => b.visibilityScore - a.visibilityScore);
  
  let bestKeywords = [];
  let worstKeywords = [];
  
  if (results.length >= 6) {
    // If 6+ keywords: top 3 best, bottom 3 worst (no overlap)
    bestKeywords = sortedByVisibility.slice(0, 3).map(r => ({
      keyword: r.keyword,
      visibilityScore: r.visibilityScore,
      mentionRate: r.mentionRate
    }));

    worstKeywords = sortedByVisibility.slice(-3).reverse().map(r => ({
      keyword: r.keyword,
      visibilityScore: r.visibilityScore,
      mentionRate: r.mentionRate
    }));
  } else {
    // If less than 6 keywords: split by score threshold (40)
    const goodKeywords = sortedByVisibility.filter(r => r.visibilityScore >= 40);
    const badKeywords = sortedByVisibility.filter(r => r.visibilityScore < 40);
    
    bestKeywords = goodKeywords.slice(0, 3).map(r => ({
      keyword: r.keyword,
      visibilityScore: r.visibilityScore,
      mentionRate: r.mentionRate
    }));
    
    worstKeywords = badKeywords.map(r => ({
      keyword: r.keyword,
      visibilityScore: r.visibilityScore,
      mentionRate: r.mentionRate
    }));
  }

  /* ------------------------------------------------------
     FINAL WEBSITE OUTPUT
     ------------------------------------------------------ */
  return {
    // Core Metrics
    websiteVisibilityScore,
    shareOfRecommendation,
    regionVisibilityScore,
    
    // Competitor Analysis
    topCompetitors,
    
    // Brand Performance
    totalKeywordsAnalyzed: results.length,
    keywordsWithBrandMention,
    brandMentionCoverage: ((keywordsWithBrandMention / results.length) * 100).toFixed(1) + "%",
    avgBrandMentionRate: avgBrandMentionRate + "%",
    avgBrandPosition,
    
    // Top/Bottom Performers
    bestPerformingKeywords: bestKeywords,
    worstPerformingKeywords: worstKeywords,
    
    // Summary Stats
    totalBrandMentions: brandMentions,
    totalQuestionsAnalyzed: totalQuestions
  };
}