import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CompetitorAnalysis from '../components/CompetitorAnalysis';

const AnalyzeResults = ({ userEmail }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    site, brand, description, industry, region, competitors, selectedKeywords
  } = state || {};

  const [loading, setLoading] = useState(true);
  const [aiMessage, setAiMessage] = useState("Thinking…");
  const [remainingTime, setRemainingTime] = useState(0);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [websiteSummary, setWebsiteSummary] = useState(null);

  useEffect(() => {
    if (!state) navigate("/analyze");
  }, [state, navigate]);

  useEffect(() => {
    if (!selectedKeywords) return;
    setRemainingTime(selectedKeywords.length * 30);
  }, [selectedKeywords]);

  useEffect(() => {
    if (!loading) return;
    const timer = setInterval(() => setRemainingTime((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    setAiMessage("Analyzing your data…");
  }, [loading]);

  useEffect(() => {
    runAnalysis();
  }, []);


 const [historySaved, setHistorySaved] = useState(false);

useEffect(() => {
  if (!loading && websiteSummary && !historySaved) {
    saveToHistory();
    setHistorySaved(true); // prevent double save
  }
}, [loading, websiteSummary, historySaved]);


  const runAnalysis = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/gsc/visibility?email=${userEmail}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site, brand, description, industry, region, competitors,
            selectedKeywords: selectedKeywords.map((k) => k.keyword)
          })
        }
      );

    
      if (!response.ok) {
        const err = await response.json();
        alert(err.message || "Unexpected error occurred.");
        setLoading(false);
        return;
      }
