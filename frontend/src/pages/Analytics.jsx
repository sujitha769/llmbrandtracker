import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const Analytics = ({ userEmail }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (!userEmail) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/activity?email=${encodeURIComponent(
          userEmail
        )}`
      );

      const data = await res.json();
      const activities = data.activities || [];

      // Convert Activity → Graph data based on new structure
      const formatted = activities.map((a) => ({
        date: new Date(a.date).toLocaleDateString(),
        keywords: a.keywordsAnalyzed.length,
        visibility: a.summary?.websiteVisibilityScore || 0,
        shareOfRec: a.summary?.shareOfRecommendation || 0,
        brandCoverage: parseFloat(a.summary?.brandMentionCoverage) || 0,
        avgBrandPos: a.summary?.avgBrandPosition || null
      }));

      // Build datasets with new metrics
      setChartData({
        labels: formatted.map((i) => i.date),
        datasets: [
          {
            type: "line",
            label: "Website Visibility Score",
            data: formatted.map((i) => i.visibility),
            borderColor: "#8A2BE2",
            borderWidth: 3,
            tension: 0.4,
            yAxisID: "y1"
          },
          {
            type: "bar",
            label: "Keywords Analyzed",
            data: formatted.map((i) => i.keywords),
            backgroundColor: "#c084fc",
            borderRadius: 6,
            yAxisID: "y"
          },
          {
            type: "line",
            label: "Share of Recommendation %",
            data: formatted.map((i) => i.shareOfRec),
            borderColor: "#10b981",
            borderWidth: 2,
            tension: 0.4,
            yAxisID: "y1"
          },
          {
            type: "line",
            label: "Brand Mention Coverage %",
            data: formatted.map((i) => i.brandCoverage),
            borderColor: "#f59e0b",
            borderWidth: 2,
            tension: 0.4,
            yAxisID: "y1"
          }
        ]
      });

      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  // Fetch initially + auto-refresh every 30 sec
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(() => fetchAnalytics(), 30000);
    return () => clearInterval(interval);
  }, [userEmail]);

  if (loading || !chartData) {
    return (
      <div
        style={{
          padding: "60px",
          background: "white",
          textAlign: "center",
          borderRadius: "12px"
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "48px",
            height: "48px",
            border: "4px solid #eee",
            borderTopColor: "#8A2BE2",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}
        ></div>
        <p style={{ marginTop: "20px", color: "#6b7280" }}>
          Loading analytics...
        </p>

        <style>{`
          @keyframes spin { 
            100% { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontSize: "28px",
          fontWeight: "700",
          marginBottom: "20px",
          color: "#111827"
        }}
      >
        📊 Brand Analytics
      </h2>

      <div
        style={{
          background: "white",
          padding: "24px",
          borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* FIXED AXIS LAYER */}
        <div style={{ position: "relative" }}>
          
          {/* SCROLLABLE LAYER */}
          <div
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: "10px",
            }}
          >
            {/* Chart-width expanded but axes remain fixed */}
            <div style={{ width: "1600px" }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: "index", intersect: false },
                  scales: {
                    x: {
                      offset: true,
                    },
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: "Keywords Analyzed" }
                    },
                    y1: {
                      beginAtZero: true,
                      position: "right",
                      grid: { drawOnChartArea: false },
                      title: { display: true, text: "Score / Percentage" }
                    }
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: "top"
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            if (label.includes("%")) {
                              label += context.parsed.y + "%";
                            } else {
                              label += context.parsed.y;
                            }
                          }
                          return label;
                        }
                      }
                    }
                  }
                }}
                height={400}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Analytics;