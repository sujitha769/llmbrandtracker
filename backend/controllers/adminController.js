import User from '../models/User.js';
import Pricing from '../models/Pricing.js';   // <-- IMPORTANT

// --------------------------------------------------
// Admin Login
// --------------------------------------------------
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });

    if (password !== 'admin123')
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --------------------------------------------------
// Get All Users
// --------------------------------------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name || 'N/A',
      role: user.role || 'user',
      plan: user.plan || null,
      planEnd: user.planEnd,
      status:
        user.planEnd && new Date(user.planEnd) > new Date() ? 'Active' : 'Inactive',
      createdAt: user.createdAt
    }));

    return res.status(200).json({ success: true, users: formattedUsers });

  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --------------------------------------------------
// Dashboard Stats
// --------------------------------------------------
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const activeSubscriptions = await User.countDocuments({
      planEnd: { $gte: new Date() },
      plan: { $ne: null }
    });
    const freeUsers = await User.countDocuments({
      $or: [
        { plan: null },
        { planEnd: { $lt: new Date() } }
      ]
    });

    return res.status(200).json({
      success: true,
      stats: { totalUsers, adminCount, activeSubscriptions, freeUsers }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --------------------------------------------------
// Login As User
// --------------------------------------------------
export const loginAsUser = async (req, res) => {
  try {
    const { adminEmail, userEmail } = req.body;

    const admin = await User.findOne({ email: adminEmail });
    if (!admin || admin.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    const user = await User.findOne({ email: userEmail });
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    return res.status(200).json({
      success: true,
      message: 'Login as user successful',
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture,
        plan: user.plan,
        planEnd: user.planEnd
      }
    });

  } catch (error) {
    console.error('Login as user error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// --------------------------------------------------
// NEW: Get Available Plans
// --------------------------------------------------
export const getAvailablePlans = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const plans = await Pricing.find();

    return res.json({
      success: true,
      user: {
        id: user._id,
        currentPlan: user.plan,
      },
      availablePlans: plans,
    });

  } catch (error) {
    console.error("Get Plans Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const changeUserPlan = async (req, res) => {
  try {
    const userId = req.params.id;
    const { planId } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const plan = await Pricing.findById(planId);
    if (!plan)
      return res.status(404).json({ success: false, message: "Plan not found" });

    // Update plan
    user.plan = {
      name: plan.title,
      maxKeywords: plan.keywords,
      usedKeywords: 0,
      price: plan.price
    };

    user.planStart = new Date();
    user.planEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await user.save();

    return res.json({
      success: true,
      message: "Plan updated successfully",
      updatedPlan: user.plan
    });

  } catch (error) {
    console.error("Change Plan Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
