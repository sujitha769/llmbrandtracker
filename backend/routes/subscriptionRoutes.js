// server/routes/subscriptionRoutes.js
import express from "express";
import { upgradePlan, getSubscriptionStatus, setFuturePlan } from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/upgrade", upgradePlan);
router.get("/status", getSubscriptionStatus); // <-- new endpoint

router.post("/setFuturePlan", setFuturePlan); 
export default router;
