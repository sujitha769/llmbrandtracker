import { analyzeVisibility } from "../controllers/visibilityController.js";
import { getUserTokensFromDB } from "../controllers/authController.js";
import { google } from "googleapis";
import oauth2Client from "../config/googleClient.js";

// Helper: Get last 3 months date range
function getLast3Months() {
  const end = new Date();
  const start = new Date();
  start.setMonth(end.getMonth() - 3);
  const fmt = (d) => d.toISOString().split("T")[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

// ⭐ NEW: Fetch real keywords from GSC
async function getTopKeywordsFromGSC(site, tokens, limit = 10) {
  try {
    oauth2Client.setCredentials(tokens);
    const webmasters = google.webmasters({ version: "v3", auth: oauth2Client });

    const { startDate, endDate } = getLast3Months();

    const gsc = await webmasters.searchanalytics.query({
      siteUrl: site,
      requestBody: { 
        startDate, 
        endDate, 
        dimensions: ["query"], 
        rowLimit: limit 
      }
    });

    const keywords = (gsc.data.rows || [])
      .sort((a, b) => b.impressions - a.impressions)
      .map(r => r.keys[0]);

    return keywords;
  } catch (err) {
    console.error("❌ Failed to fetch GSC keywords:", err.message);
    return [];
  }
}

export async function runVisibilityScan(user) {
  try {
    if (!user?.autoConfig?.site) {
      console.log("⚠️ No site configured for auto scan:", user.email);
      return null;
    }

    // ⭐ Get tokens from database
    const googleTokens = await getUserTokensFromDB(user.email);
    
    if (!googleTokens || !googleTokens.access_token) {
      console.log("❌ No Google tokens found in database for:", user.email);
      console.log("💡 User needs to login again to authorize auto scans");
      return null;
    }

    console.log("🔄 Auto Scan Started For:", user.email);
    console.log("✅ Found stored Google tokens for GSC access");

    // ⭐ If user has configured keywords, use one of them
    // Otherwise, fetch top keywords from GSC
    let selectedKeyword;

    if (user.autoConfig.keywords?.length > 0) {
      // Try user's configured keywords first
      const keywords = user.autoConfig.keywords;
      selectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      console.log("🎯 Using user-configured keyword:", selectedKeyword);
    } else {
      // Fetch real keywords from GSC
      console.log("🔍 No configured keywords, fetching from GSC...");
      const gscKeywords = await getTopKeywordsFromGSC(user.autoConfig.site, googleTokens, 10);
      
      if (gscKeywords.length === 0) {
        console.log("❌ No keywords found in GSC for this site");
        return null;
      }

      selectedKeyword = gscKeywords[Math.floor(Math.random() * gscKeywords.length)];
      console.log("🎯 Auto-selected keyword from GSC:", selectedKeyword);
    }

    let capturedData = null;

    const req = {
      body: {
        site: user.autoConfig.site,
        brand: user.autoConfig.brand,
        description: user.autoConfig.description,
        industry: user.autoConfig.industry,
        region: user.autoConfig.region,
        competitors: user.autoConfig.competitors.join(", "),
        selectedKeywords: [selectedKeyword]
      },
      query: { email: user.email },
      // ⭐ Pass tokens for GSC API access
      googleTokens: googleTokens
    };

    const res = {
      json: (data) => {
        capturedData = data;
        return res;
      },
      status: (code) => ({
        json: (data) => {
          capturedData = data;
          return res;
        }
      })
    };

    await analyzeVisibility(req, res);

    console.log("📊 Captured data structure:", JSON.stringify(capturedData, null, 2));

    if (!capturedData) {
      console.log("❌ No data captured from analyzeVisibility");
      return null;
    }

    if (!capturedData.results || capturedData.results.length === 0) {
      console.log("⚠️ Analysis returned empty results array");
      console.log("💡 This might be because:");
      console.log("   - GSC API didn't return data for this keyword");
      console.log("   - The keyword doesn't have ranking data");
      console.log("   - Token might be expired");
    }

    return {
      ...capturedData,
      autoKeyword: selectedKeyword
    };

  } catch (err) {
    console.log("❌ Auto Scan Error:", err.message);
    console.log("Stack:", err.stack);
    return null;
  }
}