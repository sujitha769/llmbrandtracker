import { google } from "googleapis";
import oauth2Client from "../config/googleClient.js";
import User from "../models/User.js";

let userTokens = {}; // Keep for backward compatibility with existing manual scans

export const googleAuth = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "openid",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const { email, name, picture } = data;

    // ⭐ Store tokens in memory (for existing manual scans)
    userTokens[email] = tokens;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        plan: null,
        planStart: null,
        planEnd: null,
        // ⭐ Save tokens to database
        googleTokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          scope: tokens.scope,
          token_type: tokens.token_type
        }
      });
    } else {
      // ⭐ Update existing user with new tokens
      user.googleTokens = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        scope: tokens.scope,
        token_type: tokens.token_type
      };
      user.name = name;
      user.picture = picture;
      await user.save();
    }

    console.log("✅ Google login successful:", email);
    console.log("✅ Tokens saved to database for:", email);

    // Redirect to frontend callback page
    return res.redirect(`http://localhost:5173/auth/callback?email=${email}`);

  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    return res.redirect("http://localhost:5173/?auth=failed");
  }
};

// ✅ Get tokens from memory (for existing manual scans)
export const getUserTokens = (email) => userTokens[email];

// ⭐ NEW: Get tokens from database (for auto scans)
export const getUserTokensFromDB = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user || !user.googleTokens?.access_token) {
      return null;
    }
    return user.googleTokens;
  } catch (error) {
    console.error("Error fetching tokens from DB:", error);
    return null;
  }
};

// ⭐ NEW: Clear auto config keywords (force use of GSC keywords)
export const clearAutoKeywords = async (req, res) => {
  try {
    const { email } = req.query;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.autoConfig.keywords = [];
    await user.save();

    console.log("✅ Cleared auto keywords for:", email);
    
    return res.json({ 
      success: true, 
      message: "Keywords cleared. Auto-scan will now use real GSC keywords." 
    });
  } catch (error) {
    console.error("❌ Error clearing keywords:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};