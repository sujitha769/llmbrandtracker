import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ userEmail }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [showHistory, setShowHistory] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
  if (userEmail) fetchUserInfo();
}, [userEmail, showHistory]);


  useEffect(() => {
    const listener = () => {
      if (document.visibilityState === "visible" && userEmail) {
        fetchUserInfo();
      }
    };
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, [userEmail]);

  const fetchUserInfo = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/userinfo?email=${userEmail}`
      );
      const data = await res.json();
      setUserInfo(data);
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  };

  if (!userInfo) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <p className="fs-5 fw-semibold text-muted">Loading profile...</p>
      </div>
    );
  }

  const plan = userInfo.plan;
  const hasPlan = !!plan?.name;

  const progress =
    hasPlan && plan.maxKeywords > 0
      ? Math.min((plan.usedKeywords / plan.maxKeywords) * 100, 100)
      : 0;

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", width: "100vw", padding: "20px", backgroundColor: "#f8f9fa" }}>
      <div style={{ width: "100%", maxWidth: "1400px" }}>
        <div className="card shadow-lg rounded-4 p-4" style={{ border: "1px solid #e0e0e0" }}>
          <div className="row g-4">
        
        {/* =======================
            LEFT SIDE - PROFILE CARD
        ======================== */}
        <div className="col-lg-4">
          <div
            className="card shadow-sm rounded-3"
            style={{
              border: "1px solid #e0e0e0",
              position: "sticky",
              top: "20px"
            }}
          >
            <div className="card-body p-4 text-center">
              {/* Profile Image */}
              <img
                src={userInfo.picture}
                alt="Profile"
                className="rounded-circle mb-3"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  border: "3px solid #f0f0f0",
                }}
              />

              {/* User Info */}
              <h3 className="fw-bold mb-1">{userInfo.name}</h3>
              <p className="text-muted mb-4">{userInfo.email}</p>

              {/* Account Stats */}
              <div className="border-top pt-3">
                <div className="row text-center g-3">
                  <div className="col-4">
                    <h5 className="fw-bold mb-0" style={{ color: "#764ba2" }}>
                      {hasPlan ? plan.usedKeywords : 0}
                    </h5>
                    <small className="text-muted">Used</small>
                  </div>
                  <div className="col-4">
                    <h5 className="fw-bold mb-0" style={{ color: "#764ba2" }}>
                      {hasPlan ? plan.maxKeywords : 0}
                    </h5>
                    <small className="text-muted">Total</small>
                  </div>
                  <div className="col-4">
                    <h5 className="fw-bold mb-0" style={{ color: "#764ba2" }}>
                      {userInfo.purchaseHistory?.length || 0}
                    </h5>
                    <small className="text-muted">Purchases</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            RIGHT SIDE - PLAN DETAILS & HISTORY
        ======================== */}
        <div className="col-lg-8">
          
          {/* PLAN CARDS */}
          <div className="row g-3 mb-4">
            
            {/* CURRENT PLAN */}
            <div className="col-md-6">
              <div className="card shadow-sm rounded-3" style={{ border: "1px solid #e0e0e0" }}>
                <div className="card-body p-4">
                  <h6 className="text-uppercase small fw-bold text-muted mb-3">
                    CURRENT PLAN
                  </h6>

                  {hasPlan ? (
                    <>
                      <h3 className="fw-bold mb-3">{plan.name}</h3>
                      
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted small">Usage</span>
                          <span className="fw-semibold small">{Math.round(progress)}%</span>
                        </div>
                        <div className="progress" style={{ height: "8px" }}>
                          <div
                            className="progress-bar"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: "#764ba2"
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <p className="text-muted mb-0 small">
                        {plan.usedKeywords} of {plan.maxKeywords} Keywords Used
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted mb-0">No active plan</p>
                      <small className="text-muted">Subscribe to get started</small>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* UPCOMING PLAN */}
            <div className="col-md-6">
              <div className="card shadow-sm rounded-3" style={{ border: "1px solid #e0e0e0" }}>
                <div className="card-body p-4">
                  <h6 className="text-uppercase small fw-bold text-muted mb-3">
                    UPCOMING PLAN
                  </h6>

                  {userInfo.futurePlan?.name ? (
                    <>
                      <h3 className="fw-bold mb-2">{userInfo.futurePlan.name}</h3>
                      <span className="badge bg-success mb-2">Scheduled</span>
                      <p className="text-muted mb-0 small">
                        {userInfo.futurePlan.maxKeywords} Keywords
                      </p>
                      <small className="text-muted">Starts after current plan</small>
                    </>
                  ) : (
                    <>
                      <p className="text-muted mb-0">No upcoming plan</p>
                      <small className="text-muted">Schedule your next plan</small>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="d-flex gap-3 mb-4">
            <button
              onClick={() => navigate("/pricing")}
              className="btn flex-fill py-3 fw-semibold rounded-3"
              style={{
                backgroundColor: "#764ba2",
                color: "white",
                border: "none"
              }}
            >
              Upgrade Plan
            </button>

             <button
              onClick={() => navigate("/pricing")}
              className="btn flex-fill py-3 fw-semibold rounded-3"
              style={{
                backgroundColor: "#764ba2",
                color: "white",
                border: "none"
              }}
            >
              Downgrade Plan
            </button>

           
            <button
              className="btn btn-outline-secondary flex-fill py-3 fw-semibold rounded-3"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Close History" : "View History"}
            </button>
          </div>

          {/* PAYMENT HISTORY */}
          {showHistory && (
            <div className="card shadow-sm rounded-3" style={{ border: "1px solid #e0e0e0" }}>
              <div className="card-body p-4">
                <h4 className="fw-bold mb-4">Payment History</h4>

                {userInfo.purchaseHistory?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th className="fw-semibold text-muted small" style={{ padding: "12px" }}>PLAN NAME</th>
                          <th className="fw-semibold text-muted small" style={{ padding: "12px" }}>AMOUNT</th>
                          <th className="fw-semibold text-muted small" style={{ padding: "12px" }}>KEYWORDS</th>
                          <th className="fw-semibold text-muted small" style={{ padding: "12px" }}>DATE & TIME</th>
                          <th className="fw-semibold text-muted small" style={{ padding: "12px" }}>TRANSACTION ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userInfo.purchaseHistory.map((p, i) => (
                          <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                            <td className="fw-semibold" style={{ padding: "14px" }}>
                              {p.planName}
                            </td>
                            <td className="fw-bold" style={{ padding: "14px", color: "#10b981" }}>
                              ₹{p.price}
                            </td>
                            <td style={{ padding: "14px" }}>
                              <span className="badge" style={{ backgroundColor: "#764ba2", color: "white" }}>
                                {p.keywords} Keywords
                              </span>
                            </td>
                            <td className="text-muted small" style={{ padding: "14px" }}>
                              {new Date(p.paidAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                              })}
                              <br />
                              {new Date(p.paidAt).toLocaleTimeString('en-US', { 
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="text-muted font-monospace small" style={{ padding: "14px" }}>
                              {p.transactionId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted mb-0">No purchase history available.</p>
                    <small className="text-muted">Your transactions will appear here</small>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default Profile;