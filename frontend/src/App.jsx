import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Landing from "./components/Landing";
import Dashboard from "./pages/Dashboard";
import Keywords from "./pages/Keywords";

// ⭐ NEW PAGES (REPLACING OLD ANALYZE)
import AnalyzeSetup from "./pages/AnalyzeSetup";
import AnalyzeResults from "./pages/AnalyzeResults";
import AnalyticsHistory from "./pages/AnalyticsHistory";
import AnalyticsResultsgraph from "./pages/AnalyticsResultsgraph";

import Pricing from "./pages/Pricing";
import Payment from "./pages/Payment";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";

import AdminPricingManager from "./pages/AdminPricingManager";
import AdminEditUserPlan from "./pages/AdminEditUserPlan";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import AutoConfig from "./pages/AutoConfig";


function AppContent({ isLoggedIn, handleLogout, email, hasSubscription }) {
  const location = useLocation();

  const hideNavbar = [
    "/dashboard",
    "/analyze",
    "/analyze/results",
    "/history",
    "/analytics-report",
    "/payment",
    "/profile",
    "/activity",
    "/admin-login",
    "/admin/dashboard",
    "/admin/pricing",
    "/admin/user/:id/edit-plan",
    "/auto-config"
  ].includes(location.pathname);

  return (
    <>
      {!hideNavbar && (
        <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      )}

      <Routes>
        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pricing" element={<AdminPricingManager />} />
        <Route
          path="/admin/user/:id/edit-plan"
          element={<AdminEditUserPlan />}
        />

        {/* ---------------- GOOGLE CALLBACK ---------------- */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ================= NOT LOGGED IN USERS ================= */}
        {!isLoggedIn && (
          <>
            <Route
              path="/"
              element={
                <Landing
                  onGoogleLogin={() =>
                    (window.location.href =
                      `${import.meta.env.VITE_BACKEND_URL}/auth/google`
                    )
                  }
                />
              }
            />
            {/* ⭐ PRICING PAGE ACCESSIBLE TO NON-LOGGED IN USERS */}
            <Route path="/pricing" element={<Pricing />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {/* ================= LOGGED-IN USERS ================= */}
        {isLoggedIn && (
          <>
            {/* ⭐ PRICING ALWAYS ACCESSIBLE */}
            <Route path="/pricing" element={<Pricing />} />

            {/* ⭐ PAYMENT ALWAYS ACCESSIBLE */}
            <Route path="/payment" element={<Payment />} />

            {/* ---------- USERS WITHOUT ACTIVE PLAN ---------- */}
            {!hasSubscription && (
              <>
                <Route
                  path="/dashboard"
                  element={<Dashboard userEmail={email} handleLogout={handleLogout} />}
                />
                <Route path="/profile" element={<Profile userEmail={email} />} />
               
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}

            {/* ---------- USERS WITH ACTIVE PLAN ---------- */}
            {hasSubscription && (
              <>
                <Route
                  path="/dashboard"
                  element={<Dashboard userEmail={email} handleLogout={handleLogout} />}
                />

                <Route path="/keywords" element={<Keywords userEmail={email} />} />

                {/* ⭐ NEW ANALYSIS SYSTEM */}
                <Route path="/analyze" element={<AnalyzeSetup userEmail={email} />} />
                <Route
                  path="/analyze/results"
                  element={<AnalyzeResults userEmail={email} />}
                />
                
                {/* ⭐ ANALYTICS HISTORY */}
                <Route 
                  path="/history" 
                  element={<AnalyticsHistory userEmail={email} />} 
                />

                {/* ⭐ NEW: ANALYTICS REPORT PAGE */}
                <Route 
                  path="/analytics-report" 
                  element={
                    <AnalyticsResultsgraph 
                      userEmail={email} 
                      analysisId={null}
                    />
                  } 
                />

                <Route path="/profile" element={<Profile userEmail={email} />} />

                {/* ⭐ AUTO CONFIG */}
                <Route 
                  path="/auto-config"
                  element={<AutoConfig />}
                />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </>
        )}
      </Routes>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [hasSubscription, setHasSubscription] = useState(false);

  // Check user subscription on login
  const checkSubscription = async (userEmail) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/subscription/status?email=${userEmail}`

      );
      const data = await res.json();

      setHasSubscription(!!data.plan?.name);

      if (data.plan?.name) {
        localStorage.setItem(
          "subscriptionData",
          JSON.stringify({ hasSubscription: true })
        );
      } else {
        localStorage.removeItem("subscriptionData");
      }
    } catch (err) {
      setHasSubscription(false);
    }
  };

  // On mount: Check if user logged in
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setIsLoggedIn(true);
      checkSubscription(storedEmail);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setHasSubscription(false);
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        handleLogout={handleLogout}
        email={email}
        hasSubscription={hasSubscription}
      />
    </Router>
  );
}

export default App;