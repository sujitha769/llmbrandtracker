import express from "express";
import { explainWhyNotMentioned } from "../controllers/whyNotMentionedController.js";

const router = express.Router();

router.post("/analyze", explainWhyNotMentioned);

// ✅ Export default router
export default router;
