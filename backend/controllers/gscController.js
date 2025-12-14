import { google } from "googleapis";
import oauth2Client from "../config/googleClient.js";
import { getUserTokens } from "./authController.js";

/**
 * Fetch all verified sites from Search Console
 */
export const getSites = async (req, res) => {
  try {
    const email = req.query.email;
    const tokens = getUserTokens(email);

    if (!tokens) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    oauth2Client.setCredentials(tokens);
    const webmasters = google.webmasters({ version: "v3", auth: oauth2Client });

    const response = await webmasters.sites.list();
    res.json({ email, sites: response.data.siteEntry || [] });

  } catch (error) {
    console.error("Error fetching GSC sites:", error);
    res.status(500).json({ error: "Failed to fetch sites" });
  }
};

/**
 * Fetch Keywords for selected site
 */
export const getKeywords = async (req, res) => {
  try {
    const { email, siteUrl } = req.body;

    const tokens = getUserTokens(email);
    if (!tokens) return res.status(401).json({ error: "User not authenticated" });

    oauth2Client.setCredentials(tokens);
    const webmasters = google.webmasters({ version: "v3", auth: oauth2Client });

    const requestBody = {
      startDate: "2025-10-01",
      endDate: "2025-11-05",
      dimensions: ["query"],
      rowLimit: 50
    };

    const response = await webmasters.searchanalytics.query({ siteUrl, requestBody });
    res.json({ keywords: response.data.rows || [] });

  } catch (error) {
    console.error("Error fetching keywords:", error);
    res.status(500).json({ error: "Failed to fetch keywords" });
  }
};

/**
 * Get logged-in user info
 */
export const getUserInfo = async (req, res) => {
  try {
    const allTokens = Object.keys(getUserTokens(""));
    if (!allTokens || allTokens.length === 0)
      return res.status(404).json({ message: "No logged-in user found" });

    res.json({ email: allTokens[allTokens.length - 1] });

  } catch (err) {
    console.error("Error fetching user info:", err);
    res.status(500).json({ error: "Failed to get user info" });
  }
};
