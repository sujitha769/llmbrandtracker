import User from '../models/User.js';

export const isAdmin = async (req, res, next) => {
  try {
    // Accept admin email from:
    // 1. headers
    // 2. query params
    // 3. body
    const email =
      req.headers['admin-email'] ||
      req.query.email ||
      req.body.adminEmail ||
      req.body.email;

    if (!email) {
      return res.status(401).json({ error: 'Admin email required for authentication' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access only' });
    }

    req.admin = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};
