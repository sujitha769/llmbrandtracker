import cron from "node-cron";
import User from "./models/User.js";
import { runVisibilityScan } from "./workers/visibilityWorker.js";
import { sendAutoScanEmail } from "./services/emailService.js";

console.log("✅ Auto Cron Initialized");

// TESTING VALUES
const PRO_INTERVAL = 600 * 60 * 1000;        // 10 hour for testing
const BUSINESS_INTERVAL = 500 * 60 * 1000;   // 50 min for testing

cron.schedule("* * * * *", async () => {
  console.log("⏱️ Cron tick: Checking users...");

  try {
    const users = await User.find({
      "autoConfig.site": { $exists: true, $ne: "" }
    });

    if (!users.length) return;

    const now = Date.now();

    for (const user of users) {
      const plan = user.plan?.name?.toLowerCase();
      const lastRun = user.lastAutoRun || 0;

      const interval =
        plan === "pro" ? PRO_INTERVAL :
        plan === "business" ? BUSINESS_INTERVAL :
        null;

      if (!interval || now - lastRun < interval) continue;

      console.log(`🚀 Auto-scan for ${user.email}`);

      const scanData = await runVisibilityScan(user);
      if (!scanData) {
        console.log(`⚠️ No scan result for ${user.email}`);
        continue;
      }

      console.log("📦 Scan data received:", {
        hasResults: !!scanData.results,
        hasSummary: !!scanData.summary,
        hasKeywordSummary: !!scanData.keywordSummary
      });

      // ⭐ Format keyword data for UI
    // ⭐ Format keyword data for UI with enriched questions
const results = scanData.results || [];
const formattedKeywords = results.map(r => {
  const compList = r.competitorAnalytics?.topCompetitors || [];
  const top = compList[0] || {};

  return {
    keyword: r.keyword,
    position: Number(r.position) || 0,
    mentionRate: r.mentionRate || "--",
    gptPosition:
      r.gptPosition && r.gptPosition !== "Not Ranked"
        ? Number(r.gptPosition)
        : "Not Ranked",
    avgGptPosition:
      r.avgGptPosition && r.avgGptPosition !== "N/A"
        ? Number(r.avgGptPosition)
        : "N/A",
    competitors: compList.length || 0,
    topCompetitor: top.name || "None",
    avgRank: top.avgRank || null,
    // ⭐ ADD THIS: Include enriched questions for email
    enrichedQuestions: r.enrichedQuestions || []
  };
});

      console.log("✅ Formatted keywords:", formattedKeywords);

      const History = (await import("./models/History.js")).default;

      const historyEntry = {
        userEmail: user.email,
        timestamp: now,
        autoScan: true,
        autoKeyword: scanData.autoKeyword,

        brand: scanData.brand || user.autoConfig.brand,
        site: scanData.site || user.autoConfig.site,
        industry: scanData.industry || user.autoConfig.industry,
        region: scanData.region || user.autoConfig.region,

        websiteVisibilityScore: scanData.summary?.websiteVisibilityScore || 0,
        shareOfRecommendation: scanData.summary?.shareOfRecommendation || 0,
        totalKeywords: scanData.keywordSummary?.totalKeywords || results.length || 1,
        totalCompetitors: scanData.keywordSummary?.totalCompetitors || 0,
        topCompetitor: scanData.summary?.topCompetitor || "None",
        brandMentionCoverage: scanData.keywordSummary?.brandMentionCoverage || 0,
        avgBrandPosition: scanData.summary?.avgBrandPosition || null,

        keywordsData: formattedKeywords
      };

      console.log("💾 Saving to history:", historyEntry);

      await History.create(historyEntry);

      // ⭐ SEND EMAIL NOTIFICATION
      console.log("📧 Sending email notification...");
      await sendAutoScanEmail(user.email, historyEntry);

      user.lastAutoRun = now;
      await user.save();

      console.log(`📦 Auto-scan saved for ${user.email}`);
    }

  } catch (err) {
    console.error("❌ Cron error:", err.message, err.stack);
  }
});