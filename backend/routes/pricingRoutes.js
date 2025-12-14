import express from "express";
import { getPricingPlans, updatePricing } from "../controllers/pricingController.js";

const router = express.Router();

router.get("/", getPricingPlans);
router.post("/", updatePricing);

export default router;
