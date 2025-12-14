import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get("email");

    if (!email) {
      navigate("/");
      return;
    }

    // Save email
    localStorage.setItem("userEmail", email);

    const checkSubscription = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/subscription/status?email=${email}`);
        const data = await res.json();

        // Save subscription status (if premium)
        if (data.hasSubscription) {
          localStorage.setItem(
            "subscriptionData",
            JSON.stringify({ hasSubscription: true })
          );
        } else {
          // Non-premium → ensure it's removed
          localStorage.removeItem("subscriptionData");
        }

        // 🎯 ALWAYS SEND USER TO DASHBOARD
        navigate("/dashboard");

      } catch (err) {
        console.error("Subscription check error:", err);

        // Still send to dashboard
        navigate("/dashboard");
      }
    };

    checkSubscription();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px", color: "#6b7280" }}>
      Authenticating, please wait...
    </div>
  );
}
