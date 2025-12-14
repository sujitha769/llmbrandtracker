import express from "express";
import { getSites, getUserInfo } from "../controllers/gscController.js";
import { analyzeVisibility, getKeywords } from "../controllers/visibilityController.js";


const router = express.Router();

router.get("/sites", getSites);
router.get("/userinfo", getUserInfo);
router.post("/keywords", getKeywords);
router.post("/visibility", analyzeVisibility);

export default router;