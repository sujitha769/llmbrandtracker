// server/controllers/subscriptionController.js
import User from "../models/User.js";
import Pricing from "../models/Pricing.js";

/* =============================================================
   🔥 1️⃣ UPGRADE PLAN (Activate Immediately)
   - OLD LOGIC KEPT
   - FIX: Reset usedKeywords
   ============================================================= */
export const upgradePlan = async (req, res) => {
  try {
    const { email, plan } = req.body;

    if (!email || !plan) {
      return res.status(400).json({ success: false, error: "Email & plan are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    const selectedPlan = await Pricing.findOne({ name: plan });
    if (!selectedPlan)
      return res.status(404).json({ success: false, error: "Plan not found" });

    // ⭐ USERS CAN UPGRADE ANYTIME (keep your old logic)
    user.plan = {
      name: selectedPlan.title,
      maxKeywords: selectedPlan.keywords,
      usedKeywords: 0, 
      price: selectedPlan.price
    };

    // ⭐ We DO NOT delete futurePlan (because you said: keep old logic)
    // User can have: 1 active + 1 future plan

    // Add purchase entry
    user.purchaseHistory.push({
      planName: selectedPlan.title,
      keywords: selectedPlan.keywords,
      price: selectedPlan.price,
      paidAt: new Date(),
      paymentMethod: "UPI",
      transactionId: "TXN_" + Date.now()
    });

    await user.save();

    return res.json({
      success: true,
      message: "Plan upgraded successfully",
      plan: user.plan
    });

  } catch (err) {
    console.error("❌ upgradePlan failed:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};



/* =============================================================
   🔵 2️⃣ SET FUTURE PLAN (Starts when current ends)
   ============================================================= */
export const setFuturePlan = async (req, res) => {
  try {
    const { email, plan } = req.body;

    if (!email || !plan)
      return res.status(400).json({ success: false, error: "Email & plan are required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    if (!user.plan?.name) {
      return res.status(400).json({
        success: false,
        error: "You do not have an active plan. Use Upgrade instead."
      });
    }

    if (user.futurePlan?.name) {
      return res.status(400).json({
        success: false,
        error: "Future plan already exists."
      });
    }

    const selectedPlan = await Pricing.findOne({ name: plan });
    if (!selectedPlan)
      return res.status(404).json({ success: false, error: "Plan not found" });

    user.futurePlan = {
      name: selectedPlan.title,
      maxKeywords: selectedPlan.keywords,
      price: selectedPlan.price
    };

    // Add purchase entry
    user.purchaseHistory.push({
      planName: selectedPlan.title,
      keywords: selectedPlan.keywords,
      price: selectedPlan.price,
      paidAt: new Date(),
      paymentMethod: "UPI",
      transactionId: "TXN_" + Date.now()
    });

    await user.save();

    return res.json({
      success: true,
      message: "Future plan saved successfully",
      futurePlan: user.futurePlan
    });

  } catch (err) {
    console.error("❌ setFuturePlan failed:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};



/* =============================================================
   🟩 3️⃣ CHECK SUBSCRIPTION STATUS
   ============================================================= */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email)
      return res.status(400).json({ success: false, error: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.json({ success: true, hasSubscription: false });

    return res.json({
      success: true,
      hasSubscription: Boolean(user.plan?.name),
      plan: user.plan,
      futurePlan: user.futurePlan,
      purchaseHistory: user.purchaseHistory
    });

  } catch (err) {
    console.error("❌ getSubscriptionStatus failed:", err);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};
