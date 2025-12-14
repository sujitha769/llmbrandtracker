import React, { useEffect, useState } from "react";
import { Settings, Globe, Building2, FileText, Briefcase, MapPin, Users, Tag, Save, Loader2, CheckCircle2, RefreshCw, Search } from "lucide-react";
import axios from "axios";

const AutoConfig = () => {
  const email = localStorage.getItem("userEmail");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetchingKeywords, setFetchingKeywords] = useState(false);

  const [form, setForm] = useState({
    site: "",
    brand: "",
    description: "",
    industry: "",
    region: "",
    competitors: "",
  });

  const [gscKeywords, setGscKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/autoConfig/get?email=${email}`);

        if (res.data?.config) {
          setForm({
            site: res.data.config.site || "",
            brand: res.data.config.brand || "",
            description: res.data.config.description || "",
            industry: res.data.config.industry || "",
            region: res.data.config.region || "",
            competitors: (res.data.config.competitors || []).join(", "),
          });

          // Set previously selected keywords
          setSelectedKeywords(res.data.config.keywords || []);

          // Auto-fetch keywords if site exists
          if (res.data.config.site) {
            fetchGSCKeywords(res.data.config.site);
          }
        }
      } catch (err) {
        console.error("Failed to load auto config:", err);
      }
      setLoading(false);
    };

    fetchData();
  }, [email]);

  const fetchGSCKeywords = async (siteUrl) => {
    if (!siteUrl) {
      alert("Please enter a website URL first");
      return;
    }

    setFetchingKeywords(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/gsc/keywords?email=${email}`,
        { site: siteUrl }
      );

      if (res.data?.keywords) {
        setGscKeywords(res.data.keywords);
      }
    } catch (err) {
      console.error("Failed to fetch GSC keywords:", err);
      alert("Failed to load keywords from Google Search Console");
    }
    setFetchingKeywords(false);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setSaved(false);

    // If site URL changes, clear keywords
    if (e.target.name === "site") {
      setGscKeywords([]);
      setSelectedKeywords([]);
    }
  };

  const toggleKeyword = (keyword) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
    setSaved(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        site: form.site,
        brand: form.brand,
        description: form.description,
        industry: form.industry,
        region: form.region,
        competitors: form.competitors.split(",").map((x) => x.trim()).filter(Boolean),
        keywords: selectedKeywords
      };

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/autoConfig/save?email=${email}`, payload);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save config:", err);
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  const filteredKeywords = gscKeywords.filter(kw =>
    kw.keyword.toLowerCase().includes(keywordSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-3">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .custom-input {
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 16px;
          transition: all 0.2s ease;
        }
        .custom-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
          outline: none;
        }
        .custom-card {
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .icon-box {
          background-color: #2563eb;
          border-radius: 12px;
          padding: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-custom {
          border-radius: 12px;
          padding: 10px 24px;
          font-weight: 600;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .btn-custom:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
        }
        .info-card {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 2px solid #93c5fd;
          border-radius: 12px;
          padding: 24px;
        }
        .label-icon {
          width: 18px;
          height: 18px;
          color: #2563eb;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        .keyword-chip {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          margin: 6px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 2px solid #e5e7eb;
          background: white;
        }
        .keyword-chip:hover {
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .keyword-chip.selected {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .keyword-stats {
          font-size: 11px;
          opacity: 0.8;
          margin-left: 8px;
        }
        .keywords-container {
          max-height: 400px;
          overflow-y: auto;
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
        }
        .keywords-container::-webkit-scrollbar {
          width: 8px;
        }
        .keywords-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .keywords-container::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 4px;
        }
      `}</style>

      <div className="container-fluid py-4" style={{ minWidth: '100vw', padding: '0 2rem' }}>
        {/* Header */}
        <div className="mb-5">
          <div className="d-flex align-items-center mb-3">
            <div className="icon-box me-3">
              <Settings size={24} color="white" />
            </div>
            <h1 className="display-4 fw-bold mb-0" style={{ fontSize: '2.5rem' }}>Automation Settings</h1>
          </div>
          <p className="text-muted fs-5 mb-0">
            Configure your automatic GPT visibility scans based on your subscription plan
          </p>
        </div>

        {/* Form Card */}
        <div className="card custom-card border-0 mb-4">
          <div className="card-body p-4 p-md-5">
            {/* Website URL */}
            <div className="mb-4">
              <label className="form-label fw-semibold d-flex align-items-center mb-2">
                <Globe className="label-icon me-2" />
                Website URL
              </label>
              <div className="d-flex gap-2">
                <input
                  type="text"
                  name="site"
                  value={form.site}
                  onChange={handleChange}
                  className="form-control custom-input"
                  placeholder="https://example.com"
                />
                <button
                  onClick={() => fetchGSCKeywords(form.site)}
                  disabled={!form.site || fetchingKeywords}
                  className="btn btn-outline-primary btn-custom d-flex align-items-center gap-2"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {fetchingKeywords ? (
                    <>
                      <Loader2 size={18} className="spin-animation" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      <span>Fetch Keywords</span>
                    </>
                  )}
                </button>
              </div>
              <small className="text-muted mt-2 d-block">
                Click "Fetch Keywords" after entering your website URL to load keywords from Google Search Console
              </small>
            </div>

            {/* Brand Name */}
            <div className="mb-4">
              <label className="form-label fw-semibold d-flex align-items-center mb-2">
                <Building2 className="label-icon me-2" />
                Brand Name
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                className="form-control custom-input"
                placeholder="Your Brand"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="form-label fw-semibold d-flex align-items-center mb-2">
                <FileText className="label-icon me-2" />
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="4"
                className="form-control custom-input"
                placeholder="Describe your business, products, and services..."
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            {/* Two Column Layout */}
            <div className="row mb-4">
              {/* Industry */}
              <div className="col-md-6 mb-4 mb-md-0">
                <label className="form-label fw-semibold d-flex align-items-center mb-2">
                  <Briefcase className="label-icon me-2" />
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className="form-control custom-input"
                  placeholder="e.g., E-commerce"
                />
              </div>

              {/* Region */}
              <div className="col-md-6">
                <label className="form-label fw-semibold d-flex align-items-center mb-2">
                  <MapPin className="label-icon me-2" />
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className="form-control custom-input"
                  placeholder="e.g., India, USA"
                />
              </div>
            </div>

            {/* Competitors */}
            <div className="mb-4">
              <label className="form-label fw-semibold d-flex align-items-center mb-2">
                <Users className="label-icon me-2" />
                Competitors
                <small className="text-muted ms-2 fw-normal">(comma separated)</small>
              </label>
              <input
                type="text"
                name="competitors"
                value={form.competitors}
                onChange={handleChange}
                className="form-control custom-input"
                placeholder="Amazon, Flipkart, Shopify"
              />
            </div>

            {/* Keywords - View Only from GSC */}
            <div className="mb-0">
              <label className="form-label fw-semibold d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center">
                  <Tag className="label-icon me-2" />
                  Keywords from Google Search Console
                  <small className="text-muted ms-2 fw-normal">(Last 3 months)</small>
                </div>
                {selectedKeywords.length > 0 && (
                  <span className="badge bg-primary rounded-pill px-3 py-2">
                    {selectedKeywords.length} selected
                  </span>
                )}
              </label>

              {gscKeywords.length > 0 ? (
                <>
                  {/* Search Box */}
                  <div className="mb-3">
                    <div className="position-relative">
                      <Search className="position-absolute" size={18} style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                      <input
                        type="text"
                        value={keywordSearch}
                        onChange={(e) => setKeywordSearch(e.target.value)}
                        className="form-control custom-input ps-5"
                        placeholder="Search keywords..."
                      />
                    </div>
                  </div>

                  {/* Keywords Container */}
                  <div className="keywords-container">
                    {filteredKeywords.length > 0 ? (
                      filteredKeywords.map((kw, idx) => (
                        <div
                          key={idx}
                          className={`keyword-chip ${selectedKeywords.includes(kw.keyword) ? 'selected' : ''}`}
                          onClick={() => toggleKeyword(kw.keyword)}
                        >
                          <span>{kw.keyword}</span>
                          <span className="keyword-stats">
                            {kw.clicks} clicks · Pos {kw.position}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted text-center py-4 mb-0">
                        No keywords match your search
                      </p>
                    )}
                  </div>

                  <small className="text-muted mt-2 d-block">
                    Click on keywords to select them for automated tracking. These will be randomly used during auto-scans.
                  </small>
                </>
              ) : (
                <div className="alert alert-info d-flex align-items-start gap-3 mb-0" style={{ borderRadius: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
                  <div>
                    <strong>No keywords loaded yet</strong>
                    <p className="mb-0 mt-1">
                      Enter your website URL above and click "Fetch Keywords" to load your top-performing keywords from Google Search Console.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with Save Button */}
          <div className="card-footer bg-light border-top py-4 px-4 px-md-5">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
              <p className="text-muted mb-0">
                Changes will be applied to future automation scans
              </p>
              <button
                onClick={saveSettings}
                disabled={saving || selectedKeywords.length === 0}
                className="btn btn-primary btn-custom d-flex align-items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="spin-animation" />
                    <span>Saving...</span>
                  </>
                ) : saved ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="info-card">
          <h5 className="fw-bold text-primary mb-3 d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>💡</span>
            Tips for better results
          </h5>
          <ul className="mb-0" style={{ color: '#1e40af' }}>
            <li className="mb-2">Select keywords that are most relevant to your business for accurate tracking</li>
            <li className="mb-2">Include direct and indirect competitors for comprehensive analysis</li>
            <li className="mb-0">Keywords are automatically pulled from your Google Search Console data (last 3 months)</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default AutoConfig;