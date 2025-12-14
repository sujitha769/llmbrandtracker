import express from "express";
import { saveAutoConfig, getAutoConfig } from "../controllers/autoConfigController.js";

const router = express.Router();

router.post("/save", saveAutoConfig);
router.get("/get", getAutoConfig);

export default router;
