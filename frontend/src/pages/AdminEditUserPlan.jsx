import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminEditUserPlan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");

  const adminEmail = localStorage.getItem("adminEmail");

  useEffect(() => {
    if (!localStorage.getItem("isAdmin")) {
      navigate("/admin-login");
      return;
    }
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/user/${id}/available-plans`,
        {
          headers: {
            "admin-email": adminEmail,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setPlans(data.availablePlans);
        setSelectedPlan(data.user.currentPlan?.name || "");
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return alert("Please select a plan");

    const plan = plans.find((p) => p.title === selectedPlan);
    if (!plan) return alert("Invalid plan selected");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/user/${id}/change-plan`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "admin-email": adminEmail,
          },
          body: JSON.stringify({ planId: plan._id }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Plan updated successfully!");
        navigate("/admin/dashboard");
      } else {
        alert(data.message || "Failed to update plan");
      }
    } catch (error) {
      console.error("Plan update error:", error);
      alert("Error updating plan");
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <h2>Loading user & plans...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "20px", textAlign: "center", fontWeight: "800", color: "#1f2937" }}>
          Change User Plan
        </h2>

        <div style={{ marginBottom: "20px", background: "#f9fafb", padding: "16px", borderRadius: "12px" }}>
          <p style={{ margin: 0 }}>
            <strong>User ID:</strong> {user.id}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Current Plan:</strong> {user.currentPlan?.name || "No Active Plan"}
          </p>
        </div>

        <label
          style={{ fontWeight: "600", marginBottom: "8px", display: "block", color: "#374151" }}
        >
          Select New Plan:
        </label>

        <select
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          style={{
            padding: "12px",
            width: "100%",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            background: "white",
            marginBottom: "20px",
            fontSize: "15px",
            fontWeight: "500",
            color: "#111827",
          }}
        >
          <option value="">Select a plan</option>
          {plans.map((plan) => (
            <option key={plan._id} value={plan.title}>
              {plan.title} — {plan.keywords} keywords — ₹{plan.price}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
          <button
            onClick={handleUpdatePlan}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "700",
            }}
          >
            Save
          </button>

          <button
            onClick={() => navigate("/admin/dashboard")}
            style={{
              flex: 1,
              padding: "12px 20px",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "700",
              color: "#374151",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditUserPlan;