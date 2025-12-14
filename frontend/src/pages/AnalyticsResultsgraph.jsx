import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const AnalyticsResultsgraph = ({ analysisId, userEmail }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAnalysisData();
  }, [analysisId, userEmail]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      
      const historyUrl = `${import.meta.env.VITE_BACKEND_URL}/api/history/${userEmail}`;
      const historyRes = await fetch(historyUrl);
      const historyJson = await historyRes.json();
      
      if (historyJson.success && historyJson.history && historyJson.history.length > 0) {
        let currentAnalysis;
        if (analysisId) {
          const specificUrl = `${import.meta.env.VITE_BACKEND_URL}/api/history/item/${analysisId}`;
          const specificRes = await fetch(specificUrl);
          const specificJson = await specificRes.json();
          currentAnalysis = specificJson.success ? specificJson.analysis : historyJson.history[0];
        } else {
          currentAnalysis = historyJson.history[0];
        }
        
        currentAnalysis.fullHistory = historyJson.history;
        setData(currentAnalysis);
      }
    } catch (error) {
      console.error("Error loading analysis:", error);
    } finally {
      setLoading(false);
    }
  };

 if (loading) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f9fafb", padding: "32px 24px" }}>
      <div style={{ width: "100vw", padding: "0 24px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }}></div>
          <p style={{ color: "#6b7280", fontSize: 15, fontWeight: 500 }}>Loading results…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    </div>
  );
}

