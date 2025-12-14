import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },

    // BASIC FIELDS
    brand: String,
    site: String,
    industry: String,
    region: String,

    // LEGACY FIELDS (safe to keep)
    websiteVisibilityScore: Number,
    shareOfRecommendation: Number,
    totalKeywords: Number,
    totalCompetitors: Number,
    topCompetitor: String,
    brandMentionCoverage: String,
    avgBrandPosition: String,
    keywordsData: { type: Array, default: [] },

    // FULL ANALYSIS (manual + auto)
    results: { type: Array, default: [] },     
    summary: { type: Object, default: {} },
    insights: { type: Object, default: {} },
    keywordSummary: { type: Object, default: {} },

    // AUTO SCAN INFO
    autoScan: { type: Boolean, default: false },
    autoKeyword: String,

    timestamp: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("History", HistorySchema);
