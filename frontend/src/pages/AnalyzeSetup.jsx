import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const industries = [
  "Technology",
  "SaaS",
  "E-Commerce",
  "Marketing",
  "Finance",
  "Health & Wellness",
  "Education",
  "Software Development",
  "AI / Machine Learning",
  "Real Estate",
  "Consulting",
  "Other"
];

const regions = [
  "Global",
  "United States",
  "India",
  "Europe",
  "Middle East",
  "Australia",
  "South-East Asia",
  "Custom"
];

const AnalyzeSetup = ({ userEmail }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const site = new URLSearchParams(location.search).get("site");

  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [region, setRegion] = useState("Global");

  const [competitors, setCompetitors] = useState("");
  const [availableKeywords, setAvailableKeywords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingKeywords, setLoadingKeywords] = useState(true);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    setLoadingKeywords(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/gsc/keywords?email=${userEmail}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site })
      });

      const json = await res.json();
      setAvailableKeywords(json.keywords || []);
    } catch (e) {
      console.error("Failed to load keywords", e);
    } finally {
      setLoadingKeywords(false);
    }
  };

  const toggleKeyword = (keyword) => {
    if (selectedKeywords.some(k => k.keyword === keyword.keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k.keyword !== keyword.keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const runAnalysis = () => {
    if (!brand.trim()) return alert("Please enter brand name.");
    if (selectedKeywords.length === 0) return alert("Select at least one keyword.");

    navigate("/analyze/results", {
      state: {
        site,
        brand,
        description,
        industry,
        region,
        competitors,
        selectedKeywords
      }
    });
  };

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        paddingTop: 60,
        paddingBottom: 60,
        backgroundColor: "#f8f9fa"
      }}
    >
      <div style={{ width: "100%", maxWidth: 900, padding: "0 24px" }}>
        
        {/* Title Section with Icon */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: 10 
        }}>
          <div style={{
            width: 50,
            height: 50,
            backgroundColor: "#4169E1",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 16
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m16.98-4.24l-4.24-4.24m-4.24-4.24l-4.24-4.24"/>
            </svg>
          </div>
          <h1
            style={{
              color: "#1a1a1a",
              fontSize: 36,
              margin: 0,
              fontWeight: "700"
            }}
          >
            AI Brand Visibility Setup
          </h1>
        </div>

        <p
          style={{
            color: "#6c757d",
            fontSize: 16,
            marginBottom: 40,
            marginLeft: 66
          }}
        >
          Configure your automatic GPT visibility scans based on your subscription plan
        </p>

        {/* White Card Container */}
        <div style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 40,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
        }}>

          {/* Website URL Field */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              fontWeight: 600,
              fontSize: 15,
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              marginBottom: 10
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4169E1" strokeWidth="2" style={{ marginRight: 8 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Website URL
            </label>
            <div style={{ position: "relative" }}>
              <input
                className="form-control"
                value={site || ""}
                readOnly
                placeholder="https://example.com"
                style={{ 
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid #dee2e6",
                  fontSize: 15,
                  backgroundColor: "#f8f9fa"
                }}
              />
             
            </div>
            <small style={{ 
              color: "#6c757d", 
              fontSize: 13,
              marginTop: 6,
              display: "block"
            }}>
              Click "Fetch Keywords" after entering your website URL to load keywords from Google Search Console
            </small>
          </div>

          {/* Brand Name */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              fontWeight: 600,
              fontSize: 15,
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              marginBottom: 10
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4169E1" strokeWidth="2" style={{ marginRight: 8 }}>
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              Brand Name
            </label>
            <input
              className="form-control"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Your Brand"
              style={{ 
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #dee2e6",
                fontSize: 15
              }}
            />
          </div>

          {/* Brand Description */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              fontWeight: 600,
              fontSize: 15,
              color: "#1a1a1a",
              display: "flex",
              alignItems: "center",
              marginBottom: 10
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4169E1" strokeWidth="2" style={{ marginRight: 8 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Description
            </label>
            <textarea
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business, products, and services..."
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #dee2e6",
                fontSize: 15,
                minHeight: 100,
                resize: "vertical"
              }}
            />
          </div>

          {/* Industry and Region in 2 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            
            {/* Industry Dropdown */}
            <div>
              <label style={{ 
                fontWeight: 600,
                fontSize: 15,
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                marginBottom: 10
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4169E1" strokeWidth="2" style={{ marginRight: 8 }}>
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Industry
              </label>
              <select
                className="form-control"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{ 
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid #dee2e6",
                  fontSize: 15
                }}
              >
                {industries.map((ind, idx) => (
                  <option key={idx} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Dropdown */}
            <div>
              <label style={{ 
                fontWeight: 600,
                fontSize: 15,
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                marginBottom: 10
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4169E1" strokeWidth="2" style={{ marginRight: 8 }}>
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
                </svg>
                Region
              </label>
              <select
                className="form-control"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{ 
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid #dee2e6",
                  fontSize: 15
                }}
              >
                {regions.map((r, idx) => (
                  <option key={idx} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Competitors */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ 
              fontWeight: 600,
              fontSize: 15,
              color: "#1a1a1a",
              marginBottom: 10,
              display: "block"
            }}>
              Competitors (optional)
            </label>
            <input
              className="form-control"
              value={competitors}
              onChange={(e) => setCompetitors(e.target.value)}
              placeholder="Comma separated e.g., Zoho, Freshworks"
              style={{ 
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #dee2e6",
                fontSize: 15
              }}
            />
          </div>

          {/* Keywords */}
          <div>
            <label style={{ 
              fontWeight: 600,
              fontSize: 15,
              color: "#1a1a1a",
              marginBottom: 10,
              display: "block"
            }}>
              Select Keywords *
            </label>

            <input
              className="form-control"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              style={{ 
                padding: "12px 16px",
                borderRadius: 8,
                border: "1px solid #dee2e6",
                fontSize: 15
              }}
            />

            {showDropdown && (
              <div
                style={{
                  border: "1px solid #dee2e6",
                  background: "white",
                  borderRadius: 8,
                  maxHeight: 260,
                  overflowY: "auto",
                  marginTop: 8,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                {loadingKeywords ? (
                  <div style={{ padding: 16, textAlign: "center", color: "#6c757d" }}>Loading...</div>
                ) : (
                  availableKeywords
                    .filter(k =>
                      k.keyword.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((k, idx) => {
                      const selected = selectedKeywords.some(sk => sk.keyword === k.keyword);
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleKeyword(k)}
                          style={{
                            padding: "12px 16px",
                            cursor: "pointer",
                            background: selected ? "#e7f3ff" : "white",
                            borderBottom: idx !== availableKeywords.length - 1 ? "1px solid #f0f0f0" : "none",
                            fontSize: 14,
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => !selected && (e.currentTarget.style.background = "#f8f9fa")}
                          onMouseLeave={(e) => !selected && (e.currentTarget.style.background = "white")}
                        >
                          {k.keyword}
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </div>

          {/* Selected Keywords */}
          <div style={{ marginTop: 16 }}>
            {selectedKeywords.map((k, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  background: "#4169E1",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 20,
                  marginRight: 10,
                  marginTop: 10,
                  fontSize: 14,
                  fontWeight: 600
                }}
              >
                {k.keyword}
              </span>
            ))}
          </div>

          {/* Run Analysis Button */}
          <button
            onClick={runAnalysis}
            style={{
              marginTop: 40,
              width: "100%",
              padding: "14px 20px",
              background: "#4169E1",
              color: "white",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              transition: "0.3s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#365ac1"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#4169E1"}
          >
            Run Analysis 🚀
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeSetup;