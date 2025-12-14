import History from "../models/History.js";

// Save analysis
export const saveHistory = async (req, res) => {
  try {
    const entry = await History.create({
  ...req.body,
  userEmail: req.query.email || req.body.userEmail
});


    return res.status(201).json({
      success: true,
      message: "History saved successfully",
      entry
    });
  } catch (error) {
    console.error("Save history error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user history
export const getHistory = async (req, res) => {
  try {
    const email = req.params.email;

    const history = await History.find({ userEmail: email }).sort({
      timestamp: -1
    });

    return res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("Get history error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete one entry
export const deleteHistory = async (req, res) => {
  try {
    const id = req.params.id;

    await History.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete history error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Clear all entries for a user
export const clearHistory = async (req, res) => {
  try {
    const email = req.params.email;

    await History.deleteMany({ userEmail: email });

    return res.status(200).json({ success: true, message: "All history cleared" });
  } catch (error) {
    console.error("Clear history error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
