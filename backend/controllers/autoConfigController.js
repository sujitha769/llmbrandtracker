import User from "../models/User.js";

/* SAVE AUTOMATION SETTINGS */
export const saveAutoConfig = async (req, res) => {
  try {
    const { email } = req.query;
    const data = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.autoConfig = {
      site: data.site || null,
      brand: data.brand || null,
      description: data.description || null,
      industry: data.industry || null,
      region: data.region || null,
      competitors: data.competitors || [],
      keywords: data.keywords || []
    };

    await user.save();

    return res.json({ success: true, message: "Auto Config Saved", config: user.autoConfig });
  } catch (err) {
    console.error("❌ Auto Config Save Error:", err);
    return res.status(500).json({ error: "Failed to save auto config" });
  }
};

/* GET AUTOMATION SETTINGS */
export const getAutoConfig = async (req, res) => {
  try {
    const { email } = req.query;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ success: true, config: user.autoConfig });
  } catch (err) {
    console.error("❌ Auto Config Fetch Error:", err);
    return res.status(500).json({ error: "Failed to fetch auto config" });
  }
};
