import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { plan, planTitle, price, keywords, isFuturePlan } = location.state || {};
  const userEmail = localStorage.getItem("userEmail");
  const userSubscriptionKey = `subscriptionData_${userEmail}`;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    upiId: "",
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------------------------------------------
  // INPUT HANDLER
  // ---------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ---------------------------------------------------
  // FORM VALIDATION
  // ---------------------------------------------------
  const validateForm = () => {
    const err = {};

    if (!formData.name.trim()) err.name = "Name is required";

    if (!formData.phone.trim()) err.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      err.phone = "Phone number must be 10 digits";

    if (!formData.upiId.trim()) err.upiId = "UPI ID is required";
    else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId))
      err.upiId = "Invalid UPI ID (example: username@upi)";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---------------------------------------------------
  // PAYMENT ⬇⬇⬇ FIXED HERE
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const apiURL = isFuturePlan
        ? `${import.meta.env.VITE_BACKEND_URL}/subscription/setFuturePlan`
        : `${import.meta.env.VITE_BACKEND_URL}/subscription/upgrade`;

      const res = await fetch(apiURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, plan }),
      });

      const data = await res.json();
      console.log("SERVER RESPONSE →", data);

      if (!data.success) {
        alert("❌ Subscription activation failed.");
        setIsProcessing(false);
        return;
      }

      // 🎉 SUCCESS MESSAGE
      if (isFuturePlan) {
        alert(
          "🎉 Payment Successful!\nYour new plan is scheduled and will start after your current plan ends."
        );
      } else {
        alert("🎉 Payment Successful!\nYour plan is now active.");
      }

      // ---------------------------------------------------
      // 🔥 CRITICAL FIX: REMOVE STALE PLAN DATA
      // ---------------------------------------------------
      localStorage.removeItem(userSubscriptionKey);
      localStorage.removeItem("planData");
      localStorage.removeItem("futurePlan");
      localStorage.removeItem("subscription");

      // Reload dashboard with FRESH DATA
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 300);

    } catch (err) {
      console.error("PAYMENT ERROR →", err);
      alert("❌ Server Error: " + err.message);
    }

    setIsProcessing(false);
  };

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "1100px" }}>

        {/* Back Button */}
        <button
          onClick={() => navigate("/pricing")}
          style={{
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "white",
            padding: "10px 24px",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "16px",
            marginBottom: "30px",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.3)";
            e.target.style.transform = "translateX(-5px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
            e.target.style.transform = "translateX(0)";
          }}
        >
          ← Back to Plans
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "30px" }}>
          
          {/* ORDER SUMMARY */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "20px",
              padding: "35px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
              height: "fit-content",
            }}
          >
            <h3 style={{ fontWeight: "700", marginBottom: "25px", color: "white", fontSize: "1.5rem" }}>
              Order Summary
            </h3>

            <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.3)", paddingBottom: "20px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Plan:</span>
                <strong style={{ color: "white" }}>{planTitle}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "rgba(255, 255, 255, 0.8)" }}>Keywords:</span>
                <strong style={{ color: "white" }}>{keywords}</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "25px" }}>
              <span style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "1.1rem" }}>Total:</span>
              <strong style={{ fontSize: "2.5rem", color: "white", fontWeight: "800" }}>₹{price}</strong>
            </div>
          </div>

          {/* PAYMENT FORM */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "20px",
              padding: "40px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 style={{ fontWeight: "700", marginBottom: "10px", color: "white", fontSize: "1.8rem" }}>
              Complete Your Payment
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.8)", marginBottom: "30px" }}>
              Fill in your details to proceed
            </p>

            <form onSubmit={handleSubmit}>
              
              {/* NAME */}
              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "white" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: errors.name ? "2px solid #ff6b6b" : "1px solid rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.9)",
                    fontSize: "16px",
                    color: "#333",
                    outline: "none",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "white";
                    e.target.style.border = "2px solid #667eea";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    if (!errors.name) e.target.style.border = "1px solid rgba(255, 255, 255, 0.3)";
                  }}
                />
                {errors.name && <div style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "5px", fontWeight: "500" }}>{errors.name}</div>}
              </div>

              {/* PHONE */}
              <div style={{ marginBottom: "25px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "white" }}>
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: errors.phone ? "2px solid #ff6b6b" : "1px solid rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.9)",
                    fontSize: "16px",
                    color: "#333",
                    outline: "none",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "white";
                    e.target.style.border = "2px solid #667eea";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    if (!errors.phone) e.target.style.border = "1px solid rgba(255, 255, 255, 0.3)";
                  }}
                />
                {errors.phone && <div style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "5px", fontWeight: "500" }}>{errors.phone}</div>}
              </div>

              {/* UPI */}
              <div style={{ marginBottom: "35px" }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px", color: "white" }}>
                  UPI ID *
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: errors.upiId ? "2px solid #ff6b6b" : "1px solid rgba(255, 255, 255, 0.3)",
                    background: "rgba(255, 255, 255, 0.9)",
                    fontSize: "16px",
                    color: "#333",
                    outline: "none",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "white";
                    e.target.style.border = "2px solid #667eea";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    if (!errors.upiId) e.target.style.border = "1px solid rgba(255, 255, 255, 0.3)";
                  }}
                />
                {errors.upiId && <div style={{ color: "#ff6b6b", fontSize: "14px", marginTop: "5px", fontWeight: "500" }}>{errors.upiId}</div>}
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={isProcessing}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: isProcessing ? "rgba(102, 126, 234, 0.6)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: isProcessing ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
                }}
              >
                {isProcessing ? "Processing..." : `Pay ₹${price} Now`}
              </button>

            </form>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;