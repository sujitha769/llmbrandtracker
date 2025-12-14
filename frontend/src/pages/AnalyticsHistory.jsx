import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AnalyticsHistory = ({ userEmail }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterBrand, setFilterBrand] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [userEmail]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/history/${userEmail}`);
      const json = await res.json();
      if (json.success) setHistory(json.history);
      else setHistory([]);
    } catch (error) {
      console.error("Error loading history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/history/item/${id}`, {
        method: "DELETE"
      });

      const json = await res.json();

      if (json.success) {
        setHistory(history.filter((h) => h._id !== id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete analysis");
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Delete ALL history? This cannot be undone.")) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/history/clear/${userEmail}`, {
        method: "DELETE"
      });

      const json = await res.json();

      if (json.success) {
        setHistory([]);
        alert("All history cleared");
      }
    } catch (error) {
      console.error("Error clearing history:", error);
      alert("Failed to clear history");
    }
  };

  const sortedAndFilteredHistory = () => {
    let filtered = [...history];

    if (filterBrand) {
      filtered = filtered.filter((h) =>
        h.brand.toLowerCase().includes(filterBrand.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = a.timestamp - b.timestamp;
          break;
        case "score":
          comparison = a.websiteVisibilityScore - b.websiteVisibilityScore;
          break;
        case "keywords":
          comparison = a.totalKeywords - b.totalKeywords;
          break;
        case "brand":
          comparison = a.brand.localeCompare(b.brand);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { text: "Excellent", color: "#10b981", bg: "#d1fae5" };
    if (score >= 60) return { text: "Good", color: "#3b82f6", bg: "#dbeafe" };
    if (score >= 40) return { text: "Fair", color: "#f59e0b", bg: "#fef3c7" };
    return { text: "Needs Work", color: "#ef4444", bg: "#fee2e2" };
  };

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

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Brand",
      "Site",
      "Industry",
      "Region",
      "Visibility Score",
      "Share of Recommendation",
      "Keywords Analyzed",
      "Total Competitors",
      "Top Competitor",
      "Brand Mention Coverage",
      "Avg Brand Position"
    ];

    const rows = sortedAndFilteredHistory().map((h) => [
      formatDate(h.timestamp),
      h.brand,
      h.site,
      h.industry,
      h.region,
      h.websiteVisibilityScore,
      h.shareOfRecommendation,
      h.totalKeywords,
      h.totalCompetitors,
      h.topCompetitor,
      h.brandMentionCoverage,
      h.avgBrandPosition
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-history-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f9fafb" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, border: "3px solid #e5e7eb", borderTop: "3px solid #3b82f6", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }}></div>
          <p style={{ color: "#6b7280", fontSize: 15, fontWeight: 500 }}>Loading history…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  const displayHistory = sortedAndFilteredHistory();

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: "32px 24px" }}>
      <style>{`
        .stat-card { transition: all 0.2s ease; border: 1px solid #e5e7eb; }
        .stat-card:hover { border-color: #d1d5db; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .btn { transition: all 0.15s ease; }
        .btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .row-hover:hover { background: #f9fafb; }
      `}</style>

      <div style={{ width: "100vw", margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#740ebcff", marginBottom: 4 }}>
            Analytics History
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15 }}>
            View and compare your past brand visibility analyses
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
          <div className="stat-card" style={cardStyle}>
            <div style={cardIconWrapper}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div style={cardLabel}>Total Analyses</div>
            <div style={cardNumber}>{history.length}</div>
          </div>

          <div className="stat-card" style={cardStyle}>
            <div style={{ ...cardIconWrapper, background: "#f0fdf4" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <div style={cardLabel}>Total Keywords Analyzed</div>
            <div style={cardNumber}>
              {history.reduce((sum, h) => sum + (h.totalKeywords || 0), 0)}
            </div>
          </div>

          <div className="stat-card" style={cardStyle}>
            <div style={{ ...cardIconWrapper, background: "#fef3c7" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
            </div>
            <div style={cardLabel}>Best GPT Rank</div>
            <div style={cardNumber}>
              {
                (() => {
                  const allRanks = history
                    .flatMap(h => h.keywordsData || [])
                    .filter(k => k.gptPosition && k.gptPosition !== "Not Ranked")
                    .map(k => Number(k.gptPosition));

                  return allRanks.length ? "#" + Math.min(...allRanks) : "N/A";
                })()
              }
            </div>
          </div>

          <div className="stat-card" style={cardStyle}>
            <div style={{ ...cardIconWrapper, background: "#f3e8ff" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
            </div>
            <div style={cardLabel}>Avg Visibility Score</div>
            <div style={cardNumber}>
              {
                history.length
                  ? Math.round(
                      history.reduce((sum, h) => sum + (h.websiteVisibilityScore || 0), 0) /
                        history.length
                    )
                  : 0
              }
            </div>
          </div>
        </div>

        {/* Filters section */}
        <div style={{ background: "white", padding: 20, borderRadius: 12, marginBottom: 24, border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <label style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 6 }}>Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="date">Date</option>
                  <option value="score">Visibility Score</option>
                  <option value="keywords">Keywords</option>
                  <option value="brand">Brand</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 6 }}>Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={dropdownStyle}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 6 }}>Filter Brand</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={exportToCSV} className="btn" style={primaryBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export CSV
              </button>

              <button onClick={clearAllHistory} className="btn" style={dangerBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={tableHeaderStyle}>Date</th>
                  <th style={tableHeaderStyle}>Brand</th>
                  <th style={tableHeaderStyle}>Site</th>
                  <th style={tableHeaderStyle}>Industry</th>
                  <th style={tableHeaderStyle}>Keywords</th>
                  <th style={tableHeaderStyle}>Visibility</th>
                  <th style={tableHeaderStyle}>Share %</th>
                  <th style={tableHeaderStyle}>Top Competitor</th>
                  <th style={tableHeaderStyle}>Brand Position</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {displayHistory.map((analysis) => {
                  const badge = getScoreBadge(analysis.websiteVisibilityScore);

                  return (
                    <React.Fragment key={analysis._id}>
                      <tr className="row-hover" style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={tableCellStyle}>{formatDate(analysis.timestamp)}</td>
                        <td style={{ ...tableCellStyle, fontWeight: 600 }}>{analysis.brand}</td>
                        <td style={tableCellStyle}>{analysis.site}</td>
                        <td style={tableCellStyle}>
                          <span style={{ background: "#f3f4f6", padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#374151" }}>
                            {analysis.industry}
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle, fontWeight: 600 }}>{analysis.totalKeywords}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{analysis.websiteVisibilityScore}</span>
                            <span style={{ background: badge.bg, color: badge.color, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                              {badge.text}
                            </span>
                          </div>
                        </td>
                        <td style={{ ...tableCellStyle, fontWeight: 600 }}>{analysis.shareOfRecommendation}%</td>
                        <td style={tableCellStyle}>{analysis.topCompetitor}</td>
                        <td style={tableCellStyle}>
                          {analysis.avgBrandPosition
                            ? `#${analysis.avgBrandPosition}`
                            : "N/A"}
                        </td>

                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() =>
                                setExpandedRow(expandedRow === analysis._id ? null : analysis._id)
                              }
                              style={smallBtn}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                                {expandedRow === analysis._id ? 
                                  <polyline points="18 15 12 9 6 15"></polyline> :
                                  <polyline points="6 9 12 15 18 9"></polyline>
                                }
                              </svg>
                              {expandedRow === analysis._id ? "Hide" : "View"}
                            </button>

                            <button
                              onClick={() => deleteAnalysis(analysis._id)}
                              style={smallDanger}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedRow === analysis._id && (
                        <tr>
                          <td colSpan="10" style={{ background: "#f9fafb", padding: 20, borderBottom: "1px solid #e5e7eb" }}>
                            <h3 style={{ marginBottom: 16, fontSize: 15, fontWeight: 600, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                              </svg>
                              Keyword-Level Analysis
                            </h3>

                            <div style={{ background: "white", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                    <th style={tableHeaderStyle}>Keyword</th>
                                    <th style={tableHeaderStyle}>GSC Rank</th>
                                    <th style={tableHeaderStyle}>Mention Rate</th>
                                    <th style={tableHeaderStyle}>Best GPT Rank</th>
                                    <th style={tableHeaderStyle}>Avg GPT Rank</th>
                                    <th style={tableHeaderStyle}>Competitors</th>
                                    <th style={tableHeaderStyle}>Top Competitor</th>
                                    <th style={tableHeaderStyle}>Avg Rank</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {analysis.keywordsData?.map((kw, idx) => {
                                    const competitorList =
                                      kw.competitorAnalytics?.topCompetitors ||
                                      kw.questions?.[0]?.competitorPositions ||
                                      [];

                                    const topCompetitor = competitorList[0] || null;

                                    return (
                                      <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ ...tableCellStyle, fontWeight: 500 }}>{kw.keyword}</td>
                                        <td style={tableCellStyle}>{kw.position || "--"}</td>
                                        <td style={tableCellStyle}>{kw.mentionRate || "--"}</td>
                                        <td style={{ ...tableCellStyle, color: "#3b82f6", fontWeight: 600 }}>
                                          {kw.gptPosition !== "Not Ranked"
                                            ? `#${kw.gptPosition}`
                                            : "Not Ranked"}
                                        </td>
                                        <td style={tableCellStyle}>
                                          {kw.avgGptPosition !== "N/A"
                                            ? `#${kw.avgGptPosition}`
                                            : "--"}
                                        </td>
                                        <td style={tableCellStyle}>
                                          {competitorList.length || "None"}
                                        </td>
                                        <td style={{ ...tableCellStyle, fontWeight: 500 }}>
                                          {topCompetitor?.name || "None"}
                                        </td>
                                        <td style={tableCellStyle}>
                                          {topCompetitor?.avgRank
                                            ? `#${topCompetitor.avgRank}`
                                            : "None"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------- STYLES -------------------- */

const cardStyle = {
  background: "white",
  padding: 24,
  borderRadius: 12
};

const cardIconWrapper = {
  width: 40,
  height: 40,
  background: "#eff6ff",
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12
};

const cardLabel = {
  fontSize: 13,
  color: "#6b7280",
  marginBottom: 8,
  fontWeight: 500
};

const cardNumber = {
  fontSize: 26,
  fontWeight: 700,
  color: "#111827"
};

const tableHeaderStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
  textTransform: "uppercase",
  letterSpacing: 0.5
};

const tableCellStyle = {
  padding: "14px 16px",
  fontSize: 14,
  color: "#6b7280"
};

const dropdownStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer"
};

const inputStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "white",
  color: "#111827",
  fontSize: 14,
  width: 200
};

const primaryBtn = {
  padding: "9px 18px",
  background: "#3b82f6",
  color: "white",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  display: "flex",
  alignItems: "center"
};

const dangerBtn = {
  padding: "9px 18px",
  background: "white",
  color: "#ef4444",
  borderRadius: 8,
  border: "1px solid #ef4444",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
  display: "flex",
  alignItems: "center"
};

const smallBtn = {
  padding: "6px 12px",
  background: "#f3f4f6",
  color: "#374151",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  display: "flex",
  alignItems: "center"
};

const smallDanger = {
  padding: "6px 10px",
  background: "#fee2e2",
  color: "#ef4444",
  borderRadius: 6,
  border: "none",
  cursor: "pointer"
};

export default AnalyticsHistory;