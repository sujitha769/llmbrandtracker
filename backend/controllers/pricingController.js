import Pricing from "../models/Pricing.js";

// GET pricing plans
export const getPricingPlans = async (req, res) => {
  try {
    const plans = await Pricing.find();
    return res.json({ success: true, plans });
  } catch (error) {
    console.error("Error getting pricing:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE pricing plans
export const updatePricing = async (req, res) => {
  try {
    const { plans } = req.body;

    // Replace old plans with new ones
    await Pricing.deleteMany({});
    await Pricing.insertMany(plans);

    return res.json({ success: true, message: "Pricing updated" });
  } catch (error) {
    console.error("Error updating pricing:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
