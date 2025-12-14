import express from "express";
import User from "../models/User.js";

const router = express.Router();

/* =========================================================
   GET /user/userinfo
   Returns: user profile, current plan, future plan,
            purchase history
========================================================= */
router.get("/userinfo", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.json({ email: null });

    const user = await User.findOne({ email });
    if (!user) return res.json({ email: null });

    res.json({
      email: user.email,
      name: user.name,
      picture: user.picture,

      plan: user.plan || null,
      futurePlan: user.futurePlan || null,

      purchaseHistory: user.purchaseHistory || []
    });

  } catch (err) {
    console.error("❌ Error in /userinfo:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/* =========================================================
   ⭐ NEW: GET /user/profile
   Returns ENTIRE USER including autoConfig (needed for Automation UI)
========================================================= */
router.get("/profile", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/* =========================================================
   POST /user/update-keyword-usage
========================================================= */
router.post("/update-keyword-usage", async (req, res) => {
  try {
    const { email } = req.query;
    const { keywordsUsed } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.plan) {
      user.plan = { name: null, maxKeywords: 0, usedKeywords: 0, price: 0 };
    }

    user.plan.usedKeywords =
      (user.plan.usedKeywords || 0) + (keywordsUsed || 0);

    /* Plan usage / expiry logic */
    if (
      user.plan.maxKeywords > 0 &&
      user.plan.usedKeywords >= user.plan.maxKeywords
    ) {
      if (user.futurePlan && user.futurePlan.name) {
        user.plan = {
          name: user.futurePlan.name,
          maxKeywords: user.futurePlan.maxKeywords,
          usedKeywords: 0,
          price: user.futurePlan.price
        };

        user.futurePlan = {
          name: null,
          maxKeywords: 0,
          price: 0,
          keywords: 0
        };
      } else {
        user.plan = {
          name: null,
          maxKeywords: 0,
          usedKeywords: 0,
          price: 0
        };
      }
    }

    await user.save();

    res.json({
      success: true,
      usedKeywords: user.plan.usedKeywords,
      maxKeywords: user.plan.maxKeywords,
      currentPlan: user.plan.name
    });

  } catch (error) {
    console.error("❌ Error updating keyword usage:", error);
    res.status(500).json({ error: "Failed to update keyword usage" });
  }
});

export default router;
