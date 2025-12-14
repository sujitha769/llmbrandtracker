//frontend/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, BarChart3, Settings, LogOut, User, Menu, X, Globe, History } from "lucide-react";
import AdminSessionBanner from "./AdminSessionBanner";
import Analytics from "./Analytics";

const Dashboard = ({ userEmail, handleLogout }) => {
  const navigate = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // 👉 NEW: Premium popup state
  const [isPremium, setIsPremium] = useState(true);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [autoConfig, setAutoConfig] = useState(null);
const [planName, setPlanName] = useState(null);


  // Fetch subscription status
useEffect(() => {
  if (!userEmail) return;

  const checkSubscription = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/subscription/status?email=${userEmail}`
      );
      const data = await res.json();

      setIsPremium(data.hasSubscription);

    const isAdminSession = localStorage.getItem("isAdminSession") === "true";

// Show popup only for REAL users, not admin impersonating
if (
  !data.hasSubscription &&
  !isAdminSession &&
  window.location.pathname !== "/pricing"
) {
  setTimeout(() => setShowUpgradePopup(true), 5000);
}



    } catch (err) {
      console.error("Subscription check failed:", err);
    }
  };

  checkSubscription();
}, [userEmail]);


// Fetch user plan + auto config
useEffect(() => {
  if (!userEmail) return;

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/profile?email=${userEmail}`
      );
      const data = await res.json();

    setPlanName((data.user?.plan?.name || "").toLowerCase());

      setAutoConfig(data.user?.autoConfig || null);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  fetchUserInfo();
}, [userEmail]);




  useEffect(() => {
    if (userEmail) fetchSites();
  }, [userEmail]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/gsc/sites?email=${userEmail}`
      );
      const data = await res.json();
      setSites(data.sites || []);
    } catch (err) {
      console.error("Error fetching sites:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f9fafb",
        overflow: "hidden",
      }}
    >
      <AdminSessionBanner />

      {/* SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          left: 0,
          bottom: 0,
          width: "256px",
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
        className="lg:translate-x-0 lg:static"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#8A2BE2",
              margin: 0,
            }}
          >
            GSC Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
            }}
            className="lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: "24px 16px" }}>
          <button
            onClick={() => setActiveSection("home")}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "12px 16px",
              marginBottom: "8px",
              backgroundColor:
                activeSection === "home" ? "#f3e8ff" : "transparent",
              color: activeSection === "home" ? "#8A2BE2" : "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            <Home size={20} style={{ marginRight: "12px" }} />
            Home
          </button>
{/* 
          <button
onClick={() => isPremium && setActiveSection("analytics")}

            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "12px 16px",
              marginBottom: "8px",
              backgroundColor:
                activeSection === "analytics" ? "#f3e8ff" : "transparent",
              color: activeSection === "analytics" ? "#8A2BE2" : "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
              
            }}
          >
            <BarChart3 size={20} style={{ marginRight: "12px" }} />
            Analytics
          </button> */}



<button
  onClick={() => isPremium && navigate("/history")}
  style={{
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "12px 16px",
    marginBottom: "8px",
    backgroundColor: "transparent",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "14px",
  }}
>
  <History size={20} style={{ marginRight: "12px" }} />
  Analytics History
</button>



<button
  onClick={() => isPremium && navigate("/analytics-report")}
  style={{
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "12px 16px",
    marginBottom: "8px",
    backgroundColor: "transparent",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: isPremium ? "pointer" : "not-allowed",
    fontWeight: "500",
    fontSize: "14px",
    opacity: isPremium ? 1 : 0.5,
  }}
>
  <BarChart3 size={20} style={{ marginRight: "12px" }} />
  Report
</button>

          <button
            onClick={() => isPremium && setActiveSection("settings")}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "12px 16px",
              backgroundColor:
                activeSection === "settings" ? "#f3e8ff" : "transparent",
              color: activeSection === "settings" ? "#8A2BE2" : "#374151",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            <Settings size={20} style={{ marginRight: "12px" }} />
            Settings
          </button>
        </nav>

        <div style={{ borderTop: "1px solid #e5e7eb", padding: "16px" }}>
          <div
            onClick={() => navigate("/profile")}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
              padding: "8px",
              cursor: "pointer",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#f3e8ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={20} style={{ color: "#8A2BE2" }} />
            </div>

            <div style={{ marginLeft: "12px", flex: 1 }}>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                  margin: 0,
                }}
              >
                {userEmail || "User"}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  margin: 0,
                }}
              >
                View Profile
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "8px 16px",
              backgroundColor: "transparent",
              color: "#dc2626",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            <LogOut size={18} style={{ marginRight: "12px" }} />
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          className="lg:hidden"
          style={{
            backgroundColor: "white",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            <Menu size={24} />
          </button>
          <h1
            style={{
              marginLeft: "16px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#111827",
            }}
          >
            GSC Dashboard
          </h1>
        </div>

        {/* CONTENT SCROLL */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div
            style={{
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "32px 24px",
            }}
          >
            {/* HOME SECTION */}
            {activeSection === "home" && (
              <>
                {/* HEADER WITH TITLE AND BUTTON IN SAME ROW */}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  marginBottom: "32px",
                  flexWrap: "wrap",
                  gap: "16px"
                }}>
                  <div>
                    <h2
                      style={{
                        fontSize: "30px",
                        fontWeight: "bold",
                        color: "#8b33bdff",
                        marginBottom: "8px",
                        display: "flex",
                        alignItems: "center",
                        margin: 0,
                      }}
                    >
                      <Globe
                        size={32}
                        style={{ marginRight: "12px", color: "#8A2BE2" }}
                      />
                      Google Search Console Sites
                    </h2>
                    <p style={{ color: "#6b7280", fontSize: "14px", margin: "8px 0 0 44px" }}>
                      Manage and analyze your connected websites
                    </p>
                  </div>

                  {/* AUTOMATION STATUS BUTTON */}
                  {(planName === "business" || planName === "pro") && (
                    <button
                      onClick={() => navigate("/auto-config")}
                      style={{
                        padding: "10px 18px",
                        fontSize: "14px",
                        fontWeight: "600",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        backgroundColor: autoConfig?.site ? "#10B981" : "#8A2BE2",
                        color: "white",
                        boxShadow: autoConfig?.site
                          ? "0 0 0px rgba(0,0,0,0)"
                          : "0 0 10px rgba(127, 72, 24, 0.7)",
                        animation: autoConfig?.site ? "none" : "glow 1.5s infinite",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {autoConfig?.site ? "Automation Active" : "Setup Automation"}
                    </button>
                  )}
                </div>

                {/* Loading */}
                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        width: "48px",
                        height: "48px",
                        border: "4px solid #f3f4f6",
                        borderTopColor: "#8A2BE2",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    ></div>
                    <p
                      style={{
                        marginTop: "20px",
                        color: "#6b7280",
                        fontSize: "16px",
                      }}
                    >
                      Loading your sites...
                    </p>
                  </div>
                ) : sites.length > 0 ? (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid #e5e7eb",
                        backgroundColor: "#e8d8f8ff",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Your Websites ({sites.length})
                      </h3>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                        }}
                      >
                        <thead style={{ backgroundColor: "#f9fafb" }}>
                          <tr>
                            <th
                              style={{
                                padding: "16px 24px",
                                textAlign: "left",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#6b7280",
                                textTransform: "uppercase",
                              }}
                            >
                              Website URL
                            </th>

                            <th
                              style={{
                                padding: "16px 24px",
                                textAlign: "right",
                                fontSize: "12px",
                                fontWeight: "600",
                                color: "#6b7280",
                                textTransform: "uppercase",
                              }}
                            >
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {sites.map((site, idx) => (
                            <tr key={idx} style={{ borderTop: "1px solid #e5e7eb" }}>
                              <td
                                style={{
                                  padding: "20px 24px",
                                  fontSize: "14px",
                                  color: "#111827",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <Globe
                                    size={18}
                                    style={{ marginRight: "12px", color: "#8A2BE2" }}
                                  />
                                  <span style={{ fontWeight: "500" }}>
                                    {site.siteUrl}
                                  </span>
                                </div>
                              </td>

                              <td style={{ padding: "20px 24px", textAlign: "right" }}>
                                <button
                                  onClick={() => {
  if (isPremium) {
    navigate(`/analyze?site=${encodeURIComponent(site.siteUrl)}`);
  }
}}

                                  style={{
                                    padding: "8px 20px",
                                    backgroundColor: "#8A2BE2",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                  }}
                                >
                                  Analyze Site
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "12px",
                      padding: "60px 20px",
                      textAlign: "center",
                    }}
                  >
                    <Globe
                      size={48}
                      style={{ color: "#d1d5db", margin: "0 auto 16px" }}
                    />
                    <p style={{ color: "#6b7280", fontSize: "16px" }}>
                      No sites found.
                    </p>
                    <p
                      style={{
                        color: "#9ca3af",
                        fontSize: "14px",
                        marginTop: "8px",
                      }}
                    >
                      Connect your Google Search Console to get started.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ANALYTICS */}
          {activeSection === "analytics" && (
  <Analytics userEmail={userEmail} />
)}

            {/* SETTINGS */}
            {activeSection === "settings" && (
              <div>
                <h2
                  style={{
                    fontSize: "30px",
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: "16px",
                  }}
                >
                  Settings
                </h2>
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    padding: "60px 20px",
                    textAlign: "center",
                  }}
                >
                  <Settings
                    size={48}
                    style={{ color: "#d1d5db", margin: "0 auto 16px" }}
                  />
                  <p style={{ color: "#6b7280", fontSize: "16px" }}>
                    Settings section coming soon...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR BACKDROP */}
      {sidebarOpen && (
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 40,
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* NEW: PREMIUM POPUP */}
      {showUpgradePopup && !isPremium && (
        <>
          {/* BLUR BACKGROUND */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backdropFilter: "blur(6px)",
              backgroundColor: "rgba(0,0,0,0.3)",
              zIndex: 999,
            }}
          ></div>

          {/* POPUP CARD */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "420px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              zIndex: 1000,
            }}
          >
            <h2
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              You are not upgraded
            </h2>

            <p style={{ fontSize: "14px", color: "#4B5563", marginBottom: "20px" }}>
              Please upgrade your plan to unlock full access.
            </p>

            <button
              onClick={() => navigate("/pricing")}
              style={{
                padding: "10px 20px",
                backgroundColor: "#8A2BE2",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "15px",
                fontWeight: "500",
                width: "100%",
              }}
            >
              Upgrade Now
            </button>
          </div>
        </>
      )}

     <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* NEW: Glow animation for Setup Automation button */
        @keyframes glow {
          0% { box-shadow: 0 0 5px rgba(138,43,226,0.4); }
          50% { box-shadow: 0 0 15px rgba(118, 6, 255, 0.9); }
          100% { box-shadow: 0 0 5px rgba(138,43,226,0.4); }
        }

        @media (min-width: 1024px) {
          .lg\\:hidden { display: none !important; }
          .lg\\:translate-x-0 { transform: translateX(0) !important; position: static !important; }
          .lg\\:static { position: static !important; }
        }
      `}</style>

    </div>
  );
};

export default Dashboard;