const json = await response.json();
setData(json.results || []);
console.log("KEYWORD SAMPLE:", json.results?.[0]);
setSummary(json.keywordSummary || null);
setWebsiteSummary(json.summary || null);

    } catch (err) {
      console.error(err);
      alert("Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

const saveToHistory = async () => {
  if (!websiteSummary) return;

  const analysisRecord = {
    userEmail,
    timestamp: Date.now(),
    brand,
    site,
    industry,
    region,

    // Summary-level fields
    totalKeywords: selectedKeywords.length,
    websiteVisibilityScore: websiteSummary.websiteVisibilityScore || 0,
    shareOfRecommendation: websiteSummary.shareOfRecommendation || 0,
    brandMentionCoverage: websiteSummary.brandMentionCoverage || "0%",
    avgBrandPosition: websiteSummary.avgBrandPosition || "N/A",

    totalCompetitors: websiteSummary.topCompetitors?.length || 0,
    topCompetitor: websiteSummary.topCompetitors?.[0]?.name || "N/A",

    totalQuestionsAnalyzed: websiteSummary.totalQuestionsAnalyzed || 0,
    totalBrandMentions: websiteSummary.totalBrandMentions || 0,

    // ⭐ NEW: Full keyword-level data
    keywordsData: data || []
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/history/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysisRecord)
    });

    const json = await res.json();

    if (json.success) {
      console.log("✅ Saved to MongoDB (with keyword data)");
    } else {
      console.error("❌ Save failed:", json.message);
    }
  } catch (err) {
    console.error("❌ Error saving:", err);
  }
};



  const getScoreColor = (score) => {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#3b82f6";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const formatTime = (t) => t < 60 ? `${t}s` : `${Math.floor(t / 60)}m ${t % 60}s`;

  const aggregateKeyInsights = () => {
    const allInsights = {
      brandStrengths: [], brandWeaknesses: [], frequentlyMentioned: [],
      rarelyMentioned: [], neverMentioned: [], competitorTopics: {},
      rankingPatterns: [], brandOpportunities: [], competitiveThreats: [],
      visibilityGaps: []
    };

    data.forEach(row => {
      if (row.insights) {
        const ins = row.insights;
        if (ins.brandStrengths) allInsights.brandStrengths.push(...ins.brandStrengths);
        if (ins.brandWeaknesses) allInsights.brandWeaknesses.push(...ins.brandWeaknesses);
        if (ins.frequentlyMentioned) allInsights.frequentlyMentioned.push(...ins.frequentlyMentioned);
        if (ins.rarelyMentioned) allInsights.rarelyMentioned.push(...ins.rarelyMentioned);
        if (ins.neverMentioned) allInsights.neverMentioned.push(...ins.neverMentioned);
        if (ins.rankingPatterns) allInsights.rankingPatterns.push(...ins.rankingPatterns);
        if (ins.brandOpportunities) allInsights.brandOpportunities.push(...ins.brandOpportunities);
        if (ins.competitiveThreats) allInsights.competitiveThreats.push(...ins.competitiveThreats);
        if (ins.visibilityGaps) allInsights.visibilityGaps.push(...ins.visibilityGaps);
        
        if (ins.competitorTopics) {
          Object.entries(ins.competitorTopics).forEach(([comp, topics]) => {
            if (!allInsights.competitorTopics[comp]) {
              allInsights.competitorTopics[comp] = {};
            }
            Object.entries(topics).forEach(([topic, count]) => {
              allInsights.competitorTopics[comp][topic] = 
                (allInsights.competitorTopics[comp][topic] || 0) + count;
            });
          });
        }
      }
    });

    allInsights.brandStrengths = [...new Set(allInsights.brandStrengths)];
    allInsights.brandWeaknesses = [...new Set(allInsights.brandWeaknesses)];
    allInsights.frequentlyMentioned = [...new Set(allInsights.frequentlyMentioned)];
    allInsights.rarelyMentioned = [...new Set(allInsights.rarelyMentioned)];
    allInsights.neverMentioned = [...new Set(allInsights.neverMentioned)];
    allInsights.rankingPatterns = [...new Set(allInsights.rankingPatterns)];
    allInsights.brandOpportunities = [...new Set(allInsights.brandOpportunities)];
    allInsights.competitiveThreats = [...new Set(allInsights.competitiveThreats)];
    allInsights.visibilityGaps = [...new Set(allInsights.visibilityGaps)];

    return allInsights;
  };

  return (
    <div style={{ minHeight: "100vh", width: "100vw", background: "#f9fafb", overflowX: "hidden" }}>
    

      {loading && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000
        }}>
          <div style={{
            background: "white", padding: 40, borderRadius: 16,
            textAlign: "center", width: 360
          }}>
            <div style={{
              width: 70, height: 70, borderRadius: "50%",
              border: "4px solid #e5e7eb", borderTop: "4px solid #6A5ACD",
              margin: "0 auto 20px", animation: "spin 1s linear infinite"
            }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0);} 100%{ transform: rotate(360deg);} }`}</style>
            <h3 style={{ color: "#6A5ACD", marginBottom: 8 }}>Analyzing…</h3>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Estimated remaining time: {formatTime(remainingTime)}
            </p>
          </div>
        </div>
      )}

      {!loading && summary && (
        <div style={{ padding: "40px 24px 60px", width: "100%", maxWidth: "100vw", margin: "0 auto", boxSizing: "border-box" }}>

  <header style={{ marginBottom: 34, justifyContent: "center", textAlign: "center"}}>
    <h1 style={{ fontSize: 36, fontWeight: 800, color: "#631bc9ff", marginBottom: 8 }}>
      Brand Visibility Report
    </h1>
    <p style={{ color: "#7a7f8bff", fontSize: 15 }}>
      Site: <b>{site}</b> · Brand: <b>{brand}</b> · Industry: <b>{industry}</b> · Region: <b>{region}</b>
    </p>
  </header>

          {websiteSummary && (
            <section style={{ marginBottom: 48 }}>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 20, marginBottom: 28
              }}>
                <div style={metricCard}>
                  <div style={metricLabel}>Website Visibility Score</div>
                  <div style={{
                    fontSize: 40, fontWeight: 800,
                    color: getScoreColor(websiteSummary.websiteVisibilityScore)
                  }}>
                    {websiteSummary.websiteVisibilityScore || 0}
                  </div>
                  <div style={metricSubtext}>
                    Average across {websiteSummary.totalKeywordsAnalyzed} keywords
                  </div>
                </div>

                <div style={metricCard}>
                  <div style={metricLabel}>Share of Recommendation</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: "#6366f1" }}>
                    {websiteSummary.shareOfRecommendation || 0}%
                  </div>
                  <div style={metricSubtext}>
                    {websiteSummary.totalBrandMentions} mentions in {websiteSummary.totalQuestionsAnalyzed} questions
                  </div>
                </div>

                <div style={metricCard}>
                  <div style={metricLabel}>Brand Mention Coverage</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: "#10b981" }}>
                    {websiteSummary.brandMentionCoverage || "0%"}
                  </div>
                  <div style={metricSubtext}>
                    Mentioned in {websiteSummary.keywordsWithBrandMention}/{websiteSummary.totalKeywordsAnalyzed} keywords
                  </div>
                </div>

                <div style={metricCard}>
                  <div style={metricLabel}>Avg Brand Position</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: "#f59e0b" }}>
                    {websiteSummary.avgBrandPosition ? `#${websiteSummary.avgBrandPosition}` : "N/A"}
                  </div>
                  <div style={metricSubtext}>When your brand appears in results</div>
                </div>
              </div>
            </section>
          )}

          {!loading && data.length > 0 && (
            <CompetitorAnalysis data={data} brand={brand} competitors={competitors} />
          )}

          {websiteSummary?.topCompetitors && websiteSummary.topCompetitors.length > 0 && (
            <section style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#111827" }}>
                🏆 Top Competitors
              </h2>
              
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 16
              }}>
                {websiteSummary.topCompetitors.slice(0, 5).map((comp, i) => (
                  <div key={i} style={{
                    padding: "18px", borderRadius: 12, background: "#fff",
                    border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>{comp.name}</span>
                      <span style={{
                        background: "#fef3c7", color: "#92400e",
                        padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700
                      }}>#{i + 1}</span>
                    </div>
                    <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8 }}>
                      <div>Mentions: <strong>{comp.strength}</strong></div>
                      <div>Avg Rank: <strong>#{comp.avgRank}</strong></div>
                      <div>Coverage: <strong>{comp.keywordCoverage}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 48 }}>
            {websiteSummary?.bestPerformingKeywords && websiteSummary.bestPerformingKeywords.length > 0 && (
              <section>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#10b981" }}>
                  ✅ Best Performing Keywords
                </h2>
                {websiteSummary.bestPerformingKeywords.map((kw, i) => (
                  <div key={i} style={{
                    padding: "16px", borderRadius: 10, background: "#ecfdf5",
                    border: "1px solid #d1fae5", marginBottom: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#065f46", marginBottom: 6 }}>
                      {kw.keyword}
                    </div>
                    <div style={{ color: "#047857", fontSize: 13 }}>
                      Score: <strong>{kw.visibilityScore}</strong> · Mentions: <strong>{kw.mentionRate}</strong>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {websiteSummary?.worstPerformingKeywords && websiteSummary.worstPerformingKeywords.length > 0 && (
              <section>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#ef4444" }}>
                  ⚠️ Needs Improvement
                </h2>
                {websiteSummary.worstPerformingKeywords.map((kw, i) => (
                  <div key={i} style={{
                    padding: "16px", borderRadius: 10, background: "#fef2f2",
                    border: "1px solid #fecaca", marginBottom: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#991b1b", marginBottom: 6 }}>
                      {kw.keyword}
                    </div>
                    <div style={{ color: "#b91c1c", fontSize: 13 }}>
                      Score: <strong>{kw.visibilityScore}</strong> · Mentions: <strong>{kw.mentionRate}</strong>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>

       

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: "#111827" }}>
              🔍 Detailed Keyword-Level Analysis
            </h2>
            <div style={{ display: "grid", gap: 16 }}>
              {data.map((row, i) => (
                <KeywordCard key={i} row={row} brand={brand} competitors={competitors} getScoreColor={getScoreColor} />
              ))}
            </div>
          </section>

          {data.length > 0 && (
            <section>
              <KeyInsightsCard insights={aggregateKeyInsights()} />
            </section>
          )}
        </div>
      )}
    </div>
  );
};

const KeywordCard = ({ row, brand, competitors, getScoreColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
      padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0, marginBottom: 8 }}>
            {row.keyword}
          </h3>
          <div style={{ fontSize: 13, color: "#6b7280", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>Visibility Score: <strong style={{ color: getScoreColor(row.visibilityScore) }}>{row.visibilityScore}</strong></span>
            <span>GSC Rank: <strong>#{row.position}</strong></span>
            <span>Mention Rate: <strong>{row.mentionRate}</strong></span>
            <span>Questions: <strong>{row.questions.length}</strong></span>
          </div>
        </div>
        
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: "10px 20px", borderRadius: 8, 
            border: "1px solid #6366f1",
            background: isOpen ? "#6366f1" : "white",
            color: isOpen ? "white" : "#6366f1",
            fontSize: 14, cursor: "pointer",
            fontWeight: 600, marginLeft: 20,
            display: "flex", alignItems: "center", gap: 8,
            transition: "all 0.2s"
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ 
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s"
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          {isOpen ? "Close" : "Open Analysis"}
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #e5e7eb" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16, marginBottom: 20, padding: "16px",
            background: "#f9fafb", borderRadius: 8
          }}>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>GSC Rank</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{row.position}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Mention Rate</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{row.mentionRate}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Best GPT Rank</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                {row.gptPosition !== "Not Ranked" ? "#" + row.gptPosition : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Avg GPT Rank</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                {row.avgGptPosition !== "N/A" ? "#" + row.avgGptPosition : "—"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Top Competitor</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
                {row.questions?.[0]?.competitorPositions?.[0]
                  ? `${row.questions[0].competitorPositions[0].name} (#${row.questions[0].competitorPositions[0].position})`
                  : "—"}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#374151" }}>
              Questions Analyzed ({row.questions.length})
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {row.questions.map((q, idx) => (
                <QuestionItem key={idx} q={q} idx={idx} brand={brand} competitors={competitors} />
              ))}
            </div>
          </div>

          {row.competitorAnalytics && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #e5e7eb" }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#374151" }}>
                Competitor Performance
              </h4>
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: 8 }}>
                <div style={{ fontSize: 13 }}>
                  {row.competitorAnalytics.topCompetitors?.slice(0, 5).map((comp, i) => (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "10px", borderBottom: "1px solid #e5e7eb",
                      background: "white", borderRadius: 6, marginBottom: 6
                    }}>
                      <span style={{ fontWeight: 600, color: "#111827" }}>{comp.name}</span>
                      <span style={{ color: "#6b7280" }}>
                        Avg Rank: <strong>#{comp.avgRank}</strong> · Mentions: <strong>{comp.mentions}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuestionItem = ({ q, idx, brand, competitors }) => {
  const [expanded, setExpanded] = useState(false);
  const [whyData, setWhyData] = useState(null);
  const [loadingWhy, setLoadingWhy] = useState(false);

  const fetchWhy = async () => {
    if (whyData || loadingWhy) return;
    try {
      setLoadingWhy(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/why-not-mentioned/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: q.keyword || "",
          question: q.question,
          brand,
          companies: q.allBrands || [],
          competitors: competitors
        })
      });
      const json = await res.json();
      setWhyData(json);
    } catch (err) {
      console.error("why-not-mentioned failed", err);
    } finally {
      setLoadingWhy(false);
    }
  };

  const brandLower = brand?.toLowerCase() || "";
  const competitorNames = q.competitorPositions?.map((c) => c.name.toLowerCase()) || [];
  const brandsList = q.allBrands || [];

  return (
    <div style={{
      padding: "14px", borderRadius: 8,
      background: "white",
      border: "1px solid #e5e7eb",
      marginBottom: 10
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: "inline-block", width: 24, height: 24, borderRadius: "50%",
            border: "2px solid #6366f1",
            backgroundColor: "#eef2ff",
            color: "#4f46e5",
            fontSize: 12, fontWeight: 700, textAlign: "center", lineHeight: "20px",
            marginRight: 8
          }}>
            {idx + 1}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{q.question}</span>
        </div>
        <button
          onClick={() => {
            setExpanded(!expanded);
            if (!expanded && !whyData) fetchWhy();
          }}
          style={{
            padding: "6px 12px", borderRadius: 6, border: "1px solid #e5e7eb",
            background: "white", fontSize: 12, cursor: "pointer",
            fontWeight: 600, marginLeft: 12, display: "flex", alignItems: "center", gap: 6
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          {expanded ? "Hide" : "Details"}
        </button>
      </div>

      <div style={{ fontSize: 13, color: "#6b7280", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <span>Brand Mentioned: <strong style={{ color: q.brandMentioned ? "#10b981" : "#ef4444" }}>{q.brandMentioned ? "Yes" : "No"}</strong></span>
        <span>Brand Rank: <strong>{q.brandPosition ? `#${q.brandPosition}` : "Not ranked"}</strong></span>
        <span>Total Brands: <strong>{q.companiesFound}</strong></span>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
          {brandsList.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#374151" }}>
                Ranked Brands
              </h5>
              {brandsList.map((name, bidx) => {
                const rank = bidx + 1;
                const isBrand = name.toLowerCase().includes(brandLower);
                const isCompetitor = competitorNames.includes(name.toLowerCase());
                const width = ((brandsList.length - bidx) / brandsList.length) * 100;

                return (
                  <div key={bidx} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px",
                    borderRadius: 6,
                    backgroundColor: isBrand ? "#eef2ff" : "white",
                    border: isBrand ? "1px solid #4f46e5" : "1px solid #e5e7eb",
                    marginBottom: 6
                  }}>
                    <span style={{ width: 30, fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
                      #{rank}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: isBrand ? 700 : 500, color: "#111827" }}>
                      {name}
                    </span>
                    <div style={{
                      flexBasis: 100, height: 6, borderRadius: 999,
                      background: "#e5e7eb", overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${width}%`, height: "100%",
                        background: isBrand ? "#4f46e5" : "#9ca3af"
                      }} />
                    </div>
                    {isBrand && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "#4f46e5", color: "white" }}>
                        YOUR BRAND
                      </span>
                    )}
                    {isCompetitor && !isBrand && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "#f97316", color: "white" }}>
                        COMPETITOR
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}


        </div>
      )}
    </div>
  );
};

const KeyInsightsCard = ({ insights }) => {
  return (
    <div style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: 16, padding: "32px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.2)", color: "white"
    }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: "white" }}>
        💡 Key Insights
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.15)", padding: "20px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
            Strengths & Weaknesses
          </h3>
          
          {insights.brandStrengths && insights.brandStrengths.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#d1fae5" }}>✓ Strengths</h4>
              <ul style={{ fontSize: 13, paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                {insights.brandStrengths.slice(0, 5).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {insights.brandWeaknesses && insights.brandWeaknesses.length > 0 && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#fecaca" }}>✗ Weaknesses</h4>
              <ul style={{ fontSize: 13, paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
                {insights.brandWeaknesses.slice(0, 5).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

      

        <div style={{ background: "rgba(255,255,255,0.15)", padding: "20px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
            Competitor Topic Dominance
          </h3>
          
          {!insights.competitorTopics || Object.keys(insights.competitorTopics).length === 0 ? (
            <div style={{ fontSize: 13, opacity: 0.8 }}>No competitor topics detected.</div>
          ) : (
            <div style={{ fontSize: 13, lineHeight: 1.8 }}>
              {Object.entries(insights.competitorTopics)
                .slice(0, 5)
                .map(([comp, topics], i) => (
                  <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                    <strong>{comp}:</strong>
                    <div style={{ marginTop: 4, opacity: 0.9 }}>
                      {Object.entries(topics)
                        .slice(0, 3)
                        .map(([topic, count]) => `${topic} (${count}x)`)
                        .join(", ")}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.15)", padding: "20px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
            Ranking Patterns
          </h3>
          
          {insights.rankingPatterns && insights.rankingPatterns.length > 0 ? (
            <ul style={{ fontSize: 13, paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              {insights.rankingPatterns.slice(0, 5).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.8 }}>No ranking patterns found.</div>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.15)", padding: "20px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
            Opportunities
          </h3>
          
          {insights.brandOpportunities && insights.brandOpportunities.length > 0 ? (
            <ul style={{ fontSize: 13, paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              {insights.brandOpportunities.slice(0, 5).map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.8 }}>No new opportunities detected.</div>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.15)", padding: "20px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
            Competitive Threats
          </h3>
          
          {insights.competitiveThreats && insights.competitiveThreats.length > 0 ? (
            <ul style={{ fontSize: 13, paddingLeft: 20, margin: 0, lineHeight: 1.8 }}>
              {insights.competitiveThreats.slice(0, 5).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.8 }}>No competitive threats detected.</div>
          )}
        </div>

        <div style={{ background: "rgba(255,255,255,0.15)", padding: "20px", borderRadius: 12, backdropFilter: "blur(10px)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "white" }}>
            Visibility Gaps
          </h3>
          
          {insights.visibilityGaps && insights.visibilityGaps.length > 0 ? (
            <ul style={{ fontSize: 13, paddingLeft: 20, margin: 0, lineHeight: 1.8}}>
              {insights.visibilityGaps.slice(0, 5).map((g, i) => (
                <li key={i} style={{ breakInside: "avoid", marginBottom: 8 }}>{g}</li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: 13, opacity: 0.8 }}>No visibility gaps detected.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const metricCard = {
  padding: "20px",
  borderRadius: 12,
  background: "white",
  border: "1px solid #e5e7eb",
  textAlign: "center",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const metricLabel = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 600,
  marginBottom: 10,
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const metricSubtext = {
  fontSize: 12,
  color: "#9ca3af",
  marginTop: 8
};

export default AnalyzeResults;