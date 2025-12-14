import User from "../models/User.js";

export const getUserProfile = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error("❌ Profile Fetch Error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};
