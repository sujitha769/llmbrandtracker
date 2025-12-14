import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import "./cronJobs.js";

import pricingRoutes from "./routes/pricingRoutes.js";
// import aiRoutes from "./routes/aiRoutes.js";
import whyNotMentionedRoute from "./routes/whyNotMentionedRoute.js";

import authRoutes from "./routes/authRoutes.js";
import gscRoutes from "./routes/gscRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import suggestionRoutes from "./routes/suggestionRoutes.js";

import adminRoutes from "./routes/adminRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

import autoConfigRoutes from "./routes/autoConfigRoutes.js";

// ⭐ Import new clear keywords function
import { clearAutoKeywords } from "./controllers/authController.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/gsc", gscRoutes);
app.use("/subscription", subscriptionRoutes);
app.use("/user", userRoutes);
app.use("/suggestions", suggestionRoutes);

app.use("/admin", adminRoutes);
app.use("/api/pricing", pricingRoutes);
// app.use("/ai", aiRoutes);
app.use("/whynot", whyNotMentionedRoute);
app.use("/api/history", historyRoutes);
app.use("/autoConfig", autoConfigRoutes);

// ⭐ NEW: Clear auto keywords endpoint
app.delete("/api/auto-config/keywords", clearAutoKeywords);

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));