if (!data) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f9fafb", padding: "32px 24px" }}>
      <div style={{ width: "100vw", padding: "0 24px" }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" style={{ margin: "0 auto 16px" }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 }}>No Data Found</h3>
          <p style={{ color: "#6b7280", fontSize: 14 }}>No analysis data available.</p>
        </div>
      </div>
    </div>
  );
}
  const prepareTimelineData = () => {
    if (!data.fullHistory || data.fullHistory.length === 0) return [];
    
    // Sort by timestamp (oldest first for chronological display)
    const sortedHistory = [...data.fullHistory].sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove duplicates based on timestamp
    const uniqueHistory = sortedHistory.filter((analysis, index, self) => 
      index === self.findIndex((a) => a.timestamp === analysis.timestamp)
    );
    
    const chartData = uniqueHistory.map((analysis, index) => {
      // Calculate avgBrandPosition from keywordsData
      let brandPos = null;
      let isNA = true;
      
      if (analysis.keywordsData && Array.isArray(analysis.keywordsData)) {
        // Find all keywords that have valid GPT positions
        const rankedKeywords = analysis.keywordsData.filter(kw => 
          kw.gptPosition && 
          kw.gptPosition !== "Not Ranked" && 
          kw.gptPosition !== "N/A" &&
          !isNaN(parseFloat(kw.gptPosition))
        );
        
        // If we have ranked keywords, calculate average
        if (rankedKeywords.length > 0) {
          const sum = rankedKeywords.reduce((acc, kw) => {
            return acc + parseFloat(kw.gptPosition);
          }, 0);
          brandPos = parseFloat((sum / rankedKeywords.length).toFixed(2));
          isNA = false;
        }
      }
      
      // If still no valid position, check the avgBrandPosition field
      if (isNA && analysis.avgBrandPosition) {
        const storedPos = analysis.avgBrandPosition;
        if (storedPos !== "N/A" && 
            storedPos !== null && 
            storedPos !== undefined && 
            !isNaN(parseFloat(storedPos))) {
          brandPos = parseFloat(storedPos);
          isNA = false;
        }
      }
      
      // If no valid position found, set to 10 (bottom of chart)
      if (isNA || brandPos === null) {
        brandPos = 10;
        isNA = true;
      }
      
      const dataPoint = {
        name: `Analysis ${index + 1}`,
        analysisDate: new Date(analysis.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: analysis.timestamp,
        brandPosition: brandPos,
        isNA: isNA,
        keywordDetails: (analysis.keywordsData || []).map(kw => ({
          keyword: kw.keyword,
          gptPosition: kw.gptPosition,
          avgGptPosition: kw.avgGptPosition,
          mentionRate: kw.mentionRate
        })),
        rankedKeywords: (analysis.keywordsData || []).filter(
          kw => kw.gptPosition && kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A"
        ).length,
        totalKeywords: analysis.totalKeywords || 0,
        visibilityScore: analysis.websiteVisibilityScore || 0,
        shareOfRecommendation: analysis.shareOfRecommendation || 0
      };
      
      return dataPoint;
    });
    
    return chartData;
  };

  const prepareDistributionData = () => {
    if (!data.fullHistory || data.fullHistory.length === 0) {
      return [
        { name: "Ranked", value: 0, color: "#3b82f6" },
        { name: "Not Ranked", value: 0, color: "#f59e0b" },
        { name: "Competitors", value: 0, color: "#ef4444" }
      ];
    }

    // Aggregate data from ALL history
    let totalRanked = 0;
    let totalNotRanked = 0;
    let competitorSet = new Set();

    data.fullHistory.forEach(analysis => {
      if (analysis.keywordsData && Array.isArray(analysis.keywordsData)) {
        analysis.keywordsData.forEach(kw => {
          // Count ranked vs not ranked
          if (kw.gptPosition && kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A") {
            totalRanked++;
          } else {
            totalNotRanked++;
          }
          
          // Collect unique competitors
          if (kw.competitorAnalytics && kw.competitorAnalytics.topCompetitors) {
            kw.competitorAnalytics.topCompetitors.forEach(comp => {
              competitorSet.add(comp.name);
            });
          } else if (kw.questions && Array.isArray(kw.questions)) {
            kw.questions.forEach(q => {
              if (q.competitorPositions && Array.isArray(q.competitorPositions)) {
                q.competitorPositions.forEach(comp => {
                  competitorSet.add(comp.name);
                });
              }
            });
          }
        });
      }
    });

    return [
      { name: "Ranked", value: totalRanked, color: "#3b82f6" },
      { name: "Not Ranked", value: totalNotRanked, color: "#f59e0b" },
      { name: "Competitors", value: competitorSet.size, color: "#ef4444" }
    ];
  };

  const prepareCompetitorData = () => {
    if (!data.fullHistory || data.fullHistory.length === 0) return [];
    
    // Aggregate competitor data from ALL history
    const competitorMap = new Map();

    data.fullHistory.forEach(analysis => {
      if (analysis.keywordsData && Array.isArray(analysis.keywordsData)) {
        analysis.keywordsData.forEach(kw => {
          let competitors = [];
          
          if (kw.competitorAnalytics && kw.competitorAnalytics.topCompetitors) {
            competitors = kw.competitorAnalytics.topCompetitors;
          } else if (kw.questions && Array.isArray(kw.questions) && kw.questions.length > 0) {
            if (kw.questions[0].competitorPositions) {
              competitors = kw.questions[0].competitorPositions.map(cp => ({
                name: cp.name,
                count: 1,
                avgRank: cp.position || 0
              }));
            }
          }
          
          competitors.forEach(comp => {
            if (competitorMap.has(comp.name)) {
              const existing = competitorMap.get(comp.name);
              existing.mentions += (comp.count || comp.strength || 1);
              existing.totalRank += (comp.avgRank || comp.position || 0);
              existing.occurrences++;
            } else {
              competitorMap.set(comp.name, {
                name: comp.name,
                mentions: comp.count || comp.strength || 1,
                totalRank: comp.avgRank || comp.position || 0,
                occurrences: 1
              });
            }
          });
        });
      }
    });

    // Convert to array and calculate average ranks
    const competitorArray = Array.from(competitorMap.values()).map(comp => ({
      name: comp.name.slice(0, 20),
      mentions: comp.mentions,
      avgRank: comp.occurrences > 0 ? parseFloat((comp.totalRank / comp.occurrences).toFixed(2)) : 0
    }));

    // Sort by mentions (descending) and return top 5
    return competitorArray
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, 5);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const timelineData = prepareTimelineData();
  const distributionData = prepareDistributionData();
  const competitorData = prepareCompetitorData();

  const hasEnoughData = timelineData.length >= 1;

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div style={{
          background: "white",
          border: "2px solid #3b82f6",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          maxWidth: 400
        }}>
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "2px solid #f3f4f6" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
              {data.name}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {data.analysisDate}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>Brand Position:</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: data.isNA ? "#ef4444" : "#3b82f6" }}>
                {data.isNA ? "N/A" : `#${data.brandPosition}`}
              </span>
            </div>
            {data.isNA && (
              <div style={{ fontSize: 11, color: "#ef4444", fontStyle: "italic", marginBottom: 8 }}>
                No ranked keywords in this analysis
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#6b7280" }}>Visibility Score:</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>{data.visibilityScore}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: "#6b7280" }}>Share of Recommendation:</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>{data.shareOfRecommendation}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "#6b7280" }}>Ranked Keywords:</span>
              <span style={{ fontWeight: 600, color: "#111827" }}>
                {data.rankedKeywords}/{data.totalKeywords}
              </span>
            </div>
          </div>

          {data.keywordDetails && data.keywordDetails.length > 0 && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "2px solid #f3f4f6" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                Keywords Analyzed ({data.keywordDetails.length}):
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {data.keywordDetails.slice(0, 10).map((kw, idx) => (
                  <div key={idx} style={{
                    fontSize: 11,
                    padding: "6px 8px",
                    background: idx % 2 === 0 ? "#f9fafb" : "white",
                    borderRadius: 4,
                    marginBottom: 4
                  }}>
                    <div style={{ fontWeight: 600, color: "#374151", marginBottom: 2 }}>
                      {kw.keyword}
                    </div>
                    <div style={{ display: "flex", gap: 12, color: "#6b7280" }}>
                      <span>
                        GPT Rank: <strong style={{ color: kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A" ? "#3b82f6" : "#ef4444" }}>
                          {kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A" ? `#${kw.gptPosition}` : "Not Ranked"}
                        </strong>
                      </span>
                      {kw.avgGptPosition && kw.avgGptPosition !== "N/A" && (
                        <span>
                          Avg: <strong>#{kw.avgGptPosition}</strong>
                        </span>
                      )}
                      {kw.mentionRate && (
                        <span>
                          Rate: <strong>{kw.mentionRate}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {data.keywordDetails.length > 10 && (
                  <div style={{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginTop: 4 }}>
                    +{data.keywordDetails.length - 10} more keywords...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "32px 24px" }}>
      <style>{`
        .card-hover { transition: all 0.2s ease; border: 1px solid #e5e7eb; }
        .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .tab-btn { transition: all 0.2s ease; }
        .tab-btn:hover { background: #f3f4f6; }
        .tab-active { background: #3b82f6 !important; color: white !important; }
      `}</style>

      <div style={{ width: "100vw", padding: "0 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#740ebcff", marginBottom: 4 }}>
                Analysis Report
              </h1>
              <p style={{ color: "#6b7280", fontSize: 15 }}>
                {data.brand} • {data.industry} • {formatDate(data.timestamp)}
              </p>
            </div>
            
            <button 
              onClick={() => window.print()}
              style={{ 
                padding: "10px 20px", 
                background: "white", 
                border: "1px solid #d1d5db", 
                borderRadius: 8, 
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Export Report
            </button>
          </div>

          <div style={{ display: "flex", gap: 8, background: "white", padding: 6, borderRadius: 10, border: "1px solid #e5e7eb", width: "fit-content" }}>
            <button 
              onClick={() => setActiveTab("overview")}
              className={`tab-btn ${activeTab === "overview" ? "tab-active" : ""}`}
              style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#6b7280", background: "transparent" }}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab("keywords")}
              className={`tab-btn ${activeTab === "keywords" ? "tab-active" : ""}`}
              style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#6b7280", background: "transparent" }}
            >
              Keywords
            </button>
            <button 
              onClick={() => setActiveTab("competitors")}
              className={`tab-btn ${activeTab === "competitors" ? "tab-active" : ""}`}
              style={{ padding: "8px 20px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#6b7280", background: "transparent" }}
            >
              Competitors
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 32 }}>
              <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>Visibility Score</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: getScoreColor(data.websiteVisibilityScore) }}>
                      {data.websiteVisibilityScore}
                    </div>
                  </div>
                  <div style={{ width: 48, height: 48, background: "#eff6ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {data.websiteVisibilityScore >= 80 ? "Excellent" : data.websiteVisibilityScore >= 60 ? "Good" : data.websiteVisibilityScore >= 40 ? "Fair" : "Needs Improvement"}
                </div>
              </div>

              <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>Share of Recommendation</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>
                      {data.shareOfRecommendation}%
                    </div>
                  </div>
                  <div style={{ width: 48, height: 48, background: "#f0fdf4", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Brand mention coverage
                </div>
              </div>

              <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>Keywords Analyzed</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>
                      {data.totalKeywords}
                    </div>
                  </div>
                  <div style={{ width: 48, height: 48, background: "#fef3c7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  Across {data.region}
                </div>
              </div>

              <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, fontWeight: 500 }}>Avg Brand Position</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>
                      {data.avgBrandPosition && data.avgBrandPosition !== "N/A" ? `#${data.avgBrandPosition}` : "N/A"}
                    </div>
                  </div>
                  <div style={{ width: 48, height: 48, background: "#f3e8ff", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                      <circle cx="12" cy="8" r="7"></circle>
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  In GPT rankings
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 32 }}>
              <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Brand Position Trend</h3>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                      Average brand ranking across {timelineData.length} {timelineData.length === 1 ? 'analysis' : 'analyses'}
                    </p>
                  </div>
                  <div style={{ background: "#eff6ff", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#3b82f6" }}>
                    {data.brand}
                  </div>
                </div>
                
                {hasEnoughData ? (
                  <ResponsiveContainer width="100%" height={520}>
                    <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 20, bottom: 70 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="analysisDate" 
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        reversed 
                        tick={{ fontSize: 11, fill: "#6b7280" }} 
                        label={{ value: 'Brand Position (Lower is Better)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: "#6b7280" } }}
                        domain={[1, 10]}
                        ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                      />
                     
                      <Line 
                        type="monotone" 
                        dataKey="brandPosition" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        name="Brand Position" 
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={8}
                              fill={payload.isNA ? "#ef4444" : "#3b82f6"}
                              stroke="white"
                              strokeWidth={3}
                            />
                          );
                        }}
                        activeDot={(props) => {
                          const { cx, cy, payload } = props;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={10}
                              fill={payload.isNA ? "#ef4444" : "#3b82f6"}
                              stroke="white"
                              strokeWidth={3}
                            />
                          );
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: 8, border: '1px dashed #d1d5db' }}>
                    <div style={{ textAlign: 'center', padding: 24 }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ margin: '0 auto 12px' }}>
                        <line x1="18" y1="20" x2="18" y2="10"></line>
                        <line x1="12" y1="20" x2="12" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="14"></line>
                      </svg>
                      <p style={{ color: '#6b7280', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                        Need More Analyses
                      </p>
                      <p style={{ color: '#9ca3af', fontSize: 12 }}>
                        Run at least 1 analysis with ranked keywords to see performance trends
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Analytics</h3>
                <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Distribution across all history</p>
                
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ marginTop: 16 }}>
                  {distributionData.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < distributionData.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: item.color }}></div>
                        <span style={{ fontSize: 13, color: "#6b7280" }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Top Performing Keywords</h3>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Best ranked keywords by GPT position</p>
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Keyword</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>GSC Rank</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>GPT Rank</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Mention Rate</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.keywordsData?.slice(0, 5).map((kw, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, color: "#111827" }}>{kw.keyword}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#6b7280" }}>{kw.position || "--"}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>
                          {kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A" ? `#${kw.gptPosition}` : "Not Ranked"}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#6b7280" }}>{kw.mentionRate || "--"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ 
                            padding: "4px 10px", 
                            borderRadius: 6, 
                            fontSize: 12, 
                            fontWeight: 600,
                            background: kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A" ? "#d1fae5" : "#fee2e2",
                            color: kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A" ? "#10b981" : "#ef4444"
                          }}>
                            {kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A" ? "Ranked" : "Not Ranked"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "keywords" && (
          <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 20 }}>All Keywords Analysis</h3>
            
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>#</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>Keyword</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>GSC Position</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>GPT Position</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>Avg GPT Rank</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>Mention Rate</th>
                    <th style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase" }}>Competitors</th>
                  </tr>
                </thead>
                <tbody>
                  {data.keywordsData?.map((kw, idx) => {
                    const competitorCount = kw.competitorAnalytics?.topCompetitors?.length || 
                                          kw.questions?.[0]?.competitorPositions?.length || 0;
                    
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#6b7280" }}>{idx + 1}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 500, color: "#111827" }}>{kw.keyword}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#6b7280" }}>{kw.position || "--"}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#3b82f6" }}>
                          {kw.gptPosition !== "Not Ranked" && kw.gptPosition !== "N/A" ? `#${kw.gptPosition}` : "Not Ranked"}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#6b7280" }}>
                          {kw.avgGptPosition !== "N/A" ? `#${kw.avgGptPosition}` : "--"}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 14, color: "#6b7280" }}>{kw.mentionRate || "--"}</td>
                        <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 600, color: "#111827" }}>{competitorCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "competitors" && (
          <>
            <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Top Competitors</h3>
              <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Competitor mention frequency and rankings across all history</p>
              
              {competitorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={competitorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="mentions" fill="#3b82f6" name="Mentions" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="avgRank" fill="#f59e0b" name="Avg Rank" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', borderRadius: 8 }}>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>No competitor data available</p>
                </div>
              )}
            </div>

            <div className="card-hover" style={{ background: "white", padding: 24, borderRadius: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111827", marginBottom: 20 }}>Competitor Details</h3>
              
              {competitorData.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                  {competitorData.map((comp, idx) => (
                    <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#6b7280" }}>
                          {idx + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 2 }}>{comp.name}</div>
                          <div style={{ fontSize: 12, color: "#6b7280" }}>Competitor</div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #f3f4f6" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Mentions</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{comp.mentions}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>Avg Rank</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b" }}>#{comp.avgRank}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 40, textAlign: 'center', background: '#f9fafb', borderRadius: 8 }}>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>No competitor data available</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsResultsgraph;