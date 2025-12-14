import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem("userEmail");

  // Load pricing plans
  useEffect(() => {
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const processed = data.plans.map((p, index) => {
            let benefits = [];

            if (index === 0) {
              benefits = [
                "✔ Full Insights",
                "✔ 1 Website Allowed",
                "✔ No Auto-Run",
                "✔ No Email Updates",
                "✔ Best for Students",
              ];
            } else if (index === 1) {
              benefits = [
                "✔ Full Insights",
                "✔ 2 Websites Allowed",
                "✔ Auto-Run Every 7 Days",
                "✔ Weekly Email Summary",
                "✔ Best for Freelancers",
              ];
            } else if (index === 2) {
              benefits = [
                "✔ Full Insights",
                "✔ Unlimited Websites",
                "✔ Auto-Run Every 5 Days",
                "✔ Email Summary Every 5 Days",
                "✔ Best for Agencies",
              ];
            }

            return {
              name: p.name || p.title.toLowerCase(),
              title: p.title,
              keywords: p.keywords,
              price: p.price,
              popular: p.popular || false,
              benefits,
            };
          });

          setPlans(processed);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);



  // MAIN PLAN HANDLER
  const handleChoosePlan = async (p) => {
    if (!userEmail) return alert("Please log in first.");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/subscription/status?email=${userEmail}`
      );
      const data = await res.json();

      const hasCurrent = data.plan && data.plan.name;
      const hasFuture = data.futurePlan && data.futurePlan.name;

      if (hasCurrent && hasFuture) {
        alert("⚠️ You already have 2 plans (current + future). Cannot buy more.");
        return;
      }

      let isFuturePlan = false;

      if (hasCurrent && !hasFuture) {
        if (!window.confirm("Your current plan is active. New plan will start later.")) return;
        isFuturePlan = true;
      }

      navigate("/payment", {
        state: {
          plan: p.name,
          planTitle: p.title,
          price: p.price.toString(),
          keywords: p.keywords.toString(),
          isFuturePlan,
        },
      });
    } catch {
      alert("Server error. Try again.");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#667eea,#764ba2)",
          color: "white",
          fontSize: "20px",
          fontWeight: "600",
        }}
      >
        Loading pricing plans...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "60px 20px",
        position: "relative",
      }}
    >
     

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h2
          style={{
            fontSize: "48px",
            fontWeight: "800",
            marginBottom: "16px",
            color: "white",
            letterSpacing: "-0.5px",
          }}
        >
      Find the Perfect Plan for Your Growth
        </h2>
        <p
          style={{
            fontSize: "18px",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "400",
          }}
        >
          Select the perfect plan for your business needs
        </p>
      </div>

      {/* ⭐ Pricing Cards */}
      <div
        style={{
          display: "flex",
          gap: "55px", // added more distance
          justifyContent: "center",
          flexWrap: "wrap",
          maxWidth: "1200px",
        }}
      >
        {plans.map((p) => (
          <div
            key={p.name}
            style={{
              position: "relative",
             border: p.popular
  ? "2px solid rgba(255, 215, 0, 0.5)"
  : "1px solid rgba(0,0,0,0.08)",   // ⭐ soft border added

              padding: "45px 35px",
              borderRadius: "24px",
              width: "320px",
              backgroundColor: "white",
              boxShadow: p.popular
                ? "0 20px 60px rgba(0,0,0,0.3)"
                : "0 10px 35px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = p.popular
                ? "scale(1.08) translateY(-10px)"
                : "scale(1.05) translateY(-10px)";
              e.currentTarget.style.boxShadow = p.popular
                ? "0 30px 80px rgba(0,0,0,0.35)"
                : "0 20px 55px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = p.popular
                ? "scale(1.05) translateY(0)"
                : "scale(1) translateY(0)";
              e.currentTarget.style.boxShadow = p.popular
                ? "0 20px 60px rgba(0,0,0,0.3)"
                : "0 10px 35px rgba(0,0,0,0.2)";
            }}
          >
            {/* ⭐ MOST POPULAR Badges stays floating */}
            {p.popular && (
              <div
                style={{
                  position: "absolute",
                  top: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "6px 24px",
                  background:
                    "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                  color: "#333",
                  borderRadius: "50px",
                  fontSize: "13px",
                  fontWeight: "700",
                  boxShadow: "0 4px 12px rgba(255,215,0,0.4)",
                }}
              >
                MOST POPULAR
              </div>
            )}

            {/* CARD CONTENT */}
            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  marginBottom: "12px",
                  color: "#1a202c",
                }}
              >
                {p.title}
              </h3>

              <p
                style={{
                  fontSize: "15px",
                  color: "#718096",
                  marginBottom: "30px",
                  fontWeight: "500",
                }}
              >
                Plan Keyword Limit: {p.keywords}
              </p>

              <div style={{ marginBottom: "20px" }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#667eea",
                  }}
                >
                  ₹
                </span>
                <span
                  style={{
                    fontSize: "56px",
                    fontWeight: "800",
                    color: "#667eea",
                  }}
                >
                  {p.price}
                </span>
              </div>

              {/* ⭐ BENEFITS LIST */}
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  marginBottom: "25px",
                  textAlign: "left",
                  lineHeight: "1.6",
                  fontSize: "15px",
                  color: "#333",
                }}
              >
                {p.benefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>

              {/* BUTTON */}
              <button
                onClick={() => handleChoosePlan(p)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: "#667eea",
                  color: "white",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "17px",
                  fontWeight: "700",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.05)";
                  e.target.style.boxShadow =
                    "0 8px 20px rgba(102, 126, 234, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Choose Plan
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* =======================
   CUSTOM ADD-ON SECTION (Original UI)
==========================*/}
<div
  style={{
    width: "100%",
    maxWidth: "1050px",
    marginTop: "130px",
    textAlign: "center",
  }}
>
  {/* Top Label */}
  <p
    style={{
      fontSize: "17px",
      color: "rgba(255,255,255,0.8)",
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: "12px",
    }}
  >
    Extra Features
  </p>

  {/* Main Heading */}
  <h2
    style={{
      fontSize: "44px",
      fontWeight: "800",
      color: "white",
      marginBottom: "45px",
    }}
  >
    Supercharge Your Visibility Performance
  </h2>

  {/* CARD WITH ORIGINAL EFFECTS */}
  <div
    style={{
      position: "relative",
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(12px)",
      borderRadius: "22px",
      padding: "45px",
      maxWidth: "850px",
      margin: "0 auto",
      boxShadow: "0 20px 55px rgba(0,0,0,0.35)",
      border: "1px solid rgba(255,255,255,0.25)",
      transition: "all 0.35s ease",
      transformStyle: "preserve-3d",
    }}

    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-12px) scale(1.03)";
      e.currentTarget.style.boxShadow =
        "0 30px 70px rgba(0,0,0,0.45)";
      e.currentTarget.style.border =
        "1px solid rgba(255,255,255,0.45)";
    }}

    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0) scale(1)";
      e.currentTarget.style.boxShadow =
        "0 20px 55px rgba(0,0,0,0.35)";
      e.currentTarget.style.border =
        "1px solid rgba(255,255,255,0.25)";
    }}
  >
    {/* Glow Ring Effect */}
    <div
      style={{
        position: "absolute",
        top: "-25px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "120px",
        height: "120px",
        background: "radial-gradient(circle, rgba(255,255,255,0.7), transparent 70%)",
        borderRadius: "50%",
        filter: "blur(20px)",
        zIndex: "-1",
      }}
    />

    {/* Title */}
    <h3
      style={{
        fontSize: "30px",
        fontWeight: "700",
        color: "white",
        marginBottom: "18px",
      }}
    >
      AI Visibility Booster
    </h3>

    {/* Description */}
    <p
      style={{
        fontSize: "16px",
        color: "rgba(255,255,255,0.85)",
        marginBottom: "30px",
        lineHeight: "1.7",
      }}
    >
      A powerful expansion to your visibility tracking toolkit.  
      Get deeper insights, clearer improvement paths, and a competitive edge  
      across every major AI model.
    </p>

    {/* Bullet List */}
    <ul
      style={{
        color: "rgba(255,255,255,0.9)",
        fontSize: "16px",
        lineHeight: "1.8",
        listStyle: "none",
        padding: 0,
        marginBottom: "30px",
      }}
    >
      <li>✨ Weekly brand visibility improvement score</li>
      <li>✨ Personalized suggestions to boost your ranking</li>
      <li>✨ Side-by-side competitor ranking analysis</li>
      <li>✨ Trend patterns across multiple AI chatbots</li>
    </ul>

    {/* Learn More Button */}
    <button
      style={{
        background: "transparent",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.4)",
        padding: "10px 20px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "16px",
        transition: "0.3s",
      }}

      onMouseEnter={(e) => {
        e.target.style.background = "rgba(255,255,255,0.2)";
        e.target.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.target.style.background = "transparent";
        e.target.style.transform = "scale(1)";
      }}
    >
      Learn More →
    </button>
  </div>
</div>


      <p
        style={{
          marginTop: "50px",
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        All plans include 24/7 customer support and free updates
      </p>
    </div>
  );
};

export default Pricing;
